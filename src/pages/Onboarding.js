import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ¡AQUÍ ESTÁ LA CORRECCIÓN! Agregamos FaTimes a la lista
import { 
    FaArrowRight, FaPlus, FaTrash, FaInfoCircle, FaLock, 
    FaCheckCircle, FaLightbulb, FaClock, FaExclamationTriangle, 
    FaSyncAlt, FaStar, FaWallet, FaShieldAlt, FaMoneyBillWave, FaTimes
} from 'react-icons/fa';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // --- DATOS DEL USUARIO ---
    const [nombre, setNombre] = useState('');
    const [ingresos, setIngresos] = useState([{ monto: '', frecuencia: 'Mensual' }]);
    const [saldoActual, setSaldoActual] = useState('');
    const [cicloMaestro, setCicloMaestro] = useState(''); 
    
    // --- SEGURIDAD (NIP) ---
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    // --- GESTIÓN DE PILARES ---
    const pilaresBase = ['Gastos Fijos', 'Gastos Variables', 'Ahorro', 'Libre'];
    const [seleccionados, setSeleccionados] = useState([]);
    const [personalizados, setPersonalizados] = useState([]);
    const [nuevoPersonalizado, setNuevoPersonalizado] = useState('');

    const [configuraciones, setConfiguraciones] = useState({});
    const [configIndex, setConfigIndex] = useState(0);

    const sugerencias = [
        { id: 'deuda_ext', nombre: 'Deuda (Externa)', desc: '⚠️ PRIORIDAD ALTA: Pagos a instituciones. Se paga primero para evitar intereses.' },
        { id: 'suscripciones', nombre: 'Suscripciones', desc: 'Control de cobros digitales (Netflix, Spotify, Gym, etc.).' },
        { id: 'emergencia', nombre: 'Fondo de Emergencia', desc: 'Un colchón de seguridad exclusivo para imprevistos.' }
    ];

    const listaAConfigurar = [...pilaresBase, ...sugerencias.filter(s => seleccionados.includes(s.id)).map(s => s.nombre), ...personalizados];

    // --- LÓGICA Y MATEMÁTICAS ---
    const blockInvalidChar = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

    const handlePinChange = (setter, value) => {
        const onlyNums = value.replace(/[^0-9]/g, '');
        if (onlyNums.length <= 4) setter(onlyNums);
    };

    const handleConfiguracionUpdate = (item, campo, valor) => {
        if (campo === 'monto' && parseFloat(valor) < 0) return; 
        const currentConfig = configuraciones[item] || { monto: '', frecuencia: 'Mensual' };
        setConfiguraciones({ ...configuraciones, [item]: { ...currentConfig, [campo]: valor } });
    };

    const calcularAcople = (monto, frecOrigen, cicloDestino) => {
        if (!monto || isNaN(monto)) return 0;
        let montoMensual = 0;
        const m = parseFloat(monto);

        if (frecOrigen === 'Diario') montoMensual = m * 30;
        else if (frecOrigen === 'Semanal') montoMensual = m * 4;
        else if (frecOrigen === 'Quincenal') montoMensual = m * 2;
        else if (frecOrigen === 'Mensual') montoMensual = m;
        else if (frecOrigen === 'Anual') montoMensual = m / 12;

        if (cicloDestino === 'Diario') return (montoMensual / 30);
        if (cicloDestino === 'Semanal') return (montoMensual / 4);
        if (cicloDestino === 'Quincenal') return (montoMensual / 2);
        if (cicloDestino === 'Mensual') return montoMensual;
        return montoMensual;
    };

    const totalIngresos = ingresos.reduce((sum, ing) => sum + calcularAcople(ing.monto, ing.frecuencia, cicloMaestro), 0);
    const totalAsignado = Object.values(configuraciones).reduce((sum, conf) => sum + calcularAcople(conf.monto, conf.frecuencia, cicloMaestro), 0);
    const presupuestoDisponible = totalIngresos - totalAsignado;
    const sobregirado = presupuestoDisponible < 0;

    const nextStep = () => {
        if (step === 3) setCicloMaestro(ingresos[0].frecuencia);
        setStep(step + 1);
    };
    
    const prevStep = () => setStep(step - 1);

    const finalizarOnboarding = () => {
        localStorage.setItem('onboardingComplete', 'true');
        localStorage.setItem('userName', nombre);
        localStorage.setItem('cicloMaestro', cicloMaestro);
        localStorage.setItem('configGlobal', JSON.stringify({ 
            ingresos, 
            saldoActual, 
            configuraciones, 
            pinSeguridad: pin 
        }));
        navigate('/dashboard');
    };

    const getDetalles = (item) => {
        const detalles = {
            'Gastos Fijos': { desc: 'Pagos obligatorios: renta, internet, colegiaturas.', tip: 'No dejes que superen el 50% de tus ingresos.' },
            'Gastos Variables': { desc: 'Servicios que fluctúan (Luz, Agua, Gasolina).', tip: 'Usa el promedio de tus últimos recibos.' },
            'Ahorro': { desc: 'Lana sagrada para tus proyectos (como el Solstice 🚗).', tip: 'Págate a ti primero. Aparta esto antes de gastar.' },
            'Libre': { desc: 'Tu lana para gustos y salidas sin culpa.', tip: 'Si este cajón llega a cero, ¡para! No toques el dinero de otros.' },
            'Deuda (Externa)': { desc: 'Prioridad #1. Pagos a bancos o créditos externos.', tip: 'Ataca siempre la deuda con el interés más alto primero.' },
            'Suscripciones': { desc: 'Gastos digitales recurrentes (Netflix, Gym).', tip: 'Revisa cada mes qué suscripciones ya no usas.' },
            'Fondo de Emergencia': { desc: 'Escudo protector exclusivo para imprevistos.', tip: 'Tu primera meta debe ser juntar un mes de gastos fijos aquí.' }
        };
        return detalles[item] || { desc: `Define el límite para "${item}".`, tip: 'Los gastos extra deben ser una fracción pequeña de tu ingreso.' };
    };

    const currentItem = listaAConfigurar[configIndex] || '';
    const currentConfig = configuraciones[currentItem] || { monto: '', frecuencia: 'Mensual' };
    const infoActual = getDetalles(currentItem);

    return (
        <div style={appBackgroundStyle}>
            <div style={containerStyle}>
                
                {step === 1 && (
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ color: '#007bff', fontSize: '36px', marginBottom: '10px' }}>FinTrack</h1>
                        <h2 style={{ marginBottom: '20px', color: '#2f3542' }}>✨ ¡Qué onda!</h2>
                        <p style={subText}>Vamos a construir tu motor financiero para que el dinero trabaje en automático para ti.</p>
                        <button onClick={nextStep} style={btnStyle}>Empezar Configuración <FaArrowRight /></button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 style={{ color: '#2f3542' }}>👤 ¿Cómo te llamamos?</h2>
                        <input type="text" placeholder="Ej. Diego Sánchez" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
                        <div style={buttonGroup}><button onClick={prevStep} style={btnSecondary}>Atrás</button><button onClick={nextStep} disabled={!nombre} style={btnStyle}>Siguiente</button></div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 style={{ color: '#2f3542' }}>💰 Tus Ingresos</h2>
                        <p style={subText}>El primer ingreso será el líder y definirá el ritmo de tu app.</p>
                        {ingresos.map((ing, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 2 }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '14px', fontWeight: 'bold', color: '#28a745' }}>$</span>
                                    <input type="number" min="0" onKeyDown={blockInvalidChar} placeholder="0.00" value={ing.monto} onChange={(e) => { let n = [...ingresos]; if(e.target.value < 0) return; n[i].monto = e.target.value; setIngresos(n); }} style={{...inputStyle, paddingLeft: '25px', margin: 0}} />
                                </div>
                                <select value={ing.frecuencia} onChange={(e) => { let n = [...ingresos]; n[i].frecuencia = e.target.value; setIngresos(n); }} style={{...inputStyle, flex: 2, margin: 0}}>
                                    <option>Diario</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option>
                                </select>
                                {ingresos.length > 1 && <FaTrash onClick={() => setIngresos(ingresos.filter((_, idx)=>idx!==i))} style={{color: '#dc3545', cursor: 'pointer', fontSize: '18px', padding: '10px'}}/>}
                            </div>
                        ))}
                        <button onClick={() => setIngresos([...ingresos, {monto: '', frecuencia: 'Mensual'}])} style={addBtn}><FaPlus /> Añadir otra fuente</button>
                        <div style={buttonGroup}><button onClick={prevStep} style={btnSecondary}>Atrás</button><button onClick={nextStep} disabled={!ingresos[0].monto} style={btnStyle}>Siguiente</button></div>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center' }}>
                        <FaClock style={{ fontSize: '55px', color: '#007bff', marginBottom: '20px' }} />
                        <h2 style={{ color: '#2f3542' }}>Tu Ciclo Base es: {cicloMaestro}</h2>
                        <div style={infoBoxStyle}>
                            <FaLightbulb style={{ color: '#ffc107', marginRight: '12px', fontSize: '24px', flexShrink: 0 }} />
                            <span>Todo se calculará en base a este tiempo. Así sabrás exactamente cuánto dinero separar cada <strong>{cicloMaestro.toLowerCase().replace('o', 'a')}</strong>.</span>
                        </div>
                        <div style={buttonGroup}><button onClick={prevStep} style={btnSecondary}>Cambiar</button><button onClick={nextStep} style={btnStyle}>Entendido <FaArrowRight /></button></div>
                    </div>
                )}

                {step === 5 && (
                    <div>
                        <h2 style={{ color: '#2f3542' }}>🛡️ Estructura de Gestión</h2>
                        <p style={subText}>Estos son los cajones donde se repartirá tu dinero automáticamente.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            {pilaresBase.map(p => <div key={p} style={pilarBaseStyle}><FaLock style={{color: '#a4b0be'}}/> {p}</div>)}
                        </div>
                        
                        <h3 style={{ fontSize: '16px', color: '#2f3542', marginBottom: '10px' }}>Sugerencias recomendadas:</h3>
                        <div style={{maxHeight: '160px', overflowY: 'auto', paddingRight: '5px', marginBottom: '20px'}}>
                            {sugerencias.map(s => (
                                <div key={s.id} onClick={() => seleccionados.includes(s.id) ? setSeleccionados(seleccionados.filter(x=>x!==s.id)) : setSeleccionados([...seleccionados, s.id])} 
                                     style={{ ...cardStyle, border: `2px solid ${seleccionados.includes(s.id) ? '#28a745' : '#eee'}`, backgroundColor: seleccionados.includes(s.id) ? '#f0fff4' : '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <strong>{s.nombre}</strong>
                                        {seleccionados.includes(s.id) && <FaCheckCircle color="#28a745" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ fontSize: '16px', color: '#2f3542', marginBottom: '10px' }}>¿Metas Personalizadas?</h3>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <input type="text" placeholder="Ej. Computadora Nueva" value={nuevoPersonalizado} onChange={(e)=>setNuevoPersonalizado(e.target.value)} style={inputStyle} />
                            <button onClick={()=>{if(nuevoPersonalizado){setPersonalizados([...personalizados, nuevoPersonalizado]); setNuevoPersonalizado('');}}} style={{...btnStyle, flex: 0, padding: '0 20px'}}><FaPlus /></button>
                        </div>
                        
                        {personalizados.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                {personalizados.map((p, idx) => (
                                    <span key={idx} style={badgeStyle}>{p} <FaTimes style={{cursor: 'pointer', marginLeft: '5px'}} onClick={() => setPersonalizados(personalizados.filter((_, i) => i !== idx))} /></span>
                                ))}
                            </div>
                        )}

                        <div style={buttonGroup}><button onClick={prevStep} style={btnSecondary}>Atrás</button><button onClick={nextStep} style={btnStyle}>Siguiente</button></div>
                    </div>
                )}

                {step === 6 && (
                    <div>
                        <div style={walletBarStyle(sobregirado)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
                                <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Presupuesto {cicloMaestro}</span>
                                <FaWallet style={{ fontSize: '18px' }} />
                            </div>
                            <h3 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>${presupuestoDisponible.toFixed(2)} <small style={{fontSize: '14px', fontWeight: 'normal'}}>disp.</small></h3>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <span style={badgeCountStyle}>Configurando {configIndex + 1} de {listaAConfigurar.length}</span>
                            <h2 style={{ color: '#007bff', margin: '10px 0 0 0' }}>{currentItem}</h2>
                        </div>

                        <div style={infoBoxStyle}><span>{infoActual.desc}</span></div>
                        <div style={tipBoxStyle}><FaStar style={{ color: '#ff9f43', fontSize: '18px', flexShrink: 0 }} /><span><strong>Pro Tip:</strong> {infoActual.tip}</span></div>

                        <div style={{ marginTop: '25px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#747d8c', marginBottom: '8px' }}>Monto de la Meta</label>
                            <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '15px', top: '15px', fontWeight: 'bold', color: '#28a745' }}>$</span>
                                <input 
                                    type="number" min="0" onKeyDown={blockInvalidChar} placeholder="0.00" value={currentConfig.monto} 
                                    onChange={(e) => handleConfiguracionUpdate(currentItem, 'monto', e.target.value)} 
                                    style={{ ...inputStyle, paddingLeft: '35px', flex: 2, margin: 0, border: sobregirado ? '2px solid #dc3545' : '1px solid #dfe6e9' }} 
                                />
                                <select value={currentConfig.frecuencia} onChange={(e) => handleConfiguracionUpdate(currentItem, 'frecuencia', e.target.value)} style={{ ...inputStyle, flex: 2, margin: 0 }}>
                                    <option>Diario</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option><option>Anual</option>
                                </select>
                            </div>

                            {currentConfig.monto > 0 && (
                                <div style={acopleStyle}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <FaSyncAlt style={{color: '#856404'}} /> 
                                        <strong>Ajuste a tu ciclo {cicloMaestro.toLowerCase()}:</strong>
                                    </div>
                                    <span style={{fontSize: '20px', display: 'block', fontWeight: 'bold', marginTop: '8px', color: '#2f3542'}}>
                                        ${calcularAcople(currentConfig.monto, currentConfig.frecuencia, cicloMaestro).toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {sobregirado && (
                                <div style={errorStyle}>
                                    <FaExclamationTriangle style={{ fontSize: '20px', flexShrink: 0 }} /> 
                                    <div><strong>¡Presupuesto superado!</strong><br/>No puedes asignar dinero que no tienes. Baja el monto de este cajón.</div>
                                </div>
                            )}
                        </div>

                        <div style={buttonGroup}>
                            <button onClick={() => configIndex === 0 ? setStep(5) : setConfigIndex(configIndex - 1)} style={btnSecondary}>Atrás</button>
                            {configIndex < listaAConfigurar.length - 1 ? (
                                <button onClick={() => setConfigIndex(configIndex + 1)} disabled={!currentConfig.monto || sobregirado} style={btnStyle}>Siguiente Cajón</button>
                            ) : (
                                <button onClick={() => setStep(7)} disabled={!currentConfig.monto || sobregirado} style={btnStyle}>Completar <FaArrowRight /></button>
                            )}
                        </div>
                    </div>
                )}

                {step === 7 && (
                    <div style={{textAlign: 'center'}}>
                        <FaMoneyBillWave style={{ fontSize: '60px', color: '#28a745', marginBottom: '20px' }} />
                        <h2 style={{ color: '#2f3542' }}>Tu Punto de Partida</h2>
                        <p style={subText}>¿Cuánto dinero tienes <strong>hoy mismo</strong> en tus cuentas y en efectivo? Este será tu saldo inicial.</p>
                        
                        <div style={{ position: 'relative', width: '80%', margin: '0 auto' }}>
                            <span style={{ position: 'absolute', left: '20px', top: '15px', fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>$</span>
                            <input 
                                type="number" min="0" onKeyDown={blockInvalidChar} placeholder="0.00" value={saldoActual} 
                                onChange={(e) => setSaldoActual(e.target.value)} 
                                style={{...inputStyle, textAlign: 'center', fontSize: '24px', padding: '15px', fontWeight: 'bold'}} 
                            />
                        </div>

                        <div style={buttonGroup}>
                            <button onClick={() => setStep(6)} style={btnSecondary}>Atrás</button>
                            <button onClick={nextStep} disabled={!saldoActual} style={btnStyle}>Configurar Seguridad <FaArrowRight /></button>
                        </div>
                    </div>
                )}

                {step === 8 && (
                    <div style={{ textAlign: 'center' }}>
                        <FaShieldAlt style={{ fontSize: '55px', color: '#dc3545', marginBottom: '20px' }} />
                        <h2 style={{ color: '#2f3542' }}>Tu NIP de Autorización</h2>
                        <p style={subText}>Crea un NIP de 4 dígitos. Se te pedirá cuando vayas a registrar un gasto para confirmar que estás seguro.</p>
                        
                        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px', width: '80%', margin: '0 auto' }}>
                            <input 
                                type="password" inputMode="numeric" placeholder="NIP de 4 dígitos" value={pin} 
                                onChange={(e) => handlePinChange(setPin, e.target.value)} 
                                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '15px', fontSize: '28px', fontWeight: 'bold' }} 
                            />
                            <input 
                                type="password" inputMode="numeric" placeholder="Confirmar NIP" value={confirmPin} 
                                onChange={(e) => handlePinChange(setConfirmPin, e.target.value)} 
                                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '15px', fontSize: '28px', fontWeight: 'bold', border: (confirmPin.length === 4 && pin !== confirmPin) ? '2px solid #dc3545' : '1px solid #dfe6e9' }} 
                            />
                        </div>

                        <div style={{ marginTop: '15px', height: '25px' }}>
                            {confirmPin.length === 4 && pin !== confirmPin && <span style={{ color: '#dc3545', fontWeight: 'bold' }}>❌ Los NIPs no coinciden</span>}
                            {pin.length === 4 && pin === confirmPin && <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ NIP Verificado</span>}
                        </div>

                        <div style={buttonGroup}>
                            <button onClick={() => setStep(7)} style={btnSecondary}>Atrás</button>
                            <button onClick={finalizarOnboarding} disabled={pin.length !== 4 || pin !== confirmPin} style={{ ...btnStyle, backgroundColor: (pin.length === 4 && pin === confirmPin) ? '#28a745' : '#ccc' }}>
                                ¡Encender FinTrack! <FaCheckCircle />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const appBackgroundStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6', padding: '20px', fontFamily: "'Segoe UI', Roboto, sans-serif" };
const containerStyle = { width: '100%', maxWidth: '550px', padding: '40px', backgroundColor: '#fff', borderRadius: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' };
const btnStyle = { flex: 1, padding: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.2s' };
const btnSecondary = { flex: 1, padding: '16px', backgroundColor: '#f1f2f6', color: '#2f3542', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background 0.2s' };
const inputStyle = { padding: '16px', borderRadius: '15px', border: '1px solid #e1e5ee', fontSize: '16px', width: '100%', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8f9fa', color: '#2f3542' };
const buttonGroup = { display: 'flex', gap: '15px', marginTop: '35px' };
const pilarBaseStyle = { padding: '15px', backgroundColor: '#f1f2f6', borderRadius: '15px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold', color: '#2f3542', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const cardStyle = { padding: '15px 20px', borderRadius: '15px', cursor: 'pointer', marginBottom: '12px', transition: 'all 0.2s' };
const infoBoxStyle = { fontSize: '14.5px', color: '#2d3436', background: '#f0f7ff', padding: '20px', borderRadius: '15px', borderLeft: '6px solid #007bff', display: 'flex', alignItems: 'flex-start', lineHeight: '1.5', textAlign: 'left', gap: '12px' };
const tipBoxStyle = { fontSize: '14px', color: '#d35400', background: '#fff2e6', padding: '18px', borderRadius: '15px', borderLeft: '6px solid #ff9f43', display: 'flex', alignItems: 'flex-start', lineHeight: '1.5', marginTop: '15px', gap: '12px', textAlign: 'left' };
const badgeCountStyle = { backgroundColor: '#eef3ff', color: '#007bff', padding: '8px 18px', borderRadius: '25px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' };
const badgeStyle = { backgroundColor: '#eef3ff', color: '#007bff', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' };
const subText = { fontSize: '15px', color: '#747d8c', marginBottom: '25px', lineHeight: '1.5' };
const addBtn = { border: 'none', background: 'none', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginTop: '15px', padding: '10px 0', fontSize: '15px' };
const acopleStyle = { marginTop: '20px', padding: '20px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '15px', borderLeft: '6px solid #ffc107', fontSize: '14px', textAlign: 'left' };
const errorStyle = { marginTop: '20px', padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '15px', borderLeft: '6px solid #dc3545', fontSize: '14px', display: 'flex', gap: '12px', textAlign: 'left', lineHeight: '1.5' };
const walletBarStyle = (sobregirado) => ({ background: sobregirado ? 'linear-gradient(135deg, #dc3545 0%, #c0392b 100%)' : 'linear-gradient(135deg, #2b323c 0%, #1e242b 100%)', color: 'white', padding: '25px', borderRadius: '20px', marginBottom: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' });

export default Onboarding;