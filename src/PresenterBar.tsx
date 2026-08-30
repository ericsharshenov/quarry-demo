import { DEMO_ORDER, STATUS_LABEL } from "./model";
import { useDemo } from "./demo";

export function PresenterBar() {
  const { state, dispatch } = useDemo();
  const { status, tareKg, driverNotified, loaderConfirmed } = state;

  const steps = [
    {
      id: "crm",
      label: "1. Заказ из CRM",
      enabled: status === "idle",
      onClick: () => dispatch({ type: "CRM_SEND" }),
    },
    {
      id: "anpr-in",
      label: "2. Камера: въезд",
      enabled: status === "waiting",
      onClick: () => dispatch({ type: "ANPR_IN" }),
    },
    {
      id: "tare",
      label: "3. Взвесить тару",
      enabled: status === "on_scales_in" && tareKg == null,
      onClick: () => dispatch({ type: "WEIGH_TARE" }),
    },
    {
      id: "push",
      label: "4. Пуш водителю",
      enabled: status === "on_scales_in" && tareKg != null && !driverNotified,
      onClick: () => dispatch({ type: "NOTIFY_DRIVER" }),
    },
    {
      id: "load",
      label: "5. Погрузка готова",
      enabled: status === "loading" && !loaderConfirmed,
      onClick: () => dispatch({ type: "CONFIRM_LOAD" }),
    },
    {
      id: "anpr-out",
      label: "6. Камера: выезд",
      enabled: status === "on_scales_out" && loaderConfirmed,
      onClick: () => dispatch({ type: "ANPR_OUT" }),
    },
  ];

  return (
    <header className="presenter">
      <div className="presenter-brand">
        <div className="presenter-kicker">Живой прототип</div>
        <h1>Автоматизация карьера</h1>
        <p className="presenter-sub">
          CRM → камера номера → весы → пост погрузки → закрытие наряда. Без
          мессенджера и бумаги.
        </p>
      </div>

      <div className="hardware">
        <div className="hw-card">
          <span className="hw-label">Камера ANPR</span>
          <strong>{state.plateRecognized ?? "— ожидание —"}</strong>
        </div>
        <div className="hw-card light-card">
          <span className="hw-label">Светофор</span>
          <div className={`traffic ${state.trafficLight}`}>
            <i className="lamp red" />
            <i className="lamp green" />
          </div>
          <em>{state.trafficLight === "green" ? "проезд" : "стоп"}</em>
        </div>
        <div className="hw-card">
          <span className="hw-label">Весы</span>
          <strong>
            {state.grossKg != null
              ? `${state.grossKg.toLocaleString("ru-RU")} кг брутто`
              : tareKg != null
                ? `${tareKg.toLocaleString("ru-RU")} кг тара`
                : "нет оси"}
          </strong>
        </div>
        <div className="hw-card status-card">
          <span className="hw-label">Статус наряда</span>
          <strong className={`pill pill-${status}`}>
            {status === "idle" ? "—" : `${DEMO_ORDER.number} · ${STATUS_LABEL[status]}`}
          </strong>
        </div>
      </div>

      <div className="step-row">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            className="step-btn"
            disabled={!s.enabled}
            onClick={s.onClick}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          className="step-btn ghost"
          onClick={() => dispatch({ type: "RESET" })}
        >
          Сброс демо
        </button>
      </div>
    </header>
  );
}
