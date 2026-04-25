import React, { useState } from 'react';
import { FaArrowLeft, FaShieldAlt, FaArrowUp, FaArrowDown, FaLock, FaCalendarAlt, FaHistory, FaBell, FaTimes, FaTrash, FaWallet } from 'react-icons/fa';
import GuiaTutorial from './GuiaTutorial';

const BovedaFullScreen = ({ isOpen, onClose, saldoBoveda, saldoActual, saldoCajaFuerte, pinSeguridad, onTransaction, historial, eventosCalendario, onSaveEvent, onDeleteEvent, mesActual, anioActual, cajones, cicloMaestro, onDeleteCajon }) => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventForm, setEventForm] = useState({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' });

    if (!isOpen) return null;

    const hoy = new Date();

    const localHistorial = historial.filter(h => h.nombre.includes('Emergencia') || h.nombre.includes('Bóveda'));
    const localEventos = eventosCalendario.filter(e => e.categoria === 'Boveda');

    const granTotal = (saldoActual || 0) + (saldoCajaFuerte || 0) + (saldoBoveda || 0);

    // 💡 LÓGICA DE META Y PROGRESO DEL FONDO DE EMERGENCIA
    const fondoData = cajones && cajones['Fondo de Emergencia'] ? cajones['Fondo de Emergencia'] : null;
    
    // Aquí lee el Gran Total (Ej. 12,000) que acabamos de agregar desde Mis Metas
    const metaTotal = fondoData?.metaTotal || 0; 
    
    // Aquí lee lo que aportas cada ciclo (Ej. 3,000)
    const cuotaCiclo = fondoData?.monto || 0;
    
    const porcentajeProgreso = metaTotal > 0 ? Math.min((saldoBoveda / metaTotal) * 100, 100) : 0;
    
    let ciclosRestantes = 0;
    if (metaTotal > 0 && cuotaCiclo > 0 && saldoBoveda < metaTotal) {
        ciclosRestantes = Math.ceil((metaTotal - saldoBoveda) / cuotaCiclo);
    }

    const handleAdd = () => {
        const val = window.prompt(`🛡️ INGRESAR A BÓVEDA INTOCABLE\n\nDinero disponible en tu Cascada: $${saldoActual.toLocaleString()}\n¿Cuánto deseas blindar en la Bóveda?`);
        if (!val) return;
        const monto = parseFloat(val);
        if (isNaN(monto) || monto <= 0) return alert("❌ Monto inválido.");
        
        let esExterno = false;
        if (monto > saldoActual) {
            const confirmExterno = window.confirm(`❌ No tienes esa cantidad en tu Cascada disponible ($${saldoActual.toLocaleString()}).\n\n¿Tienes este dinero en otra parte (otro banco, efectivo extra) y deseas blindarlo directamente en tu Bóveda sin afectar tu Cascada?`);
            if (!confirmExterno) return;
            esExterno = true;
        }

        if (window.prompt("🔒 NIP DE SEGURIDAD\nIngresa tu NIP de 4 dígitos para autorizar:") !== pinSeguridad) return alert("❌ NIP Incorrecto.");
        onTransaction('add', monto, esExterno);
    };

    const handleWithdraw = () => {
        const val = window.prompt(`🚨 RETIRO DE EMERGENCIA\n\nDinero protegido: $${saldoBoveda.toLocaleString()}\n¿Cuánto necesitas retirar para esta crisis?`);
        if (!val) return;
        const monto = parseFloat(val);
        if (isNaN(monto) || monto <= 0) return alert("❌ Monto inválido.");
        if (monto > saldoBoveda) return alert("❌ No tienes tantos fondos en la Bóveda.");
        if (window.prompt("🔒 NIP DE SEGURIDAD\nIngresa tu NIP de 4 dígitos para autorizar el retiro vital:") !== pinSeguridad) return alert("❌ NIP Incorrecto.");
        onTransaction('withdraw', monto);
    };

    // 💡 BOTÓN PARA ELIMINAR EL FONDO Y REGRESAR DINERO
    const handleEliminarFondo = () => {
        if (!fondoData && saldoBoveda === 0) return alert("No tienes un Fondo de Emergencia activo para eliminar.");
        if (window.prompt(`🔒 NIP DE SEGURIDAD\nEstás a punto de eliminar tu Fondo de Emergencia. Ingresa tu NIP para continuar:`) !== pinSeguridad) return alert("❌ NIP Incorrecto.");
        
        if (window.confirm(`🚨 ADVERTENCIA\n\n¿Estás completamente seguro de eliminar tu Fondo de Emergencia?\nTodo el dinero blindado ($${saldoBoveda.toLocaleString()}) será devuelto a tu Cascada principal.`)) {
            if (onDeleteCajon) {
                onDeleteCajon('Fondo de Emergencia', 0, true);
            }
            onClose();
        }
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
        const realesIn = reales.filter(r => /ingreso|blindaje|asegurado|reembolso/i.test(r.nombre));
        const realesOut = reales.filter(r => /retiro|gastado/i.test(r.nombre));

        return { 
            tienePago: planificados.some(e => e.tipo === 'pago') || realesIn.length > 0, 
            tieneGasto: planificados.some(e => e.tipo === 'gasto') || realesOut.length > 0 
        };
    };

    const openEventModal = (dia) => { setSelectedDay(dia); setEventForm({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' }); setIsEventModalOpen(true); };
    const handleSaveLocalEvent = () => {
        if (!eventForm.nombre || !eventForm.monto) return alert("Llena los campos.");
        onSaveEvent({ ...eventForm, monto: parseFloat(eventForm.monto), dia: selectedDay, categoria: 'Boveda' });
        setIsEventModalOpen(false);
    };

    return (
        <div style={fullScreenStyle}>
            <style>{`
                @media (max-width: 768px) {
                    .boveda-content { padding: 20px !important; }
                    .boveda-card { padding: 30px 20px !important; border-radius: 25px !important; }
                    .boveda-balance { font-size: 45px !important; }
                    .boveda-actions { flex-direction: column !important; gap: 15px !important; }
                    .boveda-grid-bottom { grid-template-columns: 1fr !important; gap: 20px !important; }
                    .boveda-btn { padding: 15px !important; font-size: 15px !important; }
                }
            `}</style>

            {isEventModalOpen && (
                <div style={overlayStyle}>
                    <div style={modalCenterStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{...badgeDayStyle, background: '#28a745'}}>Día {selectedDay} (Bóveda)</div>
                            <FaTimes onClick={() => setIsEventModalOpen(false)} style={{ cursor: 'pointer', color: '#a4b0be', fontSize: '20px' }} />
                        </div>
                        <div style={typeSelectorGrid}>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'pago'})} style={{ ...typeBtn, border: eventForm.tipo === 'pago' ? '2px solid #28a745' : '1px solid #e1e5ee', background: eventForm.tipo === 'pago' ? '#e6f4ea' : '#fff' }}>Aporte Previsto</button>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'gasto'})} style={{ ...typeBtn, border: eventForm.tipo === 'gasto' ? '2px solid #dc3545' : '1px solid #e1e5ee', background: eventForm.tipo === 'gasto' ? '#fce8e6' : '#fff' }}>Retiro de Riesgo</button>
                        </div>
                        <input type="text" placeholder="Concepto (Ej. Pago Seguro)" value={eventForm.nombre} onChange={(e) => setEventForm({...eventForm, nombre: e.target.value})} style={inputModalStyle} />
                        <input type="number" placeholder="Monto $" value={eventForm.monto} onChange={(e) => setEventForm({...eventForm, monto: e.target.value})} style={inputModalStyle} />
                        <select value={eventForm.frecuencia} onChange={(e) => setEventForm({...eventForm, frecuencia: e.target.value})} style={inputModalStyle}>
                            <option value="Único">Solo esta vez</option><option value="Semanal">Semanal</option><option value="Mensual">Mensual</option><option value="Anual">Anual</option>
                        </select>
                        <button onClick={handleSaveLocalEvent} style={{ ...btnMainAdd, width: '100%', marginTop: '10px', background: '#28a745' }}>Crear Alerta en Bóveda</button>
                    </div>
                </div>
            )}

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: 0, color: '#2f3542', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaShieldAlt color="#28a745" /> Bóveda Intocable</h1>
                </div>
            </div>
            
            <div className="boveda-content" style={contentContainer}>
                <div className="boveda-card" style={cardStyle}>
                    <div style={iconCircle}><FaLock /></div>
                    <h2 style={titleStyle}>Fondo de Emergencia Real</h2>
                    <p style={descStyle}>Dinero blindado exclusivamente para salud, desempleo o crisis mayores.</p>
                    
                    <h1 className="boveda-balance" style={balanceStyle}>${saldoBoveda.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h1>
                    <p style={{ margin: '0 0 20px 0', color: '#a4b0be', fontSize: '13px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <FaWallet /> Gran Total (Cascada + Cajas): <span style={{color: '#2f3542'}}>${granTotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                    </p>

                    {/* 💡 BARRA DE PROGRESO DEL FONDO DE EMERGENCIA */}
                    <div style={progressCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2f3542', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaShieldAlt color="#007bff" /> Progreso del Fondo
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>
                                Meta: ${metaTotal.toLocaleString()}
                            </span>
                        </div>
                        
                        <div style={{ width: '100%', height: '10px', background: '#e1e5ee', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
                            <div style={{ height: '100%', width: `${porcentajeProgreso}%`, background: '#007bff', transition: 'width 0.4s ease' }}></div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#2f3542' }}>Guardado: <b style={{color: '#2f3542'}}>${saldoBoveda.toLocaleString()}</b></span>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button onClick={handleEliminarFondo} style={btnTrashStyle} title="Eliminar fondo y recuperar dinero"><FaTrash /></button>
                                <div style={badgeCompletadoStyle}>{porcentajeProgreso.toFixed(0)}% Completado</div>
                            </div>
                        </div>

                        {metaTotal === 0 ? (
                            <p style={{margin: '15px 0 0 0', fontSize: '12px', color: '#dc3545', textAlign: 'center'}}>
                                ⚠️ Elimina este cajón (botón rojo) y vuelve a crearlo desde "Mis Metas" para definir tu objetivo.
                            </p>
                        ) : (
                            ciclosRestantes > 0 ? (
                                <p style={{margin: '10px 0 0 0', fontSize: '12px', color: '#747d8c', textAlign: 'right'}}>
                                    Faltan aprox. <b>{ciclosRestantes} aportes</b> de tu ciclo {cicloMaestro}
                                </p>
                            ) : (
                                <p style={{margin: '10px 0 0 0', fontSize: '13px', color: '#28a745', textAlign: 'right', fontWeight: 'bold'}}>
                                    ¡Meta alcanzada! 🎉
                                </p>
                            )
                        )}
                    </div>

                    <div className="boveda-actions" style={actionRow}>
                        <button className="boveda-btn" onClick={handleAdd} style={btnAdd}><FaArrowUp /> Blindar Dinero</button>
                        <button className="boveda-btn" onClick={handleWithdraw} style={btnWithdraw}><FaArrowDown /> Retirar a Cascada</button>
                    </div>
                </div>

                <div className="boveda-grid-bottom" style={gridBottom}>
                    <div style={calendarContainer}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}><span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2f3542' }}><FaCalendarAlt color="#28a745" /> Calendario Bóveda</span></div>
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
                                    else if (tienePago && tieneGasto) { bgColor = 'linear-gradient(135deg, #28a745 50%, #dc3545 50%)'; textColor = 'white'; } 
                                    else if (tienePago) { bgColor = '#28a745'; textColor = 'white'; } 
                                    else if (tieneGasto) { bgColor = '#dc3545'; textColor = 'white'; }
                                    
                                    return <div key={i} onClick={() => { if(dia) openEventModal(dia); }} style={{...celdaDia, background: bgColor, color: textColor, fontWeight: (tienePago || tieneGasto || esHoy) ? 'bold' : 'normal', cursor: dia ? 'pointer' : 'default', boxShadow: (tienePago || tieneGasto) ? '0 3px 10px rgba(0,0,0,0.15)' : 'none'}}>{dia || ''}</div>;
                                });
                            })()}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={remindersContainer}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}><h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: 0, color: '#2f3542' }}><FaHistory color="#28a745" /> Historial Bóveda</h4></div>
                            {localHistorial.length === 0 ? ( <p style={{ margin: 0, fontSize: '13px', color: '#a4b0be' }}>Sin movimientos de emergencia.</p> ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {localHistorial.map(h => {
                                        const isIngresoLocal = /ingreso|blindaje|asegurado|reembolso/i.test(h.nombre);
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}><h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: 0, color: '#2f3542' }}><FaBell color="#ffc107" /> Alertas Bóveda</h4></div>
                            {localEventos.length === 0 ? ( <p style={{ margin: 0, fontSize: '13px', color: '#a4b0be' }}>Sin alertas programadas.</p> ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {localEventos.map(e => (
                                        <div key={e.id} style={miniAlertCard}><span style={miniDayBadge}>{e.dia}</span><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nombre}</span><FaTrash onClick={() => onDeleteEvent(e.id)} style={{cursor: 'pointer', color: '#dc3545'}} /></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <GuiaTutorial 
                seccion="boveda_emergencias_v1"
                pasos={[
                    {
                        titulo: "Tu Escudo Financiero 🛡️",
                        contenido: "Esta bóveda es intocable. El dinero aquí depositado debe usarse EXCLUSIVAMENTE para emergencias médicas, accidentes o pérdida de empleo.",
                        consejo: "Nunca mezcles tus ahorros para viajes o lujos (Caja Fuerte) con este dinero. La tranquilidad mental no tiene precio."
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
const cardStyle = { backgroundColor: '#fff', padding: '50px 40px', borderRadius: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', textAlign: 'center', border: '2px solid #e6f4ea', width: '100%', marginBottom: '30px', boxSizing: 'border-box' };
const iconCircle = { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#e6f4ea', color: '#28a745', fontSize: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px auto' };
const titleStyle = { margin: '0 0 10px 0', fontSize: '24px', color: '#2f3542' };
const descStyle = { margin: '0 0 20px 0', color: '#747d8c', fontSize: '15px' };
const balanceStyle = { fontSize: '65px', margin: '0 0 5px 0', color: '#28a745', fontWeight: 'bold', textShadow: '0 4px 15px rgba(40, 167, 69, 0.2)' };
const actionRow = { display: 'flex', gap: '20px' };
const btnAdd = { flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '18px', padding: '20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(40, 167, 69, 0.3)' };
const btnWithdraw = { flex: 1, backgroundColor: '#f8f9fa', color: '#28a745', border: '2px solid #28a745', borderRadius: '18px', padding: '20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const gridBottom = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' };
const calendarContainer = { backgroundColor: '#fff', padding: '30px', borderRadius: '25px', border: '1px solid #e1e5ee', borderTop: '4px solid #28a745', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
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

// 💡 ESTILOS DE LA TARJETA DE PROGRESO AZUL
const progressCardStyle = { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '20px', border: '1px solid #e1e5ee', marginBottom: '30px', textAlign: 'left' };
const btnTrashStyle = { background: '#ffebee', color: '#dc3545', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '14px', transition: '0.2s' };
const badgeCompletadoStyle = { background: '#eef3ff', color: '#007bff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' };

export default BovedaFullScreen;