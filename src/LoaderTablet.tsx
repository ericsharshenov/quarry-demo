import { DEMO_ORDER } from "./model";
import { useDemo } from "./demo";

export function LoaderTablet() {
  const { state, dispatch } = useDemo();
  const inQueue = state.driverNotified && state.status !== "idle";

  return (
    <section className="panel tablet">
      <header className="panel-head">
        <span>Погрузчик</span>
        <small>пост {state.dock ?? "—"} · планшет</small>
      </header>

      {!inQueue || state.status === "waiting" || state.status === "on_scales_in" ? (
        <div className="empty">Очередь пуста. Ждём машину с весовой.</div>
      ) : (
        <article className="queue-card">
          <div className="plate-xl">{DEMO_ORDER.plate}</div>
          <ul>
            <li>
              <span>Фракция</span>
              <b>{DEMO_ORDER.fraction}</b>
            </li>
            <li>
              <span>Загрузить</span>
              <b>{DEMO_ORDER.quantityT} т</b>
            </li>
            <li>
              <span>Наряд</span>
              <b>{DEMO_ORDER.number}</b>
            </li>
          </ul>
          {state.loaderConfirmed ? (
            <div className="badge-ok">Загрузка отмечена · машина на выезд</div>
          ) : (
            <button
              type="button"
              className="confirm"
              onClick={() => dispatch({ type: "CONFIRM_LOAD" })}
            >
              Загружено
            </button>
          )}
        </article>
      )}
    </section>
  );
}
