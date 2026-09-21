import {
  formatDuration,
  formatTons,
  nettoKg,
  stageDurations,
  totalDuration,
} from "./model";
import { useDemo } from "./demo";
import { IconCheck } from "./icons";

export function TripSummary() {
  const { state } = useDemo();
  const stages = stageDurations(state.log);
  const total = totalDuration(state.log);

  return (
    <div className="summary">
      <div className="summary-head">
        <IconCheck size={18} />
        <span>Рейс закрыт</span>
      </div>
      <div className="summary-net">
        <span>Нетто по наряду</span>
        <b>{formatTons(nettoKg(state))}</b>
      </div>
      {stages.length > 0 && (
        <ul className="summary-stages">
          {stages.map((stage) => (
            <li key={stage.label}>
              <span>{stage.label}</span>
              <b>{formatDuration(stage.ms)}</b>
            </li>
          ))}
        </ul>
      )}
      {total != null && (
        <div className="summary-total">
          <span>Итого от заказа до выезда</span>
          <b>{formatDuration(total)}</b>
        </div>
      )}
    </div>
  );
}
