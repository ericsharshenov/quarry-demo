import { DEMO_ORDER, type TripStatus } from "./model";
import { useDemo } from "./demo";
import { IconTruck } from "./icons";

const STATIONS = [
  { key: "gate", label: "Въезд", pos: 0 },
  { key: "scales-in", label: "Весы", pos: 27 },
  { key: "dock", label: "Пост 2", pos: 55 },
  { key: "scales-out", label: "Весы", pos: 80 },
  { key: "exit", label: "Выезд", pos: 100 },
] as const;

const TRUCK_POS: Record<TripStatus, number> = {
  idle: -8,
  waiting: 0,
  on_scales_in: 27,
  loading: 55,
  on_scales_out: 80,
  closed: 108,
};

const ACTIVE_STATION: Record<TripStatus, string | null> = {
  idle: null,
  waiting: "gate",
  on_scales_in: "scales-in",
  loading: "dock",
  on_scales_out: "scales-out",
  closed: null,
};

const LOCATION_TEXT: Record<TripStatus, string> = {
  idle: "машина ещё не в карьере",
  waiting: "машина у въезда",
  on_scales_in: "машина на весах",
  loading: "машина на посту погрузки 2",
  on_scales_out: "машина вернулась на весы",
  closed: "машина выехала из карьера",
};

export function RouteMap() {
  const { state } = useDemo();

  return (
    <section className="route-card" aria-label="Схема движения по карьеру">
      <header className="route-head">
        <span>Схема движения</span>
        <small>
          {DEMO_ORDER.number} · {DEMO_ORDER.plate}
        </small>
      </header>
      <div className="route">
        <div className="route-band">
          <div className="route-track" aria-hidden="true" />
          {STATIONS.map((station) => (
            <div
              key={station.key}
              className={`route-station ${
                ACTIVE_STATION[state.status] === station.key ? "active" : ""
              }`}
              style={{ left: `${station.pos}%` }}
            >
              <span className="route-dot" />
              <span className="route-name">{station.label}</span>
            </div>
          ))}
          <div
            className={`route-truck ${
              state.status === "loading" ? "parked" : ""
            }`}
            style={{ left: `${TRUCK_POS[state.status]}%` }}
            aria-hidden="true"
          >
            <IconTruck size={30} />
          </div>
        </div>
      </div>
      <p className="route-status" role="status">
        {LOCATION_TEXT[state.status]}
      </p>
    </section>
  );
}
