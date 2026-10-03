import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Play, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const Cube = ({ videos, cubeIndex, autoRotate }) => {
  const cubeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: -20, y: 45 });

  // Helper to get video for a face
  const getVideo = (faceIndex) => {
    return videos[faceIndex] || null;
  };

  const faces = [
    { name: 'front', index: 0 },
    { name: 'back', index: 1 },
    { name: 'right', index: 2 },
    { name: 'left', index: 3 },
    { name: 'top', index: 4 },
    { name: 'bottom', index: 5 }
  ];

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setPreviousMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    
    setRotation(prev => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    
    setRotation(prev => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    setPreviousMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  // Setup global listeners for drag outside the cube area
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEndDrag);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEndDrag);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
    };
  }, [isDragging, previousMousePosition]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 2rem' }}>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>Cubo {cubeIndex + 1}</h3>
      <div 
        className="cube-scene"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className={`cube ${autoRotate ? 'auto-rotate' : ''}`}
          ref={cubeRef}
          style={!autoRotate ? { transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` } : {}}
        >
          {faces.map(face => {
            const video = getVideo(face.index);
            return (
              <div key={face.name} className={`cube__face cube__face--${face.name}`}>
                {video ? (
                  <video 
                    src={video.media_url} 
                    controls
                    preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onClick={(e) => {
                      // Stop propagation to prevent drag conflicts when clicking controls
                      e.stopPropagation();
                    }}
                  />
                ) : (
                  <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }}>
                    <Play size={48} />
                    <p style={{ fontSize: '0.875rem', marginTop: '1rem', fontWeight: '500' }}>Espacio Libre</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const VideoCubeModal = ({ event, onClose }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCubePage, setCurrentCubePage] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('wedding_media')
          .select('*')
          .eq('event_id', event.id)
          .eq('media_type', 'video')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVideos(data || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [event.id]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} color="white" className="animate-spin" />
      </div>
    );
  }

  // Chunk videos into arrays of max 6 elements
  const chunkedVideos = [];
  for (let i = 0; i < Math.min(videos.length, 18); i += 6) {
    chunkedVideos.push(videos.slice(i, i + 6));
  }
  
  // Always show at least 1 cube even if empty
  if (chunkedVideos.length === 0) {
    chunkedVideos.push([]);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h2 style={{ color: 'white', margin: 0 }}>Galería 3D de Videos</h2>
          <p style={{ color: '#aaa', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{event.name}</p>
        </div>
        <button onClick={onClose} style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
        {chunkedVideos.length > 1 && (
          <button 
            onClick={() => setCurrentCubePage(prev => Math.max(0, prev - 1))}
            disabled={currentCubePage === 0}
            style={{ position: 'absolute', left: '1rem', color: 'white', opacity: currentCubePage === 0 ? 0.3 : 1, zIndex: 10 }}
          >
            <ChevronLeft size={48} />
          </button>
        )}

        <div style={{ display: 'flex', transition: 'transform 0.3s ease', transform: `translateX(-${currentCubePage * 100}vw)`, width: `${chunkedVideos.length * 100}vw` }}>
          {chunkedVideos.map((cubeVideos, index) => (
            <div key={index} style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
              <Cube videos={cubeVideos} cubeIndex={index} autoRotate={autoRotate} />
            </div>
          ))}
        </div>

        {chunkedVideos.length > 1 && (
          <button 
            onClick={() => setCurrentCubePage(prev => Math.min(chunkedVideos.length - 1, prev + 1))}
            disabled={currentCubePage === chunkedVideos.length - 1}
            style={{ position: 'absolute', right: '1rem', color: 'white', opacity: currentCubePage === chunkedVideos.length - 1 ? 0.3 : 1, zIndex: 10 }}
          >
            <ChevronRight size={48} />
          </button>
        )}

      </div>

      {/* Footer / Instructions */}
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#888', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="btn-secondary" 
          style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? 'Pausar Rotación' : 'Rotar Automáticamente'}
        </button>
        <div>
          Arrastra el cubo para girarlo manualmente y ver todos los videos.
          {chunkedVideos.length > 1 && <div style={{ marginTop: '0.5rem', color: 'white' }}>Cubo {currentCubePage + 1} de {chunkedVideos.length}</div>}
        </div>
      </div>

    </div>
  );
};

export default VideoCubeModal;
