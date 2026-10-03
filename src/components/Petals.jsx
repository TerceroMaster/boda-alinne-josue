import React, { useEffect, useState } from 'react';

const Petals = () => {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    // Generate petals only on the client side
    const generatePetals = () => {
      const newPetals = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 5 + 5}s`, // 5 to 10s
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.5 + 0.3,
        size: Math.random() * 10 + 10, // 10px to 20px
        rotate: Math.random() * 360
      }));
      setPetals(newPetals);
    };

    generatePetals();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {petals.map(petal => (
        <div
          key={petal.id}
          style={{
            position: 'absolute',
            top: '-50px',
            left: petal.left,
            fontSize: `${petal.size * 1.5}px`,
            opacity: petal.opacity,
            animation: `fall ${petal.animationDuration} linear ${petal.animationDelay} infinite`,
            transform: `rotate(${petal.rotate}deg)`
          }}
        >
          ðŸŒ»
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Petals;
