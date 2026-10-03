import React, { useState, useRef, useEffect } from 'react';
import { Music, Pause } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicUrl, setMusicUrl] = useState('/la-carrera-del-violinista.mp3');
  const audioRef = useRef(null);

  useEffect(() => {
    // Attempt auto-play with lower volume if browser allows
    if (audioRef.current) {
      audioRef.current.volume = 0.2; 
    }

    // Fetch initial music URL
    const fetchMusic = async () => {
      const { data } = await supabase.from('wedding_settings').select('value').eq('key_name', 'background_music_url').single();
      if (data && data.value) setMusicUrl(data.value);
    };
    fetchMusic();

    // Listen for real-time changes
    const subscription = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wedding_settings' }, (payload) => {
        if (payload.new && payload.new.key_name === 'background_music_url') {
          setMusicUrl(payload.new.value);
          // If playing, it will continue playing the new song
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(255,255,255,0.2)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      border: '1px solid rgba(255,255,255,0.3)',
      boxShadow: 'var(--shadow-sm)',
      color: 'var(--text-main)'
    }}>
      <audio ref={audioRef} loop src={musicUrl} autoPlay={isPlaying} />
      <button 
        onClick={togglePlay}
        style={{
          background: 'var(--accent-main)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isPlaying ? <Pause size={16} /> : <Music size={16} />}
      </button>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, opacity: 0.8 }}>
        {isPlaying ? 'Música Clásica' : 'Música'}
      </span>
    </div>
  );
};

export default AudioPlayer;
