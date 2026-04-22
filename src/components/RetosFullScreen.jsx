import React from 'react';
import { FaArrowLeft, FaGamepad, FaCheckCircle, FaHistory, FaPiggyBank, FaTrash } from 'react-icons/fa';

const RetosFullScreen = ({ isOpen, onClose, cajones, ordenCajones, historial, totalAcumulado, completarReto, borrarReto }) => {
    if (!isOpen) return null;

    const retosActivos = ordenCajones.filter(n => n.startsWith('Reto:') || n.startsWith('Capricho:'));
    const historialRetos = historial.filter(h => h.nombre.includes('Micro-Reto') || h.nombre.includes('Capricho') || h.nombre.includes('Reto:'));

    return (
        <div style={fullScreenStyle}>
            <style>{`
                /* 🔴 MEDIA QUERIES PARA CELULARES */
                @media (max-width: 768px) {
                    .header-responsive { padding: 15px 20px !important; }
                    .header-title-responsive { font-size: 20px !important; }
                    .content-responsive { padding: 20px !important; }
                    .grid-responsive { grid-template-columns: 1fr !important; gap: 20px !important; }
                    .acumulado-card-responsive { padding: 20px !important; margin-bottom: 20px !important; }
                    .acumulado-total-responsive { font-size: 40px !important; }
                    .reto-card-responsive { padding: 15px !important; }
                    .btn-action-mobile { width: 100% !important; justify-content: center !important; }
                    .btn-group-mobile { flex-direction: column !important; width: 100% !important; margin-top: 15px !important; }
                }
            `}</style>

            <div className="header-responsive" style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 className="header-title-responsive" style={{ margin: '0', color: '#e83e8c', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaGamepad /> Mis Micro-Retos</h1>
                </div>
            </div>

            <div className="content-responsive" style={contentContainer}>
                {/* SALDO ACUMULADO */}
                <div className="acumulado-card-responsive" style={acumuladoCard}>
                    <FaPiggyBank style={{ fontSize: '40px', color: '#e83e8c', marginBottom: '10px' }} />
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#e83e8c', fontWeight: 'bold' }}>Dinero Congelado en Caprichos</p>
                    <h1 className="acumulado-total-responsive" style={{ margin: 0, fontSize: '56px', color: '#e83e8c' }}>${totalAcumulado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h1>
                </div>

                <div className="grid-responsive" style={gridStyle}>
                    {/* PANEL IZQUIERDO: RETOS ACTIVOS */}
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2f3542' }}><FaGamepad color="#e83e8c" /> Retos en Progreso</h3>
                        {retosActivos.length === 0 ? (
                            <p style={{ color: '#747d8c', background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e1e5ee' }}>No tienes retos activos ahora mismo. ¡Ve a tus Metas y crea uno!</p>
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
                                        <div key={reto} className="reto-card-responsive" style={retoCard}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <strong style={{ fontSize: '15px', color: '#2f3542' }}>{reto.replace(/ \(\d+ ciclos\)/, '').replace('Reto: ', '')}</strong>
                                                {ciclosTotal > 0 && <span style={{ fontSize: '13px', color: '#e83e8c', fontWeight: 'bold' }}>Ciclo {ciclosPagados} de {ciclosTotal}</span>}
                                            </div>
                                            
                                            {ciclosTotal > 0 && (
                                                <div style={progressBg}>
                                                    <div style={{...progressFill, width: `${Math.min((ciclosPagados/ciclosTotal)*100, 100)}%`}}></div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '13px', color: '#747d8c', fontWeight: 'bold', width: '100%', marginBottom: '10px' }}>Guardado: <span style={{color: '#2f3542', fontSize: '16px'}}>${acumulado.toLocaleString()}</span></span>
                                                
                                                <div className="btn-group-mobile" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button onClick={() => borrarReto(reto)} className="btn-action-mobile" style={btnCancelReto} title="Cancelar reto y regresar dinero">
                                                        <FaTrash /> Cancelar
                                                    </button>

                                                    {isCompleted ? (
                                                        <button onClick={() => { completarReto(reto); onClose(); }} className="btn-action-mobile" style={btnComprar}><FaCheckCircle /> ¡Comprar!</button>
                                                    ) : (
                                                        <span className="btn-action-mobile" style={{...badgeProgreso, textAlign: 'center'}}>En progreso...</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* PANEL DERECHO: HISTORIAL Y CALENDARIO */}
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2f3542' }}><FaHistory color="#007bff" /> Historial de Retos</h3>
                        <div style={historialContainer}>
                            {historialRetos.length === 0 ? (
                                <p style={{ margin: 0, fontSize: '13px', color: '#a4b0be', textAlign: 'center', padding: '20px' }}>Aún no hay movimientos de caprichos.</p>
                            ) : (
                                historialRetos.map(h => (
                                    <div key={h.id} style={historialItem}>
                                        <span style={dateBadge}>{h.dia}/{h.mes + 1}</span>
                                        <span style={{ flex: 1, fontSize: '13px', color: '#2f3542', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.nombre}</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: h.tipo === 'pago' ? '#28a745' : '#dc3545' }}>{h.tipo === 'pago' ? '+' : '-'}${h.monto}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ESTILOS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto' };
const headerStyle = { backgroundColor: '#fff', padding: '25px 40px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '10px 15px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542', transition: '0.2s', fontSize: '14px' };
const contentContainer = { padding: '40px', maxWidth: '1000px', margin: '0 auto' };
const acumuladoCard = { background: '#fce3ed', padding: '40px', borderRadius: '25px', border: '2px dashed #e83e8c', textAlign: 'center', marginBottom: '40px' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' };
const retoCard = { background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e1e5ee', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' };
const progressBg = { width: '100%', height: '12px', backgroundColor: '#f1f2f6', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' };
const progressFill = { height: '100%', background: '#e83e8c', transition: 'width 0.5s ease-out' };
const btnComprar = { background: '#e83e8c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxSizing: 'border-box' };
const btnCancelReto = { background: '#ffebee', color: '#dc3545', border: '1px solid #ffcdd2', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', fontSize: '13px', fontWeight: 'bold', gap: '5px', boxSizing: 'border-box' };
const badgeProgreso = { fontSize: '12px', color: '#a4b0be', background: '#f1f2f6', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', boxSizing: 'border-box' };
const historialContainer = { background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e1e5ee', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' };
const historialItem = { display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #f1f2f6' };
const dateBadge = { background: '#e1e5ee', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#2f3542' };

export default RetosFullScreen;