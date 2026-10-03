import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Send, MessageSquareHeart } from 'lucide-react';

const badWords = [
  'puta', 'puto', 'mierda', 'pendejo', 'pendeja', 'cabron', 'cabrÃ³n', 'chinga', 'chingada',
  'verga', 'pito', 'panocha', 'culo', 'culero', 'idiota', 'estupido', 'estÃºpido', 'imbecil',
  'imbÃ©cil', 'zorra', 'perra', 'maldito', 'maldita', 'jodete', 'jÃ³dete', 'coÃ±o', 'maricon', 'maricÃ³n',
  'sexo', 'porno', 'putas', 'putos', 'pendejos'
];

const containsProfanity = (text) => {
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return badWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(normalized);
  });
};

const Guestbook = () => {
  const [dedications, setDedications] = useState([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDedications = async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_wishes')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        // If the table doesn't exist yet, just ignore to avoid breaking the page
        console.warn('Could not fetch dedications:', error);
        return;
      }
      setDedications(data || []);
    } catch (err) {
      console.error('Error fetching dedications', err);
    }
  };

  useEffect(() => {
    fetchDedications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newMessage.trim()) return;

    if (containsProfanity(newAuthor) || containsProfanity(newMessage)) {
      alert('Lo sentimos, tu mensaje contiene lenguaje inapropiado y no puede ser publicado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('wedding_wishes')
        .insert([
          { guest_name: newAuthor, message: newMessage }
        ]);

      if (error) {
        console.error('Error adding dedication:', error);
        alert('Hubo un error al guardar tu dedicatoria. IntÃ©ntalo de nuevo.');
      } else {
        setNewAuthor('');
        setNewMessage('');
        fetchDedications(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <MessageSquareHeart size={28} color="var(--accent-color)" />
          Muro de Dedicatorias
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Deja unas hermosas palabras para Josuï¿½ y Mï¿½nica</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Tu Nombre"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.5)',
              color: 'var(--text-main)',
              fontFamily: 'inherit'
            }}
            required
          />
          <textarea
            placeholder="Escribe tu dedicatoria aquÃ­..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.5)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            required
          />
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting}
            style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? 'Enviando...' : (
              <>
                <Send size={16} /> Enviar Dedicatoria
              </>
            )}
          </button>
        </form>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {dedications.map((dedication) => (
          <div key={dedication.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
            <p style={{ fontStyle: 'italic', marginBottom: '1rem', fontSize: '1rem', lineHeight: 1.5 }}>
              "{dedication.message}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ height: '1px', background: 'var(--accent-color)', flex: 1, opacity: 0.3 }} />
              <span style={{ fontWeight: 600, color: 'var(--accent-hover)' }}>{dedication.guest_name}</span>
            </div>
          </div>
        ))}
      </div>
      {dedications.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          AÃºn no hay dedicatorias. Â¡SÃ© el primero en dejar un lindo mensaje!
        </p>
      )}
    </div>
  );
};

export default Guestbook;
