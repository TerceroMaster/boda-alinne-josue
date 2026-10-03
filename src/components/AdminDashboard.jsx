import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabaseClient';
import { Shield, Lock, Trash2, Camera, Image as ImageIcon, ArrowLeft, Loader2, ChevronDown, ChevronUp, Link, CheckCircle2, XCircle, Download, Music } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [guests, setGuests] = useState([]);
  const [dedications, setDedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);

  const avatarInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const musicInputRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1357') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('PIN incorrecto');
      setPin('');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: evData } = await supabase.from('wedding_events').select('*').order('created_at', { ascending: false });
      const { data: postData } = await supabase.from('wedding_media').select('*').order('created_at', { ascending: false });
      const { data: guestData } = await supabase.from('wedding_guests').select('*').order('created_at', { ascending: false });
      const { data: dedData } = await supabase.from('wedding_wishes').select('*').order('created_at', { ascending: false });
      
      setEvents(evData || []);
      setPosts(postData || []);
      setGuests(guestData || []);
      setDedications(dedData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventDelete = async (eventId, eventName) => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar el evento "${eventName}" y TODOS sus recuerdos?`);
    if (!confirmed) return;

    try {
      await supabase.from('wedding_media').delete().eq('event_id', eventId);
      await supabase.from('wedding_events').delete().eq('id', eventId);
      fetchData();
    } catch (error) {
      console.error('Error eliminando evento:', error);
      alert('Error al eliminar evento.');
    }
  };

  const handlePostDelete = async (postId) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este recuerdo?');
    if (!confirmed) return;

    try {
      await supabase.from('wedding_media').delete().eq('id', postId);
      fetchData();
    } catch (error) {
      console.error('Error eliminando foto:', error);
      alert('Error al eliminar recuerdo.');
    }
  };

  const handleDeleteGuest = async (guestId, guestName) => {
    const confirmed = window.confirm(`¿Seguro que deseas eliminar a "${guestName}" de la lista de invitados?`);
    if (!confirmed) return;

    try {
      await supabase.from('wedding_guests').delete().eq('id', guestId);
      fetchData();
    } catch (error) {
      console.error('Error eliminando invitado:', error);
      alert('Error al eliminar invitado.');
    }
  };

  const handleDeleteDedication = async (dedicationId) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar esta dedicatoria?');
    if (!confirmed) return;

    try {
      await supabase.from('wedding_wishes').delete().eq('id', dedicationId);
      fetchData();
    } catch (error) {
      console.error('Error eliminando dedicatoria:', error);
      alert('Error al eliminar dedicatoria.');
    }
  };

  const handleSystemImageUpload = async (e, title, setUploadingState, inputRef) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploadingState(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `sys_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('wedding_media_bucket').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('wedding_media_bucket').getPublicUrl(filePath);

      let eventId;
      const { data: hiddenEvents } = await supabase.from('wedding_events').select('id').eq('name', 'SYSTEM_HIDDEN_EVENT').limit(1);
      if (hiddenEvents && hiddenEvents.length > 0) {
        eventId = hiddenEvents[0].id;
      } else {
        const { data: newEvent } = await supabase.from('wedding_events').insert([{ name: 'SYSTEM_HIDDEN_EVENT', description: 'Hidden system event' }]).select('id');
        eventId = newEvent[0].id;
      }

      await supabase.from('wedding_media').insert([{
        event_id: eventId,
        title: title,
        media_type: 'image',
        media_url: publicUrl
      }]);

      alert('Imagen actualizada con éxito. Ve a la página principal para ver los cambios.');
      fetchData();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen.');
    } finally {
      setUploadingState(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleMusicUpload = async (e) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploadingMusic(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `music_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('wedding_media_bucket').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('wedding_media_bucket').getPublicUrl(filePath);

      // Save to settings
      const { error: dbError } = await supabase.from('wedding_settings').upsert({ 
        key_name: 'background_music_url', 
        value: publicUrl 
      }, { onConflict: 'key_name' });

      if (dbError) throw dbError;

      alert('Música actualizada con éxito. Ve a la página principal para escucharla.');
    } catch (error) {
      console.error('Error uploading music:', error);
      alert('Error al subir la música.');
    } finally {
      setUploadingMusic(false);
      if (musicInputRef.current) musicInputRef.current.value = '';
    }
  };

  const generatePDF = (event, eventGuests) => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text(`Lista de Invitados - ${event.name}`, 14, 22);
      
      // Summary
      const attending = eventGuests.filter(g => g.status === 'attending');
      const declined = eventGuests.filter(g => g.status === 'declined');
      doc.setFontSize(12);
      doc.text(`Total Confirmados: ${attending.length}`, 14, 32);
      doc.text(`Total Cancelados: ${declined.length}`, 14, 38);

      // Table Data
      const tableColumn = ["Nombre", "Status", "Sexo", "Edad", "WhatsApp"];
      const tableRows = [];

      eventGuests.forEach(g => {
        const statusText = g.status === 'attending' ? 'Confirmado' : 'Cancelado';
        const guestData = [
          g.full_name,
          statusText,
          g.gender || '-',
          g.age ? `${g.age} años` : '-',
          g.whatsapp || '-'
        ];
        tableRows.push(guestData);
      });

      autoTable(doc, {
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229] }, // matching theme accent color
      });

      const dateStr = format(new Date(), "yyyy-MM-dd");
      doc.save(`Invitados_${event.name.replace(/\s+/g, '_')}_${dateStr}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Hubo un error al generar el PDF: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '1rem' }}>
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <Shield size={48} color="var(--accent-color)" style={{ margin: '0 auto 1.5rem' }} />
          <h1 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Acceso Admin</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ingresa tu PIN de seguridad para continuar.</p>
          
          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.25rem', letterSpacing: '0.2em', textAlign: 'center' }}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
              Entrar al Panel
            </button>
          </form>
          <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--accent-hover)', textDecoration: 'none', fontSize: '0.875rem' }}>
            &larr; Volver a la página principal
          </a>
        </div>
      </div>
    );
  }

  const visibleEvents = events.filter(e => e.name !== 'SYSTEM_HIDDEN_EVENT');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Admin */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={32} color="var(--accent-color)" />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1a1a1a' }}>Panel de Control</h1>
              <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>Modo Administrador Activo</p>
            </div>
          </div>
          <a href="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Ver Página
          </a>
        </div>

        {/* Diseño Global */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Personalización Global</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="btn-secondary"
              disabled={uploadingAvatar}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              Cambiar Foto de Perfil
            </button>
            <input type="file" accept="image/*" ref={avatarInputRef} style={{ display: 'none' }} onChange={(e) => handleSystemImageUpload(e, 'PROFILE_PICTURE_SYSTEM_RECORD', setUploadingAvatar, avatarInputRef)} />
            
            <button 
              onClick={() => bgInputRef.current?.click()}
              className="btn-secondary"
              disabled={uploadingBg}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {uploadingBg ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
              Cambiar Fondo Pantalla
            </button>
            <input type="file" accept="image/*" ref={bgInputRef} style={{ display: 'none' }} onChange={(e) => handleSystemImageUpload(e, 'BACKGROUND_PICTURE_SYSTEM_RECORD', setUploadingBg, bgInputRef)} />
            
            <button 
              onClick={() => musicInputRef.current?.click()}
              className="btn-secondary"
              disabled={uploadingMusic}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {uploadingMusic ? <Loader2 size={16} className="animate-spin" /> : <Music size={16} />}
              Cambiar Música
            </button>
            <input type="file" accept="audio/*" ref={musicInputRef} style={{ display: 'none' }} onChange={handleMusicUpload} />
          </div>
        </div>

        {/* Gestión de Eventos y Recuerdos */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Gestión de Contenido</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-color)' }} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {visibleEvents.map(event => {
                const eventPosts = posts.filter(p => p.event_id === event.id && p.guest_name !== 'PROFILE_PICTURE_SYSTEM_RECORD' && p.guest_name !== 'BACKGROUND_PICTURE_SYSTEM_RECORD');
                const isExpanded = expandedEventId === event.id;

                return (
                  <div key={event.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                    <div 
                      style={{ backgroundColor: '#f9fafb', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                      onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {isExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a' }}>{event.name}</h3>
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>{eventPosts.length} recuerdos</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEventDelete(event.id, event.name); }}
                        style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}
                        title="Eliminar Evento Completo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #eee' }}>
                        
                        {/* Invitation Section */}
                        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#fdfbf7', borderRadius: '8px', border: '1px solid #f0e6d2' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Gestión de Invitados</h4>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => {
                                  const url = `${window.location.origin}/invite/${event.id}`;
                                  navigator.clipboard.writeText(url);
                                  alert('¡Link de invitación copiado! Envíalo por WhatsApp.');
                                }}
                                className="btn-secondary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                              >
                                <Link size={14} />
                                Copiar Link
                              </button>
                              
                              <button 
                                onClick={() => generatePDF(event, guests.filter(g => g.event_id === event.id))}
                                className="btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                              >
                                <Download size={14} />
                                Descargar PDF
                              </button>
                            </div>
                          </div>
                          
                          {(() => {
                            const eventGuests = guests.filter(g => g.event_id === event.id);
                            const attending = eventGuests.filter(g => g.status === 'attending');
                            const declined = eventGuests.filter(g => g.status === 'declined');

                            return (
                              <div>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                  <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 'bold' }}>{attending.length} Confirmados</span>
                                  <span style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 'bold' }}>{declined.length} Cancelados</span>
                                </div>
                                {eventGuests.length === 0 ? (
                                  <p style={{ color: '#888', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>Nadie ha respondido aún a la invitación.</p>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                    {eventGuests.map(g => (
                                      <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #eee' }}>
                                        {g.status === 'attending' ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="var(--danger)" />}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
                                          <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{g.full_name}</span>
                                          {(g.gender || g.age) && (
                                            <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                              {g.gender && <span>{g.gender}</span>}
                                              {g.gender && g.age && ' • '}
                                              {g.age && <span>{g.age} años</span>}
                                            </span>
                                          )}
                                        </div>
                                        {g.whatsapp && <span style={{ color: '#888', fontSize: '0.8rem', marginRight: '1rem' }}>WA: {g.whatsapp}</span>}
                                        
                                        <button 
                                          onClick={() => handleDeleteGuest(g.id, g.full_name)}
                                          style={{ background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer', padding: '0.2rem', display: 'flex' }}
                                          title="Eliminar invitado"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Recuerdos Subidos</h4>
                        {eventPosts.length === 0 ? (
                          <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>No hay recuerdos en este evento.</p>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {eventPosts.map(post => (
                              <div key={post.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee', aspectRatio: '1/1' }}>
                                {post.media_type === 'video' ? (
                                  <video src={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <img src={post.media_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.5rem', color: 'white', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {post.title}
                                </div>
                                <button 
                                  onClick={() => handlePostDelete(post.id)}
                                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {visibleEvents.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No has creado eventos todavía.</p>}
            </div>
          )}
        </div>

        {/* Gestión de Dedicatorias */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginTop: '2rem' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Gestión de Dedicatorias</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-color)' }} /></div>
          ) : dedications.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center' }}>No hay dedicatorias publicadas.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {dedications.map(ded => (
                <div key={ded.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9fafb', position: 'relative' }}>
                  <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#333' }}>"{ded.message}"</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.9rem' }}>- {ded.author}</p>
                  <button 
                    onClick={() => handleDeleteDedication(ded.id)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}
                    title="Eliminar Dedicatoria"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
