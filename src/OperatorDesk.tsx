import { DEMO_ORDER, STATUS_LABEL } from "./model";
import { useDemo } from "./demo";

function kg(n: number | null) {
  return n == null ? "—" : `${n.toLocaleString("ru-RU")} кг`;
}

export function OperatorDesk() {
  const { state } = useDemo();
  const net =
    state.tareKg != null && state.grossKg != null
      ? `${((state.grossKg - state.tareKg) / 1000).toFixed(2)} т`
      : "—";

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
          <div className="weights">
            <div>
              <span>Тара</span>
              <b>{kg(state.tareKg)}</b>
            </div>
            <div>
              <span>Брутто</span>
              <b>{kg(state.grossKg)}</b>
            </div>
            <div>
              <span>Нетто</span>
              <b>{net}</b>
            </div>
          </div>
          {state.salesNotified && (
            <div className="badge-ok">Отдел продаж уведомлён · наряд закрыт</div>
          )}
        </div>
      )}

      <h3 className="log-title">Журнал событий</h3>
      {state.log.length === 0 ? (
        <p className="muted small">Пока пусто — начните с шага «Заказ из CRM».</p>
      ) : (
        <ul className="log">
          {state.log.map((e) => (
            <li key={e.id}>
              <time>{e.time}</time>
              <span>{e.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
