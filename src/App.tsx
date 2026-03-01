import { ProjectProvider } from './context/ProjectContext';
import { TimerProvider } from './context/TimerContext';
import { Header } from './components/Header';
import { ActiveTimer } from './components/ActiveTimer';
import { ProjectGrid } from './components/ProjectGrid';
import { NotesModal } from './components/NotesModal';
import { CalendarWidget } from './components/CalendarWidget';
import { TimeLog } from './components/TimeLog';

export default function App() {
  return (
    <ProjectProvider>
      <TimerProvider>
        <div className="app">
          <Header />
          <ActiveTimer />
          <main className="main">
            <ProjectGrid />
            <CalendarWidget />
            <TimeLog />
          </main>
          <NotesModal />
        </div>
      </TimerProvider>
    </ProjectProvider>
  );
}
