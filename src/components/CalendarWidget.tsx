import { useLocalStorage } from '../hooks/useLocalStorage';
import { trackCalendarOpened, trackCalendarCollapsed } from '../analytics';

const CALENDAR_URL =
  'https://calendar.google.com/calendar/embed?src=giuliano.giannini%40amplitude.com&ctz=Europe%2FLondon';

export function CalendarWidget() {
  const [isOpen, setIsOpen] = useLocalStorage('ps-timer-calendar-open', false);

  const handleToggle = () => {
    if (isOpen) {
      trackCalendarCollapsed();
    } else {
      trackCalendarOpened();
    }
    setIsOpen(!isOpen);
  };

  return (
    <section className="calendar-widget">
      <button
        className="calendar-toggle"
        onClick={handleToggle}
      >
        <span className="calendar-toggle-left">
          <span className={`calendar-arrow ${isOpen ? 'calendar-arrow--open' : ''}`}>
            &#9654;
          </span>
          <span className="calendar-toggle-title">My Calendar</span>
        </span>
        <span className="calendar-toggle-hint">
          {isOpen ? 'Collapse' : 'Expand'}
        </span>
      </button>
      {isOpen && (
        <div className="calendar-iframe-container">
          <iframe
            src={CALENDAR_URL}
            className="calendar-iframe"
            title="Google Calendar"
          />
        </div>
      )}
    </section>
  );
}
