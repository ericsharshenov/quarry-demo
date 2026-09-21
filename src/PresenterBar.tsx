import {
  DEMO_ORDER,
  STATUS_LABEL,
  STEP_DEFS,
  currentStepIndex,
  nextStepType,
  stepLabel,
} from "./model";
import { createStepAction, useDemo } from "./demo";
import { useAutoDemo, useCountUp, useHotkeys, usePulse } from "./hooks";
import {
  IconArrowRight,
  IconCheck,
  IconPause,
  IconPlay,
  IconReset,
} from "./icons";
import { Stepper } from "./Stepper";

export function PresenterBar() {
  const { state, dispatch } = useDemo();
  const auto = useAutoDemo();
  useHotkeys();

  const nextType = nextStepType(state);
  const current = Math.min(currentStepIndex(state), STEP_DEFS.length);
  const total = STEP_DEFS.length;
  const finished = state.status === "closed";
  const pristine = state.status === "idle" && state.log.length === 0;

  const anprActive = usePulse(state.plateRecognized);
  const scaleValue = useCountUp(state.grossKg ?? state.tareKg);

  const scaleText =
    scaleValue == null
      ? "нет оси"
      : `${scaleValue.toLocaleString("ru-RU")} кг ${
          state.grossKg != null ? "брутто" : "тара"
        }`;

  return (
    <header className="presenter">
      <div className="presenter-top">
        <div className="presenter-brand">
          <div className="presenter-kicker">Живой прототип</div>
          <h1>Автоматизация карьера</h1>
          <p className="presenter-sub">
            CRM → камера номера → весы → пост погрузки → закрытие наряда. Без
            мессенджера и бумаги.
          </p>
        </div>

        <div className={`hw-card anpr-card ${anprActive ? "pulsing" : ""}`}>
          <span className="hw-label">Камера ANPR</span>
          <strong className="plate">
            {state.plateRecognized ?? "— ожидание —"}
          </strong>
          <span className="scan-line" aria-hidden="true" />
        </div>

        <div className="hw-card">
          <span className="hw-label">Светофор</span>
          <div
            className={`traffic ${state.trafficLight}`}
            role="img"
            aria-label={
              state.trafficLight === "green"
                ? "Светофор: проезд разрешён"
                : "Светофор: стоп"
            }
          >
            <span className="lamp red" />
            <span className="lamp green" />
          </div>
          <em>{state.trafficLight === "green" ? "проезд" : "стоп"}</em>
        </div>

        <div className="hw-card">
          <span className="hw-label">Весы</span>
          <strong className="scale-readout">{scaleText}</strong>
        </div>

        <div className="hw-card status-card">
          <span className="hw-label">Статус наряда</span>
          <strong className={`pill pill-${state.status}`}>
            {state.status === "idle"
              ? "—"
              : `${DEMO_ORDER.number} · ${STATUS_LABEL[state.status]}`}
          </strong>
        </div>
      </div>

      <div className="presenter-progress">
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current}
          aria-label="Прогресс сценария"
        >
          <div
            className="progress-fill"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
        <span className="progress-label">
          Шаг {current} из {total}
        </span>
      </div>

      <div className="controls">
        {nextType ? (
          <button
            type="button"
            className="next-btn"
            onClick={() => dispatch(createStepAction(nextType))}
          >
            <IconArrowRight size={18} />
            Следующий шаг: {stepLabel(nextType)}
          </button>
        ) : (
          <span className="next-done">
            <IconCheck size={18} />
            Наряд закрыт — сценарий пройден
          </span>
        )}

        <button
          type="button"
          className={`auto-btn ${auto.playing ? "on" : ""}`}
          onClick={() => (auto.playing ? auto.pause() : auto.start())}
          aria-pressed={auto.playing}
        >
          {auto.playing ? <IconPause size={16} /> : <IconPlay size={16} />}
          {auto.playing ? "Пауза" : finished ? "Повторить" : "Авто-демо"}
        </button>

        <button
          type="button"
          className="ghost-btn"
          onClick={auto.reset}
          disabled={pristine}
        >
          <IconReset size={16} />
          Сброс
        </button>

        <span className="hotkeys">Space / → — шаг · R — сброс</span>
      </div>

      <Stepper />
    </header>
  );
}
