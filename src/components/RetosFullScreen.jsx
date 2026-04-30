import React, { useState } from 'react';
import { 
    FaArrowLeft, FaGamepad, FaCheckCircle, FaHistory, 
    FaPiggyBank, FaTrash, FaCalendarAlt, FaTimes, FaBell 
} from 'react-icons/fa';

const RetosFullScreen = ({ 
    isOpen, onClose, cajones, ordenCajones, historial, 
    onSaveEvent, onDeleteEvent, eventosCalendario,
    mesActual, anioActual, completarReto, borrarReto 
}) => {
    
    const [selectedDay, setSelectedDay] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventForm, setEventForm] = useState({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' });

    if (!isOpen) return null;

    const hoy = new Date();
    const retosActivos = ordenCajones.filter(n => n.startsWith('Reto:') || n.startsWith('Capricho:'));
    const historialRetos = historial.filter(h => h.nombre.includes('Micro-Reto') || h.nombre.includes('Capricho') || h.nombre.includes('Reto:'));
    const localEventos = eventosCalendario.filter(e => e.categoria === 'Reto');

    // 💡 FIX: SOLO SUMA EL DINERO QUE YA FUE OFICIALMENTE "ASEGURADO" (EL ACUMULADO)
    const totalAcumuladoReal = retosActivos.reduce((total, nombre) => {
        return total + (cajones[nombre]?.acumulado || 0);
    }, 0);

    // 💡 LÓGICA DEL CALENDARIO
    const checkEventosDia = (dia) => {
        if (!dia) return { tienePago: false, tieneGasto: false };
        const fechaVista = new Date(anioActual, mesActual, dia);
        
        const planificados = localEventos.filter(ev => {
            const mC = ev.mesCreacion !== undefined ? ev.mesCreacion : mesActual;
            const aC = ev.anioCreacion !== undefined ? ev.anioCreacion : anioActual;
            const fechaOrigen = new Date(aC, mC, ev.dia);
            if (fechaVista < fechaOrigen) return false;
            if (ev.frecuencia === 'Único') return fechaVista.toDateString() === fechaOrigen.toDateString();
            if (ev.frecuencia === 'Semanal') return fechaVista.getDay() === fechaOrigen.getDay();
            if (ev.frecuencia === 'Mensual') return fechaVista.getDate() === ev.dia;
            return false;
        });

        const reales = historialRetos.filter(h => h.dia === dia && h.mes === mesActual && h.anio === anioActual);
        const realesIn = reales.filter(r => r.nombre.includes('Abono'));
        const realesOut = reales.filter(r => r.nombre.includes('Retiro') || r.nombre.includes('Comprado'));

        return { 
            tienePago: planificados.some(e => e.tipo === 'pago') || realesIn.length > 0, 
            tieneGasto: planificados.some(e => e.tipo === 'gasto') || realesOut.length > 0 
        };
    };

    const openEventModal = (dia) => { setSelectedDay(dia); setEventForm({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' }); setIsEventModalOpen(true); };
    
    const handleSaveLocalEvent = () => {
        if (!eventForm.nombre || !eventForm.monto) return alert("Llena los campos.");
        onSaveEvent({ ...eventForm, monto: parseFloat(eventForm.monto), dia: selectedDay, categoria: 'Reto' });
        setIsEventModalOpen(false);
    };

    return (
        <div style={fullScreenStyle}>
            <style>{`
                @media (max-width: 768px) {
                    .retos-content { padding: 20px !important; }
                    .retos-grid-main { grid-template-columns: 1fr !important; gap: 20px !important; }
                    .acumulado-total { font-size: 42px !important; }
                    .btn-group-mobile { flex-direction: column !important; width: 100% !important; }
                    .btn-action-mobile { width: 100% !important; }
                }
            `}</style>

            {/* MODAL DE ALERTAS PROGRAMADAS */}
            {isEventModalOpen && (
                <div style={overlayStyle}>
                    <div style={modalCenterStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{...badgeDayStyle, background: '#e83e8c'}}>Día {selectedDay} (Retos)</div>
                            <FaTimes onClick={() => setIsEventModalOpen(false)} style={{ cursor: 'pointer', color: '#a4b0be', fontSize: '20px' }} />
                        </div>
                        <div style={typeSelectorGrid}>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'pago'})} style={{ ...typeBtn, border: eventForm.tipo === 'pago' ? '2px solid #28a745' : '1px solid #e1e5ee', background: eventForm.tipo === 'pago' ? '#e6f4ea' : '#fff' }}>Ahorro</button>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'gasto'})} style={{ ...typeBtn, border: eventForm.tipo === 'gasto' ? '2px solid #dc3545' : '1px solid #e1e5ee', background: eventForm.tipo === 'gasto' ? '#fce8e6' : '#fff' }}>Compra</button>
                        </div>
                        <input type="text" placeholder="¿Qué capricho es?" value={eventForm.nombre} onChange={(e) => setEventForm({...eventForm, nombre: e.target.value})} style={inputModalStyle} />
                        <input type="number" placeholder="Monto $" value={eventForm.monto} onChange={(e) => setEventForm({...eventForm, monto: e.target.value})} style={inputModalStyle} />
                        <button onClick={handleSaveLocalEvent} style={{ ...btnMainAdd, width: '100%', background: '#e83e8c' }}>Programar Alerta</button>
                    </div>
                </div>
            )}

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: '0', color: '#e83e8c', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaGamepad /> Sala de Trofeos</h1>
                </div>
            </div>

            <div className="retos-content" style={contentContainer}>
                
                {/* TARJETA DE SALDO */}
                <div style={acumuladoCard}>
                    <FaPiggyBank style={{ fontSize: '40px', color: '#e83e8c', marginBottom: '10px' }} />
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#e83e8c', fontWeight: 'bold', textTransform: 'uppercase' }}>Dinero en tus Caprichos</p>
                    <h1 className="acumulado-total" style={{ margin: 0, fontSize: '56px', color: '#e83e8c', fontWeight: 'bold' }}>${totalAcumuladoReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h1>
                </div>

                <div className="retos-grid-main" style={gridStyle}>
                    
                    {/* COLUMNA 1: PROGRESO DE RETOS */}
                    <div>
                        <h3 style={sectionTitle}><FaGamepad color="#e83e8c" /> Retos Activos</h3>
                        {retosActivos.length === 0 ? (
                            <div style={emptyState}>No hay retos activos. ¡Crea uno en el Laboratorio!</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {retosActivos.map(reto => {
                                    const c = cajones[reto];
                                    const acumulado = c.acumulado || 0;
                                    const cuota = c.monto;
                                    const match = reto.match(/\((\d+)\s*ciclos\)/);
                                    const ciclosTotal = match ? parseInt(match[1]) : 0;
                                    const ciclosPagados = Math.floor(acumulado / cuota);
                                    const isCompleted = ciclosTotal > 0 ? (ciclosPagados >= ciclosTotal) : (acumulado > 0);

                                    return (
                                        <div key={reto} style={retoCard}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <strong style={{ fontSize: '16px', color: '#2f3542' }}>{reto.replace(/ \(\d+ ciclos\)/, '').replace('Reto: ', '')}</strong>
                                                <span style={{ fontSize: '13px', color: '#e83e8c', fontWeight: 'bold' }}>{ciclosPagados} / {ciclosTotal} Ciclos</span>
                                            </div>
                                            
                                            <div style={progressBg}>
                                                <div style={{...progressFill, width: `${Math.min((ciclosPagados/ciclosTotal)*100, 100)}%`}}></div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '14px', color: '#747d8c' }}>Guardado: <b style={{color: '#2f3542'}}>${acumulado.toLocaleString()}</b></span>
                                                
                                                <div className="btn-group-mobile" style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => borrarReto(reto)} style={btnCancelReto}><FaTrash /> Cancelar</button>
                                                    {isCompleted ? (
                                                        <button onClick={() => { completarReto(reto); onClose(); }} style={btnComprar}><FaCheckCircle /> ¡Comprar!</button>
                                                    ) : (
                                                        <span style={badgeProgreso}>En progreso...</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA 2: CALENDARIO E HISTORIAL */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        
                        {/* CALENDARIO PROPIO */}
                        <div style={calendarContainer}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#2f3542' }}><FaCalendarAlt color="#e83e8c" /> Calendario de Caprichos</h4>
                            <div style={gridCalendario}>
                                {(() => {
                                    const dias = []; const dEnMes = new Date(anioActual, mesActual + 1, 0).getDate(); const pDia = new Date(anioActual, mesActual, 1).getDay();
                                    for (let i = 0; i < pDia; i++) dias.push(null); for (let i = 1; i <= dEnMes; i++) dias.push(i);
                                    return dias.map((dia, i) => {
                                        const esHoy = dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();
                                        const { tienePago, tieneGasto } = checkEventosDia(dia);
                                        let bgColor = '#f8f9fa'; let textColor = '#2f3542';
                                        if (esHoy) { bgColor = '#007bff'; textColor = 'white'; } 
                                        else if (tienePago) { bgColor = '#e6f4ea'; textColor = '#1e8e3e'; } 
                                        else if (tieneGasto) { bgColor = '#fce8e6'; textColor = '#d93025'; }
                                        
                                        return <div key={i} onClick={() => dia && openEventModal(dia)} style={{...celdaDia, background: bgColor, color: textColor, cursor: dia ? 'pointer' : 'default', fontWeight: (tienePago || tieneGasto) ? 'bold' : 'normal'}}>{dia || ''}</div>;
                                    });
                                })()}
                            </div>
                        </div>

                        {/* HISTORIAL PROPIO */}
                        <div style={historialWrapper}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#2f3542' }}><FaHistory color="#007bff" /> Historial Sala Trofeos</h4>
                            <div style={historialScroll}>
                                {historialRetos.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#a4b0be', fontSize: '13px' }}>Sin movimientos aún.</p>
                                ) : (
                                    historialRetos.map(h => {
                                        const isIngreso = h.nombre.includes('Abono');
                                        return (
                                            <div key={h.id} style={historialItem}>
                                                <span style={dateBadge}>{h.dia}/{h.mes + 1}</span>
                                                <span style={{ flex: 1, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.nombre}</span>
                                                <span style={{ fontWeight: 'bold', color: isIngreso ? '#28a745' : '#dc3545' }}>{isIngreso ? '+' : '-'}${h.monto}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* ALERTAS ACTIVAS */}
                        <div style={historialWrapper}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#2f3542' }}><FaBell color="#ff9f43" /> Alertas de Retos</h4>
                            <div style={historialScroll}>
                                {localEventos.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#a4b0be', fontSize: '13px' }}>Sin alertas programadas.</p>
                                ) : (
                                    localEventos.map(e => (
                                        <div key={e.id} style={historialItem}>
                                            <span style={dateBadge}>{e.dia}</span>
                                            <span style={{ flex: 1, fontSize: '13px' }}>{e.nombre}</span>
                                            <FaTrash onClick={() => onDeleteEvent(e.id)} style={{cursor: 'pointer', color: '#dc3545', fontSize: '12px'}} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ESTILOS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto' };
const headerStyle = { backgroundColor: '#fff', padding: '20px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '10px 15px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542', fontSize: '13px' };
const contentContainer = { padding: '40px', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box' };
const acumuladoCard = { background: '#fce3ed', padding: '40px', borderRadius: '30px', border: '2px dashed #e83e8c', textAlign: 'center', marginBottom: '40px' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px' };
const sectionTitle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', marginBottom: '20px' };
const emptyState = { padding: '30px', background: '#fff', borderRadius: '20px', border: '1px solid #e1e5ee', color: '#747d8c', textAlign: 'center' };
const retoCard = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e1e5ee', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' };
const progressBg = { width: '100%', height: '10px', backgroundColor: '#f1f2f6', borderRadius: '5px', overflow: 'hidden' };
const progressFill = { height: '100%', background: '#e83e8c', transition: 'width 0.4s ease' };
const btnCancelReto = { background: '#ffebee', color: '#dc3545', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' };
const btnComprar = { background: '#e83e8c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' };
const badgeProgreso = { background: '#f8f9fa', color: '#a4b0be', padding: '10px 15px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #e1e5ee' };
const calendarContainer = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e1e5ee' };
const gridCalendario = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' };
const celdaDia = { textAlign: 'center', padding: '10px 0', fontSize: '13px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35px' };
const historialWrapper = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e1e5ee' };
const historialScroll = { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' };
const historialItem = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '12px' };
const dateBadge = { background: '#e1e5ee', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', color: '#2f3542' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 4000, backdropFilter: 'blur(4px)' };
const modalCenterStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '30px', borderRadius: '25px', width: '90%', maxWidth: '380px' };
const typeSelectorGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const typeBtn = { padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
const inputModalStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9', marginBottom: '15px', background: '#f8f9fa' };
const btnMainAdd = { color: 'white', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 'bold', cursor: 'pointer' };
const badgeDayStyle = { color: 'white', padding: '5px 15px', borderRadius: '15px', fontWeight: 'bold', fontSize: '12px' };

export default RetosFullScreen;