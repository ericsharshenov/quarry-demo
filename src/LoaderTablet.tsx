import { DEMO_ORDER } from "./model";
import { createStepAction, useDemo } from "./demo";
import { IconCheck, IconLoader } from "./icons";

export function LoaderTablet() {
  const { state, dispatch } = useDemo();
  const showQueue =
    state.status === "loading" || state.status === "on_scales_out";

  return (
    <section className="panel tablet">
      <header className="panel-head">
        <span>Погрузчик</span>
        <small>пост {showQueue ? state.dock : "—"} · планшет</small>
      </header>

      {!showQueue ? (
        <div className="empty">
          <IconLoader size={28} />
          <span>Очередь пуста. Ждём машину с весовой.</span>
        </div>
      ) : (
        <article className="queue-card">
          <div className="queue-top">
            <span className="queue-badge">
              {state.loaderConfirmed ? "загружено" : "в очереди"}
            </span>
            <IconLoader size={22} />
          </div>
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
            <div className="badge-ok" role="status">
              <IconCheck size={16} />
              Загрузка отмечена · машина на выезд
            </div>
          ) : (
            <button
              type="button"
              className="confirm"
              onClick={() => dispatch(createStepAction("CONFIRM_LOAD"))}
            >
              Загружено
            </button>
          )}
        </article>
      )}
    </section>
  );
}
