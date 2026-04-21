import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaShieldAlt, FaPlus, FaLightbulb, FaBrain, FaCalendarAlt, FaHistory, FaBell, FaTimes, FaTrash } from 'react-icons/fa';

const EmergenciaFullScreen = ({ isOpen, onClose, onAddCajon, gastosFijosBase, gastosVariablesBase, cicloMaestro = 'Mensual', ingresosMensuales, historial, eventosCalendario, onSaveEvent, onDeleteEvent, mesActual, anioActual }) => {
    const [gastosVitalesMensuales, setGastosVitalesMensuales] = useState('');
    const [mesesEmergencia, setMesesEmergencia] = useState(6);
    const [aporteEmergencia, setAporteEmergencia] = useState('');
    const [sugerenciaAporteUsada, setSugerenciaAporteUsada] = useState(false);

    const [selectedDay, setSelectedDay] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventForm, setEventForm] = useState({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' });

    // FILTROS LOCALES: Solo vemos lo relacionado a Emergencia y la Bóveda Intocable
    const localHistorial = historial.filter(h => h.nombre.includes('Emergencia') || h.nombre.includes('Bóveda'));
    const localEventos = eventosCalendario.filter(e => e.categoria === 'Emergencia');
    const hoy = new Date();

    useEffect(() => {
        if (isOpen) {
            let multiplicador = 1;
            if (cicloMaestro === 'Semanal') multiplicador = 4;
            if (cicloMaestro === 'Quincenal') multiplicador = 2;
            if (cicloMaestro === 'Diario') multiplicador = 30;

            const totalVitalCiclo = (parseFloat(gastosFijosBase) || 0) + (parseFloat(gastosVariablesBase) || 0);
            const sugeridoMensual = totalVitalCiclo * multiplicador;
            
            setGastosVitalesMensuales(Math.round(sugeridoMensual));
            setAporteEmergencia('');
            setSugerenciaAporteUsada(false);
        }
    }, [isOpen, gastosFijosBase, gastosVariablesBase, cicloMaestro]);

    if (!isOpen) return null;

    const sugerirAporteSano = () => {
        let multiplicador = 1;
        if (cicloMaestro === 'Semanal') multiplicador = 4;
        if (cicloMaestro === 'Quincenal') multiplicador = 2;
        if (cicloMaestro === 'Diario') multiplicador = 30;
        const ingresoPorCiclo = ingresosMensuales / multiplicador;
        const aporteSano = ingresoPorCiclo * 0.10; 
        setAporteEmergencia(Math.round(aporteSano));
        setSugerenciaAporteUsada(true);
    };

    const crearCajon = () => {
        const montoAporte = parseFloat(aporteEmergencia);
        if (!montoAporte || montoAporte <= 0) return alert('⚠️ Ingresa un aporte válido para activar el cajón.');
        onAddCajon('Fondo de Emergencia', montoAporte, cicloMaestro);
        onClose();
    };

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
            if (ev.frecuencia === 'Anual') return fechaVista.getDate() === ev.dia && fechaVista.getMonth() === mC;
            return false;
        });
        const reales = localHistorial.filter(h => h.dia === dia && h.mes === mesActual && h.anio === anioActual);
        return { 
            tienePago: planificados.some(e => e.tipo === 'pago') || reales.some(r => r.tipo === 'pago'), 
            tieneGasto: planificados.some(e => e.tipo === 'gasto') || reales.some(r => r.tipo === 'gasto') 
        };
    };

    const openEventModal = (dia) => {
        setSelectedDay(dia);
        setEventForm({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' });
        setIsEventModalOpen(true);
    };

    const handleSaveLocalEvent = () => {
        if (!eventForm.nombre || !eventForm.monto) return alert("Llena los campos.");
        // Enviamos con etiqueta secreta
        onSaveEvent({ ...eventForm, monto: parseFloat(eventForm.monto), dia: selectedDay, categoria: 'Emergencia' });
        setIsEventModalOpen(false);
    };

    const totalFondo = (parseFloat(gastosVitalesMensuales) || 0) * mesesEmergencia;

    return (
        <div style={fullScreenStyle}>
            {isEventModalOpen && (
                <div style={overlayStyle}>
                    <div style={modalCenterStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{...badgeDayStyle, background: '#28a745'}}>Día {selectedDay} (Emergencia)</div>
                            <FaTimes onClick={() => setIsEventModalOpen(false)} style={{ cursor: 'pointer', color: '#a4b0be', fontSize: '20px' }} />
                        </div>
                        <div style={typeSelectorGrid}>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'pago'})} style={{ ...typeBtn, border: eventForm.tipo === 'pago' ? '2px solid #28a745' : '1px solid #e1e5ee', background: eventForm.tipo === 'pago' ? '#e6f4ea' : '#fff' }}>Aporte Previsto</button>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'gasto'})} style={{ ...typeBtn, border: eventForm.tipo === 'gasto' ? '2px solid #dc3545' : '1px solid #e1e5ee', background: eventForm.tipo === 'gasto' ? '#fce8e6' : '#fff' }}>Gasto Previsto</button>
                        </div>
                        <input type="text" placeholder="Concepto (Ej. Pago Seguro)" value={eventForm.nombre} onChange={(e) => setEventForm({...eventForm, nombre: e.target.value})} style={inputModalStyle} />
                        <input type="number" placeholder="Monto $" value={eventForm.monto} onChange={(e) => setEventForm({...eventForm, monto: e.target.value})} style={inputModalStyle} />
                        <select value={eventForm.frecuencia} onChange={(e) => setEventForm({...eventForm, frecuencia: e.target.value})} style={inputModalStyle}>
                            <option value="Único">Solo esta vez</option><option value="Semanal">Semanal</option><option value="Mensual">Mensual</option><option value="Anual">Anual</option>
                        </select>
                        <button onClick={handleSaveLocalEvent} style={{ ...btnMainAdd, width: '100%', marginTop: '10px', background: '#28a745' }}>Crear Alerta de Emergencia</button>
                    </div>
                </div>
            )}

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: '0', color: '#2f3542', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaShieldAlt color="#28a745" /> Fondo de Emergencia</h1>
                </div>
            </div>

            <div style={contentContainer}>
                <div style={formContainerStyle}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{...iconBadgeStyle, background: '#e6f4ea', color: '#28a745', margin: '0 auto 15px auto'}}><FaBrain /></div>
                        <h2 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Cálculo Inteligente</h2>
                        <p style={{ margin: 0, color: '#747d8c', fontSize: '15px' }}>Hemos deducido tus gastos vitales mensuales a partir de tus cajones actuales.</p>
                    </div>

                    <label style={labelStyle}>Gastos Vitales Mensuales (Puedes editarlo)</label>
                    <div style={{position: 'relative', marginBottom: '25px'}}>
                        <span style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#a4b0be', fontWeight:'bold', fontSize:'18px', pointerEvents:'none'}}>$</span>
                        <input type="number" min="0" value={gastosVitalesMensuales} onChange={e => setGastosVitalesMensuales(e.target.value)} style={{...inputStyle, paddingLeft:'35px', margin: 0}} />
                    </div>

                    <label style={labelStyle}>¿Cuántos meses quieres blindar?</label>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                        {[3, 6, 12].map(m => (
                            <button key={m} onClick={() => setMesesEmergencia(m)} style={{...selectorBtn, border: mesesEmergencia===m?'2px solid #28a745':'1px solid #e1e5ee', background: mesesEmergencia===m?'#e6f4ea':'#fff', color: '#2f3542'}}>{m} Meses</button>
                        ))}
                    </div>

                    <div style={resultCardStyle}>
                        <p style={{ margin: '0 0 10px 0', color: '#747d8c', fontWeight: 'bold' }}>Objetivo Total del Fondo:</p>
                        <h1 style={{ fontSize: '48px', margin: '10px 0 30px 0', color: '#2f3542' }}>${totalFondo.toLocaleString()}</h1>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                            <label style={{...labelStyle, marginBottom: 0, color: '#2f3542'}}>Aporte por <b>{cicloMaestro}</b></label>
                            <button onClick={sugerirAporteSano} style={miniMagicBtn}><FaLightbulb /> Sugerir Aporte Saludable</button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{fontWeight: 'bold', fontSize: '20px', color: '#a4b0be'}}>$</span>
                            <input type="number" min="0" placeholder="0.00" value={aporteEmergencia} onChange={e => { setAporteEmergencia(e.target.value); setSugerenciaAporteUsada(false); }} style={{...inputStyle, marginBottom: 0, flex: 1}} />
                        </div>

                        {sugerenciaAporteUsada && (
                            <div style={tipBoxSugerencia}>
                                <p style={{ margin: 0, fontSize: '13px' }}>✨ Sugerimos <b>${aporteEmergencia}</b> (10% de tu ingreso {cicloMaestro.toLowerCase()}). Es la medida perfecta para no asfixiarte.</p>
                            </div>
                        )}

                        <button onClick={crearCajon} style={{ ...actionBtnStyle, background: '#28a745', marginTop: '25px' }}><FaPlus /> Crear Cajón en Dashboard</button>
                    </div>
                </div>

                <div style={gridBottom}>
                    <div style={{...calendarContainer, borderTop: '4px solid #28a745'}}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2f3542' }}><FaCalendarAlt color="#28a745" /> Calendario Bóveda</span>
                        </div>
                        <div style={gridDiasSemana}>{['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => <div key={d} style={headerDia}>{d.substring(0,1)}</div>)}</div>
                        <div style={gridCalendario}>
                            {(() => {
                                const dias = []; const dEnMes = new Date(anioActual, mesActual + 1, 0).getDate(); const pDia = new Date(anioActual, mesActual, 1).getDay();
                                for (let i = 0; i < pDia; i++) dias.push(null); for (let i = 1; i <= dEnMes; i++) dias.push(i);
                                return dias.map((dia, i) => {
                                    const esHoy = dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();
                                    const { tienePago, tieneGasto } = checkEventosDia(dia);
                                    let bgColor = '#f8f9fa'; let textColor = '#2f3542';
                                    if (esHoy) { bgColor = '#28a745'; textColor = 'white'; } 
                                    else if (tienePago && tieneGasto) { bgColor = 'linear-gradient(135deg, #e6f4ea 50%, #fce8e6 50%)'; textColor = '#28a745'; } 
                                    else if (tienePago) { bgColor = '#e6f4ea'; textColor = '#1e8e3e'; } 
                                    else if (tieneGasto) { bgColor = '#fce8e6'; textColor = '#d93025'; }
                                    return <div key={i} onClick={() => { if(dia) openEventModal(dia); }} style={{...celdaDia, background: bgColor, color: textColor, fontWeight: (tienePago || tieneGasto || esHoy) ? 'bold' : 'normal', cursor: dia ? 'pointer' : 'default'}}>{dia || ''}</div>;
                                });
                            })()}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={remindersContainer}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: 0, color: '#2f3542' }}><FaHistory color="#28a745" /> Historial Bóveda</h4>
                            </div>
                            {localHistorial.length === 0 ? ( <p style={{ margin: 0, fontSize: '13px', color: '#a4b0be' }}>Sin movimientos en la bóveda de emergencia.</p> ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {localHistorial.map(h => <div key={h.id} style={miniAlertCard}><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.nombre}</span><span style={{ fontWeight: 'bold', color: h.tipo === 'pago' ? '#28a745' : '#dc3545' }}>{h.tipo === 'pago' ? '+' : '-'}${h.monto}</span></div>)}
                                </div>
                            )}
                        </div>

                        <div style={remindersContainer}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: 0, color: '#2f3542' }}><FaBell color="#ffc107" /> Alertas Bóveda</h4>
                            </div>
                            {localEventos.length === 0 ? ( <p style={{ margin: 0, fontSize: '13px', color: '#a4b0be' }}>Sin alertas programadas.</p> ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {localEventos.map(e => (
                                        <div key={e.id} style={miniAlertCard}>
                                            <span style={miniDayBadge}>{e.dia}</span><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nombre}</span>
                                            <FaTrash onClick={() => onDeleteEvent(e.id)} style={{cursor: 'pointer', color: '#dc3545'}} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ESTILOS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const headerStyle = { backgroundColor: '#fff', padding: '25px 40px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542', transition: '0.2s' };
const contentContainer = { padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' };
const formContainerStyle = { backgroundColor: '#fff', padding: '50px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '30px' };
const iconBadgeStyle = { width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#747d8c', marginBottom: '10px' };
const inputStyle = { width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid #dfe6e9', outline: 'none', background: '#f8f9fa', fontSize: '18px', boxSizing: 'border-box', fontWeight: 'bold', color: '#2f3542' };
const selectorBtn = { flex: 1, padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: '0.2s' };
const actionBtnStyle = { width: '100%', color: 'white', border: 'none', borderRadius: '15px', padding: '20px', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: '0.2s' };
const resultCardStyle = { backgroundColor: '#fcfcfc', padding: '40px', borderRadius: '20px', textAlign: 'left', border: '2px dashed #28a745' };
const miniMagicBtn = { background: '#e6f4ea', color: '#28a745', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const tipBoxSugerencia = { background: '#e6f4ea', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #28a745', marginTop: '15px', color: '#1e8e3e' };
const gridBottom = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' };
const calendarContainer = { backgroundColor: '#fff', padding: '30px', borderRadius: '25px', border: '1px solid #e1e5ee', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const gridDiasSemana = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '15px', fontSize: '13px', color: '#a4b0be', fontWeight: 'bold' };
const headerDia = { padding: '5px 0' };
const gridCalendario = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' };
const celdaDia = { textAlign: 'center', padding: '12px 0', fontSize: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' };
const remindersContainer = { backgroundColor: '#fff', border: '1px solid #e1e5ee', padding: '25px 30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const miniAlertCard = { fontSize: '14px', color: '#2f3542', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderRadius: '12px', backgroundColor: '#f8f9fa', border: '1px solid #e1e5ee', gap: '10px' };
const miniDayBadge = { background: '#e1e5ee', padding: '5px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', color: '#2f3542' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3999, backdropFilter: 'blur(4px)' };
const modalCenterStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '35px', borderRadius: '25px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', zIndex: 4000, width: '380px', boxSizing: 'border-box' };
const inputModalStyle = { padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9', width: '100%', marginBottom: '15px', outline: 'none', background: '#f8f9fa', fontSize: '15px', boxSizing: 'border-box' };
const typeSelectorGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const typeBtn = { padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' };
const btnMainAdd = { flex: 1, color: 'white', border: 'none', borderRadius: '15px', padding: '18px', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' };
const badgeDayStyle = { color: '#fff', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' };

export default EmergenciaFullScreen;