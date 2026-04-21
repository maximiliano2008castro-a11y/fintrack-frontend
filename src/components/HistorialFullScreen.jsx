import React from 'react';
import { FaArrowLeft, FaHistory, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import GuiaTutorial from './GuiaTutorial'; // 🔴 TUTORIAL IMPORTADO

const HistorialFullScreen = ({ isOpen, onClose, historial }) => {
    if (!isOpen) return null;

    return (
        <div style={fullScreenStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: 0, color: '#2f3542', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHistory color="#007bff" /> Historial Detallado
                    </h1>
                </div>
            </div>
            
            <div style={contentContainer}>
                {historial.length === 0 ? (
                    <div style={emptyState}>
                        <FaHistory style={{fontSize: '60px', color: '#e1e5ee', marginBottom: '20px'}} />
                        <h2 style={{color: '#2f3542', margin: '0 0 10px 0'}}>Aún no hay movimientos</h2>
                        <p style={{color: '#747d8c', margin: 0, fontSize: '15px'}}>Aquí aparecerá tu estado de cuenta con el balance antes y después de cada transacción.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {historial.map((item, index) => {
                            const isPago = item.tipo === 'pago';
                            return (
                                <div key={item.id || index} style={cardStyle}>
                                    <div style={{...iconBox, background: isPago ? '#e6f4ea' : '#ffebee', color: isPago ? '#28a745' : '#dc3545'}}>
                                        {isPago ? <FaArrowUp /> : <FaArrowDown />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#2f3542', fontSize: '16px' }}>{item.nombre}</h3>
                                        <p style={{ margin: 0, color: '#a4b0be', fontSize: '13px', fontWeight: 'bold' }}>
                                            {item.dia}/{item.mes + 1}/{item.anio} • {item.hora}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h3 style={{ margin: '0 0 5px 0', color: isPago ? '#28a745' : '#dc3545', fontSize: '18px' }}>
                                            {isPago ? '+' : '-'}${item.monto.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                        </h3>
                                        
                                        {(item.saldoAnterior !== undefined && item.saldoAnterior !== null) && (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', marginTop: '5px' }}>
                                                <span style={{fontSize: '11px', color: '#a4b0be', textDecoration: 'line-through'}}>
                                                    Antes: ${item.saldoAnterior.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                                </span>
                                                <span style={{fontSize: '13px', color: '#007bff', fontWeight: 'bold', background: '#eef3ff', padding: '3px 8px', borderRadius: '6px'}}>
                                                    Quedó: ${item.saldoNuevo.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 🔴 INVOCAMOS EL TUTORIAL AL FINAL DE LA PANTALLA */}
            <GuiaTutorial 
                seccion="historial_vista_v1"
                pasos={[
                    {
                        titulo: "Trazabilidad Total 📖",
                        contenido: "Aquí se registra cada movimiento de tu dinero. Ingresos, gastos, metas cumplidas y dinero blindado.",
                        consejo: "Revisa siempre la línea tachada ('Antes') y la resaltada ('Quedó'). Así sabrás exactamente cómo afectó ese movimiento a tus finanzas y todo cuadrará a la perfección."
                    }
                ]}
            />
        </div>
    );
};

// ESTILOS CSS-IN-JS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const headerStyle = { backgroundColor: '#fff', padding: '25px 40px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542', transition: '0.2s' };
const contentContainer = { padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' };
const cardStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', border: '1px solid #e1e5ee' };
const iconBox = { width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' };
const emptyState = { textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '30px', border: '2px dashed #e1e5ee' };

export default HistorialFullScreen;