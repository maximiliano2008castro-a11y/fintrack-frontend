import React, { useState } from 'react';
import { FaArrowLeft, FaPiggyBank, FaArrowUp, FaArrowDown, FaLock, FaCalendarAlt, FaHistory, FaBell, FaPlus, FaTimes, FaTrash, FaWallet } from 'react-icons/fa';
import GuiaTutorial from './GuiaTutorial'; // 🔴 TUTORIAL IMPORTADO

const CajaFuerteFullScreen = ({ isOpen, onClose, saldoCajaFuerte, saldoActual, saldoBoveda, pinSeguridad, onTransaction, historial, eventosCalendario, onSaveEvent, onDeleteEvent, mesActual, anioActual }) => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventForm, setEventForm] = useState({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' });

    if (!isOpen) return null;

    const hoy = new Date();

    const localHistorial = historial.filter(h => h.nombre.includes('Caja Fuerte'));
    const localEventos = eventosCalendario.filter(e => e.categoria === 'Caja Fuerte');

    const granTotal = (saldoActual || 0) + (saldoCajaFuerte || 0) + (saldoBoveda || 0);

    const handleAdd = () => {
        const val = window.prompt(`💰 INGRESAR A CAJA FUERTE\n\nDinero disponible en tu Cascada: $${saldoActual.toLocaleString()}\n¿Cuánto deseas transferir a la Caja Fuerte?`);
        if (!val) return;
        const monto = parseFloat(val);
        if (isNaN(monto) || monto <= 0) return alert("❌ Monto inválido.");
        
        let esExterno = false;
        if (monto > saldoActual) {
            const confirmExterno = window.confirm(`❌ No tienes esa cantidad en tu Cascada disponible ($${saldoActual.toLocaleString()}).\n\n¿Tienes este dinero guardado en otra parte (otro banco, efectivo extra) y deseas ingresarlo directamente a tu Caja Fuerte sin afectar tu Cascada?`);
            if (!confirmExterno) return;
            esExterno = true;
        }

        if (window.prompt("🔒 NIP DE SEGURIDAD\nIngresa tu NIP de 4 dígitos para autorizar el ingreso:") !== pinSeguridad) return alert("❌ NIP Incorrecto. Operación cancelada.");
        
        onTransaction('add', monto, esExterno);
    };

    const handleWithdraw = () => {
        const val = window.prompt(`💸 RETIRAR A CASCADA\n\nDinero protegido en Caja Fuerte: $${saldoCajaFuerte.toLocaleString()}\n¿Cuánto deseas regresar a tu Cascada (Saldo Libre)?`);
        if (!val) return;
        const monto = parseFloat(val);
        if (isNaN(monto) || monto <= 0) return alert("❌ Monto inválido.");
        if (monto > saldoCajaFuerte) return alert("❌ No tienes tantos fondos en la Caja Fuerte.");
        if (window.prompt("🔒 NIP DE SEGURIDAD\nIngresa tu NIP de 4 dígitos para autorizar el retiro:") !== pinSeguridad) return alert("❌ NIP Incorrecto. Operación cancelada.");
        onTransaction('withdraw', monto);
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
        
        const realesIn = reales.filter(r => /ingreso|blindaje|asegurado/i.test(r.nombre));
        const realesOut = reales.filter(r => /retiro/i.test(r.nombre));

        return { 
            tienePago: planificados.some(e => e.tipo === 'pago') || realesIn.length > 0, 
            tieneGasto: planificados.some(e => e.tipo === 'gasto') || realesOut.length > 0 
        };
    };

    const openEventModal = (dia) => {
        setSelectedDay(dia);
        setEventForm({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' });
        setIsEventModalOpen(true);
    };

    const handleSaveLocalEvent = () => {
        if (!eventForm.nombre || !eventForm.monto) return alert("Llena los campos.");
        onSaveEvent({ ...eventForm, monto: parseFloat(eventForm.monto), dia: selectedDay, categoria: 'Caja Fuerte' });
        setIsEventModalOpen(false);
    };

    return (
        <div style={fullScreenStyle}>
            {isEventModalOpen && (
                <div style={overlayStyle}>
                    <div style={modalCenterStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{...badgeDayStyle, background: '#007bff'}}>Día {selectedDay} (Caja Fuerte)</div>
                            <FaTimes onClick={() => setIsEventModalOpen(false)} style={{ cursor: 'pointer', color: '#a4b0be', fontSize: '20px' }} />
                        </div>
                        <div style={typeSelectorGrid}>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'pago'})} style={{ ...typeBtn, border: eventForm.tipo === 'pago' ? '2px solid #28a745' : '1px solid #e1e5ee', background: eventForm.tipo === 'pago' ? '#e6f4ea' : '#fff' }}>Ingreso Previsto</button>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'gasto'})} style={{ ...typeBtn, border: eventForm.tipo === 'gasto' ? '2px solid #dc3545' : '1px solid #e1e5ee', background: eventForm.tipo === 'gasto' ? '#fce8e6' : '#fff' }}>Retiro Previsto</button>
                        </div>
                        <input type="text" placeholder="Concepto (Ej. Ahorro Coche)" value={eventForm.nombre} onChange={(e) => setEventForm({...eventForm, nombre: e.target.value})} style={inputModalStyle} />
                        <input type="number" placeholder="Monto $" value={eventForm.monto} onChange={(e) => setEventForm({...eventForm, monto: e.target.value})} style={inputModalStyle} />
                        <select value={eventForm.frecuencia} onChange={(e) => setEventForm({...eventForm, frecuencia: e.target.value})} style={inputModalStyle}>
                            <option value="Único">Solo esta vez</option><option value="Semanal">Semanal</option><option value="Mensual">Mensual</option><option value="Anual">Anual</option>
                        </select>
                        <button onClick={handleSaveLocalEvent} style={{ ...btnMainAdd, width: '100%', marginTop: '10px', background: '#007bff' }}>Crear Alerta en Caja Fuerte</button>
                    </div>
                </div>
            )}

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: 0, color: '#2f3542', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaLock color="#007bff" /> Caja Fuerte (Mis Ahorros)</h1>
                </div>
            </div>
            
            <div style={contentContainer}>
                <div style={cardStyle}>
                    <div style={iconCircle}><FaPiggyBank /></div>
                    <h2 style={titleStyle}>Ahorros Protegidos</h2>
                    <p style={descStyle}>El dinero aquí no se toca por error. Está fuera de tu Cascada diaria.</p>
                    
                    <h1 style={balanceStyle}>${saldoCajaFuerte.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h1>
                    <p style={{ margin: '0 0 40px 0', color: '#a4b0be', fontSize: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <FaWallet /> Gran Total (Todos tus fondos y apartados): <span style={{color: '#2f3542'}}>${granTotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                    </p>

                    <div style={actionRow}>
                        <button onClick={handleAdd} style={btnAdd}><FaArrowUp /> Ingresar Dinero</button>
                        <button onClick={handleWithdraw} style={btnWithdraw}><FaArrowDown /> Retirar a Cascada</button>
                    </div>
                </div>

                <div style={gridBottom}>
                    <div style={calendarContainer}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2f3542' }}><FaCalendarAlt color="#007bff" /> Calendario de Ahorros</span>
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
                                    if (esHoy) { bgColor = '#007bff'; textColor = 'white'; } 
                                    else if (tienePago && tieneGasto) { bgColor = 'linear-gradient(135deg, #e6f4ea 50%, #fce8e6 50%)'; textColor = '#007bff'; } 
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
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: 0, color: '#2f3542' }}><FaHistory color="#007bff" /> Historial de Caja Fuerte</h4>
                            </div>
                            {localHistorial.length === 0 ? ( <p style={{ margin: 0, fontSize: '13px', color: '#a4b0be' }}>Sin movimientos en la caja fuerte.</p> ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {localHistorial.map(h => {
                                        const isIngresoLocal = /ingreso|blindaje|asegurado/i.test(h.nombre);
                                        return (
                                            <div key={h.id} style={miniAlertCard}>
                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.nombre}</span>
                                                <span style={{ fontWeight: 'bold', color: isIngresoLocal ? '#28a745' : '#dc3545' }}>
                                                    {isIngresoLocal ? '+' : '-'}${h.monto}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div style={remindersContainer}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: 0, color: '#2f3542' }}><FaBell color="#ffc107" /> Alertas Programadas</h4>
                            </div>
                            {localEventos.length === 0 ? ( <p style={{ margin: 0, fontSize: '13px', color: '#a4b0be' }}>Sin alertas de ahorro programadas.</p> ) : (
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
            
            {/* 🔴 INVOCAMOS EL TUTORIAL AL FINAL DE LA PANTALLA */}
            <GuiaTutorial 
                seccion="caja_fuerte_vista"
                pasos={[
                    {
                        titulo: "Tu Bóveda de Ahorros 🐷",
                        contenido: "Este dinero está fuera de tu Cascada diaria. Aquí se acumula lo que lograste ahorrar de tus metas o de tu sobrante.",
                        consejo: "Usa el botón de 'Ingresar Dinero' si vendiste algo o te regalaron efectivo; la app lo registrará como Ingreso Externo sin afectar tu presupuesto diario."
                    }
                ]}
            />
        </div>
    );
};

// ESTILOS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const headerStyle = { backgroundColor: '#fff', padding: '25px 40px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542', transition: '0.2s' };
const contentContainer = { padding: '60px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' };
const cardStyle = { backgroundColor: '#fff', padding: '50px 40px', borderRadius: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', textAlign: 'center', border: '2px solid #eef3ff', width: '100%', marginBottom: '30px' };
const iconCircle = { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#eef3ff', color: '#007bff', fontSize: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px auto' };
const titleStyle = { margin: '0 0 10px 0', fontSize: '24px', color: '#2f3542' };
const descStyle = { margin: '0 0 40px 0', color: '#747d8c', fontSize: '15px' };
const balanceStyle = { fontSize: '65px', margin: '0 0 50px 0', color: '#007bff', fontWeight: 'bold', textShadow: '0 4px 15px rgba(0, 123, 255, 0.2)' };
const actionRow = { display: 'flex', gap: '20px' };
const btnAdd = { flex: 1, backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '18px', padding: '20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0, 123, 255, 0.3)' };
const btnWithdraw = { flex: 1, backgroundColor: '#f8f9fa', color: '#007bff', border: '2px solid #007bff', borderRadius: '18px', padding: '20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
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

export default CajaFuerteFullScreen;