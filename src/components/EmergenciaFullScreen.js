import React, { useState, useEffect } from 'react';
import { 
    FaArrowLeft, FaShieldAlt, FaPlus, FaLightbulb, FaBrain, 
    FaTrash, FaMinus 
} from 'react-icons/fa';

const EmergenciaFullScreen = ({ 
    isOpen, onClose, onAddCajon, gastosFijosBase, gastosVariablesBase, 
    cicloMaestro = 'Mensual', ingresosMensuales, 
    saldoBoveda = 0, 
    onTransaction,    
    onDeleteCajon    
}) => {
    const [gastosVitalesMensuales, setGastosVitalesMensuales] = useState('');
    const [mesesEmergencia, setMesesEmergencia] = useState(6);
    const [aporteEmergencia, setAporteEmergencia] = useState('');
    const [sugerenciaAporteUsada, setSugerenciaAporteUsada] = useState(false);

    useEffect(() => {
        if (isOpen) {
            let multiplicador = 1;
            if (cicloMaestro === 'Semanal') multiplicador = 4;
            if (cicloMaestro === 'Quincenal') multiplicador = 2;
            if (cicloMaestro === 'Diario') multiplicador = 30;

            const totalVitalCiclo = (parseFloat(gastosFijosBase) || 0) + (parseFloat(gastosVariablesBase) || 0);
            const sugeridoMensual = totalVitalCiclo * multiplicador;
            
            setGastosVitalesMensuales(Math.round(sugeridoMensual));
            setAporteEmergencia('');
            setSugerenciaAporteUsada(false);
        }
    }, [isOpen, gastosFijosBase, gastosVariablesBase, cicloMaestro]);

    if (!isOpen) return null;

    // Lógica para la barra de progreso
    const totalFondoGoal = (parseFloat(gastosVitalesMensuales) || 0) * mesesEmergencia;
    const porcentajeProgreso = totalFondoGoal > 0 ? Math.min((saldoBoveda / totalFondoGoal) * 100, 100) : 0;

    const sugerirAporteSano = () => {
        let multiplicador = 1;
        if (cicloMaestro === 'Semanal') multiplicador = 4;
        if (cicloMaestro === 'Quincenal') multiplicador = 2;
        if (cicloMaestro === 'Diario') multiplicador = 30;
        const ingresoPorCiclo = ingresosMensuales / multiplicador;
        const aporteSano = ingresoPorCiclo * 0.10; 
        setAporteEmergencia(Math.round(aporteSano));
        setSugerenciaAporteUsada(true);
    };

    const crearCajon = () => {
        const montoAporte = parseFloat(aporteEmergencia);
        if (!montoAporte || montoAporte <= 0) return alert('⚠️ Ingresa un aporte válido.');
        // Pasamos la meta total al Dashboard para que se guarde en la BD
        onAddCajon('Fondo de Emergencia', montoAporte, cicloMaestro, totalFondoGoal);
        onClose();
    };

    const handleManualTransaction = (tipo) => {
        const monto = parseFloat(window.prompt(`¿Cuánto dinero deseas ${tipo === 'add' ? 'ingresar a' : 'retirar de'} la Bóveda?`));
        if (!monto || isNaN(monto) || monto <= 0) return;
        onTransaction(tipo === 'add' ? 'add' : 'withdraw', monto);
    };

    const handleEliminarFondo = () => {
        if (window.confirm("🚨 ¿Estás seguro de eliminar tu Fondo de Emergencia?\n\nTodo el dinero acumulado regresará a tu saldo disponible (cascada).")) {
            if (onDeleteCajon) onDeleteCajon('Fondo de Emergencia', 0, true); 
            onClose();
        }
    };

    return (
        <div style={fullScreenStyle}>
            <style>{`
                @media (max-width: 768px) {
                    .emergencia-content { padding: 20px !important; }
                    .emergencia-card { padding: 25px !important; border-radius: 20px !important; }
                    .btn-group-mobile { flex-direction: column !important; }
                }
            `}</style>

            <div style={headerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                    <button onClick={onClose} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: '0', color: '#2f3542', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaShieldAlt color="#28a745" /> Configurar Blindaje</h1>
                </div>
            </div>

            <div className="emergencia-content" style={contentContainer}>
                
                {/* 💡 NUEVA TARJETA: BARRA DE PROGRESO Y CONTROLES (IDÉNTICA A LA FOTO) */}
                <div className="emergencia-card" style={progressCardStyle}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#2f3542', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaShieldAlt color="#007bff" /> Fondo de Emergencia
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2f3542' }}>Progreso</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#007bff' }}>Meta: ${totalFondoGoal.toLocaleString()}</span>
                    </div>
                    
                    <div style={{ width: '100%', height: '10px', background: '#e1e5ee', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
                        <div style={{ height: '100%', width: `${porcentajeProgreso}%`, background: '#007bff', transition: 'width 0.4s ease' }}></div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <span style={{ fontSize: '14px', color: '#2f3542' }}>Guardado: <b>${saldoBoveda.toLocaleString()}</b></span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={handleEliminarFondo} style={btnTrashStyle} title="Eliminar fondo y recuperar dinero"><FaTrash /></button>
                            <div style={badgeCompletadoStyle}>{porcentajeProgreso.toFixed(0)}% Completado</div>
                        </div>
                    </div>

                    <div className="btn-group-mobile" style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => handleManualTransaction('add')} style={btnIngresar}><FaPlus /> Ingresar</button>
                        <button onClick={() => handleManualTransaction('withdraw')} style={btnRetirar}><FaMinus /> Retirar</button>
                    </div>
                </div>

                {/* CALCULADORA DE SUPERVIVENCIA */}
                <div className="emergencia-card" style={formContainerStyle}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={iconBadgeStyle}><FaBrain /></div>
                        <h2 style={{ margin: '0 0 10px 0', color: '#28a745', fontSize: '20px' }}>Cálculo de Supervivencia</h2>
                    </div>

                    <label style={labelStyle}>Gastos Vitales Mensuales</label>
                    <div style={{position: 'relative', marginBottom: '25px'}}>
                        <span style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#a4b0be', fontWeight:'bold'}}>$</span>
                        <input type="number" value={gastosVitalesMensuales} onChange={e => setGastosVitalesMensuales(e.target.value)} style={{...inputStyle, paddingLeft:'35px'}} />
                    </div>

                    <label style={labelStyle}>Meses de Cobertura</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        {[3, 6, 12].map(m => (
                            <button key={m} onClick={() => setMesesEmergencia(m)} style={{...selectorBtn, border: mesesEmergencia===m?'2px solid #28a745':'1px solid #e1e5ee', background: mesesEmergencia===m?'#e6f4ea':'#fff'}}>{m}m</button>
                        ))}
                    </div>

                    <div style={resultCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <label style={{...labelStyle, marginBottom: 0}}>Aporte ({cicloMaestro})</label>
                            <button onClick={sugerirAporteSano} style={miniMagicBtn}><FaLightbulb /> Auto-calcular</button>
                        </div>
                        <input type="number" placeholder="0.00" value={aporteEmergencia} onChange={e => setAporteEmergencia(e.target.value)} style={inputStyle} />
                        <button onClick={crearCajon} style={{ ...actionBtnStyle, background: '#28a745', marginTop: '20px' }}>{porcentajeProgreso > 0 ? 'Actualizar Aporte' : 'Activar Cajón'}</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ESTILOS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto' };
const headerStyle = { backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '10px 15px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542' };
const contentContainer = { padding: '30px', maxWidth: '650px', margin: '0 auto' };

// Estilos de la nueva tarjeta tipo "Ahorro Inteligente" (colores azules y limpios de la foto)
const progressCardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', marginBottom: '30px', border: '1px solid #e1e5ee' };
const btnTrashStyle = { background: '#ffebee', color: '#dc3545', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '14px', transition: '0.2s' };
const badgeCompletadoStyle = { background: '#eef3ff', color: '#007bff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' };
const btnIngresar = { flex: 1, background: '#28a745', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' };
const btnRetirar = { flex: 1, background: '#dc3545', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' };

// Estilos de la calculadora
const formContainerStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', border: '1px solid #e1e5ee', marginBottom: '40px' };
const iconBadgeStyle = { width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: '#e6f4ea', color: '#28a745', margin: '0 auto 15px auto' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#747d8c', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9', outline: 'none', background: '#f8f9fa', fontSize: '16px', boxSizing: 'border-box' };
const selectorBtn = { flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', border: '1px solid #e1e5ee' };
const resultCardStyle = { backgroundColor: '#fcfcfc', padding: '20px', borderRadius: '15px', border: '1px dashed #28a745' };
const actionBtnStyle = { width: '100%', color: 'white', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' };
const miniMagicBtn = { background: '#e6f4ea', color: '#28a745', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' };

export default EmergenciaFullScreen;