import { STEP_DEFS, can, currentStepIndex } from "./model";
import { createStepAction, useDemo } from "./demo";
import { IconCheck, STEP_ICONS } from "./icons";

export function Stepper() {
  const { state, dispatch } = useDemo();
  const current = currentStepIndex(state);

  return (
    <ol className="stepper">
      {STEP_DEFS.map((step, index) => {
        const Icon = STEP_ICONS[step.type];
        const done = index < current;
        const isCurrent = index === current;
        const enabled = can(state, step.type);
        const status = done ? "done" : isCurrent ? "current" : "pending";
        return (
          <li key={step.type} className={`step step-${status}`}>
            {index > 0 && <span className="step-line" aria-hidden="true" />}
            <button
              type="button"
              className="step-node"
              disabled={!enabled}
              onClick={() => dispatch(createStepAction(step.type))}
              aria-current={isCurrent ? "step" : undefined}
              title={
                done
                  ? `${step.label}: выполнено`
                  : enabled
                    ? `${step.label}: выполнить`
                    : `${step.label}: пока недоступно`
              }
            >
              <span className="step-dot">
                {done ? <IconCheck size={16} /> : <Icon size={16} />}
              </span>
              <span className="step-label">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
