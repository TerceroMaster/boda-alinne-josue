import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle2, XCircle, Loader2, Heart, Calendar, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import VipPass from './VipPass';

const Invitation = ({ eventId }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState(null);
  const [guestId, setGuestId] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('wedding_events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleRSVP = async (status) => {
    if (!name.trim()) {
      alert('Por favor ingresa tu nombre y apellido.');
      return;
    }
    if (!gender && status === 'attending') {
      alert('Por favor selecciona tu gÃ©nero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        attending: true,
        full_name: name.trim(),
        whatsapp: whatsapp.trim() || null,
        status: status
      };

      if (status === 'attending') {
        payload.gender = gender;
        if (age.trim()) payload.age = parseInt(age, 10);
      }

      const { data, error } = await supabase
        .from('wedding_guests')
        .insert([payload])
        .select();

      if (error) throw error;
      setSubmittedStatus(status);
      if (status === 'attending' && data && data.length > 0) {
        setGuestId(data[0].id);
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('OcurriÃ³ un error al enviar tu respuesta. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} className="animate-spin" color="var(--accent-color)" />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div>
          <h2>Evento no encontrado</h2>
          <p>El enlace de invitaciÃ³n parece ser invÃ¡lido o el evento fue eliminado.</p>
        </div>
      </div>
    );
  }

  if (submittedStatus) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {submittedStatus === 'attending' ? (
            <VipPass guestName={name} event={event} guestId={guestId} />
          ) : (
            <>
              <Heart size={64} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Â¡Te extraÃ±aremos! ðŸ˜”</h2>
              <p style={{ color: 'var(--text-muted)' }}>Entendemos que no puedas asistir. PodrÃ¡s ver todas las fotos y videos del evento en esta misma pÃ¡gina despuÃ©s de la fiesta.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', background: 'rgba(253, 251, 247, 0.8)' }}>
      
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', textAlign: 'center', marginTop: '2rem' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-hover)', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
          <Heart size={16} fill="currentColor" />
          ESTÃS INVITADO(A)
        </div>

        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>
          {event.name}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} />
            <span>{format(parseISO(event.event_date || event.created_at), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}</span>
          </div>
          {event.description && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '80%' }}>
              <MapPin size={18} />
              <span>{event.description}</span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', margin: '2rem 0' }}></div>

        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Confirma tu asistencia</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '350px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="Tu Nombre y Apellido" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ 
              width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)',
              fontSize: '1rem', fontFamily: 'inherit'
            }}
          />
          
          <input 
            type="tel" 
            placeholder="WhatsApp (Opcional)" 
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            style={{ 
              width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)',
              fontSize: '1rem', fontFamily: 'inherit'
            }}
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ 
                flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)',
                fontSize: '1rem', fontFamily: 'inherit', color: gender ? 'inherit' : '#757575'
              }}
            >
              <option value="" disabled>Sexo</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>

            <input 
              type="number" 
              placeholder="Edad (Opcional)" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="0"
              max="120"
              style={{ 
                flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)',
                fontSize: '1rem', fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              onClick={() => handleRSVP('attending')}
              disabled={submitting}
              className="btn-primary"
              style={{ flex: 1, padding: '1rem', background: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
            >
              {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'SÃ­, asistirÃ©'}
            </button>
            <button 
              onClick={() => handleRSVP('declined')}
              disabled={submitting}
              className="btn-secondary"
              style={{ flex: 1, padding: '1rem' }}
            >
              {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'No podrÃ©'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Invitation;
