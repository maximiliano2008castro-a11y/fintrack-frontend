import React, { useState } from 'react';
// ¡AQUÍ ESTÁ LA CORRECCIÓN! Importamos todos los iconos necesarios, incluyendo FaHistory, FaBell y FaArrowLeft
import { FaTimes, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus, FaTrash, FaArrowLeft, FaHistory, FaBell } from 'react-icons/fa';

const CalendarFullScreen = ({ isOpen, onClose, eventos, historial, onDeleteEvent, onSaveEvent, nombresMeses, diasSemana, mesActualGlobal, anioActualGlobal }) => {
    
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
        
        // Pasamos el evento a la función principal que nos dio el Dashboard
        onSaveEvent({
            nombre: eventForm.nombre,
            monto: parseFloat(eventForm.monto),
            tipo: eventForm.tipo,
            frecuencia: eventForm.frecuencia,
            dia: diaSeleccionado
        });

        // Limpiamos el formulario y lo cerramos
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
        <div style={fullScreenStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: 0, color: '#2f3542', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaCalendarAlt color="#007bff" /> Calendario Completo</h1>
                </div>
            </div>

            <div style={layoutGrid}>
                {/* CALENDARIO IZQUIERDO */}
                <div style={mainCalendarArea}>
                    <div style={calendarHeader}>
                        <h2 style={{ margin: 0 }}>{nombresMeses[mesVisualizado]} {anioVisualizado}</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => cambiarMes('prev')} style={navBtn}><FaChevronLeft /></button>
                            <button onClick={() => cambiarMes('next')} style={navBtn}><FaChevronRight /></button>
                        </div>
                    </div>
                    
                    <div style={diasSemanaGrid}>
                        {diasSemana.map(d => <div key={d} style={{ padding: '10px 0' }}>{d}</div>)}
                    </div>
                    
                    <div style={calendarioGrid}>
                        {diasDelMes.map((dia, i) => {
                            if (!dia) return <div key={i} style={diaVacio}></div>;
                            
                            const evDia = getEventosDelDia(dia);
                            const hsDia = getHistorialDelDia(dia);
                            const tienePago = evDia.some(e => e.tipo === 'pago') || hsDia.some(h => h.tipo === 'pago');
                            const tieneGasto = evDia.some(e => e.tipo === 'gasto') || hsDia.some(h => h.tipo === 'gasto');
                            const esSeleccionado = dia === diaSeleccionado;

                            let bgColor = '#f8f9fa';
                            if (esSeleccionado) bgColor = '#eef3ff';
                            else if (tienePago && tieneGasto) bgColor = 'linear-gradient(135deg, #e6f4ea 50%, #fce8e6 50%)';
                            else if (tienePago) bgColor = '#e6f4ea';
                            else if (tieneGasto) bgColor = '#fce8e6';

                            return (
                                <div key={i} onClick={() => { setDiaSeleccionado(dia); setIsAddingEvent(false); }} style={{ ...celdaDiaCompleto, background: bgColor, border: esSeleccionado ? '2px solid #007bff' : '1px solid transparent' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: esSeleccionado ? '#007bff' : '#2f3542' }}>{dia}</span>
                                    <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
                                        {tienePago && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#28a745' }}></span>}
                                        {tieneGasto && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc3545' }}></span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PANEL DERECHO DE DETALLES */}
                <div style={detailsSidebar}>
                    {diaSeleccionado ? (
                        <>
                            <h2 style={{ margin: '0 0 25px 0', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px' }}>Día {diaSeleccionado}</h2>
                            
                            {/* HISTORIAL (REAL) */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#007bff', marginBottom: '15px' }}><FaHistory /> Lo que pasó (Real)</h4>
                                {historialSeleccionado.length > 0 ? (
                                    historialSeleccionado.map(h => (
                                        <div key={h.id} style={detalleCard}>
                                            <span style={{ fontWeight: 'bold' }}>{h.nombre}</span>
                                            <span style={{ color: h.tipo === 'pago' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>{h.tipo === 'pago' ? '+' : '-'}${h.monto}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={emptyCard}>No hubo movimientos financieros este día.</div>
                                )}
                            </div>

                            {/* ALERTAS (PLANIFICADO) */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#ff9f43' }}><FaBell /> Alertas (Planificado)</h4>
                                    {!isAddingEvent && (
                                        <button onClick={() => setIsAddingEvent(true)} style={{ background: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><FaPlus /> Nueva</button>
                                    )}
                                </div>
                                
                                {/* EL MINI FORMULARIO PARA CREAR ALERTA AQUÍ MISMO */}
                                {isAddingEvent && (
                                    <div style={{ background: '#eef3ff', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #cce5ff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <h5 style={{ margin: 0, color: '#007bff' }}>Crear Alerta</h5>
                                            <FaTimes onClick={() => setIsAddingEvent(false)} style={{ cursor: 'pointer', color: '#a4b0be' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                            <button onClick={() => setEventForm({...eventForm, tipo: 'pago'})} style={{ padding: '8px', borderRadius: '8px', border: eventForm.tipo === 'pago' ? '2px solid #28a745' : '1px solid #e1e5ee', background: eventForm.tipo === 'pago' ? '#e6f4ea' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Cobro</button>
                                            <button onClick={() => setEventForm({...eventForm, tipo: 'gasto'})} style={{ padding: '8px', borderRadius: '8px', border: eventForm.tipo === 'gasto' ? '2px solid #dc3545' : '1px solid #e1e5ee', background: eventForm.tipo === 'gasto' ? '#fce8e6' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Gasto</button>
                                        </div>
                                        <input type="text" placeholder="Concepto (Ej. Luz)" value={eventForm.nombre} onChange={(e) => setEventForm({...eventForm, nombre: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dfe6e9', marginBottom: '10px', boxSizing: 'border-box' }} />
                                        <input type="number" placeholder="Monto $" value={eventForm.monto} onChange={(e) => setEventForm({...eventForm, monto: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dfe6e9', marginBottom: '10px', boxSizing: 'border-box' }} />
                                        <select value={eventForm.frecuencia} onChange={(e) => setEventForm({...eventForm, frecuencia: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dfe6e9', marginBottom: '10px', boxSizing: 'border-box' }}>
                                            <option value="Único">Solo esta vez</option><option value="Semanal">Semanal</option><option value="Mensual">Mensual</option><option value="Anual">Anual</option>
                                        </select>
                                        <button onClick={handleGuardarNuevaAlerta} style={{ width: '100%', background: '#007bff', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                                    </div>
                                )}

                                {eventosSeleccionados.length > 0 ? (
                                    eventosSeleccionados.map(e => (
                                        <div key={e.id} style={{...detalleCard, flexDirection: 'column', alignItems: 'flex-start'}}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                                                <span style={{ fontWeight: 'bold' }}>{e.nombre}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <span style={{ color: e.tipo === 'pago' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>${e.monto}</span>
                                                    {/* EL BASURERO AHORA SÍ SIRVE AQUÍ */}
                                                    <FaTrash onClick={() => onDeleteEvent(e.id)} style={{ cursor: 'pointer', color: '#dc3545' }} title="Eliminar Alerta"/>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#a4b0be', textTransform: 'uppercase' }}>Frecuencia: {e.frecuencia}</span>
                                        </div>
                                    ))
                                ) : (
                                    !isAddingEvent && <div style={emptyCard}>No hay alertas programadas para este día.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#a4b0be', marginTop: '100px' }}>
                            <FaCalendarAlt style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.5 }} />
                            <p>Selecciona un día en el calendario para ver o añadir detalles.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ESTILOS CALENDARIO FULLSCREEN
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, display: 'flex', flexDirection: 'column' };
const headerStyle = { backgroundColor: '#fff', padding: '20px 40px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' };
const backBtnStyle = { padding: '10px 15px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542' };
const layoutGrid = { display: 'flex', flex: 1, overflow: 'hidden' };
const mainCalendarArea = { flex: 2, padding: '40px', overflowY: 'auto' };
const detailsSidebar = { flex: 1, minWidth: '350px', maxWidth: '450px', backgroundColor: '#fff', borderLeft: '1px solid #e1e5ee', padding: '40px', overflowY: 'auto' };
const calendarHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const navBtn = { padding: '10px 15px', borderRadius: '10px', border: '1px solid #e1e5ee', background: '#fff', cursor: 'pointer', color: '#2f3542' };
const diasSemanaGrid = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', color: '#a4b0be', marginBottom: '10px' };
const calendarioGrid = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px' };
const diaVacio = { minHeight: '100px', backgroundColor: 'transparent' };
const celdaDiaCompleto = { minHeight: '100px', padding: '15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s, box-shadow 0.1s' };
const detalleCard = { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', border: '1px solid #e1e5ee' };
const emptyCard = { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#a4b0be', border: '1px dashed #dfe6e9', fontSize: '13px' };

export default CalendarFullScreen;