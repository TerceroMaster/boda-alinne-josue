import React, { useState, useEffect } from 'react';

const Countdown = () => {
  // Configura aquÃ­ la fecha de la celebraciÃ³n
  const targetDate = new Date('2026-11-20T16:30:00').getTime();

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeBlocks = [
    { label: 'DÃAS', value: timeLeft.days },
    { label: 'HRS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEG', value: timeLeft.seconds }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '1.5rem',
      marginBottom: '1rem'
    }}>
      {timeBlocks.map((block, idx) => (
        <div key={idx} style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '12px',
          padding: '0.75rem',
          minWidth: '70px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: 'var(--accent-hover)',
            lineHeight: 1
          }}>
            {block.value.toString().padStart(2, '0')}
          </span>
          <span style={{ 
            fontSize: '0.65rem', 
            fontWeight: 600,
            color: 'var(--text-main)', 
            marginTop: '4px',
            letterSpacing: '1px'
          }}>
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
