export type TripStatus =
  | "idle"
  | "waiting"
  | "on_scales_in"
  | "loading"
  | "on_scales_out"
  | "closed";

export type LogEntry = {
  id: number;
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

export const STATUS_LABEL: Record<TripStatus, string> = {
  idle: "нет наряда",
  waiting: "ожидает",
  on_scales_in: "на весах",
  loading: "погрузка",
  on_scales_out: "выезд",
  closed: "закрыт",
};
