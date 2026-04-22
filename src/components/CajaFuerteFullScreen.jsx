import React, { useState } from 'react';
import { FaArrowLeft, FaLock, FaPlus, FaMinus, FaHistory, FaBrain, FaCheckCircle, FaTrash } from 'react-icons/fa';

const CajaFuerteFullScreen = ({ isOpen, onClose, saldoCajaFuerte, saldoActual, pinSeguridad, onTransaction, historial, cajones, ordenCajones, completarMeta, borrarMeta }) => {
    const [montoIngreso, setMontoIngreso] = useState('');
    const [montoRetiro, setMontoRetiro] = useState('');

    if (!isOpen) return null;

    const metasActivas = ordenCajones.filter(n => n.startsWith('Meta:'));
    const totalAcumuladoMetas = metasActivas.reduce((acc, n) => acc + (cajones[n]?.acumulado || 0), 0);
    const granTotal = saldoCajaFuerte + totalAcumuladoMetas;
    const historialCaja = historial.filter(h => h.nombre.includes('Caja Fuerte') || h.nombre.includes('Ahorro') || h.nombre.startsWith('Meta:'));

    const preventMinus = (e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); };

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

    return (
        <div style={fullScreenStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: '0', color: '#007bff', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaLock /> Caja Fuerte (Ahorros)</h1>
                </div>
            </div>

            <div style={contentContainer}>
                
                <div style={{...acumuladoCard, background: 'linear-gradient(135deg, #007bff, #00d2ff)'}}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}>Gran Total (Libre + Metas)</p>
                    <h1 style={{ margin: 0, fontSize: '64px', color: '#fff' }}>${granTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h1>
                </div>

                <div style={gridStyle}>
                    
                    {/* PANEL IZQUIERDO: AHORRO LIBRE */}
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2f3542', borderBottom: '2px solid #e1e5ee', paddingBottom: '10px' }}><FaLock color="#007bff" /> Ahorro General (Libre)</h3>
                        <div style={retoCard}>
                            <h2 style={{ fontSize: '36px', margin: '0 0 20px 0', color: '#007bff', textAlign: 'center' }}>${saldoCajaFuerte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h2>
                            
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <input type="number" min="0" onKeyDown={preventMinus} placeholder="Monto a ingresar" value={montoIngreso} onChange={e=>setMontoIngreso(e.target.value)} style={inputStyle} />
                                <button onClick={handleAdd} style={{...btnAccion, background: '#10ac84'}}><FaPlus /> Ingresar</button>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="number" min="0" onKeyDown={preventMinus} placeholder="Monto a retirar" value={montoRetiro} onChange={e=>setMontoRetiro(e.target.value)} style={inputStyle} />
                                <button onClick={handleWithdraw} style={{...btnAccion, background: '#ee5253'}}><FaMinus /> Retirar</button>
                            </div>
                        </div>

                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2f3542', marginTop: '30px' }}><FaHistory color="#007bff" /> Historial de Ahorros</h3>
                        <div style={historialContainer}>
                            {historialCaja.length === 0 ? <p style={{textAlign:'center', color:'#a4b0be', fontSize:'13px'}}>No hay movimientos.</p> : 
                                historialCaja.map(h => (
                                    <div key={h.id} style={historialItem}>
                                        <span style={dateBadge}>{h.dia}/{h.mes + 1}</span>
                                        <span style={{ flex: 1, fontSize: '13px' }}>{h.nombre}</span>
                                        <span style={{ fontWeight: 'bold', color: h.tipo === 'pago' ? '#28a745' : '#dc3545' }}>{h.tipo === 'pago' ? '+' : '-'}${h.monto}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* PANEL DERECHO: METAS INTELIGENTES */}
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2f3542', borderBottom: '2px solid #e1e5ee', paddingBottom: '10px' }}><FaBrain color="#007bff" /> Metas de Ahorro Inteligente</h3>
                        {metasActivas.length === 0 ? (
                            <p style={{ color: '#747d8c', background: '#fff', padding: '20px', borderRadius: '15px', border: '1px dashed #007bff', textAlign: 'center' }}>No tienes Ahorros Inteligentes en progreso. ¡Créalos en el Laboratorio!</p>
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <strong style={{ fontSize: '16px' }}>{meta.replace(/ \(Total: [\d.]+\)/, '').replace('Meta: ', '')}</strong>
                                                {total > 0 && <span style={{ fontSize: '14px', color: '#007bff', fontWeight: 'bold' }}>Meta: ${total.toLocaleString()}</span>}
                                            </div>
                                            <div style={progressBg}><div style={{...progressFill, width: `${porcentaje}%`}}></div></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                                <span style={{ fontSize: '14px' }}>Guardado: <b style={{fontSize:'18px', color:'#2f3542'}}>${acumulado.toLocaleString()}</b></span>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => borrarMeta(meta)} style={btnDelete}><FaTrash /></button>
                                                    {isCompleted ? (
                                                        <button onClick={() => { completarMeta(meta); onClose(); }} style={btnComprar}><FaCheckCircle /> ¡Finalizar y Comprar!</button>
                                                    ) : (
                                                        <span style={badgeProgreso}>{porcentaje.toFixed(0)}% Completado</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto' };
const headerStyle = { backgroundColor: '#fff', padding: '25px 40px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542', transition: '0.2s' };
const contentContainer = { padding: '40px', maxWidth: '1100px', margin: '0 auto' };
const acumuladoCard = { padding: '40px', borderRadius: '25px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 15px 30px rgba(0,123,255,0.2)' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' };
const retoCard = { background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e1e5ee', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' };
const progressBg = { width: '100%', height: '12px', backgroundColor: '#f1f2f6', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' };
const progressFill = { height: '100%', background: '#007bff', transition: 'width 0.5s ease-out' };
const btnComprar = { background: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const btnDelete = { background: '#ffebee', color: '#dc3545', border: '1px solid #ffcdd2', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const badgeProgreso = { fontSize: '12px', color: '#007bff', background: '#eef3ff', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' };
const historialContainer = { background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e1e5ee', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' };
const historialItem = { display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #f1f2f6' };
const dateBadge = { background: '#e1e5ee', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#2f3542' };
const inputStyle = { flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9', outline: 'none', background: '#f8f9fa', fontSize: '15px', boxSizing: 'border-box', fontWeight: 'bold' };
const btnAccion = { border: 'none', color: 'white', padding: '15px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };

export default CajaFuerteFullScreen;