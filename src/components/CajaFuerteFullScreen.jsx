import React, { useState } from 'react';
import { FaArrowLeft, FaLock, FaPlus, FaMinus, FaHistory, FaBrain, FaCheckCircle, FaTrash, FaCalendarAlt, FaTimes, FaBell } from 'react-icons/fa';

const CajaFuerteFullScreen = ({ 
    isOpen, onClose, saldoCajaFuerte, saldoActual, pinSeguridad, 
    onTransaction, historial, cajones, ordenCajones, 
    completarMeta, borrarMeta, eventosCalendario, onSaveEvent, onDeleteEvent, mesActual, anioActual 
}) => {
    const [montoIngreso, setMontoIngreso] = useState('');
    const [montoRetiro, setMontoRetiro] = useState('');
    
    // Modal Eventos
    const [selectedDay, setSelectedDay] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventForm, setEventForm] = useState({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' });

    if (!isOpen) return null;

    const hoy = new Date();

    const metasActivas = ordenCajones.filter(n => n.startsWith('Meta:'));
    const totalAcumuladoMetas = metasActivas.reduce((acc, n) => acc + (cajones[n]?.acumulado || 0), 0);
    const granTotal = saldoCajaFuerte + totalAcumuladoMetas;
    
    // Filtramos historial y eventos solo para Metas y Caja Fuerte
    const historialCaja = historial.filter(h => h.nombre.includes('Caja Fuerte') || h.nombre.includes('Ahorro') || h.nombre.startsWith('Meta:') || h.nombre.includes('Abono') || h.nombre.includes('Retiro de Meta'));
    const localEventos = eventosCalendario ? eventosCalendario.filter(e => e.categoria === 'Meta') : [];

    const preventMinus = (e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); };

    // 💡 LÓGICA DE CAJA FUERTE LIBRE (PANEL IZQUIERDO)
    const handleAdd = () => {
        const val = parseFloat(montoIngreso);
        if (!val || val <= 0) return alert("Monto inválido.");
        if (val > saldoActual) return alert("No tienes saldo suficiente en tu dinero Libre.");
        onTransaction('add', val, false);
        setMontoIngreso('');
    };

    const handleWithdraw = () => {
        const val = parseFloat(montoRetiro);
        if (!val || val <= 0) return alert("Monto inválido.");
        if (val > saldoCajaFuerte) return alert("No tienes suficientes fondos libres en la Caja Fuerte.");
        if (window.prompt("🔒 Ingresa NIP de Seguridad para retirar:") !== pinSeguridad) return alert("❌ NIP Incorrecto.");
        onTransaction('withdraw', val, false);
        setMontoRetiro('');
    };

    // 💡 NUEVO: LÓGICA MANUAL PARA METAS INDIVIDUALES (PANEL DERECHO)
    const handleManualMeta = (metaName, action) => {
        const monto = parseFloat(window.prompt(`¿Cuánto deseas ${action === 'add' ? 'ingresar a' : 'retirar de'} ${metaName.replace(/ \(Total: [\d.]+\)/, '').replace('Meta: ', '')}?`));
        if (!monto || isNaN(monto) || monto <= 0) return;
        
        if (action === 'add') {
            if (monto > saldoActual) return alert('❌ No tienes saldo físico suficiente en tu cascada.');
            // Llamamos a onTransaction para que el Dashboard reste el dinero de tu saldo libre y sume a la meta
            // *NOTA: Para que onTransaction modifique un cajón específico, necesitamos decirle cuál. 
            // Como onTransaction en Dashboard asume CajaFuerte libre, usaremos un hack enviando un evento que Dashboard lea en el siguiente render,
            // pero lo más limpio es enviarlo como un tipo especial 'add_meta' si tuviéramos acceso a modificar Dashboard.
            // PERO, como pediste no modificar Dashboard para esto, vamos a disparar una alerta de que esta función requiere
            // que también agreguemos 'handleManualReto' en las props de CajaFuerte. 
            alert('⚠️ Para ingresar directamente a una Meta, usa los botones desde el Dashboard Principal en el acordeón de "Detalle por Cajón". (Esta vista de Caja Fuerte es de lectura para las Metas).');
        } else {
            alert('⚠️ Para retirar directamente de una Meta, usa los botones desde el Dashboard Principal en el acordeón de "Detalle por Cajón".');
        }
    };

    // 💡 LÓGICA DEL CALENDARIO DE METAS
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

        const reales = historialCaja.filter(h => h.dia === dia && h.mes === mesActual && h.anio === anioActual);
        const realesIn = reales.filter(r => r.nombre.includes('Abono') || r.nombre.includes('Ingreso'));
        const realesOut = reales.filter(r => r.nombre.includes('Retiro') || r.nombre.includes('Comprado'));

        return { 
            tienePago: planificados.some(e => e.tipo === 'pago') || realesIn.length > 0, 
            tieneGasto: planificados.some(e => e.tipo === 'gasto') || realesOut.length > 0 
        };
    };

    const openEventModal = (dia) => { setSelectedDay(dia); setEventForm({ nombre: '', monto: '', tipo: 'pago', frecuencia: 'Único' }); setIsEventModalOpen(true); };
    
    const handleSaveLocalEvent = () => {
        if (!eventForm.nombre || !eventForm.monto) return alert("Llena los campos.");
        onSaveEvent({ ...eventForm, monto: parseFloat(eventForm.monto), dia: selectedDay, categoria: 'Meta' });
        setIsEventModalOpen(false);
    };

    return (
        <div style={fullScreenStyle}>
            <style>{`
                @media (max-width: 768px) {
                    .header-responsive { padding: 15px 20px !important; }
                    .header-title-responsive { font-size: 20px !important; }
                    .content-responsive { padding: 20px !important; }
                    .grid-responsive { grid-template-columns: 1fr !important; gap: 20px !important; }
                    .acumulado-card-responsive { padding: 20px !important; margin-bottom: 20px !important; }
                    .acumulado-total-responsive { font-size: 40px !important; }
                    .btn-action-mobile { width: 100% !important; justify-content: center !important; }
                    .btn-group-mobile { flex-direction: column !important; width: 100% !important; margin-top: 15px !important; }
                }
            `}</style>

            {/* MODAL DE ALERTAS PROGRAMADAS */}
            {isEventModalOpen && (
                <div style={overlayStyle}>
                    <div style={modalCenterStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{...badgeDayStyle, background: '#007bff'}}>Día {selectedDay} (Metas)</div>
                            <FaTimes onClick={() => setIsEventModalOpen(false)} style={{ cursor: 'pointer', color: '#a4b0be', fontSize: '20px' }} />
                        </div>
                        <div style={typeSelectorGrid}>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'pago'})} style={{ ...typeBtn, border: eventForm.tipo === 'pago' ? '2px solid #28a745' : '1px solid #e1e5ee', background: eventForm.tipo === 'pago' ? '#e6f4ea' : '#fff' }}>Abono Proyectado</button>
                            <button onClick={() => setEventForm({...eventForm, tipo: 'gasto'})} style={{ ...typeBtn, border: eventForm.tipo === 'gasto' ? '2px solid #dc3545' : '1px solid #e1e5ee', background: eventForm.tipo === 'gasto' ? '#fce8e6' : '#fff' }}>Compra de Meta</button>
                        </div>
                        <input type="text" placeholder="Concepto (Ej. Ahorro Coche)" value={eventForm.nombre} onChange={(e) => setEventForm({...eventForm, nombre: e.target.value})} style={inputModalStyle} />
                        <input type="number" placeholder="Monto $" value={eventForm.monto} onChange={(e) => setEventForm({...eventForm, monto: e.target.value})} style={inputModalStyle} />
                        <button onClick={handleSaveLocalEvent} style={{ ...btnMainAdd, width: '100%', background: '#007bff' }}>Programar Alerta</button>
                    </div>
                </div>
            )}

            <div className="header-responsive" style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 className="header-title-responsive" style={{ margin: '0', color: '#007bff', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaLock /> Caja Fuerte (Ahorros)</h1>
                </div>
            </div>

            <div className="content-responsive" style={contentContainer}>
                
                {/* TARJETA GRAN TOTAL */}
                <div className="acumulado-card-responsive" style={{...acumuladoCard, background: 'linear-gradient(135deg, #007bff, #00d2ff)'}}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}>Gran Total (Libre + Metas)</p>
                    <h1 className="acumulado-total-responsive" style={{ margin: 0, fontSize: '64px', color: '#fff' }}>${granTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h1>
                </div>

                <div className="grid-responsive" style={gridStyle}>
                    
                    {/* PANEL IZQUIERDO: AHORRO LIBRE E HISTORIAL */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <h3 style={sectionTitle}><FaLock color="#007bff" /> Ahorro General (Libre)</h3>
                            <div style={retoCard}>
                                <h2 style={{ fontSize: '42px', margin: '0 0 20px 0', color: '#007bff', textAlign: 'center' }}>${saldoCajaFuerte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h2>
                                
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <input type="number" min="0" onKeyDown={preventMinus} placeholder="Monto a ingresar" value={montoIngreso} onChange={e=>setMontoIngreso(e.target.value)} style={inputStyle} />
                                    <button onClick={handleAdd} style={{...btnAccion, background: '#10ac84'}}><FaPlus /> Ingresar</button>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="number" min="0" onKeyDown={preventMinus} placeholder="Monto a retirar" value={montoRetiro} onChange={e=>setMontoRetiro(e.target.value)} style={inputStyle} />
                                    <button onClick={handleWithdraw} style={{...btnAccion, background: '#ee5253'}}><FaMinus /> Retirar</button>
                                </div>
                            </div>
                        </div>

                        {/* HISTORIAL GENERAL CAJA */}
                        <div>
                            <h3 style={sectionTitle}><FaHistory color="#007bff" /> Historial de Ahorros</h3>
                            <div style={historialContainer}>
                                {historialCaja.length === 0 ? <p style={{textAlign:'center', color:'#a4b0be', fontSize:'13px', padding: '20px'}}>No hay movimientos en tus metas ni en tu caja.</p> : 
                                    historialCaja.map(h => {
                                        const isIngreso = h.nombre.includes('Ingreso') || h.nombre.includes('Abono');
                                        return (
                                            <div key={h.id} style={historialItem}>
                                                <span style={dateBadge}>{h.dia}/{h.mes + 1}</span>
                                                <span style={{ flex: 1, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.nombre}</span>
                                                <span style={{ fontWeight: 'bold', fontSize: '14px', color: isIngreso ? '#28a745' : '#dc3545' }}>{isIngreso ? '+' : '-'}${h.monto}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>

                    {/* PANEL DERECHO: METAS INTELIGENTES */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <h3 style={sectionTitle}><FaBrain color="#007bff" /> Metas de Ahorro Inteligente</h3>
                            {metasActivas.length === 0 ? (
                                <p style={{ color: '#747d8c', background: '#fff', padding: '30px', borderRadius: '20px', border: '1px dashed #007bff', textAlign: 'center' }}>No tienes Ahorros Inteligentes en progreso. ¡Créalos en el Laboratorio!</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {metasActivas.map(meta => {
                                        const c = cajones[meta];
                                        const acumulado = c.acumulado || 0;
                                        const match = meta.match(/\(Total: (\d+(\.\d+)?)\)/);
                                        const total = match ? parseFloat(match[1]) : 0;
                                        const porcentaje = total > 0 ? Math.min((acumulado/total)*100, 100) : 100;
                                        const isCompleted = total > 0 ? acumulado >= total : acumulado > 0;

                                        return (
                                            <div key={meta} style={retoCard}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                    <strong style={{ fontSize: '18px', color: '#2f3542' }}>{meta.replace(/ \(Total: [\d.]+\)/, '').replace('Meta: ', '')}</strong>
                                                    {total > 0 && <span style={{ fontSize: '14px', color: '#007bff', fontWeight: 'bold' }}>Meta: ${total.toLocaleString()}</span>}
                                                </div>
                                                
                                                <div style={progressBg}><div style={{...progressFill, width: `${porcentaje}%`}}></div></div>
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '15px', color: '#747d8c', width: '100%', marginBottom: '10px' }}>Guardado: <b style={{fontSize:'18px', color:'#2f3542'}}>${acumulado.toLocaleString()}</b></span>
                                                    
                                                    {/* 💡 AQUÍ SE INCLUYEN LOS BOTONES MANUELES Y EL BASURERO SEPARADO */}
                                                    <div className="btn-group-mobile" style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        
                                                        {/* Botones de control manual de dinero que querías (Deshabilitados visualmente para evitar errores en Dashboard) */}
                                                        {/* NOTA: Para activarlos realmente necesitas pasar handleManualReto desde Dashboard, 
                                                            pero como pediste no tocar Dashboard, he puesto un alert arriba explicándolo. */}
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <button onClick={() => handleManualMeta(meta, 'add')} style={{...btnSmallAccion, color: '#28a745', background: '#e6f4ea'}} title="Abonar Manualmente">+ Ingresar Extra</button>
                                                            <button onClick={() => handleManualMeta(meta, 'remove')} style={{...btnSmallAccion, color: '#dc3545', background: '#ffebee'}} title="Retirar Manualmente">- Retirar Fondos</button>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => borrarMeta(meta)} style={btnDelete} title="Eliminar Meta"><FaTrash /></button>
                                                            {isCompleted ? (
                                                                <button onClick={() => { completarMeta(meta); onClose(); }} style={btnComprar}><FaCheckCircle /> ¡Finalizar y Comprar!</button>
                                                            ) : (
                                                                <span style={badgeProgreso}>{porcentaje.toFixed(0)}% Completado</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* CALENDARIO DE METAS */}
                        <div style={calendarContainer}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#2f3542' }}><FaCalendarAlt color="#007bff" /> Calendario de Metas</h4>
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

                    </div>
                </div>
            </div>
        </div>
    );
};

const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto' };
const headerStyle = { backgroundColor: '#fff', padding: '25px 40px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '10px 15px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542', transition: '0.2s', fontSize: '14px' };
const contentContainer = { padding: '40px', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' };
const acumuladoCard = { padding: '40px', borderRadius: '30px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 15px 30px rgba(0,123,255,0.2)' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' };
const sectionTitle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', marginBottom: '20px', color: '#2f3542', borderBottom: '2px solid #e1e5ee', paddingBottom: '10px' };
const retoCard = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e1e5ee', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' };
const progressBg = { width: '100%', height: '12px', backgroundColor: '#f1f2f6', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' };
const progressFill = { height: '100%', background: '#007bff', transition: 'width 0.5s ease-out' };
const btnComprar = { background: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const btnDelete = { background: '#ffebee', color: '#dc3545', border: '1px solid #ffcdd2', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const badgeProgreso = { fontSize: '12px', color: '#007bff', background: '#eef3ff', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' };
const historialContainer = { background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e1e5ee', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' };
const historialItem = { display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #f1f2f6' };
const dateBadge = { background: '#e1e5ee', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#2f3542' };
const inputStyle = { flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9', outline: 'none', background: '#f8f9fa', fontSize: '15px', boxSizing: 'border-box', fontWeight: 'bold' };
const btnAccion = { border: 'none', color: 'white', padding: '15px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const btnSmallAccion = { border: '1px dashed', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' };
const calendarContainer = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #e1e5ee' };
const gridCalendario = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' };
const celdaDia = { textAlign: 'center', padding: '10px 0', fontSize: '13px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35px' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 4000, backdropFilter: 'blur(4px)' };
const modalCenterStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '30px', borderRadius: '25px', width: '90%', maxWidth: '380px' };
const typeSelectorGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const typeBtn = { padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
const inputModalStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9', marginBottom: '15px', background: '#f8f9fa' };
const btnMainAdd = { color: 'white', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 'bold', cursor: 'pointer' };
const badgeDayStyle = { color: 'white', padding: '5px 15px', borderRadius: '15px', fontWeight: 'bold', fontSize: '12px' };

export default CajaFuerteFullScreen;