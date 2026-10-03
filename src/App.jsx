import React, { useState, useEffect, useRef } from 'react';
import Timeline from './components/Timeline';
import UploadModal from './components/UploadModal';
import EventModal from './components/EventModal';
import ProfilePicture from './components/ProfilePicture';
import EventAlbum from './components/EventAlbum';
import AdminDashboard from './components/AdminDashboard';
import Invitation from './components/Invitation';
import Petals from './components/Petals';
import AudioPlayer from './components/AudioPlayer';
import Countdown from './components/Countdown';
import Guestbook from './components/Guestbook';
import { supabase } from './lib/supabaseClient';
import { PlusCircle, Heart, CalendarPlus, Shield, Moon, Sun } from 'lucide-react';

function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch custom background on load
  useEffect(() => {
    // The background is now set via CSS using the tulipanes_fondo.png
  }, []);

  if (window.location.pathname === '/admin') {
    return <AdminDashboard />;
  }

  if (window.location.pathname.startsWith('/invite/')) {
    const eventId = window.location.pathname.split('/invite/')[1];
    return <Invitation eventId={eventId} />;
  }

  const handleOpenEventModal = () => {
    const pin = window.prompt('Introduce el PIN de seguridad para crear un evento:');
    if (pin === '1357') {
      setIsEventModalOpen(true);
    } else if (pin !== null) {
      alert('PIN incorrecto. OperaciÃ³n cancelada.');
    }
  };

  const handleOpenUploadModal = () => {
    const pin = window.prompt('Introduce el PIN de seguridad para agregar un recuerdo:');
    if (pin === '1357') {
      setIsUploadModalOpen(true);
    } else if (pin !== null) {
      alert('PIN incorrecto. OperaciÃ³n cancelada.');
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <Petals />
      <AudioPlayer />
      
      {/* Header */}
      <header style={{ 
        padding: '3rem 1rem 1rem', 
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        {/* Dark Mode Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            textAlign: 'center'
          }} className="header-layout">
            
            {/* Perfil Grande Actualizable */}
            <ProfilePicture />

            {/* Texto y Botones */}
            <div>
              <div className="animate-fade-in delay-100" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-hover)',
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Heart size={16} fill="currentColor" style={{ marginRight: '0.5rem' }} />
                JosuÃ© & MÃ³nica ðŸ
              </div>
              
              <h1 className="header-title animate-fade-in delay-200" style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '3.5rem' }}>
                ðŸŒ» Nuestra Boda ðŸŒ»
              </h1>

              <p className="animate-fade-in delay-200" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1rem', textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
                Viernes 20 de Noviembre del 2026
              </p>

              <div className="animate-fade-in delay-300">
                <Countdown />
              </div>
              
              <p className="animate-fade-in delay-300" style={{ 
                color: '#1a1a1a', 
                maxWidth: '600px', 
                margin: '0 auto 2rem',
                fontSize: '1.25rem',
                fontWeight: '600',
                textShadow: '0 2px 4px rgba(255,255,255,0.9)'
              }}>
                AcompÃ¡Ã±anos a atesorar cada sonrisa, cada paso y cada hermoso recuerdo en esta maravillosa aventura.
              </p>

              <div className="animate-fade-in delay-300" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  className="btn-secondary"
                  onClick={handleOpenEventModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CalendarPlus size={20} />
                  Crear Evento
                </button>

                <button 
                  className="btn-primary"
                  onClick={handleOpenUploadModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <PlusCircle size={20} />
                  Agregar Recuerdo
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ marginTop: '2rem' }}>
        {activeEvent ? (
          <EventAlbum 
            event={activeEvent} 
            onBack={() => setActiveEvent(null)} 
          />
        ) : (
          <>
            <Timeline onEventClick={setActiveEvent} />
            <Guestbook />
          </>
        )}
      </main>

      {/* Modals */}
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

      {/* Admin Quick Access Button */}
      <button 
        onClick={() => window.location.pathname = '/admin'}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          zIndex: 50,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = 'var(--text-main)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        title="Panel de Control"
      >
        <Shield size={18} />
      </button>

      <style>{`
        @media (min-width: 768px) {
          .header-layout {
            flex-direction: row !important;
            text-align: left !important;
            align-items: center !important;
          }
          .header-layout > div:last-child {
            flex: 1;
          }
          .header-layout .btn-primary, .header-layout .btn-secondary {
            justify-content: flex-start;
          }
          .header-layout > div > div:last-child {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
