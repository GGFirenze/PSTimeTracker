import { useTimerContext } from '../context/TimerContext';
import { formatTimeCompact } from '../hooks/useTimer';

export function Header() {
  const { todayBillableSeconds, todayNonBillableSeconds } = useTimerContext();
  const totalSeconds = todayBillableSeconds + todayNonBillableSeconds;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">
          <span className="header-icon">&#9201;</span>
          PS Time Tracker
        </h1>
        <p className="header-date">{today}</p>
      </div>
      <div className="header-stats">
        <div className="stat">
          <span className="stat-value">{formatTimeCompact(totalSeconds)}</span>
          <span className="stat-label">Total Today</span>
        </div>
        <div className="stat stat-billable">
          <span className="stat-value">
            {formatTimeCompact(todayBillableSeconds)}
          </span>
          <span className="stat-label">Billable</span>
        </div>
        <div className="stat stat-nonbillable">
          <span className="stat-value">
            {formatTimeCompact(todayNonBillableSeconds)}
          </span>
          <span className="stat-label">Non-Billable</span>
        </div>
      </div>
    </header>
  );
}
