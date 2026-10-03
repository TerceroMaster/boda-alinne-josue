import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, UploadCloud, Loader2, Info } from 'lucide-react';

const UploadModal = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showLimitsInfo, setShowLimitsInfo] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_events')
        .select('id, name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const filteredEvents = data ? data.filter(e => e.name !== 'SYSTEM_HIDDEN_EVENT') : [];
      setEvents(filteredEvents);
      if (filteredEvents.length > 0) {
        setEventId(filteredEvents[0].id); // Auto select the latest event
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 50MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !eventId) {
      setError('Por favor, ingresa un título, selecciona un archivo y un evento.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('wedding_media_bucket')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wedding_media_bucket')
        .getPublicUrl(filePath);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      const { error: dbError } = await supabase
        .from('wedding_media')
        .insert([
          {
            
            event_id: eventId,
              title,
            description,
            media_type: mediaType,
            media_url: publicUrl
          }
        ]);

      if (dbError) throw dbError;

      setTitle('');
      setDescription('');
      setFile(null);
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al subir el archivo.');
    } finally {
      setUploading(false);
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
        maxWidth: '500px',
        padding: '2rem',
        position: 'relative',
        backgroundColor: 'var(--bg-primary)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
          disabled={uploading}
        >
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--accent-color)' }}>Nuevo Recuerdo</h2>
          <button 
            type="button"
            onClick={() => setShowLimitsInfo(!showLimitsInfo)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-hover)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <Info size={18} /> Límites
          </button>
        </div>

        {showLimitsInfo && (
          <div className="animate-fade-in" style={{ padding: '1rem', backgroundColor: 'var(--accent-light)', color: 'var(--text-main)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid var(--accent-color)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-hover)' }}>⚠️ Información Importante</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li><strong>Tamaño máximo:</strong> 50 MB por archivo.</li>
              <li><strong>Fotos:</strong> Tienes capacidad aproximada para unas ~300 a 400 fotos en total.</li>
              <li><strong>Videos:</strong> Sube videos cortos (15 a 30 segundos grabados en el celular normal) para asegurarte de que pesen menos de 50 MB.</li>
            </ul>
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Evento</label>
            {events.length > 0 ? (
              <select 
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '8px',
                  border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '1rem',
                  backgroundColor: 'white'
                }}
                disabled={uploading}
                required
              >
                <option value="" disabled>Selecciona un evento...</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            ) : (
              <div style={{ color: 'var(--danger)', fontSize: '0.875rem', padding: '0.5rem 0' }}>
                Debes crear un evento primero.
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Título de la foto/video</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Abriendo regalos"
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '1rem'
              }}
              disabled={uploading}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Descripción (opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribe algo hermoso..."
              rows={2}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px',
                border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '1rem',
                resize: 'vertical'
              }}
              disabled={uploading}
            />
          </div>

          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--accent-color)',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              backgroundColor: file ? 'var(--accent-light)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <input 
              type="file" 
              accept="image/*,video/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <UploadCloud size={32} color="var(--accent-color)" style={{ margin: '0 auto 0.5rem' }} />
            {file ? (
              <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>{file.name}</p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Haz clic para seleccionar foto/video</p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            disabled={uploading || events.length === 0}
          >
            {uploading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Subiendo...
              </>
            ) : (
              'Guardar Recuerdo'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
