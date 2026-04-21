import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBullseye, FaMagic, FaPiggyBank, FaBrain, FaRocket, FaExclamationTriangle, FaCheckCircle, FaTimes, FaShieldAlt, FaPlus, FaBriefcase, FaHourglassHalf, FaGamepad, FaChartLine, FaChartBar, FaLightbulb, FaSyncAlt } from 'react-icons/fa';
import GuiaTutorial from './GuiaTutorial'; // 🔴 TUTORIAL IMPORTADO

const MetasFullScreen = ({ isOpen, onClose, onAddCajon, onReplaceAhorro, ingresosMensuales, gastosFijosBase, gastosVariablesBase, edadUsuario, cicloMaestro = 'Mensual' }) => {
    const [vistaActual, setVistaActual] = useState('menu');

    // ESTADOS: FONDO DE EMERGENCIA 
    const [gastosVitalesMensuales, setGastosVitalesMensuales] = useState('');
    const [mesesEmergencia, setMesesEmergencia] = useState(6);
    const [aporteEmergencia, setAporteEmergencia] = useState('');
    const [frecuenciaEmergencia, setFrecuenciaEmergencia] = useState(cicloMaestro);
    const [sugerenciaEmergenciaUsada, setSugerenciaEmergenciaUsada] = useState(false);

    // ESTADOS: AHORRO INTELIGENTE
    const [formInteligente, setFormInteligente] = useState({ nombreMeta: '', montoTotal: '', mesesObjetivo: '', capacidadAhorro: '' });
    const [resultadoIA, setResultadoIA] = useState(null);
    const [sugerenciaUsada, setSugerenciaUsada] = useState(false);

    // ESTADOS: NEGOCIO 
    const [formNegocio, setFormNegocio] = useState({ inversion: '', costoUnidad: '', precioVenta: '', fijosMes: '', metaVentas: '' });
    const [resultadoNegocio, setResultadoNegocio] = useState(null);
    
    // ESTADOS: MÁQUINA DEL TIEMPO 
    const [formMaquina, setFormMaquina] = useState({ aporteInicial: '', aporteMensual: '', tasaAnual: 10, edadRetiro: 30 });
    const [resultadoMaquina, setResultadoMaquina] = useState(null);
    
    // ESTADOS: RETOS
    const [formReto, setFormReto] = useState({ nombre: '', monto: '', semanasManual: '' });
    const [resultadoReto, setResultadoReto] = useState(null);

    useEffect(() => {
        if (vistaActual === 'emergencia') {
            let multiplicador = 1;
            if (cicloMaestro === 'Semanal') multiplicador = 4;
            if (cicloMaestro === 'Quincenal') multiplicador = 2;
            if (cicloMaestro === 'Diario') multiplicador = 30;

            const totalVitalCiclo = (parseFloat(gastosFijosBase) || 0) + (parseFloat(gastosVariablesBase) || 0);
            const sugeridoMensual = totalVitalCiclo * multiplicador;
            
            setGastosVitalesMensuales(Math.round(sugeridoMensual));
            setAporteEmergencia('');
            setSugerenciaEmergenciaUsada(false);
            setFrecuenciaEmergencia(cicloMaestro);
        }
    }, [vistaActual, gastosFijosBase, gastosVariablesBase, cicloMaestro]);

    if (!isOpen) return null;

    const irAtras = () => {
        if (vistaActual === 'menu') onClose();
        else { setVistaActual('menu'); setSugerenciaUsada(false); setResultadoIA(null); setResultadoReto(null); setResultadoNegocio(null); setResultadoMaquina(null); }
    };

    const ajustarAlCicloActual = (montoMensual) => {
        const cicloSeguro = cicloMaestro || 'Mensual';
        if (cicloSeguro === 'Semanal') return montoMensual / 4;
        if (cicloSeguro === 'Quincenal') return montoMensual / 2;
        return montoMensual;
    };

    const sugerirCapacidad = () => {
        const ahorroSanoMensual = ingresosMensuales * 0.15;
        const sugerenciaCiclo = ajustarAlCicloActual(ahorroSanoMensual);
        setFormInteligente({ ...formInteligente, capacidadAhorro: Math.round(sugerenciaCiclo) });
        setSugerenciaUsada(true);
    };

    const sugerirAporteEmergencia = () => {
        const ingresoPorCiclo = ajustarAlCicloActual(ingresosMensuales);
        const aporteSano = ingresoPorCiclo * 0.10; 
        setAporteEmergencia(Math.round(aporteSano));
        setSugerenciaEmergenciaUsada(true);
    };

    const ejecutarAnalisisInteligente = (usarColchon) => {
        if (!formInteligente.nombreMeta || !formInteligente.montoTotal || !formInteligente.mesesObjetivo || !formInteligente.capacidadAhorro) return alert("Llena todos los campos.");
        const cicloSeguro = cicloMaestro || 'Mensual';
        const montoBase = parseFloat(formInteligente.montoTotal);
        const colchon = usarColchon ? montoBase * 0.10 : 0;
        const montoTotalCalculo = montoBase + colchon; 
        const meses = parseInt(formInteligente.mesesObjetivo);
        const capacidadPorCiclo = parseFloat(formInteligente.capacidadAhorro);

        let capacidadMensual = capacidadPorCiclo;
        if (cicloSeguro === 'Semanal') capacidadMensual = capacidadPorCiclo * 4;
        if (cicloSeguro === 'Quincenal') capacidadMensual = capacidadPorCiclo * 2;

        if (capacidadMensual > ingresosMensuales) {
            setResultadoIA({ estado: 'Imposible', color: '#dc3545', icono: <FaTimes />, mensaje: `Quieres ahorrar $${capacidadMensual.toLocaleString()} al mes, pero ganas $${ingresosMensuales.toLocaleString()}.`, opciones: [], conColchon: usarColchon });
            setVistaActual('resultadoInteligente');
            return;
        }

        const cuotaMensualIdeal = montoTotalCalculo / meses;
        const cuotaCicloIdeal = ajustarAlCicloActual(cuotaMensualIdeal);
        const diferencia = capacidadPorCiclo - cuotaCicloIdeal;
        const mesesReales = Math.ceil(montoTotalCalculo / capacidadMensual);

        let estado, color, mensaje, icono, opciones;

        if (diferencia >= 0) {
            estado = '¡Súper Viable!'; color = '#28a745'; icono = <FaCheckCircle />;
            mensaje = `Tu ahorro cubre perfecto la cuota de $${cuotaCicloIdeal.toLocaleString(undefined, {minimumFractionDigits: 2})} por ciclo.`;
            opciones = [{ titulo: 'Plan Ideal', desc: `Ahorrar $${cuotaCicloIdeal.toLocaleString(undefined, {minimumFractionDigits: 2})} cada ${cicloSeguro.toLowerCase()} por ${meses} meses.`, monto: cuotaCicloIdeal, frecuencia: cicloSeguro }];
        } else {
            estado = 'Retador'; color = '#ffc107'; icono = <FaRocket />;
            mensaje = `Necesitas $${cuotaCicloIdeal.toLocaleString(undefined, {minimumFractionDigits: 2})} por ciclo. Te faltan $${Math.abs(diferencia).toFixed(2)}.`;
            opciones = [
                { titulo: 'Ajustar Tiempo', desc: `Ahorrar tus $${capacidadPorCiclo.toLocaleString()} actuales. Lo lograrás en ${mesesReales} meses.`, monto: capacidadPorCiclo, frecuencia: cicloSeguro },
                { titulo: 'Ajustar Ahorro', desc: `Subir tu ahorro a $${cuotaCicloIdeal.toLocaleString(undefined, {minimumFractionDigits: 2})} para cumplir el plazo original.`, monto: cuotaCicloIdeal, frecuencia: cicloSeguro }
            ];
        }
        setResultadoIA({ estado, color, mensaje, icono, opciones, colchon, conColchon: usarColchon });
        setVistaActual('resultadoInteligente');
    };

    const analizarNegocio = () => {
        const inv = parseFloat(formNegocio.inversion) || 0;
        const fijos = parseFloat(formNegocio.fijosMes) || 0;
        const costo = parseFloat(formNegocio.costoUnidad) || 0;
        const precio = parseFloat(formNegocio.precioVenta) || 0;
        const ventasEsperadas = parseFloat(formNegocio.metaVentas) || 0;

        if (!inv || !costo || !precio) return alert("Llena al menos Inversión, Costo y Precio.");
        if (precio <= costo) return alert("❌ Error: El precio de venta debe ser mayor al costo de producción, de lo contrario perderás dinero en cada venta.");

        const margenUnidad = precio - costo;
        const margenPorcentaje = (margenUnidad / precio) * 100;
        const equilibrioMensual = fijos > 0 ? Math.ceil(fijos / margenUnidad) : 0;
        const utilidadMensualBruta = (ventasEsperadas * margenUnidad) - fijos;
        
        let mesesROI = "N/A";
        if (utilidadMensualBruta > 0) {
            mesesROI = Math.ceil(inv / utilidadMensualBruta);
        } else if (ventasEsperadas > 0 && utilidadMensualBruta <= 0) {
            mesesROI = "Nunca (Estás en pérdida mensual)";
        }

        setResultadoNegocio({ 
            margenUnidad, 
            margenPorcentaje, 
            equilibrioMensual, 
            utilidadMensualBruta,
            mesesROI
        });
    };

    const calcularInteresCompuesto = () => {
        const inicial = parseFloat(formMaquina.aporteInicial) || 0;
        const mensual = parseFloat(formMaquina.aporteMensual) || 0;
        const tasa = parseFloat(formMaquina.tasaAnual) || 10;
        const retiro = parseInt(formMaquina.edadRetiro) || 60;
        const edad = parseInt(edadUsuario) || 18;

        if (retiro <= edad) return alert("La edad de retiro debe ser mayor a tu edad actual.");
        if (mensual <= 0 && inicial <= 0) return alert("Debes ingresar un aporte mensual o inicial.");

        const mesesTotales = (retiro - edad) * 12;
        const tasaMensual = (tasa / 100) / 12;
        
        let capitalAcumulado = inicial;
        let aportadoBolsillo = inicial;

        for (let i = 0; i < mesesTotales; i++) {
            capitalAcumulado += mensual;
            aportadoBolsillo += mensual;
            capitalAcumulado += capitalAcumulado * tasaMensual;
        }

        const pensionVitaliciaMensual = (capitalAcumulado * 0.04) / 12;

        setResultadoMaquina({ 
            futuro: capitalAcumulado, 
            aportado: aportadoBolsillo, 
            interesGanado: capitalAcumulado - aportadoBolsillo,
            pensionMensual: pensionVitaliciaMensual
        });
    };

    const generarReto = () => {
        const monto = parseFloat(formReto.monto);
        const semanasManuales = parseInt(formReto.semanasManual);

        if (!formReto.nombre || !monto || monto <= 0) return alert("Llena el nombre y el precio.");
        const presupuestoSanoSemanal = ingresosMensuales > 0 ? (ingresosMensuales * 0.10) / 4 : 500;

        if (semanasManuales && semanasManuales > 0) {
            const cuotaSemanal = monto / semanasManuales;
            if (cuotaSemanal <= presupuestoSanoSemanal) {
                setResultadoReto({ tipo: 'manual_sano', semanas: semanasManuales, semanal: cuotaSemanal });
            } else {
                setResultadoReto({ tipo: 'manual_peligro', semanas: semanasManuales, semanal: cuotaSemanal, limiteSano: presupuestoSanoSemanal });
            }
        } else {
            const cuota4Semanas = monto / 4;
            if (cuota4Semanas <= presupuestoSanoSemanal) {
                setResultadoReto({ tipo: 'ideal', semanas: 4, semanal: cuota4Semanas });
            } else {
                const semanasRealesSanas = Math.ceil(monto / presupuestoSanoSemanal);
                setResultadoReto({ tipo: 'ajustado', semanas: semanasRealesSanas, semanal: presupuestoSanoSemanal });
            }
        }
    };

    const renderMenu = () => (
        <>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#2f3542', fontSize: '32px' }}>Laboratorio Financiero 🔬</h2>
                <p style={{ margin: 0, color: '#747d8c', fontSize: '16px' }}>Proyecta tus metas ajustadas a tu ciclo <b>{cicloMaestro || 'Mensual'}</b>.</p>
            </div>
            <div style={gridStyle}>
                <div style={{...toolCard, borderTop: '5px solid #007bff'}} onClick={() => setVistaActual('inteligente')}>
                    <div style={{...iconBadgeStyle, background: '#eef3ff', color: '#007bff'}}><FaMagic /></div><h3 style={cardTitle}>Ahorro Inteligente</h3><p style={cardDesc}>Analiza la viabilidad de compras.</p>
                </div>
                <div style={{...toolCard, borderTop: '5px solid #28a745'}} onClick={() => setVistaActual('emergencia')}>
                    <div style={{...iconBadgeStyle, background: '#e6f4ea', color: '#28a745'}}><FaShieldAlt /></div><h3 style={cardTitle}>Fondo de Emergencia</h3><p style={cardDesc}>Calculadora y activador de escudo vital.</p>
                </div>
                <div style={{...toolCard, borderTop: '5px solid #6f42c1'}} onClick={() => setVistaActual('negocio')}>
                    <div style={{...iconBadgeStyle, background: '#f3e8ff', color: '#6f42c1'}}><FaBriefcase /></div><h3 style={cardTitle}>Simulador Negocio Pro</h3><p style={cardDesc}>Márgenes, equilibrio y ROI exacto.</p>
                </div>
                <div style={{...toolCard, borderTop: '5px solid #6610f2'}} onClick={() => setVistaActual('maquina')}>
                    <div style={{...iconBadgeStyle, background: '#e0cffc', color: '#6610f2'}}><FaChartLine /></div><h3 style={cardTitle}>Máquina del Tiempo Pro</h3><p style={cardDesc}>Calcula tu pensión vitalicia real.</p>
                </div>
                <div style={{...toolCard, borderTop: '5px solid #e83e8c'}} onClick={() => setVistaActual('retos')}>
                    <div style={{...iconBadgeStyle, background: '#fce3ed', color: '#e83e8c'}}><FaGamepad /></div><h3 style={cardTitle}>Micro-Retos</h3><p style={cardDesc}>Divide caprichos a tu propio ritmo.</p>
                </div>
            </div>
        </>
    );

    const renderInteligente = () => (
        <div style={formContainerStyle}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '10px' }}><FaMagic /> Ahorro Inteligente</h2>
            <p style={{ textAlign: 'center', color: '#747d8c', marginBottom: '30px' }}>Ingreso por ciclo <b>({cicloMaestro})</b>: <b>${ajustarAlCicloActual(ingresosMensuales).toLocaleString()}</b></p>
            <label style={labelStyle}>¿Qué quieres comprar o lograr?</label><input type="text" placeholder="Ej. Laptop, Viaje, Coche" value={formInteligente.nombreMeta} onChange={e => setFormInteligente({...formInteligente, nombreMeta: e.target.value})} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label style={labelStyle}>Precio Total ($)</label><input type="number" min="0" value={formInteligente.montoTotal} onChange={e => setFormInteligente({...formInteligente, montoTotal: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>Plazo (Meses)</label><input type="number" min="1" value={formInteligente.mesesObjetivo} onChange={e => setFormInteligente({...formInteligente, mesesObjetivo: e.target.value})} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                <label style={{...labelStyle, marginBottom: 0}}>¿Cuánto ahorrar por <b>{cicloMaestro}</b>?</label>
                <button onClick={sugerirCapacidad} style={miniMagicBtn}><FaLightbulb /> 🤔 No sé, sugiéreme</button>
            </div>
            <input type="number" min="0" value={formInteligente.capacidadAhorro} onChange={e => { setFormInteligente({...formInteligente, capacidadAhorro: e.target.value}); setSugerenciaUsada(false); }} style={inputStyle} />
            {sugerenciaUsada && <div style={tipBoxSugerencia}><p style={{ margin: 0, fontSize: '13px' }}>✨ Sugerimos <b>${formInteligente.capacidadAhorro}</b> (15% de tu ingreso por ciclo).</p></div>}
            <button onClick={() => ejecutarAnalisisInteligente(true)} style={actionBtnStyle}><FaBrain /> Analizar Proyecto</button>
        </div>
    );

    const renderResultadoInteligente = () => (
        <div style={formContainerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '60px', color: resultadoIA?.color, marginBottom: '15px' }}>{resultadoIA?.icono}</div>
                <h1 style={{ margin: '0 0 10px 0', color: resultadoIA?.color, fontSize: '32px' }}>{resultadoIA?.estado}</h1>
                <p style={{ margin: 0, color: '#2f3542', fontSize: '18px' }}>{resultadoIA?.mensaje}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                {resultadoIA?.opciones.map((opc, idx) => (
                    <div key={idx} style={optionCardStyle}>
                        <div style={{ flex: 1 }}><h3 style={{ margin: '0 0 5px 0' }}>{opc.titulo}</h3><p style={{ margin: 0, color: '#747d8c', fontSize: '14px' }}>{opc.desc}</p></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={() => onAddCajon(formInteligente.nombreMeta, opc.monto, opc.frecuencia)} style={btnCreateCajon}><FaPlus /> Crear Meta Nueva</button>
                            <button onClick={() => onReplaceAhorro(opc.monto, opc.frecuencia)} style={{...btnCreateCajon, background: '#ff9f43'}}><FaSyncAlt /> Reemplazar 'Ahorro' Base</button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => setVistaActual('inteligente')} style={btnVolverEdit}>Ajustar datos</button>
        </div>
    );

    const renderEmergencia = () => {
        const totalFondo = (parseFloat(gastosVitalesMensuales) || 0) * mesesEmergencia;
        return (
            <div style={formContainerStyle}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FaShieldAlt style={{ fontSize: '40px', color: '#28a745', marginBottom: '10px' }}/>
                    <h2 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Configurar Fondo de Emergencia</h2>
                    <p style={{ margin: 0, color: '#747d8c', fontSize: '15px' }}>Deducimos tus gastos vitales a partir de tus cajones de Fijos y Variables.</p>
                </div>
                <label style={labelStyle}>Gastos Vitales Mensuales (Calculado auto)</label>
                <div style={{position: 'relative', marginBottom: '25px'}}>
                    <span style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#a4b0be', fontWeight:'bold', fontSize:'18px', pointerEvents:'none'}}>$</span>
                    <input type="number" min="0" value={gastosVitalesMensuales} onChange={e => setGastosVitalesMensuales(e.target.value)} style={{...inputStyle, paddingLeft:'35px', margin: 0}} />
                </div>
                <label style={labelStyle}>¿Cuántos meses quieres blindar?</label>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    {[3, 6, 12].map(m => (
                        <button key={m} onClick={() => setMesesEmergencia(m)} style={{...selectorBtn, border: mesesEmergencia===m?'2px solid #28a745':'1px solid #e1e5ee', background: mesesEmergencia===m?'#e6f4ea':'#fff', color: '#2f3542'}}>{m} Meses</button>
                    ))}
                </div>
                <div style={resultCardStyle}>
                    <p style={{ margin: '0 0 10px 0', color: '#747d8c', fontWeight: 'bold' }}>Objetivo Total del Fondo:</p>
                    <h1 style={{ fontSize: '48px', margin: '10px 0 20px 0', color: '#2f3542' }}>${totalFondo.toLocaleString()}</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <label style={{...labelStyle, marginBottom: 0, color: '#2f3542'}}>Aporte por <b>{cicloMaestro}</b></label>
                        <button onClick={sugerirAporteEmergencia} style={{...miniMagicBtn, background: '#e6f4ea', color: '#28a745'}}><FaLightbulb /> Sugerir Aporte Sano</button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{fontWeight: 'bold', fontSize: '20px', color: '#a4b0be'}}>$</span>
                        <input type="number" min="0" value={aporteEmergencia} onChange={e => { setAporteEmergencia(e.target.value); setSugerenciaEmergenciaUsada(false); }} style={{...inputStyle, marginBottom: 0, flex: 1}} />
                    </div>
                    {sugerenciaEmergenciaUsada && (
                        <div style={{...tipBoxSugerencia, background: '#e6f4ea', borderLeft: '4px solid #28a745', color: '#1e8e3e'}}>
                            <p style={{ margin: 0, fontSize: '13px' }}>✨ Sugerimos <b>${aporteEmergencia}</b> (10% de tu ingreso por ciclo). No asfixiará tu presupuesto.</p>
                        </div>
                    )}
                    <button onClick={() => { if(!aporteEmergencia || aporteEmergencia<=0) return alert('Ingresa un monto.'); onAddCajon('Fondo de Emergencia', parseFloat(aporteEmergencia), cicloMaestro); onClose(); }} style={{ ...actionBtnStyle, background: '#28a745', marginTop: '25px' }}><FaPlus /> Crear Cajón en Dashboard</button>
                </div>
            </div>
        );
    };

    const renderNegocio = () => {
        const inv = parseFloat(formNegocio.inversion) || 0;
        const fijos = parseFloat(formNegocio.fijosMes) || 0;
        const costo = parseFloat(formNegocio.costoUnidad) || 0;
        const precio = parseFloat(formNegocio.precioVenta) || 0;
        const ventasEsperadas = parseFloat(formNegocio.metaVentas) || 0;

        const margenUnidad = precio - costo;
        const margenPorcentaje = (precio > 0) ? (margenUnidad / precio) * 100 : 0;
        const equilibrioMensual = (fijos > 0 && margenUnidad > 0) ? Math.ceil(fijos / margenUnidad) : 0;
        const utilidadMensualBruta = (ventasEsperadas * margenUnidad) - fijos;
        
        let mesesROI = "N/A";
        if (utilidadMensualBruta > 0) mesesROI = Math.ceil(inv / utilidadMensualBruta);
        else if (ventasEsperadas > 0 && utilidadMensualBruta <= 0) mesesROI = "Nunca (Estás en pérdida)";

        return (
            <div style={formContainerStyle}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FaBriefcase style={{ fontSize: '40px', color: '#6f42c1', marginBottom: '10px' }}/>
                    <h2 style={{ margin: '0 0 10px 0', color: '#6f42c1' }}>Simulador de Negocios Pro</h2>
                    <p style={{ margin: 0, color: '#747d8c', fontSize: '14px' }}>Descubre la viabilidad real de tu emprendimiento.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><label style={labelStyle}>Inversión Inicial Total ($)</label><input type="number" value={formNegocio.inversion} onChange={e=>setFormNegocio({...formNegocio, inversion: e.target.value})} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Gastos Fijos x Mes ($)</label><input type="number" value={formNegocio.fijosMes} onChange={e=>setFormNegocio({...formNegocio, fijosMes: e.target.value})} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Costo Producción (1 ud)</label><input type="number" value={formNegocio.costoUnidad} onChange={e=>setFormNegocio({...formNegocio, costoUnidad: e.target.value})} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Precio de Venta (1 ud)</label><input type="number" value={formNegocio.precioVenta} onChange={e=>setFormNegocio({...formNegocio, precioVenta: e.target.value})} style={inputStyle} /></div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{...labelStyle, color: '#6f42c1'}}>Meta Realista: ¿Cuántas unidades crees vender al mes?</label>
                        <input type="number" value={formNegocio.metaVentas} onChange={e=>setFormNegocio({...formNegocio, metaVentas: e.target.value})} style={{...inputStyle, borderColor: '#e0cffc'}} />
                    </div>
                </div>
                <button onClick={analizarNegocio} style={{...actionBtnStyle, background: '#6f42c1', marginTop: '10px'}}><FaChartBar /> Calcular Rentabilidad</button>

                {resultadoNegocio && (
                    <div style={{...resultBoxStyle, borderColor: '#6f42c1', background: '#fcf8ff', marginTop: '30px'}}>
                        <h3 style={{color: '#6f42c1', marginTop: 0, borderBottom: '1px solid #e0cffc', paddingBottom: '10px'}}>Análisis Financiero</h3>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                            <div>
                                <p style={{margin: 0, fontSize: '13px', color: '#747d8c'}}>Margen de Ganancia</p>
                                <p style={{margin: '5px 0', fontSize: '20px', fontWeight: 'bold', color: '#28a745'}}>{resultadoNegocio.margenPorcentaje.toFixed(1)}% <span style={{fontSize:'14px', color:'#a4b0be'}}>(${resultadoNegocio.margenUnidad.toFixed(2)} /ud)</span></p>
                            </div>
                            <div>
                                <p style={{margin: 0, fontSize: '13px', color: '#747d8c'}}>Punto de Equilibrio</p>
                                <p style={{margin: '5px 0', fontSize: '16px', fontWeight: 'bold', color: '#2f3542'}}>Vender <b>{resultadoNegocio.equilibrioMensual}</b> uds / mes</p>
                            </div>
                        </div>
                        <div style={{marginTop: '20px', padding: '15px', background: resultadoNegocio.utilidadMensualBruta > 0 ? '#e6f4ea' : '#ffebee', borderRadius: '15px'}}>
                            <p style={{margin: 0, fontSize: '13px', color: resultadoNegocio.utilidadMensualBruta > 0 ? '#28a745' : '#dc3545', fontWeight: 'bold'}}>Proyección Mensual</p>
                            <h2 style={{margin: '5px 0', color: resultadoNegocio.utilidadMensualBruta > 0 ? '#1e8e3e' : '#c0392b'}}>${resultadoNegocio.utilidadMensualBruta.toLocaleString(undefined, {minimumFractionDigits:2})} / mes</h2>
                            <p style={{margin: 0, fontSize: '14px', color: '#2f3542'}}>{resultadoNegocio.utilidadMensualBruta > 0 ? `🚀 Recuperarás tu inversión en ${resultadoNegocio.mesesROI} meses.` : `⚠️ Estás perdiendo dinero mensual.`}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderMaquina = () => {
        return (
            <div style={formContainerStyle}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FaChartLine style={{ fontSize: '40px', color: '#6610f2', marginBottom: '10px' }}/>
                    <h2 style={{ margin: '0 0 10px 0', color: '#6610f2' }}>Máquina del Tiempo Pro</h2>
                    <p style={{ margin: 0, color: '#747d8c', fontSize: '14px' }}>El poder del Interés Compuesto para tu jubilación.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><label style={labelStyle}>Aporte Inicial (Opcional) $</label><input type="number" placeholder="Guardadito actual" value={formMaquina.aporteInicial} onChange={e=>setFormMaquina({...formMaquina, aporteInicial: e.target.value})} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Inversión Mensual Fija $</label><input type="number" placeholder="Ej. 2000" value={formMaquina.aporteMensual} onChange={e=>setFormMaquina({...formMaquina, aporteMensual: e.target.value})} style={{...inputStyle, borderColor: '#e0cffc'}} /></div>
                    <div><label style={labelStyle}>Tasa Anual (%)</label><input type="number" placeholder="Ej. 10" value={formMaquina.tasaAnual} onChange={e=>setFormMaquina({...formMaquina, tasaAnual: e.target.value})} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Edad de Retiro (Años)</label><input type="number" placeholder={`Ej. 65`} value={formMaquina.edadRetiro} onChange={e=>setFormMaquina({...formMaquina, edadRetiro: e.target.value})} style={inputStyle} /></div>
                </div>

                <button onClick={calcularInteresCompuesto} style={{...actionBtnStyle, background: '#6610f2', marginTop: '10px'}}><FaHourglassHalf /> Proyectar mi Futuro</button>

                {resultadoMaquina && (
                    <div style={{...resultBoxStyle, borderColor: '#6610f2', background: '#f8f4ff', marginTop: '30px'}}>
                        <h3 style={{textAlign: 'center', color: '#6610f2', margin: '0 0 5px 0'}}>Resumen a tus {formMaquina.edadRetiro} años</h3>
                        <div style={{textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '15px', border: '2px solid #e0cffc', margin: '15px 0'}}>
                            <p style={{margin: 0, fontSize: '14px', color: '#747d8c', fontWeight: 'bold'}}>Capital Total Acumulado</p>
                            <h1 style={{fontSize:'45px', margin: '5px 0', color: '#6610f2'}}>${Math.round(resultadoMaquina.futuro).toLocaleString()}</h1>
                            <p style={{margin: 0, fontSize: '13px', color: '#28a745'}}>+ ${Math.round(resultadoMaquina.interesGanado).toLocaleString()} de intereses regalados.</p>
                        </div>
                        <div style={{background: '#6610f2', padding: '20px', borderRadius: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <FaPiggyBank style={{fontSize: '40px', opacity: 0.8}} />
                            <div>
                                <p style={{margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9}}>Pensión Vitalicia (Regla 4%)</p>
                                <h2 style={{margin: '5px 0', fontSize: '28px'}}>${Math.round(resultadoMaquina.pensionMensual).toLocaleString()} <span style={{fontSize:'16px', fontWeight:'normal'}}>/ mes</span></h2>
                                <p style={{margin: 0, fontSize: '12px', opacity: 0.8}}>Dinero mensual que te pagará tu fondo, sin acabarse.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderRetos = () => {
        return (
            <div style={formContainerStyle}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FaGamepad style={{ fontSize: '40px', color: '#e83e8c', marginBottom: '10px' }}/>
                    <h2 style={{ margin: '0 0 10px 0', color: '#e83e8c' }}>Micro-Retos</h2>
                    <p style={{ margin: 0, color: '#747d8c', fontSize: '14px' }}>Divide caprichos grandes en "pagos chiquitos" sin afectar tu presupuesto.</p>
                </div>
                
                <label style={labelStyle}>¿Qué quieres comprar o hacer?</label>
                <input type="text" placeholder="Ej. Zapatos, Concierto" value={formReto.nombre} onChange={e=>setFormReto({...formReto, nombre: e.target.value})} style={inputStyle} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>Precio Total ($)</label>
                        <input type="number" min="0" value={formReto.monto} onChange={e=>setFormReto({...formReto, monto: e.target.value})} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{...labelStyle, color: '#e83e8c'}}>¿En cuántas semanas? (Opcional)</label>
                        <input type="number" min="1" placeholder="Auto" value={formReto.semanasManual} onChange={e=>setFormReto({...formReto, semanasManual: e.target.value})} style={{...inputStyle, borderColor: formReto.semanasManual ? '#e83e8c' : '#dfe6e9'}} />
                    </div>
                </div>

                <button onClick={generarReto} style={{...actionBtnStyle, background: '#e83e8c', marginTop: '10px'}}><FaMagic /> Crear Reto Semanal</button>

                {resultadoReto && (
                    <div style={{...resultBoxStyle, borderColor: resultadoReto.tipo === 'manual_peligro' ? '#dc3545' : '#e83e8c', background: resultadoReto.tipo === 'manual_peligro' ? '#ffebee' : '#fce3ed', marginTop: '30px'}}>
                        
                        {resultadoReto.tipo === 'manual_peligro' && (
                            <>
                                <h3 style={{margin: '0 0 10px 0', color: '#dc3545'}}><FaExclamationTriangle /> ¡Reto muy agresivo!</h3>
                                <p style={{color: '#2f3542', fontSize: '15px', lineHeight: '1.5'}}>Lograrlo en {resultadoReto.semanas} semanas requiere guardar <b>${resultadoReto.semanal.toFixed(2)}</b> a la semana. Esto supera tu límite de diversión sano (${resultadoReto.limiteSano.toFixed(2)}).</p>
                            </>
                        )}
                        
                        {(resultadoReto.tipo === 'manual_sano' || resultadoReto.tipo === 'ideal') && (
                            <>
                                <h3 style={{margin: '0 0 10px 0', color: '#e83e8c'}}>🎯 ¡Súper viable en {resultadoReto.semanas} semanas!</h3>
                                <p style={{color: '#2f3542', fontSize: '15px', lineHeight: '1.5'}}>Guarda solo <b>${resultadoReto.semanal.toFixed(2)}</b> a la semana. No afectará tus finanzas vitales.</p>
                            </>
                        )}
                        
                        {resultadoReto.tipo === 'ajustado' && (
                            <>
                                <h3 style={{margin: '0 0 10px 0', color: '#ffc107'}}>⚠️ Reto Ajustado (Salud Financiera)</h3>
                                <p style={{color: '#2f3542', fontSize: '15px', lineHeight: '1.5'}}>Para no asfixiarte, lo extendimos a <b>{resultadoReto.semanas} semanas</b>. Guarda <b>${resultadoReto.semanal.toFixed(2)}</b> a la semana.</p>
                            </>
                        )}

                        <button onClick={() => onAddCajon(`Capricho: ${formReto.nombre}`, resultadoReto.semanal, 'Semanal')} style={{...btnCreateCajon, width: '100%', marginTop: '20px', background: resultadoReto.tipo === 'manual_peligro' ? '#dc3545' : '#e83e8c'}}>
                            <FaPlus /> Crear Cajón de Reto Semanal
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={fullScreenStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={irAtras} style={backBtnStyle}><FaArrowLeft /> Volver</button>
                    <h1 style={{ margin: 0, color: '#2f3542', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaBullseye color="#dc3545" /> Mis Metas y Herramientas</h1>
                </div>
            </div>
            <div style={contentContainer}>
                {vistaActual === 'menu' && renderMenu()}
                {vistaActual === 'inteligente' && renderInteligente()}
                {vistaActual === 'resultadoInteligente' && renderResultadoInteligente()}
                {vistaActual === 'emergencia' && renderEmergencia()}
                {vistaActual === 'negocio' && renderNegocio()}
                {vistaActual === 'maquina' && renderMaquina()}
                {vistaActual === 'retos' && renderRetos()}
            </div>

            {/* 🔴 INVOCAMOS EL TUTORIAL AL FINAL DEL COMPONENTE */}
            <GuiaTutorial 
                seccion="laboratorio_financiero_v1"
                pasos={[
                    {
                        titulo: "Laboratorio Financiero 🔬",
                        contenido: "Este es tu espacio de planeación. Puedes simular negocios, calcular el interés compuesto de tu retiro, y dividir compras grandes en micro-retos.",
                        consejo: "Antes de dar un 'tarjetazo' a meses, usa el Ahorro Inteligente para saber si puedes pagarlo sin asfixiarte."
                    }
                ]}
            />
        </div>
    );
};

// ESTILOS
const fullScreenStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f7f6', zIndex: 3000, overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const headerStyle = { backgroundColor: '#fff', padding: '25px 40px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 3010 };
const backBtnStyle = { padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'8px', backgroundColor: '#f1f2f6', color: '#2f3542', transition: '0.2s' };
const contentContainer = { padding: '40px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', paddingBottom: '50px' };
const toolCard = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e1e5ee', cursor: 'pointer', transition: '0.2s', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' };
const iconBadgeStyle = { width: '55px', height: '55px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '15px' };
const cardTitle = { margin: '0 0 10px 0', fontSize: '18px' };
const cardDesc = { color: '#747d8c', fontSize: '13px', margin: 0, lineHeight: '1.4' };
const formContainerStyle = { backgroundColor: '#fff', padding: '50px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#747d8c', marginBottom: '10px' };
const inputStyle = { width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid #dfe6e9', marginBottom: '25px', outline: 'none', background: '#f8f9fa', fontSize: '16px', boxSizing: 'border-box', fontWeight: 'bold' };
const actionBtnStyle = { width: '100%', color: 'white', border: 'none', borderRadius: '15px', padding: '20px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', background: '#007bff' };
const miniMagicBtn = { background: '#eef3ff', color: '#007bff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const tipBoxSugerencia = { background: '#eef3ff', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #007bff', marginBottom: '20px', color: '#004085' };
const optionCardStyle = { display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '25px', borderRadius: '20px', border: '1px solid #e1e5ee' };
const btnCreateCajon = { background: '#10ac84', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', width: '100%' };
const btnVolverEdit = { width: '100%', background: 'none', border: '2px solid #007bff', color: '#007bff', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };
const selectorBtn = { flex: 1, padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' };
const resultCardStyle = { backgroundColor: '#fcfcfc', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '2px dashed #28a745' };
const resultBoxStyle = { marginTop: '30px', backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '20px', border: '1px solid #e1e5ee' };

export default MetasFullScreen;