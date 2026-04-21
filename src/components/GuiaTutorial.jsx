import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaRocket, FaTimes, FaInfoCircle } from 'react-icons/fa';

const GuiaTutorial = ({ seccion, pasos, onClose }) => {
    const [pasoActual, setPasoActual] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const yaVisto = localStorage.getItem(`tutorial_${seccion}`);
        if (!yaVisto) {
            setVisible(true);
        }
    }, [seccion]);

    if (!visible) return null;

    const siguiente = () => {
        if (pasoActual < pasos.length - 1) {
            setPasoActual(pasoActual + 1);
        } else {
            finalizar();
        }
    };

    const finalizar = () => {
        localStorage.setItem(`tutorial_${seccion}`, 'true');
        setVisible(false);
        if (onClose) onClose();
    };

    return (
        <div style={overlayStyle}>
            <style>{`
                @keyframes bounceInTut {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .tut-modal { animation: bounceInTut 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>
            <div className="tut-modal" style={modalStyle}>
                <div style={headerStyle}>
                    <div style={iconBadge}><FaInfoCircle /></div>
                    <button onClick={finalizar} style={closeBtn} title="Saltar Tutorial"><FaTimes /></button>
                </div>
                
                <h2 style={titleStyle}>{pasos[pasoActual].titulo}</h2>
                <p style={descStyle}>{pasos[pasoActual].contenido}</p>
                
                {pasos[pasoActual].consejo && (
                    <div style={tipBox}>
                        <FaLightbulb style={{color: '#f39c12', fontSize: '24px', flexShrink: 0}} />
                        <div>
                            <b style={{fontSize: '14px', color: '#d35400', display: 'block', marginBottom: '4px'}}>Tip Financiero:</b>
                            <p style={tipText}>{pasos[pasoActual].consejo}</p>
                        </div>
                    </div>
                )}

                <div style={footerStyle}>
                    <span style={stepIndicator}>Paso {pasoActual + 1} de {pasos.length}</span>
                    <button onClick={siguiente} style={btnNext}>
                        {pasoActual === pasos.length - 1 ? '¡Entendido, vamos!' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalStyle = { backgroundColor: '#fff', width: '100%', maxWidth: '420px', borderRadius: '30px', padding: '35px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' };
const iconBadge = { width: '55px', height: '55px', borderRadius: '18px', background: 'linear-gradient(135deg, #2f3542, #1e242b)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' };
const closeBtn = { background: 'none', border: 'none', color: '#a4b0be', fontSize: '20px', cursor: 'pointer', padding: '5px' };
const titleStyle = { margin: '0 0 12px 0', fontSize: '24px', color: '#2f3542', fontWeight: '900' };
const descStyle = { fontSize: '15px', color: '#747d8c', lineHeight: '1.6', marginBottom: '25px' };
const tipBox = { display: 'flex', alignItems: 'center', gap: '15px', background: '#fff9e6', padding: '20px', borderRadius: '20px', borderLeft: '4px solid #f39c12', marginBottom: '30px' };
const tipText = { margin: 0, fontSize: '13px', color: '#57606f', lineHeight: '1.5', textAlign: 'left' };
const footerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const stepIndicator = { fontSize: '13px', color: '#a4b0be', fontWeight: 'bold' };
const btnNext = { padding: '14px 28px', borderRadius: '15px', border: 'none', background: '#007bff', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '15px' };

export default GuiaTutorial;