import { createPortal } from 'react-dom';
import { ProjectProvider } from './context/ProjectContext';
import { TimerProvider } from './context/TimerContext';
import { Header } from './components/Header';
import { ActiveTimer } from './components/ActiveTimer';
import { ProjectGrid } from './components/ProjectGrid';
import { NotesModal } from './components/NotesModal';
import { CalendarWidget } from './components/CalendarWidget';
import { TimeLog } from './components/TimeLog';
import { FloatingWidget } from './components/FloatingWidget';
import { usePictureInPicture } from './hooks/usePictureInPicture';

export default function App() {
  const { pipWindow, isOpen, openPiP, closePiP, isSupported } =
    usePictureInPicture();

  return (
    <ProjectProvider>
      <TimerProvider>
        <div className="app">
          <Header
            pipSupported={isSupported}
            pipOpen={isOpen}
            onTogglePiP={isOpen ? closePiP : openPiP}
          />
          <ActiveTimer />
          <main className="main">
            <ProjectGrid />
            <CalendarWidget />
            <TimeLog />
          </main>
          <NotesModal />
        </div>
        {pipWindow &&
          createPortal(<FloatingWidget />, pipWindow.document.body)}
      </TimerProvider>
    </ProjectProvider>
  );
}
