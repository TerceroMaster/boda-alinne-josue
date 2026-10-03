import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, CalendarPlus, Loader2 } from 'lucide-react';

const EventModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, ingresa el nombre del evento.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = { name, description };
      if (eventDate) {
        // Convert local datetime to ISO string for Supabase TIMESTAMP WITH TIME ZONE
        payload.event_date = new Date(eventDate).toISOString();
      }

      const { error: dbError } = await supabase
        .from('wedding_events')
        .insert([payload]);

      if (dbError) throw dbError;

      // Success! Reset and close
      setName('');
      setDescription('');
      setEventDate('');
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al crear el evento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        position: 'relative',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
          disabled={saving}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarPlus size={24} />
          Nuevo Evento
        </h2>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nombre del Evento</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Baby Shower"
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '1rem'
              }}
              disabled={saving}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>DescripciÃ³n (opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Un pequeÃ±o detalle del evento..."
              rows={2}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '1rem',
                resize: 'vertical'
              }}
              disabled={saving}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fecha y Hora del Evento</label>
            <input 
              type="datetime-local" 
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '1rem'
              }}
              disabled={saving}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Creando...
              </>
            ) : (
              'Crear Evento'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
