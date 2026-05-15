import React, { useState } from 'react';
import { FaArrowRight, FaUser, FaLock, FaWallet, FaCheckCircle, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

const BienvenidaFullScreen = ({ onFinish, isDarkMode }) => {
    const [paso, setPaso] = useState(1);

    // Estado del formulario
    const [nombre, setNombre] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    
    const [saldo, setSaldo] = useState('');
    const [ciclo, setCiclo] = useState('Mensual');
    const [diaInicio, setDiaInicio] = useState('1');
    const [ingresoBase, setIngresoBase] = useState('');

    const blockInvalidChars = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

    const siguientePaso = () => {
        if (paso === 1) {
            if (!nombre.trim() || !fechaNacimiento) return alert("Por favor ingresa tu nombre y fecha de nacimiento.");
            setPaso(2);
        } else if (paso === 2) {
            if (pin.length !== 4 || confirmPin.length !== 4) return alert("El NIP debe ser exactamente de 4 dígitos.");
            if (pin !== confirmPin) return alert("Los NIPs no coinciden.");
            setPaso(3);
        } else if (paso === 3) {
            if (!saldo || saldo < 0) return alert("Ingresa tu saldo actual (puede ser 0).");
            if (!ingresoBase || ingresoBase <= 0) return alert("Ingresa un ingreso base estimado.");
            finalizar();
        }
    };

    const finalizar = () => {
        // Creamos los 4 cajones administradores por defecto
        const cajonesBase = {
            'Deuda': { monto: 0, frecuencia: ciclo, acumulado: 0 },
            'Gastos Fijos': { monto: 0, frecuencia: ciclo, acumulado: 0 },
            'Gastos Variables': { monto: 0, frecuencia: ciclo, acumulado: 0 },
            'Ahorro': { monto: 0, frecuencia: ciclo, acumulado: 0 }
        };
        const ordenCajonesBase = ['Deuda', 'Gastos Fijos', 'Gastos Variables', 'Ahorro'];
        const ingresosArray = [{ monto: parseFloat(ingresoBase), frecuencia: ciclo }];

        const datosCompletos = {
            nombre: nombre.trim(),
            fechaNacimiento,
            pin,
            saldo: parseFloat(saldo),
            ciclo,
            diaInicio,
            ingresos: ingresosArray,
            cajones: cajonesBase,
            ordenCajones: ordenCajonesBase
        };

        onFinish(datosCompletos);
    };

    return (
        <div className={isDarkMode ? 'theme-dark' : 'theme-light'} style={fullScreenStyle}>
            <div style={containerStyle}>
                
                {/* BARRA DE PROGRESO */}
                <div style={progressContainer}>
                    <div style={{...progressStep, background: paso >= 1 ? 'var(--primary)' : 'var(--bg-tertiary)'}}></div>
                    <div style={{...progressStep, background: paso >= 2 ? 'var(--primary)' : 'var(--bg-tertiary)'}}></div>
                    <div style={{...progressStep, background: paso >= 3 ? 'var(--primary)' : 'var(--bg-tertiary)'}}></div>
                </div>

                <div style={cardStyle}>
                    
                    {/* PASO 1: DATOS PERSONALES */}
                    {paso === 1 && (
                        <div style={stepAnimStyle}>
                            <div style={iconBadge}><FaUser /></div>
                            <h1 style={titleStyle}>¡Bienvenido a FinTrack!</h1>
                            <p style={descStyle}>El motor financiero que administrará tu dinero en automático. Para empezar, ¿cómo te llamamos?</p>
                            
                            <label style={labelStyle}>Tu Nombre o Apodo</label>
                            <input type="text" placeholder="Ej. Diego" value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
                            
                            <label style={labelStyle}>Fecha de Nacimiento</label>
                            <input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} style={inputStyle} />
                        </div>
                    )}

                    {/* PASO 2: SEGURIDAD */}
                    {paso === 2 && (
                        <div style={stepAnimStyle}>
                            <div style={{...iconBadge, background: 'var(--success-light)', color: 'var(--success)'}}><FaLock /></div>
                            <h1 style={titleStyle}>Blindaje Financiero</h1>
                            <p style={descStyle}>Tus metas y bóveda estarán protegidas. Crea un NIP de 4 dígitos para autorizar movimientos importantes.</p>
                            
                            <label style={labelStyle}>Nuevo NIP (4 números)</label>
                            <input type="password" maxLength="4" placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))} style={{...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '24px'}} />
                            
                            <label style={labelStyle}>Confirmar NIP</label>
                            <input type="password" maxLength="4" placeholder="••••" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))} style={{...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '24px'}} />
                        </div>
                    )}

                    {/* PASO 3: DINERO Y CICLO */}
                    {paso === 3 && (
                        <div style={stepAnimStyle}>
                            <div style={{...iconBadge, background: 'var(--warning-light)', color: 'var(--warning)'}}><FaWallet /></div>
                            <h1 style={titleStyle}>Ajuste de Motores</h1>
                            <p style={descStyle}>Casi listos. Dile a FinTrack cómo funciona tu dinero para configurar tu Cascada.</p>
                            
                            <label style={labelStyle}>¿Cuánto dinero físico tienes justo ahora?</label>
                            <div style={{position: 'relative', marginBottom: '20px'}}>
                                <span style={currencySymbol}>$</span>
                                <input type="number" min="0" onKeyDown={blockInvalidChars} placeholder="0.00" value={saldo} onChange={e => setSaldo(e.target.value)} style={{...inputStyle, paddingLeft: '35px', marginBottom: 0}} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}><FaCalendarAlt /> Ciclo Maestro</label>
                                    <select value={ciclo} onChange={e => setCiclo(e.target.value)} style={inputStyle}>
                                        <option value="Diario">Diario</option>
                                        <option value="Semanal">Semanal</option>
                                        <option value="Quincenal">Quincenal</option>
                                        <option value="Mensual">Mensual</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Día de Cobro</label>
                                    <input type="number" min="1" max="31" onKeyDown={blockInvalidChars} placeholder="Día" value={diaInicio} onChange={e => setDiaInicio(e.target.value)} style={inputStyle} />
                                </div>
                            </div>

                            <label style={labelStyle}><FaMoneyBillWave /> ¿Cuánto ganas aprox. por ciclo ({ciclo})?</label>
                            <div style={{position: 'relative'}}>
                                <span style={currencySymbol}>$</span>
                                <input type="number" min="0" onKeyDown={blockInvalidChars} placeholder="Ingreso esperado" value={ingresoBase} onChange={e => setIngresoBase(e.target.value)} style={{...inputStyle, paddingLeft: '35px'}} />
                            </div>
                        </div>
                    )}

                    {/* BOTONERÍA */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        {paso > 1 && (
                            <button onClick={() => setPaso(paso - 1)} style={btnBackStyle}>Atrás</button>
                        )}
                        <button onClick={siguientePaso} style={btnNextStyle}>
                            {paso === 3 ? <><FaCheckCircle /> Iniciar Motor</> : <>Siguiente <FaArrowRight /></>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

// ESTILOS DINÁMICOS BASADOS EN VARIABLES CSS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--bg-main)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' };
const containerStyle = { width: '100%', maxWidth: '500px', padding: '20px', boxSizing: 'border-box' };
const progressContainer = { display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' };
const progressStep = { height: '6px', flex: 1, borderRadius: '3px', transition: 'background-color 0.4s ease' };
const cardStyle = { backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '30px', boxShadow: 'var(--modal-shadow)', border: '1px solid var(--border-color)' };
const stepAnimStyle = { animation: 'fadeIn 0.4s ease-in-out' };
const iconBadge = { width: '70px', height: '70px', borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', boxShadow: '0 5px 15px var(--primary-light)' };
const titleStyle = { margin: '0 0 10px 0', fontSize: '28px', color: 'var(--text-main)', fontWeight: 'bold' };
const descStyle = { margin: '0 0 30px 0', fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.5' };
const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '10px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid var(--border-light)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '16px', boxSizing: 'border-box', marginBottom: '20px', transition: '0.3s' };
const currencySymbol = { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', fontWeight: 'bold', fontSize: '16px' };
const btnNextStyle = { flex: 2, background: 'var(--primary)', color: 'white', border: 'none', padding: '18px', borderRadius: '15px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 5px 15px var(--primary-light)' };
const btnBackStyle = { flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: '15px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' };

export default BienvenidaFullScreen;