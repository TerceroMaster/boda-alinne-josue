import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, CalendarHeart, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const EventAlbum = ({ event, onBack }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImmersive, setIsImmersive] = useState(false);
  const [immersiveMedia, setImmersiveMedia] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('wedding_media')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const visiblePosts = data.filter(p => 
          p.title !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
          p.title !== 'BACKGROUND_PICTURE_SYSTEM_RECORD' &&
          p.guest_name !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
          p.guest_name !== 'BACKGROUND_PICTURE_SYSTEM_RECORD' &&
          (p.media_type === 'image' || p.media_type === 'video')
        );
        setPosts(visiblePosts);
      } catch (error) {
        console.error('Error fetching album posts:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    const channel = supabase
      .channel('public:wedding_media:event=' + event.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wedding_media', filter: 'event_id=eq.' + event.id }, payload => {
        if (payload.eventType === 'INSERT') {
          if (
            payload.new.title !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
            payload.new.title !== 'BACKGROUND_PICTURE_SYSTEM_RECORD' &&
            payload.new.guest_name !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
            (payload.new.media_type === 'image' || payload.new.media_type === 'video')
          ) {
            setPosts(current => [payload.new, ...current]);
          }
        } else if (payload.eventType === 'DELETE') {
          setPosts(current => current.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  const openImmersive = (post) => {
    setImmersiveMedia(post);
    setIsImmersive(true);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Header del Ãlbum */}
      <div style={{ marginBottom: '3rem', textAlign: 'center', position: 'relative' }}>
        <button 
          onClick={onBack}
          className="btn-secondary"
          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
          {event.name}
        </h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          {format(parseISO(event.created_at), "MMMM yyyy", { locale: es })}
          {event.description && ` â€¢ ${event.description}`}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>
            <CalendarHeart size={48} color="var(--accent-color)" />
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Ãlbum VacÃ­o</h3>
          <p>AÃºn no hay fotos en este evento. Â¡Agrega el primer recuerdo!</p>
          <p style={{ fontSize: '0.875rem' }}></p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              className={`glass-panel animate-fade-in delay-${(index % 3 + 1) * 100}`}
              style={{ overflow: 'hidden', padding: 0, cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--glass-border)', position: 'relative' }}
              onClick={() => openImmersive(post)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: '100%', height: '280px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={`${post.media_url}?t=${Date.now()}`} 
                  alt={post.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  
                />
              </div>
              <div style={{ padding: '1rem', position: 'relative' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{post.title}</h4>
                {post.description && (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {post.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visor Inmersivo */}
      {isImmersive && immersiveMedia && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setIsImmersive(false)}
        >
          <button 
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', zIndex: 20 }}
            onClick={(e) => { e.stopPropagation(); setIsImmersive(false); }}
          >
            <X size={36} />
          </button>

          <div style={{ position: 'absolute', top: '2rem', width: '100%', textAlign: 'center', color: 'white', zIndex: 10 }}>
             <h3 style={{ margin: 0, fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{immersiveMedia.title}</h3>
             {immersiveMedia.description && <p style={{ margin: '0.5rem 0 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{immersiveMedia.description}</p>}
          </div>
          
          {immersiveMedia.media_type === 'image' ? (
            <img 
              src={immersiveMedia.media_url} 
              alt={immersiveMedia.title} 
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }} 
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video 
              src={immersiveMedia.media_url} 
              controls
              autoPlay
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default EventAlbum;
