import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import EventCard from '../components/EventCard.jsx';
import EventosPanel from '../components/EventosPanel.jsx';
import { EVENTOS } from '../data/eventos.js';

export default function Home() {
  const [eventoActivo, setEventoActivo] = useState(null);

  return (
    <>
      <Navbar />

      <div className="intro-strip">
        <div className="intro-label">Eventos disponibles</div>
      </div>

      <main className="app-main">
        <div className="boletos-grid">
          {EVENTOS.map((ev, i) => (
            <EventCard
              key={ev.id}
              evento={ev}
              index={i}
              onClick={() => setEventoActivo(ev)}
            />
          ))}
        </div>
      </main>

      <EventosPanel
        evento={eventoActivo}
        onClose={() => setEventoActivo(null)}
      />
    </>
  );
}