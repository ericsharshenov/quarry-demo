export type TripStatus =
  | "idle"
  | "waiting"
  | "on_scales_in"
  | "loading"
  | "on_scales_out"
  | "closed";

export type StepType =
  | "CRM_SEND"
  | "ANPR_IN"
  | "WEIGH_TARE"
  | "NOTIFY_DRIVER"
  | "CONFIRM_LOAD"
  | "ANPR_OUT";

export type LogEntry = {
  id: number;
  at: number;
  kind: StepType;
  time: string;
  text: string;
};

export type TripState = {
  status: TripStatus;
  plateRecognized: string | null;
  trafficLight: "red" | "green";
  tareKg: number | null;
  grossKg: number | null;
  dock: number | null;
  driverNotified: boolean;
  loaderConfirmed: boolean;
  salesNotified: boolean;
  log: LogEntry[];
};

export const DEMO_ORDER = {
  number: "Н-10482",
  fraction: "5–20 мм",
  quantityT: 20,
  plate: "А123ВС 116",
  customer: "ООО «СтройТранс»",
  driver: "Иванов С. П.",
} as const;

export const SCENARIO = {
  tareKg: 14280,
  grossKg: 34110,
} as const;

export const STATUS_LABEL: Record<TripStatus, string> = {
  idle: "нет наряда",
  waiting: "ожидает",
  on_scales_in: "на весах",
  loading: "погрузка",
  on_scales_out: "выезд",
  closed: "закрыт",
};

export const STEP_DEFS: { type: StepType; label: string; short: string }[] = [
  { type: "CRM_SEND", label: "Заказ из CRM", short: "CRM" },
  { type: "ANPR_IN", label: "Камера: въезд", short: "Въезд" },
  { type: "WEIGH_TARE", label: "Взвесить тару", short: "Тара" },
  { type: "NOTIFY_DRIVER", label: "Пуш водителю", short: "Пуш" },
  { type: "CONFIRM_LOAD", label: "Погрузка готова", short: "Погрузка" },
  { type: "ANPR_OUT", label: "Камера: выезд", short: "Выезд" },
];

export function can(state: TripState, type: StepType): boolean {
  switch (type) {
    case "CRM_SEND":
      return state.status === "idle";
    case "ANPR_IN":
      return state.status === "waiting";
    case "WEIGH_TARE":
      return state.status === "on_scales_in" && state.tareKg == null;
    case "NOTIFY_DRIVER":
      return (
        state.status === "on_scales_in" &&
        state.tareKg != null &&
        !state.driverNotified
      );
    case "CONFIRM_LOAD":
      return state.status === "loading" && !state.loaderConfirmed;
    case "ANPR_OUT":
      return state.status === "on_scales_out" && state.loaderConfirmed;
    default:
      return false;
  }
}

export function nextStepType(state: TripState): StepType | null {
  return STEP_DEFS.find((step) => can(state, step.type))?.type ?? null;
}

export function currentStepIndex(state: TripState): number {
  const index = STEP_DEFS.findIndex((step) => can(state, step.type));
  return index === -1 ? STEP_DEFS.length : index;
}

export function stepLabel(type: StepType): string {
  return STEP_DEFS.find((step) => step.type === type)?.label ?? type;
}

export function nettoKg(state: TripState): number | null {
  if (state.tareKg == null || state.grossKg == null) return null;
  return state.grossKg - state.tareKg;
}

export function formatKg(value: number | null): string {
  return value == null ? "—" : `${value.toLocaleString("ru-RU")} кг`;
}

export function formatTons(valueKg: number | null): string {
  if (valueKg == null) return "—";
  return `${(valueKg / 1000).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} т`;
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  if (totalSec < 60) return `${totalSec} с`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min} мин ${sec.toString().padStart(2, "0")} с`;
}

export const STAGES: { from: StepType; to: StepType; label: string }[] = [
  { from: "CRM_SEND", to: "ANPR_IN", label: "До въезда" },
  { from: "ANPR_IN", to: "WEIGH_TARE", label: "Въезд и тара" },
  { from: "WEIGH_TARE", to: "NOTIFY_DRIVER", label: "Оформление" },
  { from: "NOTIFY_DRIVER", to: "CONFIRM_LOAD", label: "Погрузка" },
  { from: "CONFIRM_LOAD", to: "ANPR_OUT", label: "Выезд и брутто" },
];

export type StageDuration = {
  label: string;
  ms: number;
};

export function stageDurations(log: LogEntry[]): StageDuration[] {
  const at = new Map<StepType, number>();
  for (const entry of log) {
    if (!at.has(entry.kind)) at.set(entry.kind, entry.at);
  }
  const result: StageDuration[] = [];
  for (const stage of STAGES) {
    const from = at.get(stage.from);
    const to = at.get(stage.to);
    if (from == null || to == null) continue;
    result.push({ label: stage.label, ms: Math.max(0, to - from) });
  }
  return result;
}

export function totalDuration(log: LogEntry[]): number | null {
  const at = new Map<StepType, number>();
  for (const entry of log) {
    if (!at.has(entry.kind)) at.set(entry.kind, entry.at);
  }
  const start = at.get("CRM_SEND");
  const end = at.get("ANPR_OUT");
  if (start == null || end == null) return null;
  return Math.max(0, end - start);
}
