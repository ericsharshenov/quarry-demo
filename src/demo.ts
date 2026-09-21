import { createContext, useContext, type Dispatch } from "react";
import {
  DEMO_ORDER,
  SCENARIO,
  can,
  formatKg,
  type LogEntry,
  type StepType,
  type TripState,
} from "./model";

export const initialState: TripState = {
  status: "idle",
  plateRecognized: null,
  trafficLight: "red",
  tareKg: null,
  grossKg: null,
  dock: null,
  driverNotified: false,
  loaderConfirmed: false,
  salesNotified: false,
  log: [],
};

export type Action =
  | { type: StepType; meta: { id: number; at: number } }
  | { type: "RESET" };

let logSeq = 1;

function nowTime(at: number): string {
  return new Date(at).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function pushLog(
  state: TripState,
  action: { type: StepType; meta: { id: number; at: number } },
  text: string,
): TripState {
  const entry: LogEntry = {
    id: action.meta.id,
    at: action.meta.at,
    kind: action.type,
    time: nowTime(action.meta.at),
    text,
  };
  return { ...state, log: [entry, ...state.log].slice(0, 50) };
}

export function createStepAction(type: StepType): Action {
  return { type, meta: { id: logSeq++, at: Date.now() } };
}

export function resetAction(): Action {
  return { type: "RESET" };
}

export function reducer(state: TripState, action: Action): TripState {
  if (action.type === "RESET") {
    return { ...initialState, log: [] };
  }
  if (!can(state, action.type)) return state;

  switch (action.type) {
    case "CRM_SEND":
      return pushLog(
        { ...state, status: "waiting" },
        action,
        `CRM: отдел продаж отправил наряд ${DEMO_ORDER.number} (${DEMO_ORDER.fraction}, ${DEMO_ORDER.quantityT} т, ${DEMO_ORDER.plate})`,
      );
    case "ANPR_IN":
      return pushLog(
        {
          ...state,
          status: "on_scales_in",
          plateRecognized: DEMO_ORDER.plate,
          trafficLight: "green",
        },
        action,
        `ANPR: номер ${DEMO_ORDER.plate} распознан, наряд найден, светофор зелёный`,
      );
    case "WEIGH_TARE":
      return pushLog(
        { ...state, tareKg: SCENARIO.tareKg, trafficLight: "red" },
        action,
        `Весы: тара ${formatKg(SCENARIO.tareKg)}. Водитель остаётся в кабине`,
      );
    case "NOTIFY_DRIVER":
      return pushLog(
        { ...state, status: "loading", dock: 2, driverNotified: true },
        action,
        `Водителю: пост погрузки 2. Погрузчику: очередь ${DEMO_ORDER.plate}, ${DEMO_ORDER.quantityT} т фракции ${DEMO_ORDER.fraction}`,
      );
    case "CONFIRM_LOAD":
      return pushLog(
        { ...state, loaderConfirmed: true, status: "on_scales_out" },
        action,
        "Погрузчик: загрузка подтверждена. Машина возвращается на весы",
      );
    case "ANPR_OUT": {
      const gross = SCENARIO.grossKg;
      const net = gross - (state.tareKg ?? 0);
      return pushLog(
        {
          ...state,
          status: "closed",
          plateRecognized: DEMO_ORDER.plate,
          trafficLight: "green",
          grossKg: gross,
          salesNotified: true,
        },
        action,
        `ANPR выезд: ${DEMO_ORDER.plate}. Брутто ${formatKg(gross)}, нетто ${formatKg(net)}. Наряд закрыт, продажи уведомлены`,
      );
    }
  }
}

export const DemoContext = createContext<{
  state: TripState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo вне провайдера");
  return ctx;
}
