import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { Camera, Loader2, Eye, X } from 'lucide-react';

const ProfilePicture = ({ isAdmin }) => {
  const [imageUrl, setImageUrl] = useState('/cliente_mtfd.jpg');
  const [uploading, setUploading] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const fileInputRef = useRef(null);

  // Removed the useEffect that fetches the profile picture to rely on the static one,
  // unless they upload a new one. In a real app we'd fetch it, but for this demo 
  // we want to ensure the client image is shown first.

  const handleFileChange = async (e) => {
    try {
      if (!isAdmin) {
        alert('Debes activar el Modo Administrador para cambiar la foto.');
        return;
      }
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `profile_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('wedding_media_bucket')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get URL
      const { data: { publicUrl } } = supabase.storage
        .from('wedding_media_bucket')
        .getPublicUrl(filePath);

      // Save as a special hidden post to avoid schema changes
      // We will need a dummy event_id. Let's find or create a hidden event.
      let eventId;
      const { data: hiddenEvents } = await supabase
        .from('events_mtfd')
        .select('id')
        .eq('name', 'SYSTEM_HIDDEN_EVENT')
        .limit(1);

      if (hiddenEvents && hiddenEvents.length > 0) {
        eventId = hiddenEvents[0].id;
      } else {
        const { data: newEvent, error: evError } = await supabase
          .from('events_mtfd')
          .insert([{ name: 'SYSTEM_HIDDEN_EVENT', description: 'Hidden system event' }])
          .select('id');
        if (evError) throw evError;
        eventId = newEvent[0].id;
      }

      const { error: postErr } = await supabase
        .from('wedding_media')
        .insert([{
          
          guest_name: 'PROFILE_PICTURE_SYSTEM_RECORD',
          media_type: 'image',
          media_url: publicUrl
        }]);
      if (postErr) throw postErr;

      setImageUrl(publicUrl);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Error: ' + (error.message || 'Error desconocido al subir archivo.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '280px', height: '280px', flexShrink: 0 }}>
      <div className="animate-fade-in animate-pulse-gentle" style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '6px solid var(--accent-light)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        <img 
          src={imageUrl} 
          alt="Alinne y Josue"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Overlay for options */}
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: 'white',
            opacity: uploading ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => { if(!uploading) e.currentTarget.style.opacity = '1' }}
          onMouseLeave={(e) => { if(!uploading) e.currentTarget.style.opacity = '0' }}
        >
          {uploading ? (
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsImmersive(true); }}
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid white', borderRadius: '20px', padding: '0.5rem 1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
              >
                <Eye size={16} /> Ver Foto
              </button>
              {isAdmin && (
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid white', borderRadius: '20px', padding: '0.5rem 1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                >
                  <Camera size={16} /> Actualizar Foto
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />

      {/* Immersive View Modal */}
      {isImmersive && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0, padding: 0,
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setIsImmersive(false)}
        >
          <button 
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '10px' }}
            onClick={(e) => { e.stopPropagation(); setIsImmersive(false); }}
          >
            <X size={36} />
          </button>
          <img 
            src={imageUrl} 
            alt="Alinne y Josue Full" 
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfilePicture;
