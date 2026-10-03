import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Download, CheckCircle, Ticket } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const VipPass = ({ guestName, event, guestId }) => {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const eventDate = event.event_date || event.created_at;
  const eventUrl = "https://linea-vida-vaquerita-ivette.vercel.app/";
  
  const shortId = guestId ? guestId.split('-')[0].toUpperCase() : 'VIP-01';

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `VIP_Pass_${guestName.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      alert('Hubo un error al descargar tu pase. IntÃ©ntalo de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', animation: 'fadeInUp 0.8s ease-out' }}>
      
      <div style={{ textAlign: 'center' }}>
        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ color: 'var(--text-main)', fontSize: '2rem', marginBottom: '0.5rem' }}>Â¡Lugar Reservado!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Te esperamos con mucha emociÃ³n.<br/>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', display: 'block', marginTop: '0.5rem' }}>- Jessica Ivette</span>
        </p>
      </div>

      {/* TICKET WRAPPER */}
      <div 
        ref={ticketRef}
        style={{
          width: '100%',
          maxWidth: '350px',
          background: 'linear-gradient(135deg, #fdfbf7 0%, #f3eedc 100%)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e2d5ba',
          color: '#3e2723'
        }}
      >
        {/* TOP SECTION */}
        <div style={{ padding: '2rem 1.5rem 1.5rem', textAlign: 'center', borderBottom: '2px dashed #d7c5a3', position: 'relative' }}>
          {/* Half circles for the ticket cut out effect */}
          <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '20px', height: '20px', backgroundColor: '#f9f5f0', borderRadius: '50%', boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.05)' }}></div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '20px', height: '20px', backgroundColor: '#f9f5f0', borderRadius: '50%', boxShadow: 'inset 2px 0 3px rgba(0,0,0,0.05)' }}></div>
          
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.7rem', color: '#8d6e63', fontWeight: 'bold', border: '1px solid #d7c5a3', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            ID: {shortId}
          </div>

          <Ticket size={32} color="var(--accent-color)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', color: '#8d6e63' }}>PASE VIP OFICIAL</h3>
          <h1 style={{ margin: '0.5rem 0', fontSize: '1.8rem', color: '#4e342e', fontFamily: 'serif' }}>{event.name}</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#6d4c41', textTransform: 'capitalize' }}>
            {format(parseISO(eventDate), "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {/* MIDDLE SECTION - GUEST INFO */}
        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.4)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', color: '#8d6e63', letterSpacing: '0.05em' }}>INVITADO ESPECIAL</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#3e2723', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {guestName}
          </p>
        </div>

        {/* BOTTOM SECTION - QR */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '2px dashed #d7c5a3', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', backgroundColor: '#f9f5f0', borderRadius: '50%', boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.05)' }}></div>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', backgroundColor: '#f9f5f0', borderRadius: '50%', boxShadow: 'inset 2px 0 3px rgba(0,0,0,0.05)' }}></div>
          
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <QRCodeSVG value={eventUrl} size={100} fgColor="#3e2723" />
          </div>
          <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', color: '#8d6e63', letterSpacing: '0.1em' }}>
            ACCESO CONFIRMADO
          </p>
        </div>
      </div>

      <button 
        onClick={handleDownload}
        className="btn-primary"
        disabled={downloading}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '30px', boxShadow: '0 4px 15px rgba(212, 163, 115, 0.4)' }}
      >
        <Download size={20} />
        {downloading ? 'Generando Pase...' : 'Descargar mi Pase VIP'}
      </button>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default VipPass;
