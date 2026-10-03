import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarHeart, Video, Image as ImageIcon, MapPin, Box } from 'lucide-react';
import VideoCubeModal from './VideoCubeModal';

const Timeline = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [postsByEvent, setPostsByEvent] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCubeEvent, setActiveCubeEvent] = useState(null);

  const fetchData = async () => {
    try {
      // 1. Fetch Events
      const { data: eventsDataRaw, error: eventsError } = await supabase
        .from('wedding_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      const eventsData = eventsDataRaw?.filter(e => e.name !== 'SYSTEM_HIDDEN_EVENT') || [];

      // 2. Fetch Posts
      const { data: postsData, error: postsError } = await supabase
        .from('wedding_media')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Group posts by event_id
      const grouped = {};
      postsData?.forEach(post => {
        if (!grouped[post.event_id]) {
          grouped[post.event_id] = [];
        }
        grouped[post.event_id].push(post);
      });

      setEvents(eventsData || []);
      setPostsByEvent(grouped);
    } catch (error) {
      console.error('Error fetching timeline data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to both tables
    const channelEvents = supabase
      .channel('public:events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wedding_events' }, payload => {
        setEvents(current => [payload.new, ...current]);
      })
      .subscribe();

    const channelPosts = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wedding_media' }, payload => {
        if (payload.eventType === 'INSERT') {
          if (payload.new.guest_name !== 'PROFILE_PICTURE_SYSTEM_RECORD' && payload.new.guest_name !== 'BACKGROUND_PICTURE_SYSTEM_RECORD') {
            setPostsByEvent(current => {
              const eventPosts = current[payload.new.event_id] || [];
              return {
                ...current,
                [payload.new.event_id]: [payload.new, ...eventPosts]
              };
            });
          }
        } else if (payload.eventType === 'DELETE') {
          setPostsByEvent(current => {
            const newPosts = { ...current };
            for (const eventId in newPosts) {
              newPosts[eventId] = newPosts[eventId].filter(p => p.id !== payload.old.id);
            }
            return newPosts;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelEvents);
      supabase.removeChannel(channelPosts);
    };
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <div style={{ animation: 'spin 1s linear infinite' }}>
          <CalendarHeart size={48} color="var(--accent-color)" />
        </div>
      </div>
    );
  }

  const visibleEvents = events.filter(e => e.name !== 'SYSTEM_HIDDEN_EVENT');

  if (visibleEvents.length === 0) {
    return (
      <div className="container glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <h3 style={{ color: 'var(--text-muted)' }}>AÃºn no hay eventos.</h3>
        <p>Crea el primer evento para empezar a guardar recuerdos.</p>
      </div>
    );
  }

  return (
    <div className="container timeline-container">
      {visibleEvents.map((event, evIndex) => {
        const eventPosts = postsByEvent[event.id] || [];

        // Filtrar posts ocultos y asegurar que solo mostramos imÃ¡genes en la portada y cuenta
        const visiblePosts = eventPosts.filter(p => 
          p.title !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
          p.title !== 'BACKGROUND_PICTURE_SYSTEM_RECORD' &&
          p.media_type === 'image'
        );

        return (
          <div key={event.id} style={{ marginBottom: '4rem' }} className="animate-fade-in">
            {/* Event Header */}
            <div style={{
              position: 'relative',
              marginLeft: '48px', // Align with timeline line
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
               {/* Event Node */}
              <div style={{
                position: 'absolute',
                left: '-60px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 0 0 4px var(--bg-primary), var(--shadow-sm)',
                zIndex: 10
              }}>
                <MapPin size={16} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', margin: 0 }}>
                    {event.name}
                  </h2>
                </div>
                <div style={{ color: '#1a1a1a', fontWeight: '500', textShadow: '0 1px 2px rgba(255,255,255,0.8)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {format(parseISO(event.event_date || event.created_at), "MMMM yyyy", { locale: es })} 
                  {event.description && ` â€¢ ${event.description}`}
                </div>
              </div>
            </div>

            {/* Event Cover Photo & Summary */}
            <div 
              className="glass-panel animate-fade-in"
              style={{
                position: 'relative',
                margin: '1.5rem 0',
                marginLeft: '48px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onClick={() => onEventClick && onEventClick(event)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Small Post Node */}
              <div style={{
                position: 'absolute',
                left: '-31px',
                top: '28px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-light)',
                border: '2px solid var(--accent-hover)'
              }} />

              {visiblePosts.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
                  Sin fotos o videos aÃºn. Â¡Agrega el primero!
                </div>
              ) : (
                <>
                  {/* Cover Media */}
                  <div style={{ 
                    borderRadius: 'var(--radius-md)', 
                    overflow: 'hidden', 
                    marginBottom: '1.5rem',
                    backgroundColor: '#000',
                    height: '220px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={visiblePosts[0].media_url} 
                      alt={visiblePosts[0].title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Summary Footer */}
                  <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{visiblePosts.length} recuerdo{visiblePosts.length !== 1 && 's'}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ãšltimo: {visiblePosts[0].title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      >
                        <ImageIcon size={16} />
                        Ver Ã¡lbum completo
                      </button>
                      <button 
                        className="btn-primary" 
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)' }}
                        onClick={(e) => { e.stopPropagation(); setActiveCubeEvent(event); }}
                      >
                        <Box size={16} />
                        Videos 3D
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      
      {activeCubeEvent && (
        <VideoCubeModal 
          event={activeCubeEvent} 
          onClose={() => setActiveCubeEvent(null)} 
        />
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Timeline;
