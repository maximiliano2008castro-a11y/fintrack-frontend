import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus, FaTrash, FaArrowLeft, FaHistory, FaBell } from 'react-icons/fa';

// 💡 Se agregó "isDarkMode" a los props
const CalendarFullScreen = ({ isOpen, onClose, eventos, historial, onDeleteEvent, onSaveEvent, nombresMeses, diasSemana, mesActualGlobal, anioActualGlobal, isDarkMode }) => {
    
    // Estados internos del calendario
    const [mesVisualizado, setMesVisualizado] = useState(mesActualGlobal !== undefined ? mesActualGlobal : new Date().getMonth());
    const [anioVisualizado, setAnioVisualizado] = useState(anioActualGlobal !== undefined ? anioActualGlobal : new Date().getFullYear());
    const [diaSeleccionado, setDiaSeleccionado] = useState(new Date().getDate());
    
    // Estado para el mini formulario
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [eventForm, setEventForm] = useState({ nombre: '', monto: '', tipo: 'gasto', frecuencia: 'Único' });

    if (!isOpen) return null;

    const cambiarMes = (direccion) => {
        if (direccion === 'prev') {
            if (mesVisualizado === 0) { setMesVisualizado(11); setAnioVisualizado(anioVisualizado - 1); }
            else { setMesVisualizado(mesVisualizado - 1); }
        } else {
            if (mesVisualizado === 11) { setMesVisualizado(0); setAnioVisualizado(anioVisualizado + 1); }
            else { setMesVisualizado(mesVisualizado + 1); }
        }
        setIsAddingEvent(false);
    };

    const handleGuardarNuevaAlerta = () => {
        if (!eventForm.nombre || !eventForm.monto) return alert("Llena todos los campos.");
        
        onSaveEvent({
            nombre: eventForm.nombre,
            monto: parseFloat(eventForm.monto),
            tipo: eventForm.tipo,
            frecuencia: eventForm.frecuencia,
            dia: diaSeleccionado
        });

        setEventForm({ nombre: '', monto: '', tipo: 'gasto', frecuencia: 'Único' });
        setIsAddingEvent(false);
    };

    const getEventosDelDia = (dia) => {
        const fechaVista = new Date(anioVisualizado, mesVisualizado, dia);
        return eventos.filter(ev => {
            const mC = ev.mesCreacion !== undefined ? ev.mesCreacion : mesVisualizado;
            const aC = ev.anioCreacion !== undefined ? ev.anioCreacion : anioVisualizado;
            const fechaOrigen = new Date(aC, mC, ev.dia);
            
            if (fechaVista < fechaOrigen) return false;
            if (ev.frecuencia === 'Único') return fechaVista.toDateString() === fechaOrigen.toDateString();
            if (ev.frecuencia === 'Semanal') return fechaVista.getDay() === fechaOrigen.getDay();
            if (ev.frecuencia === 'Mensual') return fechaVista.getDate() === ev.dia;
            if (ev.frecuencia === 'Anual') return fechaVista.getDate() === ev.dia && fechaVista.getMonth() === mC;
            return false;
        });
    };

    const getHistorialDelDia = (dia) => historial.filter(h => h.dia === dia && h.mes === mesVisualizado && h.anio === anioVisualizado);

    const diasDelMes = [];
    const diasEnMes = new Date(anioVisualizado, mesVisualizado + 1, 0).getDate();
    const primerDia = new Date(anioVisualizado, mesVisualizado, 1).getDay();

    for (let i = 0; i < primerDia; i++) diasDelMes.push(null);
    for (let i = 1; i <= diasEnMes; i++) diasDelMes.push(i);

    const eventosSeleccionados = diaSeleccionado ? getEventosDelDia(diaSeleccionado) : [];
    const historialSeleccionado = diaSeleccionado ? getHistorialDelDia(diaSeleccionado) : [];

    return (
        <div className={isDarkMode ? 'theme-dark' : 'theme-light'} style={fullScreenStyle}>
            
            {/* INYECTAMOS UN MEDIA QUERY PARA EL MÓVIL DIRECTO EN EL COMPONENTE */}
            <style>{`
                @media (max-width: 768px) {
                    .calendar-layout { flex-direction: column !important; }
                    .calendar-sidebar { width: 100% !important; max-width: 100% !important; border-left: none !important; border-top: 1px solid var(--border-color); }
                    .calendar-grid { gap: 5px !important; }
                    .calendar-cell { min-height: 60px !important; padding: 5px !important; border-radius: 10px !important; }
                    .calendar-main { padding: 20px !important; }
                }
            `}</style>

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaCalendarAlt color="var(--primary)" /> Calendario Completo</h1>
                </div>
            </div>

            <div className="calendar-layout" style={layoutGrid}>
                {/* CALENDARIO IZQUIERDO */}
                <div className="calendar-main" style={mainCalendarArea}>
                    <div style={calendarHeader}>
                        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>{nombresMeses[mesVisualizado]} {anioVisualizado}</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => cambiarMes('prev')} style={navBtn}><FaChevronLeft /></button>
                            <button onClick={() => cambiarMes('next')} style={navBtn}><FaChevronRight /></button>
                        </div>
                    </div>
                    
                    <div style={diasSemanaGrid}>
                        {diasSemana.map(d => <div key={d} style={{ padding: '10px 0' }}>{d}</div>)}
                    </div>
                    
                    <div className="calendar-grid" style={calendarioGrid}>
                        {diasDelMes.map((dia, i) => {
                            if (!dia) return <div key={i} style={diaVacio}></div>;
                            
                            const evDia = getEventosDelDia(dia);
                            const hsDia = getHistorialDelDia(dia);
                            const tienePago = evDia.some(e => e.tipo === 'pago') || hsDia.some(h => h.tipo === 'pago');
                            const tieneGasto = evDia.some(e => e.tipo === 'gasto') || hsDia.some(h => h.tipo === 'gasto');
                            const esSeleccionado = dia === diaSeleccionado;

                            let bgColor = 'var(--bg-secondary)';
                            if (esSeleccionado) bgColor = 'var(--primary-light)';
                            else if (tienePago && tieneGasto) bgColor = 'linear-gradient(135deg, var(--success-light) 50%, var(--danger-light) 50%)';
                            else if (tienePago) bgColor = 'var(--success-light)';
                            else if (tieneGasto) bgColor = 'var(--danger-light)';

                            return (
                                <div className="calendar-cell" key={i} onClick={() => { setDiaSeleccionado(dia); setIsAddingEvent(false); }} style={{ ...celdaDiaCompleto, background: bgColor, border: esSeleccionado ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: esSeleccionado ? 'var(--primary)' : 'var(--text-main)' }}>{dia}</span>
                                    <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
                                        {tienePago && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>}
                                        {tieneGasto && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PANEL DERECHO DE DETALLES */}
                <div className="calendar-sidebar" style={detailsSidebar}>
                    {diaSeleccionado ? (
                        <>
                            <h2 style={{ margin: '0 0 25px 0', borderBottom: '2px solid var(--border-color)', paddingBottom: '15px', color: 'var(--text-main)' }}>Día {diaSeleccionado}</h2>
                            
                            {/* HISTORIAL (REAL) */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '15px' }}><FaHistory /> Lo que pasó (Real)</h4>
                                {historialSeleccionado.length > 0 ? (
                                    historialSeleccionado.map(h => (
                                        <div key={h.id} style={detalleCard}>
                                            <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{h.nombre}</span>
                                            <span style={{ color: h.tipo === 'pago' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{h.tipo === 'pago' ? '+' : '-'}${h.monto}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={emptyCard}>No hubo movimientos financieros este día.</div>
                                )}
                            </div>

                            {/* ALERTAS (PLANIFICADO) */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}><FaBell /> Alertas (Planificado)</h4>
                                    {!isAddingEvent && (
                                        <button onClick={() => setIsAddingEvent(true)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><FaPlus /> Nueva</button>
                                    )}
                                </div>
                                
                                {/* EL MINI FORMULARIO PARA CREAR ALERTA AQUÍ MISMO */}
                                {isAddingEvent && (
                                    <div style={{ background: 'var(--primary-light)', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '1px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <h5 style={{ margin: 0, color: 'var(--primary)' }}>Crear Alerta</h5>
                                            <FaTimes onClick={() => setIsAddingEvent(false)} style={{ cursor: 'pointer', color: 'var(--text-light)' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                            <button onClick={() => setEventForm({...eventForm, tipo: 'pago'})} style={{ padding: '8px', borderRadius: '8px', border: eventForm.tipo === 'pago' ? '2px solid var(--success)' : '1px solid var(--border-color)', background: eventForm.tipo === 'pago' ? 'var(--success-light)' : 'var(--bg-secondary)', color: eventForm.tipo === 'pago' ? 'var(--success)' : 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>Cobro</button>
                                            <button onClick={() => setEventForm({...eventForm, tipo: 'gasto'})} style={{ padding: '8px', borderRadius: '8px', border: eventForm.tipo === 'gasto' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: eventForm.tipo === 'gasto' ? 'var(--danger-light)' : 'var(--bg-secondary)', color: eventForm.tipo === 'gasto' ? 'var(--danger)' : 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>Gasto</button>
                                        </div>
                                        <input type="text" placeholder="Concepto (Ej. Luz)" value={eventForm.nombre} onChange={(e) => setEventForm({...eventForm, nombre: e.target.value})} style={inputModalStyle} />
                                        <input type="number" placeholder="Monto $" value={eventForm.monto} onChange={(e) => setEventForm({...eventForm, monto: e.target.value})} style={inputModalStyle} />
                                        <select value={eventForm.frecuencia} onChange={(e) => setEventForm({...eventForm, frecuencia: e.target.value})} style={inputModalStyle}>
                                            <option value="Único">Solo esta vez</option><option value="Semanal">Semanal</option><option value="Mensual">Mensual</option><option value="Anual">Anual</option>
                                        </select>
                                        <button onClick={handleGuardarNuevaAlerta} style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                                    </div>
                                )}

                                {eventosSeleccionados.length > 0 ? (
                                    eventosSeleccionados.map(e => (
                                        <div key={e.id} style={{...detalleCard, flexDirection: 'column', alignItems: 'flex-start'}}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                                                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{e.nombre}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <span style={{ color: e.tipo === 'pago' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>${e.monto}</span>
                                                    <FaTrash onClick={() => onDeleteEvent(e.id)} style={{ cursor: 'pointer', color: 'var(--danger)' }} title="Eliminar Alerta"/>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase' }}>Frecuencia: {e.frecuencia}</span>
                                        </div>
                                    ))
                                ) : (
                                    !isAddingEvent && <div style={emptyCard}>No hay alertas programadas para este día.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '100px' }}>
                            <FaCalendarAlt style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.5 }} />
                            <p>Selecciona un día en el calendario para ver o añadir detalles.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ESTILOS DINÁMICOS BASADOS EN VARIABLES CSS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--bg-main)', zIndex: 3000, display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s' };
const headerStyle = { backgroundColor: 'var(--bg-card)', padding: '20px 40px', boxShadow: 'var(--card-shadow)', borderBottom: '1px solid var(--border-color)', transition: '0.3s' };
const backBtnStyle = { padding: '10px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-main)', transition: '0.2s' };
const layoutGrid = { display: 'flex', flex: 1, overflow: 'hidden' };
const mainCalendarArea = { flex: 2, padding: '40px', overflowY: 'auto' };
const detailsSidebar = { flex: 1, minWidth: '350px', maxWidth: '450px', backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', padding: '40px', overflowY: 'auto', transition: '0.3s' };
const calendarHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const navBtn = { padding: '10px 15px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-main)', transition: '0.2s' };
const diasSemanaGrid = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '10px' };
const calendarioGrid = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px' };
const diaVacio = { minHeight: '100px', backgroundColor: 'transparent' };
const celdaDiaCompleto = { minHeight: '100px', padding: '15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s, box-shadow 0.1s, background-color 0.3s, border 0.3s' };
const detalleCard = { backgroundColor: 'var(--bg-secondary)', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', border: '1px solid var(--border-light)', transition: '0.3s' };
const emptyCard = { backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', fontSize: '13px', transition: '0.3s' };
const inputModalStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '10px', boxSizing: 'border-box', background: 'var(--bg-card)', color: 'var(--text-main)', transition: '0.3s' };

export default CalendarFullScreen;