import {
  DEMO_ORDER,
  STATUS_LABEL,
  formatKg,
  formatTons,
} from "./model";
import { useDemo } from "./demo";
import { useCountUp } from "./hooks";
import { TripSummary } from "./TripSummary";

export function OperatorDesk() {
  const { state } = useDemo();
  const tare = useCountUp(state.tareKg);
  const gross = useCountUp(state.grossKg);
  const net = tare != null && gross != null ? gross - tare : null;
  const weighing = state.status === "on_scales_in" || state.status === "on_scales_out";

  return (
    <section className="panel desk">
      <header className="panel-head">
        <span>Весовая</span>
        <small>оператор · без окна и бумаги</small>
      </header>

      {state.status === "idle" ? (
        <div className="empty">
          Нет активных нарядов. Ожидаем данные из CRM — не из мессенджера.
        </div>
      ) : (
        <div className="order-card">
          <div className="order-top">
            <div>
              <div className="muted">Наряд</div>
              <div className="huge">{DEMO_ORDER.number}</div>
            </div>
            <span className={`pill pill-${state.status}`}>
              {STATUS_LABEL[state.status]}
            </span>
          </div>
          <dl className="meta">
            <div>
              <dt>Клиент</dt>
              <dd>{DEMO_ORDER.customer}</dd>
            </div>
            <div>
              <dt>Госномер</dt>
              <dd className="plate">{DEMO_ORDER.plate}</dd>
            </div>
            <div>
              <dt>Фракция</dt>
              <dd>{DEMO_ORDER.fraction}</dd>
            </div>
            <div>
              <dt>План</dt>
              <dd>{DEMO_ORDER.quantityT} т</dd>
            </div>
          </dl>
          <div className={`weights ${weighing ? "weighing" : ""}`}>
            <div>
              <span>Тара</span>
              <b>{formatKg(tare)}</b>
            </div>
            <div>
              <span>Брутто</span>
              <b>{formatKg(gross)}</b>
            </div>
            <div>
              <span>Нетто</span>
              <b>{formatTons(net)}</b>
            </div>
          </div>
          {state.salesNotified && (
            <div className="badge-ok" role="status">
              Отдел продаж уведомлён · наряд закрыт
            </div>
          )}
          {state.status === "closed" && <TripSummary />}
        </div>
      )}

      <h3 className="log-title">Журнал событий</h3>
      {state.log.length === 0 ? (
        <p className="muted small">Пока пусто — начните с шага «Заказ из CRM».</p>
      ) : (
        <>
          <p className="sr-only" role="status">
            {state.log[0]?.text}
          </p>
          <ul className="log">
            {state.log.map((entry) => (
              <li key={entry.id}>
                <time>{entry.time}</time>
                <span>{entry.text}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
