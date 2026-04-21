import React, { useState, useEffect } from 'react';
import { 
    FaArrowRight, FaMoneyBillWave, FaSyncAlt, FaCheckCircle, 
    FaRocket, FaUserTie, FaBoxOpen, FaExclamationTriangle, 
    FaPlus, FaKey, FaLightbulb, FaShieldAlt, FaCalculator, FaTimes
} from 'react-icons/fa';

const BienvenidaFullScreen = ({ onFinish }) => {
    const [step, setStep] = useState(1);
    
    // 1. Datos Personales
    const [nombre, setNombre] = useState(localStorage.getItem('userName') || '');
    const [fechaNacimiento, setFechaNacimiento] = useState(localStorage.getItem('fechaNacimiento') || '');
    const [saldo, setSaldo] = useState('');
    
    // 2. Ingresos y Ciclo
    const [ingresos, setIngresos] = useState([{ monto: '', frecuencia: 'Mensual' }]);
    const [ciclo, setCiclo] = useState('Mensual');
    const [diaInicio, setDiaInicio] = useState('1'); 
    
    // 3. Egresos (Admins y Extras)
    const [admins, setAdmins] = useState({'Gastos Fijos': '', 'Gastos Variables': '', 'Ahorro': ''});
    const [cajonesExtra, setCajonesExtra] = useState([]);
    const [tieneDeuda, setTieneDeuda] = useState(false);
    
    // 4. Seguridad
    const [pin, setPin] = useState('');

    // ==========================================
    // CALCULADORA INTELIGENTE BANCARIA
    // ==========================================
    const [calculadoraAbierta, setCalculadoraAbierta] = useState(null);
    const [itemsCalc, setItemsCalc] = useState([{ concepto: '', monto: '', frecuencia: 'Mensual' }]);

    const preventMinus = (e) => {
        if (e.key === '-' || e.key === 'e') {
            e.preventDefault();
        }
    };

    const updateIngreso = (index, field, value) => {
        const nuevos = [...ingresos];
        nuevos[index] = { ...nuevos[index], [field]: value };
        setIngresos(nuevos);
    };

    const updateCalcItem = (index, field, value) => {
        const nuevos = [...itemsCalc];
        nuevos[index] = { ...nuevos[index], [field]: value };
        setItemsCalc(nuevos);
    };

    const updateCajonExtra = (index, value) => {
        const nuevos = [...cajonesExtra];
        nuevos[index] = { ...nuevos[index], monto: value };
        setCajonesExtra(nuevos);
    };

    useEffect(() => {
        if (step === 4 && ingresos.length > 0) {
            let maxMonto = -1;
            let freqSugerida = 'Mensual';
            ingresos.forEach(ing => {
                const m = parseFloat(ing.monto) || 0;
                if (m > maxMonto) { maxMonto = m; freqSugerida = ing.frecuencia; }
            });
            setCiclo(freqSugerida);
        }
    }, [step, ingresos]);

    const obtenerDias = (frecuencia) => {
        switch(frecuencia) {
            case 'Diario': return 1;
            case 'Semanal': return 7;
            case 'Quincenal': return 15;
            case 'Mensual': return 30;
            case 'Anual': return 365;
            default: return 30;
        }
    };

    const limpiarMonto = (val) => {
        if (!val) return 0;
        return parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0;
    };

    const convertirACicloMaestro = (monto, frecOrigen, cicloDestino) => {
        const m = Math.abs(limpiarMonto(monto)); 
        if (m === 0) return 0;
        const diasOrigen = obtenerDias(frecOrigen);
        const diasDestino = obtenerDias(cicloDestino);
        const valorDiario = m / diasOrigen;
        return valorDiario * diasDestino;
    };

    const calcularSumaCalculadora = () => {
        return itemsCalc.reduce((sum, item) => sum + convertirACicloMaestro(item.monto, item.frecuencia, ciclo), 0);
    };

    const abrirCalculadora = (adminName) => {
        if (calculadoraAbierta === adminName) {
            setCalculadoraAbierta(null);
        } else {
            setItemsCalc([{ concepto: '', monto: '', frecuencia: 'Mensual' }]);
            setCalculadoraAbierta(adminName);
        }
    };

    const aplicarCalculo = () => {
        const totalCalculado = calcularSumaCalculadora();
        const valorLimpio = Math.round(totalCalculado * 100) / 100;
        setAdmins(prevAdmins => ({
            ...prevAdmins, 
            [calculadoraAbierta]: valorLimpio === 0 ? '' : valorLimpio
        }));
        setCalculadoraAbierta(null);
    };

    const handleNext = () => {
        if (step === 2 && (!nombre || !fechaNacimiento || !saldo)) return alert("⚠️ Llena tu nombre, fecha y saldo inicial para continuar.");
        if (step === 3 && (!ingresos[0].monto)) return alert("⚠️ Necesitas registrar al menos una fuente de ingresos.");
        if (step === 7 && pin.length !== 4) return alert("⚠️ Crea un NIP exacto de 4 dígitos.");
        setStep(step + 1);
    };

    const toggleDeuda = () => {
        if (!tieneDeuda) {
            setTieneDeuda(true);
            setCajonesExtra([{ nombre: 'Deuda', monto: '', frecuencia: ciclo }, ...cajonesExtra]);
        }
    };

    const addCajonPersonalizado = () => {
        const nom = window.prompt("Nombre de tu nueva meta o cajón:");
        if (nom) setCajonesExtra([...cajonesExtra, { nombre: nom, monto: '', frecuencia: ciclo }]);
    };

    const handleFinalize = () => {
        let configFinalCajones = {
            'Gastos Fijos': { monto: Math.abs(limpiarMonto(admins['Gastos Fijos'])), frecuencia: ciclo },
            'Gastos Variables': { monto: Math.abs(limpiarMonto(admins['Gastos Variables'])), frecuencia: ciclo },
            'Ahorro': { monto: Math.abs(limpiarMonto(admins['Ahorro'])), frecuencia: ciclo }
        };

        cajonesExtra.forEach(c => { configFinalCajones[c.nombre] = { monto: Math.abs(limpiarMonto(c.monto)), frecuencia: ciclo }; });

        let ordenFinal = ['Gastos Fijos', 'Gastos Variables', 'Ahorro'];
        let extrasNombres = cajonesExtra.map(c => c.nombre).filter(n => n !== 'Deuda');
        
        if (tieneDeuda) ordenFinal = ['Deuda', ...ordenFinal, ...extrasNombres];
        else ordenFinal = [...ordenFinal, ...extrasNombres];

        onFinish({
            nombre, 
            fechaNacimiento, 
            saldo: Math.abs(limpiarMonto(saldo)), 
            ciclo,
            diaInicio, 
            ingresos: ingresos.map(i => ({ ...i, monto: Math.abs(limpiarMonto(i.monto)) })),
            cajones: configFinalCajones, 
            ordenCajones: ordenFinal, 
            pin
        });
    };

    const totalIngresos = ingresos.reduce((sum, ing) => sum + convertirACicloMaestro(ing.monto, ing.frecuencia, ciclo), 0);

    const renderSelectorDia = () => {
        if (ciclo === 'Diario') return null; 
        
        if (ciclo === 'Semanal') {
            return (
                <div style={{marginBottom: '25px', width: '100%', textAlign: 'left'}}>
                    <label style={labelStyle}>¿Qué día de la semana inicia tu ciclo? (Día de pago)</label>
                    <select value={diaInicio} onChange={(e) => setDiaInicio(e.target.value)} style={inputBigStyle} className="input-focus">
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miércoles</option>
                        <option value="4">Jueves</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sábado</option>
                        <option value="0">Domingo</option>
                    </select>
                </div>
            );
        }

        return (
            <div style={{marginBottom: '25px', width: '100%', textAlign: 'left'}}>
                <label style={labelStyle}>¿Qué día del mes inicia tu ciclo? (Día de pago)</label>
                <select value={diaInicio} onChange={(e) => setDiaInicio(e.target.value)} style={inputBigStyle} className="input-focus">
                    {Array.from({length: 31}, (_, i) => i + 1).map(dia => (
                        <option key={dia} value={dia}>Día {dia}</option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div style={fullScreenStyle}>
            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideDownInline { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .step-container { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .calc-panel { animation: slideDownInline 0.3s ease-out forwards; }
                .input-focus:focus { border-color: #007bff !important; box-shadow: 0 0 0 4px rgba(0,123,255,0.15) !important; outline: none; }
                .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
                
                /* ESTILOS DE SCROLL PREMIUM PARA LA BIENVENIDA */
                .scroll-container::-webkit-scrollbar { width: 8px; }
                .scroll-container::-webkit-scrollbar-track { background: transparent; }
                .scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .scroll-container::-webkit-scrollbar-thumb:hover { background: #a4b0be; }
            `}</style>

            {/* 🔴 AQUI ESTA LA MAGIA DEL SCROLL: className="scroll-container" + modalStyle */}
            <div className="scroll-container" style={modalStyle}>
                
                <div style={{ width: '100%', height: '8px', background: '#f1f2f6', borderRadius: '10px', marginBottom: '30px', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ width: `${(step / 7) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #007bff, #00d2ff)', transition: 'width 0.5s ease' }}></div>
                </div>
                
                {step === 1 && (
                    <div className="step-container" style={stepStyle}>
                        <div style={{...iconBadge, background: 'linear-gradient(135deg, #007bff, #6610f2)', color: '#fff', boxShadow: '0 10px 25px rgba(0,123,255,0.3)'}}><FaRocket/></div>
                        <h1 style={titleStyle}>¡Bienvenido a FinTrack!</h1>
                        <p style={descStyle}>El sistema que automatiza tu dinero en cascada. Olvídate del estrés financiero, aquí tu dinero trabaja por ti y fluye exactamente hacia donde debe ir.</p>
                        <div style={tipBox}>
                            <FaLightbulb style={{color: '#f39c12', fontSize: '20px', flexShrink: 0}} />
                            <span style={{fontSize: '13px', color: '#2f3542', textAlign: 'left'}}>Te tomará menos de 3 minutos configurar tu Fortaleza. Ten a la mano tus cuentas bancarias.</span>
                        </div>
                        <button onClick={handleNext} style={btnStyle} className="btn-hover">Iniciar Configuración <FaArrowRight /></button>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-container" style={stepStyle}>
                        <div style={{...iconBadge, background:'#eef3ff', color:'#007bff'}}><FaUserTie/></div>
                        <h2 style={titleStyle}>Tus Cimientos</h2>
                        <p style={descStyle}>¿Cómo te llamas y con cuánto capital arrancamos hoy?</p>
                        
                        <input type="text" placeholder="¿Cómo te gusta que te llamen?" value={nombre} onChange={e=>setNombre(e.target.value)} style={inputBigStyle} className="input-focus" />
                        <label style={labelStyle}>Fecha de Nacimiento</label>
                        <input type="date" value={fechaNacimiento} onChange={e=>setFechaNacimiento(e.target.value)} style={inputBigStyle} className="input-focus" />
                        
                        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '15px', borderLeft: '5px solid #ffc107', marginBottom: '25px', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
                            <label style={{fontSize:'14px', fontWeight:'bold', color:'#856404', marginBottom:'10px', display: 'flex', alignItems: 'center', gap: '8px'}}><FaExclamationTriangle /> Dinero Disponible (Cascada Actual)</label>
                            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#856404', lineHeight: '1.4' }}>¿Cuánto dinero tienes <b>HOY</b> para gastar o sobrevivir hasta tu próximo pago? <br/><br/><i>(⚠️ <b>NO</b> incluyas ahorros, inversiones ni fondos de emergencia. Solo el dinero "suelto" de este ciclo).</i></p>
                            
                            <div style={{position: 'relative', width: '100%'}}>
                                <span style={dollarIcon}>$</span>
                                <input type="number" min="0" onKeyDown={preventMinus} value={saldo} onChange={e=>setSaldo(e.target.value)} style={{...inputBigStyle, paddingLeft:'40px', fontSize: '24px', color: '#28a745', marginBottom: 0, border: '1px solid #ffeeba'}} placeholder="0.00" className="input-focus" />
                            </div>
                        </div>

                        <button onClick={handleNext} style={btnStyle} className="btn-hover">Siguiente <FaArrowRight /></button>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-container" style={stepStyle}>
                        <div style={{...iconBadge, background:'#e6f4ea', color:'#28a745'}}><FaMoneyBillWave/></div>
                        <h2 style={titleStyle}>Tu Motor Financiero</h2>
                        <p style={descStyle}>Añade tus fuentes de ingreso (sueldo, ventas, mesada).</p>
                        
                        {ingresos.map((ing, i) => (
                            <div key={i} style={{display:'flex', gap:'10px', width:'100%', marginBottom:'15px', background: '#f8f9fa', padding: '15px', borderRadius: '15px', border: '1px solid #e1e5ee', boxSizing: 'border-box'}}>
                                <div style={{position: 'relative', flex: 2}}>
                                    <span style={{...dollarIcon, top: '12px', fontSize: '16px'}}>$</span>
                                    <input type="number" min="0" onKeyDown={preventMinus} placeholder="Monto" value={ing.monto} onChange={e => updateIngreso(i, 'monto', e.target.value)} style={{...inputBigStyle, paddingLeft:'30px', margin: 0, border: 'none', background: '#fff'}} className="input-focus" />
                                </div>
                                <select value={ing.frecuencia} onChange={e => updateIngreso(i, 'frecuencia', e.target.value)} style={{...inputBigStyle, flex: 2, margin: 0, border: 'none', background: '#fff', cursor: 'pointer'}} className="input-focus">
                                    <option value="Diario">Diario</option>
                                    <option value="Semanal">Semanal</option>
                                    <option value="Quincenal">Quincenal</option>
                                    <option value="Mensual">Mensual</option>
                                    <option value="Anual">Anual</option>
                                </select>
                            </div>
                        ))}

                        <button onClick={() => setIngresos([...ingresos, {monto:'', frecuencia:'Mensual'}])} style={addBtn}>+ Añadir otra fuente</button>
                        <button onClick={handleNext} style={btnStyle} className="btn-hover">Siguiente <FaArrowRight /></button>
                    </div>
                )}

                {step === 4 && (
                    <div className="step-container" style={stepStyle}>
                        <div style={{...iconBadge, background:'#f3e8ff', color:'#6f42c1'}}><FaSyncAlt/></div>
                        <h2 style={titleStyle}>Confirmación de Ciclo</h2>
                        
                        <div style={{background:'linear-gradient(135deg, #f8f9fa 0%, #eef3ff 100%)', padding:'25px', borderRadius:'20px', border:'2px solid #007bff', marginBottom:'25px', boxShadow: '0 10px 20px rgba(0,123,255,0.1)', width: '100%', boxSizing: 'border-box'}}>
                            <p style={{color:'#2f3542', fontSize:'15px', margin:0, lineHeight: '1.5'}}>
                                Basado en tu ingreso principal, tu <b>Ciclo Maestro</b> sugerido es <b style={{color: '#007bff', fontSize: '20px', display: 'block', margin: '10px 0'}}>{ciclo.toUpperCase()}</b>
                                Te estimamos un ingreso de <span style={{color:'#28a745', fontWeight:'bold'}}>${totalIngresos.toLocaleString(undefined, {minimumFractionDigits:2})}</span> por ciclo.
                            </p>
                        </div>

                        <div style={tipBox}>
                            <FaLightbulb style={{color: '#f39c12', fontSize: '24px', flexShrink: 0}} />
                            <span style={{fontSize: '13px', color: '#2f3542', textAlign: 'left'}}>Tus metas y alertas se recalcularán automáticamente a este ciclo. Si prefieres otro, cámbialo abajo.</span>
                        </div>

                        <label style={labelStyle}>Modificar Ciclo Maestro:</label>
                        <select value={ciclo} onChange={e=>setCiclo(e.target.value)} style={{...inputBigStyle, cursor: 'pointer', marginBottom: '20px'}} className="input-focus">
                            <option value="Diario">Diario</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Quincenal">Quincenal</option>
                            <option value="Mensual">Mensual</option>
                        </select>

                        {renderSelectorDia()}

                        <button onClick={handleNext} style={btnStyle} className="btn-hover">Confirmar Ciclo <FaArrowRight /></button>
                    </div>
                )}

                {step === 5 && (
                    <div className="step-container" style={stepStyle}>
                        <div style={{...iconBadge, background:'#fff3cd', color:'#ffc107'}}><FaBoxOpen/></div>
                        <h2 style={titleStyle}>Tus 3 Administradores</h2>
                        <p style={descStyle}>¿Cuánto destinarás por ciclo <b>({ciclo})</b>? Abre la calculadora (🧮) para convertir pagos automáticamente.</p>
                        
                        <div style={{textAlign:'left', width:'100%', marginBottom:'20px'}}>
                            
                            {/* CAJON: GASTOS FIJOS */}
                            <div style={{...adminBox, borderColor: calculadoraAbierta === 'Gastos Fijos' ? '#007bff' : '#e1e5ee'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div><b style={{fontSize: '16px'}}>🏠 Gastos Fijos</b><br/><span style={adminDesc}>Renta, Luz, Agua, Colegiatura</span></div>
                                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                        <button onClick={() => abrirCalculadora('Gastos Fijos')} style={{...calcBtnStyle, background: calculadoraAbierta === 'Gastos Fijos' ? '#007bff' : '#f8f9fa', color: calculadoraAbierta === 'Gastos Fijos' ? '#fff' : '#007bff'}} title="Calculadora Inteligente">
                                            {calculadoraAbierta === 'Gastos Fijos' ? <FaTimes /> : <FaCalculator />}
                                        </button>
                                        <input type="number" min="0" onKeyDown={preventMinus} placeholder="$ Meta" value={admins['Gastos Fijos']} onChange={e=>setAdmins({...admins, 'Gastos Fijos': e.target.value})} style={inputMini} className="input-focus" />
                                    </div>
                                </div>
                                {calculadoraAbierta === 'Gastos Fijos' && (
                                    <div className="calc-panel" style={calcInnerBox}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                                            <FaCalculator style={{color: '#007bff'}}/>
                                            <h4 style={{fontSize:'14px', color:'#007bff', margin:0}}>Conversión automática a {ciclo}</h4>
                                        </div>
                                        
                                        {itemsCalc.map((item, i) => (
                                            <div key={i} style={{display:'flex', gap:'8px', marginBottom:'12px', alignItems: 'center', width: '100%'}}>
                                                <input type="text" placeholder="Ref." value={item.concepto} onChange={e=>updateCalcItem(i, 'concepto', e.target.value)} style={{...inputCalc, width: '28%', flexShrink: 0}} className="input-focus" />
                                                <div style={{position: 'relative', flex: 1, minWidth: '105px'}}>
                                                    <span style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#a4b0be', fontWeight:'bold', pointerEvents: 'none'}}>$</span>
                                                    <input type="number" min="0" onKeyDown={preventMinus} placeholder="0.00" value={item.monto} onChange={e=>updateCalcItem(i, 'monto', e.target.value)} style={{...inputCalc, width: '100%', paddingLeft: '26px'}} className="input-focus" />
                                                </div>
                                                <select value={item.frecuencia} onChange={e=>updateCalcItem(i, 'frecuencia', e.target.value)} style={{...inputCalc, width: '32%', flexShrink: 0, cursor: 'pointer', padding: '10px 5px'}} className="input-focus">
                                                    <option value="Diario">Diario</option>
                                                    <option value="Semanal">Semanal</option>
                                                    <option value="Quincenal">Quince</option>
                                                    <option value="Mensual">Mes</option>
                                                    <option value="Anual">Anual</option>
                                                </select>
                                            </div>
                                        ))}

                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '10px 15px', background: '#f8f9fa', borderRadius: '10px'}}>
                                            <button onClick={()=>setItemsCalc([...itemsCalc, {concepto:'', monto:'', frecuencia:'Mensual'}])} style={addBtnMini}>+ Añadir gasto</button>
                                            <div style={{fontSize: '15px', fontWeight: 'bold'}}>Total {ciclo}: <span style={{color:'#28a745'}}>${calcularSumaCalculadora().toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div>
                                        </div>
                                        <button type="button" onClick={aplicarCalculo} style={btnAplicarCalc} className="btn-hover">Aplicar Total al Cajón</button>
                                    </div>
                                )}
                            </div>

                            {/* CAJON: GASTOS VARIABLES */}
                            <div style={{...adminBox, borderColor: calculadoraAbierta === 'Gastos Variables' ? '#007bff' : '#e1e5ee'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div><b style={{fontSize: '16px'}}>🍔 Gastos Variables</b><br/><span style={adminDesc}>Comida diaria, Gasolina, Salidas</span></div>
                                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                        <button onClick={() => abrirCalculadora('Gastos Variables')} style={{...calcBtnStyle, background: calculadoraAbierta === 'Gastos Variables' ? '#007bff' : '#f8f9fa', color: calculadoraAbierta === 'Gastos Variables' ? '#fff' : '#007bff'}} title="Calculadora Inteligente">
                                            {calculadoraAbierta === 'Gastos Variables' ? <FaTimes /> : <FaCalculator />}
                                        </button>
                                        <input type="number" min="0" onKeyDown={preventMinus} placeholder="$ Meta" value={admins['Gastos Variables']} onChange={e=>setAdmins({...admins, 'Gastos Variables': e.target.value})} style={inputMini} className="input-focus" />
                                    </div>
                                </div>
                                {calculadoraAbierta === 'Gastos Variables' && (
                                    <div className="calc-panel" style={calcInnerBox}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                                            <FaCalculator style={{color: '#007bff'}}/>
                                            <h4 style={{fontSize:'14px', color:'#007bff', margin:0}}>Conversión automática a {ciclo}</h4>
                                        </div>
                                        
                                        {itemsCalc.map((item, i) => (
                                            <div key={i} style={{display:'flex', gap:'8px', marginBottom:'12px', alignItems: 'center', width: '100%'}}>
                                                <input type="text" placeholder="Ref." value={item.concepto} onChange={e=>updateCalcItem(i, 'concepto', e.target.value)} style={{...inputCalc, width: '28%', flexShrink: 0}} className="input-focus" />
                                                <div style={{position: 'relative', flex: 1, minWidth: '105px'}}>
                                                    <span style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#a4b0be', fontWeight:'bold', pointerEvents: 'none'}}>$</span>
                                                    <input type="number" min="0" onKeyDown={preventMinus} placeholder="0.00" value={item.monto} onChange={e=>updateCalcItem(i, 'monto', e.target.value)} style={{...inputCalc, width: '100%', paddingLeft: '26px'}} className="input-focus" />
                                                </div>
                                                <select value={item.frecuencia} onChange={e=>updateCalcItem(i, 'frecuencia', e.target.value)} style={{...inputCalc, width: '32%', flexShrink: 0, cursor: 'pointer', padding: '10px 5px'}} className="input-focus">
                                                    <option value="Diario">Diario</option>
                                                    <option value="Semanal">Semanal</option>
                                                    <option value="Quincenal">Quince</option>
                                                    <option value="Mensual">Mes</option>
                                                    <option value="Anual">Anual</option>
                                                </select>
                                            </div>
                                        ))}

                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '10px 15px', background: '#f8f9fa', borderRadius: '10px'}}>
                                            <button onClick={()=>setItemsCalc([...itemsCalc, {concepto:'', monto:'', frecuencia:'Mensual'}])} style={addBtnMini}>+ Añadir gasto</button>
                                            <div style={{fontSize: '15px', fontWeight: 'bold'}}>Total {ciclo}: <span style={{color:'#28a745'}}>${calcularSumaCalculadora().toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div>
                                        </div>
                                        <button type="button" onClick={aplicarCalculo} style={btnAplicarCalc} className="btn-hover">Aplicar Total al Cajón</button>
                                    </div>
                                )}
                            </div>

                            {/* CAJON: AHORRO */}
                            <div style={adminBox}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div><b style={{fontSize: '16px'}}>🐷 Ahorro Intocable</b><br/><span style={adminDesc}>Págate a ti mismo primero</span></div>
                                    <input type="number" min="0" onKeyDown={preventMinus} placeholder="$ Meta" value={admins['Ahorro']} onChange={e=>setAdmins({...admins, 'Ahorro': e.target.value})} style={inputMini} className="input-focus" />
                                </div>
                            </div>

                        </div>
                        <button onClick={handleNext} style={btnStyle} className="btn-hover">Siguiente <FaArrowRight /></button>
                    </div>
                )}

                {step === 6 && (
                    <div className="step-container" style={stepStyle}>
                        <div style={{...iconBadge, background:'#ffebee', color:'#dc3545'}}><FaExclamationTriangle/></div>
                        <h2 style={titleStyle}>Metas y Deudas</h2>
                        <p style={descStyle}>Añade tus propios cajones (Suscripciones, Viajes). <b>Si tienes deudas, agrégalas como Prioridad.</b></p>
                        
                        <div style={{display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', marginBottom:'25px', width: '100%'}}>
                            {!tieneDeuda && (
                                <button onClick={toggleDeuda} style={{...sugBtn, border:'2px solid #dc3545', color:'#dc3545', background:'rgba(220, 53, 69, 0.1)', flex: 1}} className="btn-hover pulse">
                                    🚨 Tengo Deudas
                                </button>
                            )}
                            <button onClick={addCajonPersonalizado} style={{...sugBtn, border:'2px dashed #007bff', color:'#007bff', background:'#eef3ff', flex: 1}} className="btn-hover">
                                + Meta Personalizada
                            </button>
                        </div>

                        {tieneDeuda && (
                            <div style={{...tipBox, background: 'rgba(220, 53, 69, 0.1)', borderLeft: '4px solid #dc3545', width: '100%', boxSizing: 'border-box'}}>
                                <FaExclamationTriangle style={{color: '#dc3545', fontSize: '24px', flexShrink: 0}} />
                                <span style={{fontSize: '13px', color: '#dc3545', fontWeight: 'bold', textAlign: 'left'}}>Regla de Oro: La DEUDA será tu Prioridad #1. Sanar tus finanzas es lo primero.</span>
                            </div>
                        )}

                        {cajonesExtra.length > 0 && (
                            <div style={{width:'100%', textAlign:'left', marginBottom:'20px'}}>
                                {cajonesExtra.map((c, i) => (
                                    <div key={i} style={{...adminBox, border: c.nombre === 'Deuda' ? '2px solid #dc3545' : '1px solid #e1e5ee', marginBottom: '10px', padding: '15px'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <b style={{color: c.nombre==='Deuda'?'#dc3545':'#2f3542', fontSize: '15px'}}>{c.nombre === 'Deuda' ? '🚨 DEUDA TOTAL' : `🎯 ${c.nombre}`}</b>
                                            <input type="number" min="0" onKeyDown={preventMinus} placeholder="$ Meta" value={c.monto} onChange={e=>updateCajonExtra(i, e.target.value)} style={inputMini} className="input-focus" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={handleNext} style={btnStyle} className="btn-hover">Siguiente <FaArrowRight /></button>
                    </div>
                )}

                {step === 7 && (
                    <div className="step-container" style={stepStyle}>
                        <div style={{...iconBadge, background:'#2f3542', color:'#fff'}}><FaShieldAlt/></div>
                        <h2 style={titleStyle}>Blindaje de Bóveda</h2>
                        
                        <div style={{...tipBox, width: '100%', boxSizing: 'border-box'}}>
                            <FaKey style={{color: '#007bff', fontSize: '20px', flexShrink: 0}} />
                            <span style={{fontSize: '13px', color: '#2f3542', textAlign: 'left'}}>Crea un NIP. Se te pedirá para retirar dinero de tus Bóvedas Intocables o para modificar administradores base.</span>
                        </div>

                        <div style={{background: '#f8f9fa', padding: '30px', borderRadius: '20px', marginTop: '10px', border: '1px solid #e1e5ee', width: '100%', boxSizing: 'border-box'}}>
                            <input 
                                type="password" 
                                maxLength="4" 
                                placeholder="••••" 
                                value={pin} 
                                onChange={e=>setPin(e.target.value.replace(/[^0-9]/g, ''))} 
                                style={{
                                    width: '100%', background: '#fff', border: '2px solid #2f3542', 
                                    borderRadius: '15px', fontSize: '40px', letterSpacing: '25px', 
                                    textAlign: 'center', padding: '15px', outline: 'none', color: '#007bff',
                                    boxSizing: 'border-box'
                                }} 
                                className="input-focus" 
                            />
                            <p style={{fontSize: '12px', color: '#a4b0be', margin: '15px 0 0 0'}}>Ingresa 4 números exactos.</p>
                        </div>
                        
                        <button onClick={handleFinalize} style={{...btnStyle, background:'linear-gradient(135deg, #10ac84, #28a745)', boxShadow: '0 10px 25px rgba(40, 167, 69, 0.3)'}} className="btn-hover">
                            ¡Activar mi Fortaleza! <FaCheckCircle />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ESTILOS WIZARD PREMIUM
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(244, 247, 246, 0.95)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' };
const modalStyle = { backgroundColor: '#fff', padding: '40px 50px', borderRadius: '35px', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', maxWidth: '550px', width: '100%', textAlign: 'center', boxSizing: 'border-box', border: '1px solid #e1e5ee', maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden' };
const stepStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' };
const iconBadge = { width:'90px', height:'90px', borderRadius:'30px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', marginBottom:'25px' };
const titleStyle = { color:'#2f3542', fontSize:'26px', margin:'0 0 10px 0', fontWeight: '900' };
const descStyle = { color:'#747d8c', fontSize:'15px', marginBottom:'25px', lineHeight:'1.5' };
const btnStyle = { width: '100%', padding: '20px', borderRadius: '18px', border: 'none', background: '#2f3542', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s ease', boxSizing: 'border-box' };
const inputBigStyle = { width: '100%', padding: '18px', borderRadius: '15px', border: '2px solid #e1e5ee', fontSize: '16px', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box', marginBottom: '15px', transition: 'all 0.2s', backgroundColor: '#f8f9fa', color: '#2f3542' };
const dollarIcon = { position: 'absolute', left: '20px', top: '18px', fontSize: '20px', fontWeight: 'bold', color: '#28a745', pointerEvents: 'none' };
const addBtn = { background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px', fontSize: '14px', transition: '0.2s' };
const labelStyle = { display:'block', fontSize:'14px', fontWeight:'bold', color:'#a4b0be', marginBottom:'8px', alignSelf:'flex-start' };
const adminBox = { background:'#fff', border:'2px solid', padding:'20px', borderRadius:'20px', marginBottom:'15px', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' };
const adminDesc = { fontSize:'13px', color:'#747d8c', display: 'block', marginTop: '4px' };
const inputMini = { padding:'12px', borderRadius:'12px', border:'2px solid #e1e5ee', outline:'none', fontWeight:'bold', fontSize:'16px', width: '110px', textAlign: 'center', background: '#f8f9fa', color: '#2f3542', transition: 'all 0.2s', margin: 0, boxSizing: 'border-box' };
const sugBtn = { padding:'12px 20px', borderRadius:'15px', fontWeight:'bold', cursor:'pointer', fontSize:'14px', transition: 'all 0.2s' };
const tipBox = { display: 'flex', alignItems: 'center', gap: '15px', background: '#fff9e6', padding: '15px 20px', borderRadius: '15px', borderLeft: '4px solid #f39c12', marginBottom: '25px', textAlign: 'left', width: '100%', boxSizing: 'border-box' };

const calcBtnStyle = { padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: 'all 0.2s' };
const calcInnerBox = { marginTop: '20px', padding: '20px', borderTop: '1px dashed #e1e5ee', background: '#fcfcfc', borderRadius: '0 0 15px 15px', width: '100%', boxSizing: 'border-box' };

// Cajas milimétricas
const inputCalc = { padding: '10px', borderRadius: '10px', border: '1px solid #dfe6e9', outline: 'none', fontSize: '14px', background: '#fff', boxSizing: 'border-box' };
const addBtnMini = { background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };
const btnAplicarCalc = { width: '100%', padding: '14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer', transition: '0.2s', fontSize: '15px', boxSizing: 'border-box' };

export default BienvenidaFullScreen;