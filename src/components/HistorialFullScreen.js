import React from 'react';
import { FaArrowLeft, FaHistory, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import GuiaTutorial from './GuiaTutorial'; // 🔴 TUTORIAL IMPORTADO

// 💡 Se agregó "isDarkMode" a los props
const HistorialFullScreen = ({ isOpen, onClose, historial, isDarkMode }) => {
    if (!isOpen) return null;

    return (
        <div className={isDarkMode ? 'theme-dark' : 'theme-light'} style={fullScreenStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHistory color="var(--primary)" /> Historial Detallado
                    </h1>
                </div>
            </div>
            
            <div style={contentContainer}>
                {historial.length === 0 ? (
                    <div style={emptyState}>
                        <FaHistory style={{fontSize: '60px', color: 'var(--text-light)', marginBottom: '20px'}} />
                        <h2 style={{color: 'var(--text-main)', margin: '0 0 10px 0'}}>Aún no hay movimientos</h2>
                        <p style={{color: 'var(--text-muted)', margin: 0, fontSize: '15px'}}>Aquí aparecerá tu estado de cuenta con el balance antes y después de cada transacción.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {historial.map((item, index) => {
                            const isPago = item.tipo === 'pago';
                            return (
                                <div key={item.id || index} style={cardStyle}>
                                    <div style={{...iconBox, background: isPago ? 'var(--success-light)' : 'var(--danger-light)', color: isPago ? 'var(--success-alt)' : 'var(--danger)'}}>
                                        {isPago ? <FaArrowUp /> : <FaArrowDown />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '16px' }}>{item.nombre}</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
                                            {item.dia}/{item.mes + 1}/{item.anio} • {item.hora}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h3 style={{ margin: '0 0 5px 0', color: isPago ? 'var(--success-alt)' : 'var(--danger)', fontSize: '18px' }}>
                                            {isPago ? '+' : '-'}${item.monto.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                        </h3>
                                        
                                        {(item.saldoAnterior !== undefined && item.saldoAnterior !== null) && (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', marginTop: '5px' }}>
                                                <span style={{fontSize: '11px', color: 'var(--text-light)', textDecoration: 'line-through'}}>
                                                    Antes: ${item.saldoAnterior.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                                </span>
                                                <span style={{fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', background: 'var(--primary-light)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-light)'}}>
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

// ESTILOS DINÁMICOS BASADOS EN VARIABLES CSS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--bg-main)', zIndex: 3000, overflowY: 'auto', display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s' };
const headerStyle = { backgroundColor: 'var(--bg-card)', padding: '25px 40px', boxShadow: 'var(--card-shadow)', position: 'sticky', top: 0, zIndex: 3010, borderBottom: '1px solid var(--border-color)', transition: '0.3s' };
const backBtnStyle = { padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-main)', transition: '0.2s' };
const contentContainer = { padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' };
const cardStyle = { backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)', transition: '0.3s' };
const iconBox = { width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' };
const emptyState = { textAlign: 'center', padding: '100px 20px', background: 'var(--bg-card)', borderRadius: '30px', border: '2px dashed var(--border-color)', transition: '0.3s' };

export default HistorialFullScreen;