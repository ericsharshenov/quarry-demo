import { createContext, useContext, type Dispatch } from "react";
import type { TripState } from "./model";

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

let logSeq = 1;

function nowTime() {
  return new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function pushLog(state: TripState, text: string): TripState {
  return {
    ...state,
    log: [{ id: logSeq++, time: nowTime(), text }, ...state.log].slice(0, 12),
  };
}

export type Action =
  | { type: "CRM_SEND" }
  | { type: "ANPR_IN" }
  | { type: "WEIGH_TARE" }
  | { type: "NOTIFY_DRIVER" }
  | { type: "CONFIRM_LOAD" }
  | { type: "ANPR_OUT" }
  | { type: "RESET" };

export function reducer(state: TripState, action: Action): TripState {
  switch (action.type) {
    case "RESET":
      return { ...initialState, log: [] };
    case "CRM_SEND": {
      if (state.status !== "idle") return state;
      return pushLog(
        { ...state, status: "waiting" },
        "CRM: отдел продаж отправил наряд Н-10482 (5–20 мм, 20 т, А123ВС 116)",
      );
    }
    case "ANPR_IN": {
      if (state.status !== "waiting") return state;
      return pushLog(
        {
          ...state,
          status: "on_scales_in",
          plateRecognized: "А123ВС 116",
          trafficLight: "green",
        },
        "ANPR: номер А123ВС 116 распознан, наряд найден, светофор зелёный",
      );
    }
    case "WEIGH_TARE": {
      if (state.status !== "on_scales_in") return state;
      const tare = 14280;
      return pushLog(
        {
          ...state,
          tareKg: tare,
          trafficLight: "red",
        },
        `Весы: тара ${tare.toLocaleString("ru-RU")} кг. Водитель остаётся в кабине`,
      );
    }
    case "NOTIFY_DRIVER": {
      if (state.status !== "on_scales_in" || state.tareKg == null) return state;
      return pushLog(
        {
          ...state,
          status: "loading",
          dock: 2,
          driverNotified: true,
        },
        "Водителю: пост погрузки 2. Погрузчику: очередь А123ВС 116, 20 т фракции 5–20",
      );
    }
    case "CONFIRM_LOAD": {
      if (state.status !== "loading" || state.loaderConfirmed) return state;
      return pushLog(
        { ...state, loaderConfirmed: true, status: "on_scales_out" },
        "Погрузчик: загрузка подтверждена. Машина возвращается на весы",
      );
    }
    case "ANPR_OUT": {
      if (state.status !== "on_scales_out" || !state.loaderConfirmed) return state;
      const gross = 34110;
      const tare = state.tareKg ?? 0;
      const netT = ((gross - tare) / 1000).toFixed(2);
      return pushLog(
        {
          ...state,
          status: "closed",
          plateRecognized: "А123ВС 116",
          trafficLight: "green",
          grossKg: gross,
          salesNotified: true,
        },
        `ANPR выезд: А123ВС 116. Брутто ${gross.toLocaleString("ru-RU")} кг, нетто ${netT} т. Наряд закрыт, продажи уведомлены`,
      );
    }
    default:
      return state;
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
