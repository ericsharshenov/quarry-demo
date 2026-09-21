import { DEMO_ORDER, formatTons, nettoKg } from "./model";
import { useDemo } from "./demo";

export function DriverPhone() {
  const { state } = useDemo();

  let body;
  if (!state.driverNotified) {
    body = (
      <div className="phone-idle">
        <p>Нет новых заданий</p>
        <small>
          Водитель остаётся в кабине. Пост придёт после взвешивания тары.
        </small>
      </div>
    );
  } else if (state.status === "closed") {
    body = (
      <div className="phone-card done">
        <div className="muted">Рейс завершён</div>
        <h2>Можно выезжать</h2>
        <p>
          {DEMO_ORDER.plate} · нетто {formatTons(nettoKg(state))}
        </p>
      </div>
    );
  } else {
    body = (
      <div className="phone-card">
        {state.status === "loading" && !state.loaderConfirmed && (
          <div className="toast" role="status">
            Новое задание
          </div>
        )}
        <div className="muted">Пост погрузки</div>
        <div className="dock">{state.dock}</div>
        <p className="frac">{DEMO_ORDER.fraction}</p>
        <p className="qty">{DEMO_ORDER.quantityT} т</p>
        <p className="hint">
          {state.loaderConfirmed
            ? "Загружено. Вернитесь на весы."
            : "Не выходите из кабины. Следуйте на пост."}
        </p>
      </div>
    );
  }

  return (
    <section className="panel phone-wrap">
      <header className="panel-head">
        <span>Водитель</span>
        <small>мобильное приложение</small>
      </header>
      <div className="phone">
        <div className="notch" />
        <div className="phone-screen">
          <div className="phone-bar">
            <b>Карьер</b>
            <span>{DEMO_ORDER.driver}</span>
          </div>
          <div key={`${state.status}-${state.loaderConfirmed}`} className="phone-body">
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}
