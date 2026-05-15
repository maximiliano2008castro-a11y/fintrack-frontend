import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarFullScreen from '../components/CalendarFullScreen'; 
import HistorialFullScreen from '../components/HistorialFullScreen'; 
import MetasFullScreen from '../components/MetasFullScreen'; 
import BienvenidaFullScreen from '../components/BienvenidaFullScreen'; 
import CajaFuerteFullScreen from '../components/CajaFuerteFullScreen'; 
import BovedaFullScreen from '../components/BovedaFullScreen'; 
import GuiaTutorial from '../components/GuiaTutorial'; 
import RetosFullScreen from '../components/RetosFullScreen';

import { 
    FaWallet, FaArrowUp, FaArrowDown, FaSignOutAlt, FaCog, FaBoxOpen, 
    FaShieldAlt, FaCheckCircle, FaExclamationCircle, FaPlus, 
    FaUserEdit, FaTimes, FaCalendarAlt, FaTrash, FaLightbulb,
    FaChevronUp, FaChevronDown, FaExclamationTriangle, FaHistory, FaSave,
    FaBullseye, FaEdit, FaPiggyBank, FaLock, FaSyncAlt, FaGamepad, FaUserTimes
} from 'react-icons/fa';

const Dashboard = () => {
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstTime, setIsFirstTime] = useState(false); 
    const [showTutorial, setShowTutorial] = useState(false); 

    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState(''); 
    const [cicloMaestro, setCicloMaestro] = useState('Mensual');
    const [diaInicioCiclo, setDiaInicioCiclo] = useState('1'); 
    const [ultimaFechaReinicio, setUltimaFechaReinicio] = useState(''); 

    const [saldoActual, setSaldoActual] = useState(0);
    const [ingresos, setIngresos] = useState([]);
    const [cajones, setCajones] = useState({});
    const [ordenCajones, setOrdenCajones] = useState([]); 
    const [pinSeguridad, setPinSeguridad] = useState('');
    
    const [historial, setHistorial] = useState([]); 
    const [eventosCalendario, setEventosCalendario] = useState([]); 
    
    const [boveda, setBoveda] = useState(0); 
    const [cajaFuerte, setCajaFuerte] = useState(0); 

    const hoy = new Date();
    const [mesActual, setMesActual] = useState(hoy.getMonth());
    const [anioActual, setAnioActual] = useState(hoy.getFullYear());

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFullScreenCalendar, setIsFullScreenCalendar] = useState(false);
    const [isHistorialOpen, setIsHistorialOpen] = useState(false); 
    const [isMetasOpen, setIsMetasOpen] = useState(false); 
    const [isEmergenciaOpen, setIsEmergenciaOpen] = useState(false); 
    const [isEditingCajones, setIsEditingCajones] = useState(false);
    
    const [showSobranteAlert, setShowSobranteAlert] = useState(true);
    
    const [expandedCajones, setExpandedCajones] = useState({});
    const toggleCajon = (nombre) => {
        setExpandedCajones(prev => ({ ...prev, [nombre]: !prev[nombre] }));
    };

    const [isBovedaFullScreenOpen, setIsBovedaFullScreenOpen] = useState(false); 
    const [isCajaFuerteFullScreenOpen, setIsCajaFuerteFullScreenOpen] = useState(false); 
    const [isRetosFullScreenOpen, setIsRetosFullScreenOpen] = useState(false);
    
    const [isCorteModalOpen, setIsCorteModalOpen] = useState(false);
    const [cajonesCorte, setCajonesCorte] = useState([]);
    const [ingresoPendienteCorte, setIngresoPendienteCorte] = useState(0);

    const [isEditMontoOpen, setIsEditMontoOpen] = useState(false);
    const [editMontoForm, setEditMontoForm] = useState({ nombre: '', nombreOriginal: '', monto: '', frecuencia: 'Mensual' });
    
    const [isSubCalcOpen, setIsSubCalcOpen] = useState(false);
    const [subGastos, setSubGastos] = useState([{ nombre: '', monto: '', frecuencia: 'Mensual' }]);

    const [isQuickEventOpen, setIsQuickEventOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [eventForm, setEventForm] = useState({ nombre: '', monto: '', tipo: 'gasto', frecuencia: 'Único' });
    const [isImprevistoModalOpen, setIsImprevistoModalOpen] = useState(false);
    const [imprevistoForm, setImprevistoForm] = useState({ nombre: '', monto: '' });
    const [nuevoCajon, setNuevoCajon] = useState({ tipo: 'Fijo', nombre: '', monto: '', frecuencia: 'Mensual', costoTotal: '', ciclos: '' });
    
    const [isReconfigureOpen, setIsReconfigureOpen] = useState(false);
    const [configForm, setConfigForm] = useState({ saldoActual: 0, cicloMaestro: 'Mensual', diaInicioCiclo: '1', ingresos: [] });

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({ nombre: '', correo: '', fechaNacimiento: '', password: '', confirmPassword: '', pin: '', confirmPin: '' });

    const blockInvalidChars = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();
    const isAdmin = (nombre) => ['Gastos Fijos', 'Gastos Variables', 'Deuda'].includes(nombre) || nombre.startsWith('Ahorro');

    const calcularAcople = (monto, frec, ciclo) => {
        if (frec === 'Imprevisto_Pagado') return parseFloat(monto) || 0;
        let m = parseFloat(monto) || 0;
        if (frec === 'Diario') m *= 30; else if (frec === 'Semanal') m *= 4; else if (frec === 'Quincenal') m *= 2; else if (frec === 'Anual') m /= 12;
        if (ciclo === 'Diario') return m / 30; if (ciclo === 'Semanal') return m / 4; if (ciclo === 'Quincenal') return m / 2; return m;
    };

    const validarPasswordSegura = (pass) => {
        if (pass.length < 8) return "Debe tener al menos 8 caracteres.";
        if (!/[A-Z]/.test(pass)) return "Debe incluir al menos una letra MAYÚSCULA.";
        if (!/[a-z]/.test(pass)) return "Debe incluir al menos una letra minúscula.";
        if (!/[0-9]/.test(pass)) return "Debe incluir al menos un número.";
        if (!/[@$!%*?&.,\-_]/.test(pass)) return "Debe incluir al menos un carácter especial (@$!%*?&).";
        return "OK";
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');
        
        if (!token || !userEmail) { navigate('/'); return; }
        setEmail(userEmail);

        const fetchCloudData = async () => {
            try {
                const response = await fetch(`https://fintrack-backend-27ml.onrender.com/api/auth/get-data/${userEmail}`);
                const data = await response.json();

                if (response.ok && data.isConfigured) {
                    const cloudData = data.financialData;
                    setUserName(cloudData.nombre || '');
                    setFechaNacimiento(cloudData.fechaNacimiento || '');
                    setPinSeguridad(cloudData.pinSeguridad || '');
                    
                    const config = cloudData.configGlobal || {};
                    setCicloMaestro(config.cicloMaestro || 'Mensual');
                    setDiaInicioCiclo(config.diaInicioCiclo || '1'); 
                    setUltimaFechaReinicio(config.ultimaFechaReinicio || ''); 
                    setSaldoActual(parseFloat(config.saldoActual) || 0);
                    setBoveda(parseFloat(config.boveda) || 0); 
                    setCajaFuerte(parseFloat(config.cajaFuerte) || 0); 
                    setIngresos(config.ingresos || []);
                    setCajones(config.configuraciones || {});
                    setOrdenCajones(config.ordenCajones || []);
                    
                    setHistorial(cloudData.historial || []);
                    setEventosCalendario(cloudData.agenda || []);
                    
                    setIsFirstTime(false);
                } else {
                    setIsFirstTime(true);
                }
            } catch (error) {
                alert("Error de conexión con la nube. Mostrando datos locales de respaldo.");
                setIsFirstTime(true); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchCloudData();
    }, [navigate]);

    const handleFinalizarBienvenida = async (datos) => {
        setIsLoading(true);
        const financialDataObj = {
            nombre: datos.nombre, fechaNacimiento: datos.fechaNacimiento, pinSeguridad: datos.pin,
            configGlobal: {
                saldoActual: datos.saldo, boveda: 0, cajaFuerte: 0, cicloMaestro: datos.ciclo,
                diaInicioCiclo: datos.diaInicio, ultimaFechaReinicio: '', ingresos: datos.ingresos,
                configuraciones: datos.cajones, ordenCajones: datos.ordenCajones
            },
            historial: [], agenda: []
        };

        try {
            await fetch('https://fintrack-backend-27ml.onrender.com/api/auth/save-data', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, financialData: financialDataObj })
            });
            setUserName(datos.nombre); setFechaNacimiento(datos.fechaNacimiento); setPinSeguridad(datos.pin); 
            setSaldoActual(datos.saldo); setCicloMaestro(datos.ciclo); setDiaInicioCiclo(datos.diaInicio);
            setIngresos(datos.ingresos); setCajones(datos.cajones); setOrdenCajones(datos.ordenCajones);
            setIsFirstTime(false); setShowTutorial(true); 
        } catch (error) {
            alert("No se pudo guardar en la nube. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!email || isFirstTime || isLoading) return;

        const syncToCloud = async () => {
            const financialDataObj = {
                nombre: userName, fechaNacimiento: fechaNacimiento, pinSeguridad: pinSeguridad,
                configGlobal: {
                    saldoActual, boveda, cajaFuerte, cicloMaestro, diaInicioCiclo, 
                    ultimaFechaReinicio, ingresos, configuraciones: cajones, ordenCajones
                },
                historial: historial, agenda: eventosCalendario
            };

            try {
                await fetch('https://fintrack-backend-27ml.onrender.com/api/auth/save-data', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, financialData: financialDataObj })
                });
            } catch (error) {}
        };

        const delaySync = setTimeout(() => { syncToCloud(); }, 1000);
        return () => clearTimeout(delaySync);
    }, [saldoActual, cajones, ordenCajones, boveda, cajaFuerte, historial, eventosCalendario, userName, fechaNacimiento, pinSeguridad, cicloMaestro, diaInicioCiclo, ultimaFechaReinicio, ingresos, email, isFirstTime, isLoading]);

    useEffect(() => {
        if (isLoading || isFirstTime || !cicloMaestro) return;
        const hoyDate = new Date();
        const fechaStringHoy = hoyDate.toDateString(); 
        if (ultimaFechaReinicio === fechaStringHoy) return;

        let tocaCobro = false;
        if (cicloMaestro === 'Semanal') { if (hoyDate.getDay().toString() === diaInicioCiclo.toString()) tocaCobro = true; } 
        else if (cicloMaestro === 'Quincenal') {
            const diaMes = hoyDate.getDate(); const diaInicioInt = parseInt(diaInicioCiclo);
            if (diaMes === diaInicioInt || diaMes === (diaInicioInt + 15 > 30 ? 15 : diaInicioInt + 15)) tocaCobro = true;
        } 
        else if (cicloMaestro === 'Mensual') { if (hoyDate.getDate().toString() === diaInicioCiclo.toString()) tocaCobro = true; }

        if (tocaCobro) {
            const totalIngresoAAgregar = ingresos.reduce((s, i) => s + calcularAcople(i.monto, i.frecuencia, cicloMaestro), 0);
            let nC = { ...cajones }; let nO = [...ordenCajones]; let saldoTemp = saldoActual;

            Object.keys(nC).forEach(key => { 
                if (nC[key].esRetoPagado) nC[key].esRetoPagado = false; 
                if (nC[key].aseguradoEnCiclo) nC[key].aseguradoEnCiclo = false; 
            });

            nO = nO.filter(n => { if (nC[n] && nC[n].frecuencia === 'Imprevisto_Pagado') { delete nC[n]; return false; } return true; });
            setCajones(nC); setOrdenCajones(nO);

            const pendientes = [];
            nO.forEach(n => {
                if (!nC[n] || n === 'Libre') return;
                let saltarLlenado = false;
                if (n.startsWith('Meta:')) {
                    const match = n.match(/\(Total: (\d+(\.\d+)?)\)/);
                    const total = match ? parseFloat(match[1]) : 0;
                    if (total > 0 && (nC[n].acumulado || 0) >= total) saltarLlenado = true;
                } else if (n.startsWith('Reto:')) {
                    const match = n.match(/\((\d+)\s*ciclos\)/);
                    if (match) {
                        const ciclosTotal = parseInt(match[1]);
                        if (Math.floor((nC[n].acumulado || 0) / nC[n].monto) >= ciclosTotal) saltarLlenado = true;
                    }
                }
                if (saltarLlenado) return;

                const meta = calcularAcople(nC[n].monto, nC[n].frecuencia, cicloMaestro);
                let llenado = Math.min(Math.max(0, saldoTemp), meta);
                saldoTemp -= llenado;
                if (llenado > 0) pendientes.push({ nombre: n, llenado, procesado: false });
            });

            setCajonesCorte(pendientes); setIngresoPendienteCorte(totalIngresoAAgregar);
            setIsCorteModalOpen(true); setUltimaFechaReinicio(fechaStringHoy); 
        }
    }, [isLoading, isFirstTime, cicloMaestro, diaInicioCiclo, ultimaFechaReinicio, ingresos, ordenCajones, cajones, saldoActual]);

    const procesarCorteCajon = (index, accion) => {
        const cajon = cajonesCorte[index];
        if (accion === 'gastar') { registrarEnHistorial(`${cajon.nombre} (Corte de Ciclo)`, cajon.llenado, 'gasto', saldoActual, saldoActual - cajon.llenado); setSaldoActual(p => p - cajon.llenado); }
        const nuevos = [...cajonesCorte]; nuevos[index].procesado = true; setCajonesCorte(nuevos);
    };

    const finalizarCorte = () => {
        const montoNuevo = parseFloat(ingresoPendienteCorte) || 0;
        if (montoNuevo > 0) { registrarEnHistorial(`¡Inicio de Ciclo! (${cicloMaestro})`, montoNuevo, 'pago', saldoActual, saldoActual + montoNuevo); setSaldoActual(p => p + montoNuevo); }
        setIsCorteModalOpen(false); alert(`✅ ¡Tus cascadas se han reiniciado con éxito para este nuevo ciclo!`);
    };

    const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('userEmail'); navigate('/'); };

    const handleEliminarCuenta = async () => {
        if (window.confirm("🚨 ADVERTENCIA: Estás a punto de eliminar tu cuenta de forma PERMANENTE. Perderás todas tus metas, cajones y dinero registrado.\n\n¿Deseas continuar?")) {
            const conf = window.prompt("Para confirmar la eliminación, escribe la palabra ELIMINAR en mayúsculas:");
            if (conf === "ELIMINAR") {
                try {
                    await fetch('https://fintrack-backend-27ml.onrender.com/api/auth/delete', {
                        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email })
                    });
                } catch (error) {}
                localStorage.removeItem('token'); localStorage.removeItem('userEmail');
                alert("🗑️ Tu cuenta ha sido eliminada correctamente.");
                navigate('/');
            } else { alert("❌ Cancelado. La palabra no coincide."); }
        }
    };

    const registrarEnHistorial = (nombre, monto, tipo, saldoAnt, saldoNuev) => {
        setHistorial(prev => [{ id: Date.now(), dia: hoy.getDate(), mes: hoy.getMonth(), anio: hoy.getFullYear(), hora: hoy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), nombre, monto: parseFloat(monto), tipo, saldoAnterior: saldoAnt !== undefined ? saldoAnt : null, saldoNuevo: saldoNuev !== undefined ? saldoNuev : null }, ...prev]);
    };
    
    const limpiarHistorial = () => { if (window.confirm("⚠️ ¿Borrar historial?")) setHistorial([]); };

    const borrarCajon = (nombre, llenadoActual = 0, autoRefund = false) => {
        if (isAdmin(nombre) && !nombre.startsWith('Ahorro')) return alert("❌ Los administradores base (Gastos Fijos/Variables/Deuda) no se eliminan.");
        
        if (nombre === 'Fondo de Emergencia') { 
            if (!autoRefund) {
                if (window.prompt(`🔒 Ingresa NIP:`) !== pinSeguridad) return alert('❌ NIP Incorrecto.'); 
                if (!window.confirm(`¿Seguro que quieres eliminar tu Fondo de Emergencia?`)) return;
            }
            if (boveda > 0) {
                let accion = '2'; 
                if (!autoRefund) accion = window.prompt(`Tienes $${boveda.toLocaleString()} acumulados en tu Bóveda.\n\nEscribe '1' si ya te GASTASTE ese dinero (Emergencia real).\nEscribe '2' para regresar el dinero a la cascada.`);
                if (accion === '1') { registrarEnHistorial('Fondo de Emergencia Gastado', boveda, 'gasto', saldoActual, saldoActual); setBoveda(0); } 
                else if (accion === '2') { registrarEnHistorial('Reembolso Fondo Emergencia', boveda, 'pago', saldoActual, saldoActual + boveda); setSaldoActual(p => p + boveda); setBoveda(0); } 
                else return alert('❌ Cancelado.');
            }
            const nC = { ...cajones }; delete nC[nombre]; setCajones(nC);
            setOrdenCajones(prev => prev.filter(n => n !== nombre));
            if(autoRefund) alert("✅ Fondo eliminado. El dinero ha regresado a tu Cascada.");
            return;
        }

        if (window.confirm(`¿Seguro que quieres eliminar "${nombre}"?`)) {
            const acumulado = cajones[nombre]?.acumulado || 0;
            const totalRetenido = llenadoActual + acumulado;
            if (totalRetenido > 0 && cajones[nombre].frecuencia !== 'Imprevisto_Pagado') {
                const txtAcum = acumulado > 0 ? `\n(Tienes $${acumulado.toLocaleString()} congelados en este Reto/Meta)` : '';
                const accion = window.prompt(`Este cajón tiene dinero retenido${txtAcum}.\n\nEscribe '1' si ya GASTASTE este dinero.\nEscribe '2' si cancelas la meta (El dinero volverá a tu bolsillo).`);
                if (accion === '1') { if (llenadoActual > 0) { registrarEnHistorial(`${nombre} (Completado)`, llenadoActual, 'gasto', saldoActual, saldoActual - llenadoActual); setSaldoActual(p => p - llenadoActual); } } 
                else if (accion === '2') { if (acumulado > 0) { registrarEnHistorial(`Cancelación de Reto: ${nombre}`, acumulado, 'pago', saldoActual, saldoActual + acumulado); setSaldoActual(p => p + acumulado); } } 
                else return alert('❌ Cancelado.');
            }
            const nC = { ...cajones }; delete nC[nombre]; setCajones(nC);
            setOrdenCajones(prev => prev.filter(n => n !== nombre));
        }
    };

    const reemplazarAhorroAdmin = (monto, frecuencia) => {
        const p = window.prompt(`🔒 Ingresa NIP para reemplazar tu Ahorro Base por $${monto.toLocaleString()}:`);
        if (p !== pinSeguridad) return alert('❌ NIP Incorrecto.');
        setCajones(prev => ({ ...prev, 'Ahorro': { monto: parseFloat(monto), frecuencia } })); 
        alert('✅ Cajón de Ahorro Base actualizado.'); 
        setIsMetasOpen(false);
    };

    const handleManualReto = (nombre, action) => {
        const cleanName = nombre.replace(/ \(\d+ ciclos\)/, '').replace(/ \(Total: [\d.]+\)/, '').replace('Meta: ', '').replace('Reto: ', '');
        const monto = parseFloat(window.prompt(`¿Cuánto deseas ${action === 'add' ? 'ingresar a' : 'retirar de'} ${cleanName}?`));
        if (!monto || isNaN(monto) || monto <= 0) return;
        
        if (action === 'add') {
            let esExterno = false;
            if (monto > saldoActual) {
                const conf = window.confirm(`❌ No tienes $${monto} en tu saldo físico disponible ($${saldoActual.toLocaleString()}).\n\n¿Tienes este dinero en otra parte (ej. en efectivo o en otra cuenta) y quieres sumarlo a la meta sin afectar tu cascada actual?`);
                if(!conf) return; esExterno = true;
            }
            registrarEnHistorial(esExterno ? `Abono externo a ${cleanName}` : `Abono a ${cleanName}`, monto, esExterno ? 'pago' : 'gasto', saldoActual, esExterno ? saldoActual : saldoActual - monto);
            if (!esExterno) setSaldoActual(p => p - monto);
            setCajones(prev => ({ ...prev, [nombre]: { ...prev[nombre], acumulado: (prev[nombre].acumulado || 0) + monto } }));
        } else {
            const max = cajones[nombre].acumulado || 0;
            if (monto > max) return alert('❌ No tienes tanto dinero acumulado en esta meta.');
            registrarEnHistorial(`Retiro de ${cleanName}`, monto, 'pago', saldoActual, saldoActual + monto);
            setSaldoActual(p => p + monto);
            setCajones(prev => ({ ...prev, [nombre]: { ...prev[nombre], acumulado: (prev[nombre].acumulado || 0) - monto } }));
        }
    };

    const abonarReto = (nombre, llenado) => {
        const title = nombre.startsWith('Meta:') ? 'Ahorro Inteligente' : 'Micro-Reto';
        if (window.confirm(`¿Abonar $${llenado.toLocaleString()} a tu ${title}?\n\nEl dinero se guardará en tu acumulado y este cajón quedará "Asegurado" por el resto del ciclo.`)) {
            registrarEnHistorial(`Abono a ${title}: ${nombre.replace(/ \(\d+ ciclos\)/, '').replace(/ \(Total: [\d.]+\)/, '').replace('Meta: ', '').replace('Reto: ', '')}`, llenado, 'gasto', saldoActual, saldoActual - llenado);
            setSaldoActual(p => p - llenado);
            setCajones(prev => ({ ...prev, [nombre]: { ...prev[nombre], acumulado: (prev[nombre].acumulado || 0) + llenado, esRetoPagado: true } }));
        }
    };

    const completarReto = (nombre) => {
        const acumulado = cajones[nombre]?.acumulado || 0;
        if (window.confirm(`🎉 ¡Lo lograste!\n\n¿Quieres usar tus $${acumulado.toLocaleString()} guardados para comprar esto?`)) {
            registrarEnHistorial(`¡Comprado! (${nombre.replace(/ \(\d+ ciclos\)/, '').replace(/ \(Total: [\d.]+\)/, '').replace('Meta: ', '').replace('Reto: ', '')})`, acumulado, 'gasto', saldoActual, saldoActual);
            const nC = { ...cajones }; delete nC[nombre]; setCajones(nC);
            setOrdenCajones(prev => prev.filter(n => n !== nombre));
        }
    };

    const asegurarFondos = (nombreCajon, montoCajon) => {
        const esEmergencia = nombreCajon === 'Fondo de Emergencia'; const destino = esEmergencia ? 'Bóveda Intocable' : 'Caja Fuerte';
        if (window.confirm(`¿Asegurar $${montoCajon.toLocaleString()} del cajón "${nombreCajon}" en tu ${destino}?`)) {
            const nC = { ...cajones };
            if (!['Gastos Fijos', 'Gastos Variables', 'Ahorro', 'Deuda'].includes(nombreCajon) && !esEmergencia) { 
                delete nC[nombreCajon]; setOrdenCajones(p => p.filter(n => n !== nombreCajon)); 
            } else { nC[nombreCajon] = { ...nC[nombreCajon], aseguradoEnCiclo: true }; }
            setCajones(nC);
            registrarEnHistorial(`Asegurado en ${destino}: ${nombreCajon}`, montoCajon, 'gasto', saldoActual, saldoActual - montoCajon); 
            setSaldoActual(p => p - montoCajon); 
            if (esEmergencia) setBoveda(p => p + montoCajon); else setCajaFuerte(p => p + montoCajon);
        }
    };

    const handleCajaFuerteTransaction = (tipo, monto, esExterno = false) => {
        if (tipo === 'add') { registrarEnHistorial(esExterno ? 'Ingreso Externo a Caja Fuerte' : 'Ingreso a Caja Fuerte', monto, esExterno ? 'pago' : 'gasto', saldoActual, esExterno ? saldoActual : saldoActual - monto); if (!esExterno) setSaldoActual(p => p - monto); setCajaFuerte(p => p + monto); } 
        else if (tipo === 'withdraw') { registrarEnHistorial('Retiro de Caja Fuerte', monto, 'pago', saldoActual, saldoActual + monto); setSaldoActual(p => p + monto); setCajaFuerte(p => p - monto); }
    };

    const handleBovedaTransaction = (tipo, monto, esExterno = false) => {
        if (tipo === 'add') { registrarEnHistorial(esExterno ? 'Blindaje Externo a Bóveda' : 'Blindaje Manual a Bóveda', monto, esExterno ? 'pago' : 'gasto', saldoActual, esExterno ? saldoActual : saldoActual - monto); if (!esExterno) setSaldoActual(p => p - monto); setBoveda(p => p + monto); } 
        else if (tipo === 'withdraw') { registrarEnHistorial('Retiro Crítico de Bóveda', monto, 'pago', saldoActual, saldoActual + monto); setSaldoActual(p => p + monto); setBoveda(p => p - monto); }
    };

    const abrirBoveda = () => { 
        setIsProfileOpen(false); 
        if (!cajones['Fondo de Emergencia'] && boveda === 0) return alert('⚠️ Aún no tienes Fondo de Emergencia configurado en tus Metas.'); 
        if (window.prompt('🔒 Ingresa NIP para abrir la Bóveda:') === pinSeguridad) setIsBovedaFullScreenOpen(true); 
        else alert('❌ NIP Incorrecto.'); 
    };

    const abrirCajaFuerte = () => { 
        setIsProfileOpen(false); 
        if (window.prompt('🔒 Ingresa NIP para abrir Caja Fuerte:') === pinSeguridad) setIsCajaFuerteFullScreenOpen(true); 
        else alert('❌ NIP Incorrecto.'); 
    };

    const checkEventosDia = (dia) => {
        if (!dia) return { tienePago: false, tieneGasto: false };
        const fechaVista = new Date(anioActual, mesActual, dia);
        const planificados = eventosCalendario.filter(ev => {
            const mC = ev.mesCreacion !== undefined ? ev.mesCreacion : mesActual; const aC = ev.anioCreacion !== undefined ? ev.anioCreacion : anioActual; const fechaOrigen = new Date(aC, mC, ev.dia);
            if (fechaVista < fechaOrigen) return false;
            if (ev.frecuencia === 'Único') return fechaVista.toDateString() === fechaOrigen.toDateString();
            if (ev.frecuencia === 'Semanal') return fechaVista.getDay() === fechaOrigen.getDay();
            if (ev.frecuencia === 'Mensual') return fechaVista.getDate() === ev.dia;
            if (ev.frecuencia === 'Anual') return fechaVista.getDate() === ev.dia && fechaVista.getMonth() === mC;
            return false;
        });
        const reales = historial.filter(h => h.dia === dia && h.mes === mesActual && h.anio === anioActual);
        return { tienePago: planificados.some(e => e.tipo === 'pago') || reales.some(r => r.tipo === 'pago'), tieneGasto: planificados.some(e => e.tipo === 'gasto') || reales.some(r => r.tipo === 'gasto') };
    };

    const handleDayClick = (dia) => { if (!dia) return; setSelectedDay(dia); setIsEditing(false); setIsQuickEventOpen(true); };
    const handleEditEvent = (ev) => { setEventForm({ nombre: ev.nombre, monto: ev.monto, tipo: ev.tipo, frecuencia: ev.frecuencia }); setSelectedDay(ev.dia); setEditingId(ev.id); setIsEditing(true); setIsQuickEventOpen(true); };
    const cerrarModalEvento = () => { setIsQuickEventOpen(false); setIsEditing(false); setEditingId(null); setEventForm({ nombre: '', monto: '', tipo: 'gasto', frecuencia: 'Único' }); };
    
    const guardarEvento = () => { if (!eventForm.nombre || !eventForm.monto) return alert("Llena los campos."); setEventosCalendario(isEditing ? eventosCalendario.map(e => e.id === editingId ? { ...e, ...eventForm, monto: parseFloat(eventForm.monto) } : e) : [...eventosCalendario, { id: Date.now(), dia: selectedDay, ...eventForm, monto: parseFloat(eventForm.monto), mesCreacion: mesActual, anioCreacion: anioActual }]); cerrarModalEvento(); };
    
    const eliminarEventoTotal = () => { 
        const ev = eventosCalendario.find(e => e.id === editingId); if (!ev) return;
        const accion = window.prompt(`¿Qué deseas hacer con la alerta "${ev.nombre}"?\n\nEscribe '1' si ya se PAGÓ/COBRÓ (Afectará tu saldo y guardará en historial).\nEscribe '2' para solo borrar la alerta sin tocar tu dinero.`);
        if (accion === '1') {
            if (ev.tipo === 'gasto') { if (ev.monto > saldoActual) return alert('❌ No tienes saldo físico suficiente para este gasto.'); registrarEnHistorial(`${ev.nombre}`, ev.monto, 'gasto', saldoActual, saldoActual - ev.monto); setSaldoActual(p => p - ev.monto); } 
            else { registrarEnHistorial(`${ev.nombre}`, ev.monto, 'pago', saldoActual, saldoActual + ev.monto); setSaldoActual(p => p + ev.monto); }
            setEventosCalendario(eventosCalendario.filter(e => e.id !== editingId)); cerrarModalEvento();
        } else if (accion === '2') { setEventosCalendario(eventosCalendario.filter(e => e.id !== editingId)); cerrarModalEvento(); } 
        else { alert('❌ Cancelado.'); }
    };
    
    const handleSaveEventFromCalendar = (nuevoEvento) => { setEventosCalendario([...eventosCalendario, { id: Date.now(), ...nuevoEvento, mesCreacion: mesActual, anioCreacion: anioActual }]); };
    const handleDeleteEventFromCalendar = (id) => { if (window.confirm("¿Eliminar alerta?")) setEventosCalendario(eventosCalendario.filter(e => e.id !== id)); };

    const handleGuardarNuevoCajon = () => {
        if (nuevoCajon.tipo === 'Fijo') {
            if (!nuevoCajon.nombre || !nuevoCajon.monto) return alert('Llena todos los campos.');
            setCajones(prev => ({ ...prev, [nuevoCajon.nombre]: { monto: parseFloat(nuevoCajon.monto), frecuencia: nuevoCajon.frecuencia, acumulado: 0, esRetoPagado: false } }));
            setOrdenCajones(prev => [...prev, nuevoCajon.nombre]); 
            setIsAddModalOpen(false); 
            setNuevoCajon({ tipo: 'Fijo', nombre: '', monto: '', frecuencia: 'Mensual', costoTotal: '', ciclos: '' });
        }
    };

    const crearReto = (nom, cuotaReal, numCiclos) => {
        if (!nom) return alert('Ponle nombre a tu reto.');
        const fullName = `Reto: ${nom} (${numCiclos} ciclos)`;
        setCajones(prev => ({ ...prev, [fullName]: { monto: parseFloat(cuotaReal), frecuencia: cicloMaestro, acumulado: 0, esRetoPagado: false } }));
        setOrdenCajones(prev => [...prev, fullName]); 
        setIsAddModalOpen(false); 
        setNuevoCajon({ tipo: 'Fijo', nombre: '', monto: '', frecuencia: 'Mensual', costoTotal: '', ciclos: '' });
    };

    const handleGuardarImprevisto = () => {
        const montoImprevisto = parseFloat(imprevistoForm.monto);
        if (!imprevistoForm.nombre || isNaN(montoImprevisto) || montoImprevisto <= 0) return alert('Llena los campos correctamente.');
        if (montoImprevisto > saldoActual) return alert('❌ No tienes suficiente dinero físico para cubrir este imprevisto.');
        const nombreImp = `🚨 Imprevisto: ${imprevistoForm.nombre}`;
        registrarEnHistorial(nombreImp, montoImprevisto, 'gasto', saldoActual, saldoActual - montoImprevisto); setSaldoActual(p => p - montoImprevisto);
        setCajones(prev => ({ ...prev, [nombreImp]: { monto: montoImprevisto, frecuencia: 'Imprevisto_Pagado' } })); setOrdenCajones(prev => [nombreImp, ...prev]);
        setIsImprevistoModalOpen(false); setImprevistoForm({ nombre: '', monto: '' });
    };

    const agregarCajonDesdeMetas = (nombre, monto, frecuencia, metaTotal = 0) => {
        if (cajones[nombre]) return alert(`❌ Ya tienes activo el cajón "${nombre}". Si quieres reconfigurarlo, elimínalo primero de tu Cascada.`);
        setCajones(prev => ({ ...prev, [nombre]: { monto, frecuencia, acumulado: 0, esRetoPagado: false, metaTotal } }));
        setOrdenCajones(prev => { if (!prev.includes(nombre)) return [...prev, nombre]; return prev; }); 
        setIsMetasOpen(false); setIsEmergenciaOpen(false);
    };

    const moverCajonArribaAbajo = (index, direccion) => {
        const nuevoOrden = [...ordenCajones]; const swapIndex = direccion === 'up' ? index - 1 : index + 1;
        if (swapIndex >= 0 && swapIndex < nuevoOrden.length) {
            if (nuevoOrden[index] === 'Deuda' || nuevoOrden[swapIndex] === 'Deuda') return;
            if (isAdmin(nuevoOrden[index]) === isAdmin(nuevoOrden[swapIndex])) { [nuevoOrden[index], nuevoOrden[swapIndex]] = [nuevoOrden[swapIndex], nuevoOrden[index]]; setOrdenCajones(nuevoOrden); }
        }
    };

    const abrirEdicionMonto = (nombreCajon) => {
        if (isAdmin(nombreCajon) && !nombreCajon.startsWith('Ahorro')) { if (window.prompt(`🔒 NIP requerido para editar admin:`) !== pinSeguridad) return alert('❌ NIP Incorrecto.'); }
        setEditMontoForm({ nombre: nombreCajon, nombreOriginal: nombreCajon, monto: cajones[nombreCajon].monto, frecuencia: cajones[nombreCajon].frecuencia }); 
        setSubGastos([{ nombre: '', monto: '', frecuencia: 'Mensual' }]);
        setIsEditMontoOpen(true);
    };

    const handleSubGastoChange = (index, field, value) => { const nuevos = [...subGastos]; nuevos[index][field] = value; setSubGastos(nuevos); };
    const addSubGasto = () => setSubGastos([...subGastos, { nombre: '', monto: '', frecuencia: 'Mensual' }]);
    const removeSubGasto = (index) => setSubGastos(subGastos.filter((_, i) => i !== index));

    const aplicarSubGastos = () => {
        let total = 0;
        subGastos.forEach(sub => { if (sub.monto) total += calcularAcople(sub.monto, sub.frecuencia, editMontoForm.frecuencia); });
        setEditMontoForm({ ...editMontoForm, monto: total.toFixed(2) });
    };

    const guardarEdicionMonto = () => {
        if (!editMontoForm.monto || parseFloat(editMontoForm.monto) <= 0) return alert("Monto inválido.");
        let nuevoNombre = editMontoForm.nombre.trim(); const nombreViejo = editMontoForm.nombreOriginal;
        if (nombreViejo.startsWith('Ahorro')) { if (!nuevoNombre.toLowerCase().includes('ahorro')) nuevoNombre = 'Ahorro ' + nuevoNombre; }
        if (nuevoNombre !== nombreViejo) {
            if (cajones[nuevoNombre]) return alert('❌ Ya existe un cajón con ese nombre.');
            const nC = { ...cajones }; nC[nuevoNombre] = { ...nC[nombreViejo], monto: parseFloat(editMontoForm.monto), frecuencia: editMontoForm.frecuencia }; delete nC[nombreViejo];
            setCajones(nC); const nO = [...ordenCajones]; const idx = nO.indexOf(nombreViejo); if (idx !== -1) nO[idx] = nuevoNombre; setOrdenCajones(nO);
        } else {
            setCajones(prev => ({ ...prev, [nuevoNombre]: { ...prev[nuevoNombre], monto: parseFloat(editMontoForm.monto), frecuencia: editMontoForm.frecuencia } }));
        }
        setIsEditMontoOpen(false);
    };

    const abrirReconfiguracion = () => { setConfigForm({ saldoActual: saldoActual, cicloMaestro: cicloMaestro, diaInicioCiclo: diaInicioCiclo, ingresos: JSON.parse(JSON.stringify(ingresos)) }); setIsProfileOpen(false); setIsReconfigureOpen(true); };
    
    const handleGuardarReconfiguracion = () => {
        if (configForm.ingresos.length === 0 || configForm.ingresos.some(i => !i.monto)) return alert("Ingresos inválidos.");
        setSaldoActual(parseFloat(configForm.saldoActual)); setCicloMaestro(configForm.cicloMaestro); setDiaInicioCiclo(configForm.diaInicioCiclo); setIngresos(configForm.ingresos); setIsReconfigureOpen(false);
    };
    
    const handleAddIngreso = () => setConfigForm({ ...configForm, ingresos: [...configForm.ingresos, { monto: '', frecuencia: 'Mensual' }] });
    const handleRemoveIngreso = (index) => setConfigForm({ ...configForm, ingresos: configForm.ingresos.filter((_, i) => i !== index) });
    const handleIngresoChange = (index, field, value) => { const nI = [...configForm.ingresos]; nI[index][field] = value; setConfigForm({ ...configForm, ingresos: nI }); };

    const handleAddMoney = () => { const motivo = window.prompt('💰 Motivo del ingreso:'); if (!motivo) return; const m = window.prompt('¿Cuánto entró?'); const montoIngresado = parseFloat(m); if (m && !isNaN(m) && montoIngresado > 0) { registrarEnHistorial(motivo, montoIngresado, 'pago', saldoActual, saldoActual + montoIngresado); setSaldoActual(p => p + montoIngresado); } };
    const handleRemoveMoney = () => {
        const motivo = window.prompt('💸 Gasto:'); if (!motivo) return; const m = window.prompt('¿Cuánto costó?'); const montoGastado = parseFloat(m);
        if (m && !isNaN(m) && montoGastado > 0) {
            if (montoGastado > saldoActual) return alert('❌ No tienes liquidez.');
            if (window.prompt('🔒 Confirma NIP:') === pinSeguridad) { registrarEnHistorial(motivo, montoGastado, 'gasto', saldoActual, saldoActual - montoGastado); setSaldoActual(p => p - montoGastado); } else { alert('❌ NIP Incorrecto.'); }
        }
    };

    const abrirEditarPerfil = () => { setProfileForm({ nombre: userName, correo: email, fechaNacimiento: fechaNacimiento, password: '', confirmPassword: '', pin: '', confirmPin: '' }); setIsProfileOpen(false); setIsEditProfileOpen(true); };
    
    const handleGuardarPerfil = () => {
        if (!profileForm.nombre) return alert("❌ Nombre vacío."); 
        if (profileForm.password) {
            const estadoPassword = validarPasswordSegura(profileForm.password);
            if (estadoPassword !== "OK") return alert(`🛡️ Contraseña insegura:\n${estadoPassword}`);
            if (profileForm.password !== profileForm.confirmPassword) return alert("❌ Las contraseñas no coinciden.");
        }
        if (profileForm.pin && (profileForm.pin.length !== 4 || profileForm.pin !== profileForm.confirmPin)) return alert("❌ NIP inválido.");
        setUserName(profileForm.nombre); if (profileForm.fechaNacimiento) setFechaNacimiento(profileForm.fechaNacimiento); if (profileForm.pin) setPinSeguridad(profileForm.pin);
        setIsEditProfileOpen(false); alert("✅ Perfil actualizado. Se sincronizará automáticamente con la nube.");
    };

    const ingresosMensuales = ingresos.reduce((s, i) => s + calcularAcople(i.monto, i.frecuencia, 'Mensual'), 0);
    const totalIngresosCiclo = ingresos.reduce((s, i) => s + calcularAcople(i.monto, i.frecuencia, cicloMaestro), 0);
    const totalAsignadoBase = Object.values(cajones).reduce((s, c) => s + calcularAcople(c.monto, c.frecuencia, cicloMaestro), 0);
    
    let saldoRestante = saldoActual;
    const estadoCajones = [];
    
    ordenCajones.forEach(n => {
        if (!cajones[n] || n === 'Libre') return; 
        const meta = calcularAcople(cajones[n].monto, cajones[n].frecuencia, cicloMaestro);
        if (cajones[n].frecuencia === 'Imprevisto_Pagado') { 
            estadoCajones.push({ nombre: n, meta: meta, llenado: meta, porcentaje: 100, esSobrante: false, completado: false }); 
        } 
        else { 
            let llenado = 0; let porcentaje = 100; let estaCompletadoTotalmente = false;
            if (n.startsWith('Meta:')) { const match = n.match(/\(Total: (\d+(\.\d+)?)\)/); const total = match ? parseFloat(match[1]) : 0; if (total > 0 && (cajones[n].acumulado || 0) >= total) estaCompletadoTotalmente = true; } 
            else if (n.startsWith('Reto:')) { const match = n.match(/\((\d+)\s*ciclos\)/); if (match) { const ciclosTotal = parseInt(match[1]); if (Math.floor((cajones[n].acumulado || 0) / cajones[n].monto) >= ciclosTotal) estaCompletadoTotalmente = true; } } 
            else if (n === 'Fondo de Emergencia') { if (cajones[n].metaTotal > 0 && boveda >= cajones[n].metaTotal) estaCompletadoTotalmente = true; }

            if (estaCompletadoTotalmente) { estadoCajones.push({ nombre: n, meta, llenado: 0, porcentaje: 100, esSobrante: false, completado: true }); } 
            else {
                if (!cajones[n].esRetoPagado && !cajones[n].aseguradoEnCiclo) { llenado = Math.min(Math.max(0, saldoRestante), meta); saldoRestante -= llenado; porcentaje = meta > 0 ? Math.min((llenado / meta) * 100, 100) : 100; }
                estadoCajones.push({ nombre: n, meta, llenado, porcentaje: porcentaje, esSobrante: false, completado: false }); 
            }
        }
    });

    const metaLibre = cajones['Libre'] ? calcularAcople(cajones['Libre'].monto, cajones['Libre'].frecuencia, cicloMaestro) : 0;
    estadoCajones.push({ nombre: 'Libre', meta: metaLibre, llenado: Math.max(0, saldoRestante), porcentaje: metaLibre > 0 ? Math.min((Math.max(0, saldoRestante) / metaLibre) * 100, 100) : 100, esSobrante: true });
    
    const disponibleLibre = estadoCajones.find(c => c.nombre === 'Libre')?.llenado || 0;
    const sobranteCiclo = totalIngresosCiclo - totalAsignadoBase;

    const totalAcumuladoRetos = Object.keys(cajones).reduce((acc, key) => {
        if (key.startsWith('Reto:') || key.includes('Capricho:')) return acc + (cajones[key].acumulado || 0);
        return acc;
    }, 0);

    if (isLoading) return <div style={{height: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 style={{color: '#3b82f6'}}>Sincronizando con TiDB... ☁️</h2></div>;
    if (isFirstTime) return <div className="app-wrapper" style={appWrapperStyle}><BienvenidaFullScreen onFinish={handleFinalizarBienvenida} /></div>;

    return (
        <div className="app-wrapper" style={appWrapperStyle}>
            <style>{`
                @media (max-width: 768px) {
                    .app-wrapper { flex-direction: column !important; }
                    .sidebar { position: relative !important; width: 100% !important; height: auto !important; order: 2 !important; border-right: none !important; border-top: 1px solid #334155 !important; padding: 20px !important; overflow-y: visible !important; }
                    .main-content { margin-left: 0 !important; padding: 20px !important; order: 1 !important; }
                    .btn-group { flex-direction: column !important; gap: 10px !important; }
                    .stats-grid { grid-template-columns: 1fr !important; gap: 15px !important; margin-bottom: 25px !important; }
                    .modal-center { width: 90% !important; padding: 25px !important; }
                    .profile-sidebar { width: 100% !important; padding: 25px !important; }
                    .text-huge { font-size: 40px !important; }
                    .text-title { font-size: 24px !important; }
                    .hide-mobile { display: none !important; }
                    .flex-col-mobile { flex-direction: column !important; align-items: stretch !important; gap: 10px; }
                    .cajon-header-mobile { flex-direction: column !important; align-items: flex-start !important; }
                }
                /* Animaciones Neón Básicas */
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
                    100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
                }
            `}</style>

            {isCorteModalOpen && (
                <div style={{...overlayStyle, zIndex: 9999}}>
                    <div className="modal-center" style={{...modalCenterStyle, width: '450px', maxHeight: '85vh', overflowY: 'auto', zIndex: 10000}}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <FaSyncAlt style={{ fontSize: '40px', color: '#3b82f6', marginBottom: '10px' }} />
                            <h2 style={{ margin: '0 0 10px 0', color: '#f1f5f9' }}>¡Nuevo Ciclo!</h2>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                                {cajonesCorte.length > 0 ? "Primero, hagamos cuentas de los cajones que quedaron con dinero." : "Es momento de iniciar tu nueva cascada."}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {cajonesCorte.map((c, i) => {
                                if (c.procesado) return null;
                                return (
                                    <div key={i} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #334155', background: '#1e293b' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><b style={{ color: '#f1f5f9' }}>{c.nombre}</b><b style={{ color: '#3b82f6' }}>${c.llenado.toLocaleString()}</b></div>
                                        <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => procesarCorteCajon(i, 'gastar')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>💸 Ya lo pagué</button>
                                            <button onClick={() => procesarCorteCajon(i, 'sobrante')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #10ac84', background: 'rgba(16, 172, 132, 0.1)', color: '#10ac84', fontWeight: 'bold', cursor: 'pointer' }}>🔄 No lo gasté</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {cajonesCorte.every(c => c.procesado) && (
                            <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease-in' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '15px', textAlign: 'center', marginBottom: '15px', border: '1px solid #3b82f6' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>¿Con cuánto dinero inicias este ciclo?</h4>
                                    <div style={{position: 'relative'}}>
                                        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#3b82f6' }}>$</span>
                                        <input type="number" min="0" onKeyDown={blockInvalidChars} value={ingresoPendienteCorte} onChange={(e) => setIngresoPendienteCorte(e.target.value)} style={{...inputModalStyle, paddingLeft: '35px', margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', borderColor: '#3b82f6'}} />
                                    </div>
                                </div>
                                <button onClick={finalizarCorte} style={{ ...btnMainAdd, background: '#3b82f6', width: '100%' }}>Iniciar Ciclo con ${parseFloat(ingresoPendienteCorte || 0).toLocaleString()}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(isProfileOpen || isAddModalOpen || isImprevistoModalOpen || isQuickEventOpen || isReconfigureOpen || isEditProfileOpen || isEditMontoOpen) && !isCorteModalOpen && (
                <div style={overlayStyle} onClick={() => { setIsProfileOpen(false); setIsAddModalOpen(false); setIsImprevistoModalOpen(false); setIsReconfigureOpen(false); setIsEditProfileOpen(false); setIsEditMontoOpen(false); cerrarModalEvento(); }}></div>
            )}

            {isEditMontoOpen && (
                <div className="modal-center" style={{ ...modalCenterStyle, width: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '18px' }}>Editar <span style={{color: '#3b82f6'}}>{editMontoForm.nombreOriginal}</span></h3>
                        <FaTimes onClick={() => setIsEditMontoOpen(false)} style={{ cursor: 'pointer', fontSize: '20px', color: '#64748b' }} />
                    </div>
                    
                    {editMontoForm.nombreOriginal.startsWith('Ahorro') && (
                        <>
                            <label style={labelModalStyle}>Nombre del Cajón</label>
                            <input type="text" value={editMontoForm.nombre} onChange={(e) => setEditMontoForm({...editMontoForm, nombre: e.target.value})} style={inputModalStyle} />
                        </>
                    )}

                    <label style={labelModalStyle}>Frecuencia (Plazo de la meta)</label>
                    <select value={editMontoForm.frecuencia} onChange={(e) => setEditMontoForm({...editMontoForm, frecuencia: e.target.value})} disabled={editMontoForm.nombreOriginal.startsWith('Meta:') || editMontoForm.nombreOriginal.startsWith('Reto:')} style={{...inputModalStyle, backgroundColor: (editMontoForm.nombreOriginal.startsWith('Meta:') || editMontoForm.nombreOriginal.startsWith('Reto:')) ? '#1e293b' : '#0b0f19', cursor: (editMontoForm.nombreOriginal.startsWith('Meta:') || editMontoForm.nombreOriginal.startsWith('Reto:')) ? 'not-allowed' : 'pointer'}}>
                        <option>Único</option><option>Diario</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option><option>Anual</option>
                    </select>

                    <label style={labelModalStyle}>Monto Total de la Meta</label>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <span style={{ position: 'absolute', left: '15px', top: '15px', fontWeight: 'bold', color: '#10ac84' }}>$</span>
                        <input type="number" min="0" onKeyDown={blockInvalidChars} value={editMontoForm.monto} onChange={(e) => setEditMontoForm({...editMontoForm, monto: e.target.value})} style={{ ...inputModalStyle, paddingLeft: '35px', margin: 0, fontSize: '18px', fontWeight: 'bold' }} />
                    </div>

                    {(editMontoForm.nombreOriginal === 'Gastos Fijos' || editMontoForm.nombreOriginal === 'Gastos Variables') && (
                        <div style={{ borderTop: '1px dashed #334155', marginTop: '10px', paddingTop: '20px' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#3b82f6', fontSize: '14px' }}>Conversión a {editMontoForm.frecuencia}</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {subGastos.map((sub, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input type="text" placeholder="Ej. Luz" value={sub.nombre} onChange={(e) => handleSubGastoChange(i, 'nombre', e.target.value)} style={{...inputModalStyle, flex: 2, margin: 0, padding: '10px', fontSize: '14px', background: '#0b0f19', border: '1px solid #334155'}} />
                                        <div style={{position: 'relative', flex: 1.5}}>
                                            <span style={{position: 'absolute', left: '10px', top: '10px', fontSize: '14px', color: '#64748b'}}>$</span>
                                            <input type="number" min="0" onKeyDown={blockInvalidChars} value={sub.monto} onChange={(e) => handleSubGastoChange(i, 'monto', e.target.value)} style={{...inputModalStyle, width: '100%', margin: 0, padding: '10px 10px 10px 25px', fontSize: '14px', background: '#0b0f19', border: '1px solid #334155'}} />
                                        </div>
                                        <select value={sub.frecuencia} onChange={(e) => handleSubGastoChange(i, 'frecuencia', e.target.value)} style={{...inputModalStyle, flex: 1.5, margin: 0, padding: '10px', fontSize: '14px', background: '#0b0f19', border: '1px solid #334155'}}>
                                            <option value="Diario">Día</option><option value="Semanal">Semana</option><option value="Quincenal">Quincena</option><option value="Mensual">Mes</option><option value="Anual">Año</option>
                                        </select>
                                        {subGastos.length > 1 && <FaTimes onClick={() => removeSubGasto(i)} style={{ color: '#64748b', cursor: 'pointer', flexShrink: 0, padding: '5px', fontSize: '18px' }} />}
                                    </div>
                                ))}
                                <span onClick={addSubGasto} style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '5px', display: 'inline-block' }}>+ Añadir fila</span>
                                <button onClick={aplicarSubGastos} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '10px', width: '100%' }}>Aplicar Total</button>
                            </div>
                        </div>
                    )}

                    {editMontoForm.nombreOriginal !== 'Gastos Fijos' && editMontoForm.nombreOriginal !== 'Gastos Variables' && (
                         <button onClick={guardarEdicionMonto} style={{ ...btnMainAdd, width: '100%', marginTop: '20px' }}><FaSave /> Actualizar Cajón</button>
                    )}
                    {(editMontoForm.nombreOriginal === 'Gastos Fijos' || editMontoForm.nombreOriginal === 'Gastos Variables') && (
                         <button onClick={guardarEdicionMonto} style={{ ...btnMainAdd, background: '#10ac84', width: '100%', marginTop: '10px' }}><FaSave /> Guardar Cambios</button>
                    )}
                </div>
            )}

            {isEditProfileOpen && (
                <div className="modal-center" style={{...modalCenterStyle, width: '420px', maxHeight: '90vh', overflowY: 'auto'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h3 style={{ margin: 0, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}><FaUserEdit /> Editar Perfil</h3><FaTimes onClick={() => setIsEditProfileOpen(false)} style={{ cursor: 'pointer', fontSize: '20px', color: '#64748b' }} /></div>
                    <label style={labelModalStyle}>Nombre</label><input type="text" value={profileForm.nombre} onChange={(e) => setProfileForm({...profileForm, nombre: e.target.value})} style={inputModalStyle} />
                    <label style={labelModalStyle}>Correo</label><input type="email" value={profileForm.correo} disabled style={{...inputModalStyle, backgroundColor:'#1e293b', color:'#94a3b8', cursor:'not-allowed'}} />
                    <label style={labelModalStyle}>Fecha de Nacimiento</label><input type="date" value={profileForm.fechaNacimiento} onChange={(e) => setProfileForm({...profileForm, fechaNacimiento: e.target.value})} style={inputModalStyle} />
                    <div style={{ padding: '15px', background: '#1e293b', borderRadius: '15px', border: '1px solid #334155', marginBottom: '20px', marginTop: '10px' }}>
                        <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#94a3b8' }}>Deja en blanco si no deseas cambiar contraseña o NIP.</p>
                        <label style={labelModalStyle}>Nueva Contraseña</label><input type="password" value={profileForm.password} onChange={(e) => setProfileForm({...profileForm, password: e.target.value})} style={{...inputModalStyle, marginBottom: profileForm.password ? '10px' : '15px'}} />
                        {profileForm.password && ( <><div style={{fontSize:'11px', color:'#94a3b8', marginBottom:'10px'}}>Requiere: Mín. 8 caracteres, 1 MAYÚSCULA, 1 minúscula, 1 número, 1 símbolo.</div><label style={{...labelModalStyle, color: '#3b82f6'}}>Confirmar Contraseña</label><input type="password" value={profileForm.confirmPassword} onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})} style={{...inputModalStyle, border: '1px solid #3b82f6'}} /></> )}
                        <label style={labelModalStyle}>Nuevo NIP (4 dígitos)</label><input type="password" maxLength="4" value={profileForm.pin} onChange={(e) => setProfileForm({...profileForm, pin: e.target.value.replace(/[^0-9]/g, '')})} style={{...inputModalStyle, letterSpacing: '8px', textAlign: 'center', marginBottom: profileForm.pin ? '10px' : '0'}} />
                        {profileForm.pin && ( <><label style={{...labelModalStyle, color: '#3b82f6'}}>Confirmar NIP</label><input type="password" maxLength="4" value={profileForm.confirmPin} onChange={(e) => setProfileForm({...profileForm, confirmPin: e.target.value.replace(/[^0-9]/g, '')})} style={{...inputModalStyle, letterSpacing: '8px', textAlign: 'center', border: '1px solid #3b82f6', margin: 0}} /></> )}
                    </div>
                    <button onClick={handleGuardarPerfil} style={{ ...btnMainAdd, width: '100%' }}><FaSave /> Guardar Cambios</button>
                </div>
            )}

            {isReconfigureOpen && (
                <div className="modal-center" style={{...modalCenterStyle, width: '450px', maxHeight: '90vh', overflowY: 'auto'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}><FaCog /> Reconfigurar Finanzas</h3>
                        <FaTimes onClick={() => setIsReconfigureOpen(false)} style={{ cursor: 'pointer', fontSize: '20px', color: '#64748b' }} />
                    </div>

                    <label style={labelModalStyle}>Saldo Físico Actual</label>
                    <input type="number" min="0" onKeyDown={blockInvalidChars} value={configForm.saldoActual} onChange={(e) => setConfigForm({...configForm, saldoActual: e.target.value})} style={{ ...inputModalStyle, fontSize: '20px', fontWeight: 'bold' }} />
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{flex: 1}}>
                            <label style={labelModalStyle}>Ciclo Maestro Base</label>
                            <select value={configForm.cicloMaestro} onChange={(e) => setConfigForm({...configForm, cicloMaestro: e.target.value})} style={inputModalStyle}>
                                <option>Diario</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option>
                            </select>
                        </div>
                        <div style={{flex: 1}}>
                            <label style={labelModalStyle}>Día de Cobro</label>
                            <input type="number" min="1" max="31" value={configForm.diaInicioCiclo} onChange={(e) => setConfigForm({...configForm, diaInicioCiclo: e.target.value})} style={inputModalStyle} />
                        </div>
                    </div>

                    <label style={labelModalStyle}>Tus Ingresos</label>
                    {configForm.ingresos.map((ing, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input type="number" min="0" onKeyDown={blockInvalidChars} value={ing.monto} onChange={(e) => handleIngresoChange(i, 'monto', e.target.value)} style={{...inputModalStyle, flex: 2, margin: 0}} />
                            <select value={ing.frecuencia} onChange={(e) => handleIngresoChange(i, 'frecuencia', e.target.value)} style={{...inputModalStyle, flex: 2, margin: 0}}><option>Diario</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option></select>
                            {configForm.ingresos.length > 1 && <FaTrash onClick={() => handleRemoveIngreso(i)} style={{color: '#ef4444', cursor: 'pointer', padding: '10px'}}/>}
                        </div>
                    ))}
                    <button onClick={handleAddIngreso} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', padding: '5px 0' }}><FaPlus /> Añadir fuente</button>
                    <button onClick={handleGuardarReconfiguracion} style={{ ...btnMainAdd, width: '100%' }}><FaSave /> Guardar Cambios</button>
                </div>
            )}

            {isQuickEventOpen && (
                <div className="modal-center" style={modalCenterStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><div style={badgeDayStyle}>Día {selectedDay}</div><FaTimes onClick={cerrarModalEvento} style={{ cursor: 'pointer', color: '#64748b', fontSize: '20px' }} /></div>
                    <div style={typeSelectorGrid}><button onClick={() => setEventForm({...eventForm, tipo: 'pago'})} style={{ ...typeBtn, border: eventForm.tipo === 'pago' ? '2px solid #10ac84' : '1px solid #334155', background: eventForm.tipo === 'pago' ? 'rgba(16, 172, 132, 0.1)' : '#0b0f19', color: eventForm.tipo === 'pago' ? '#10ac84' : '#e2e8f0' }}>Cobro</button><button onClick={() => setEventForm({...eventForm, tipo: 'gasto'})} style={{ ...typeBtn, border: eventForm.tipo === 'gasto' ? '2px solid #ef4444' : '1px solid #334155', background: eventForm.tipo === 'gasto' ? 'rgba(239, 68, 68, 0.1)' : '#0b0f19', color: eventForm.tipo === 'gasto' ? '#ef4444' : '#e2e8f0' }}>Gasto</button></div>
                    <input type="text" placeholder="¿Qué es?" value={eventForm.nombre} onChange={(e) => setEventForm({...eventForm, nombre: e.target.value})} style={inputModalStyle} />
                    <input type="number" min="0" onKeyDown={blockInvalidChars} placeholder="Monto $" value={eventForm.monto} onChange={(e) => setEventForm({...eventForm, monto: e.target.value})} style={inputModalStyle} />
                    <select value={eventForm.frecuencia} onChange={(e) => setEventForm({...eventForm, frecuencia: e.target.value})} style={inputModalStyle}><option value="Único">Solo esta vez</option><option value="Semanal">Semanal</option><option value="Mensual">Mensual</option><option value="Anual">Anual</option></select>
                    <button onClick={guardarEvento} style={{ ...btnMainAdd, width: '100%', marginTop: '10px' }}>{isEditing ? 'Guardar Cambios' : 'Crear Alerta'}</button>
                    {isEditing && <button onClick={eliminarEventoTotal} style={{ ...btnMainRemove, width: '100%', marginTop: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}><FaTrash /> Eliminar Alerta / Ejecutar</button>}
                </div>
            )}

            {/* CREADOR INTELIGENTE DE METAS/RETOS */}
            {isAddModalOpen && (
                <div className="modal-center" style={{...modalCenterStyle, width: '420px'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#f1f5f9' }}>Nuevo Cajón</h3>
                        <FaTimes onClick={() => setIsAddModalOpen(false)} style={{ cursor: 'pointer', color: '#64748b' }} />
                    </div>

                    <div style={typeSelectorGrid}>
                        <button onClick={() => setNuevoCajon({...nuevoCajon, tipo: 'Fijo'})} style={{ ...typeBtn, border: nuevoCajon.tipo === 'Fijo' ? '2px solid #3b82f6' : '1px solid #334155', background: nuevoCajon.tipo === 'Fijo' ? 'rgba(59, 130, 246, 0.1)' : '#0b0f19', color: nuevoCajon.tipo === 'Fijo' ? '#3b82f6' : '#e2e8f0' }}>Cajón Fijo</button>
                        <button onClick={() => setNuevoCajon({...nuevoCajon, tipo: 'Reto'})} style={{ ...typeBtn, border: nuevoCajon.tipo === 'Reto' ? '2px solid #e83e8c' : '1px solid #334155', background: nuevoCajon.tipo === 'Reto' ? 'rgba(232, 62, 140, 0.1)' : '#0b0f19', color: nuevoCajon.tipo === 'Reto' ? '#e83e8c' : '#e2e8f0' }}>Micro-Reto</button>
                    </div>

                    {nuevoCajon.tipo === 'Fijo' ? (
                        <>
                            <input type="text" placeholder="Nombre de la meta" value={nuevoCajon.nombre} onChange={(e) => setNuevoCajon({...nuevoCajon, nombre: e.target.value})} style={inputModalStyle} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="number" min="0" onKeyDown={blockInvalidChars} placeholder="Monto" value={nuevoCajon.monto} onChange={(e) => setNuevoCajon({...nuevoCajon, monto: e.target.value})} style={{ ...inputModalStyle, flex: 1, margin: 0 }} />
                                <select value={nuevoCajon.frecuencia} onChange={(e) => setNuevoCajon({...nuevoCajon, frecuencia: e.target.value})} style={{ ...inputModalStyle, flex: 1, margin: 0 }}>
                                    <option>Único</option><option>Diario</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option><option>Anual</option>
                                </select>
                            </div>
                            <button onClick={handleGuardarNuevoCajon} style={{ ...btnMainAdd, width: '100%', marginTop: '20px', background: '#3b82f6' }}>Crear Cajón Fijo</button>
                        </>
                    ) : (
                        <>
                            <input type="text" placeholder="¿Qué capricho quieres? (Ej. Tenis)" value={nuevoCajon.nombre} onChange={(e) => setNuevoCajon({...nuevoCajon, nombre: e.target.value})} style={inputModalStyle} />
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{flex: 1, position: 'relative'}}>
                                    <span style={{position: 'absolute', left: '10px', top: '15px', color: '#64748b'}}>$</span>
                                    <input type="number" min="0" onKeyDown={blockInvalidChars} placeholder="Costo Total" value={nuevoCajon.costoTotal} onChange={(e) => setNuevoCajon({...nuevoCajon, costoTotal: e.target.value})} style={{ ...inputModalStyle, paddingLeft: '25px', margin: 0 }} />
                                </div>
                                <div style={{flex: 1, position: 'relative'}}>
                                    <input type="number" min="1" onKeyDown={blockInvalidChars} placeholder="Ciclos" value={nuevoCajon.ciclos} onChange={(e) => setNuevoCajon({...nuevoCajon, ciclos: e.target.value})} style={{ ...inputModalStyle, paddingRight: '50px', margin: 0 }} />
                                    <span style={{position: 'absolute', right: '10px', top: '15px', color: '#64748b', fontSize: '12px'}}>ciclos</span>
                                </div>
                            </div>

                            {(() => {
                                const costoT = parseFloat(nuevoCajon.costoTotal) || 0;
                                const cics = parseInt(nuevoCajon.ciclos) || 0;
                                if (costoT > 0 && cics > 0) {
                                    const cuota = costoT / cics;
                                    if (cuota > sobranteCiclo && sobranteCiclo > 0) {
                                        const ciclosViables = Math.ceil(costoT / sobranteCiclo);
                                        const cuotaViable = costoT / ciclosViables;
                                        return (
                                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '15px', borderRadius: '15px', marginTop: '10px' }}>
                                                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ef4444', fontWeight: 'bold' }}>
                                                    🚨 ¡Peligro! Tu cuota sería de ${cuota.toLocaleString(undefined, {maximumFractionDigits:2})} y solo tienes ${sobranteCiclo.toLocaleString(undefined, {maximumFractionDigits:2})} libres.
                                                </p>
                                                <button onClick={() => crearReto(nuevoCajon.nombre, cuotaViable, ciclosViables)} style={{ ...btnMainAdd, width: '100%', background: '#10ac84', marginBottom: '10px', fontSize: '13px', padding: '12px' }}>
                                                    Crear Viable: {ciclosViables} ciclos de ${cuotaViable.toLocaleString(undefined, {maximumFractionDigits:2})}
                                                </button>
                                                <button onClick={() => crearReto(nuevoCajon.nombre, cuota, cics)} style={{ ...btnMainRemove, width: '100%', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontSize: '13px', padding: '12px' }}>
                                                    Forzar: {cics} ciclos de ${cuota.toLocaleString(undefined, {maximumFractionDigits:2})} (Arriesgado)
                                                </button>
                                            </div>
                                        );
                                    } else if (cuota > sobranteCiclo && sobranteCiclo <= 0) {
                                        return (
                                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '15px', borderRadius: '15px', marginTop: '10px' }}>
                                                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ef4444', fontWeight: 'bold' }}>🚨 No tienes dinero libre este ciclo.</p>
                                                <button onClick={() => crearReto(nuevoCajon.nombre, cuota, cics)} style={{ ...btnMainRemove, width: '100%', fontSize: '13px' }}>Forzar de todos modos</button>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div style={{ background: 'rgba(16, 172, 132, 0.1)', border: '1px solid #10ac84', padding: '15px', borderRadius: '15px', marginTop: '10px', textAlign: 'center' }}>
                                                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#10ac84', fontWeight: 'bold' }}>✅ ¡Es viable! Pagarás ${cuota.toLocaleString(undefined, {maximumFractionDigits:2})} por ciclo.</p>
                                                <button onClick={() => crearReto(nuevoCajon.nombre, cuota, cics)} style={{ ...btnMainAdd, width: '100%', background: '#e83e8c' }}>Crear Micro-Reto</button>
                                            </div>
                                        );
                                    }
                                }
                                return <button style={{ ...btnMainAdd, width: '100%', marginTop: '10px', background: '#334155', color: '#64748b', cursor: 'not-allowed' }}>Ingresa los datos para evaluar</button>;
                            })()}
                        </>
                    )}
                </div>
            )}

            {isImprevistoModalOpen && (
                <div className="modal-center" style={modalCenterStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h3 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}><FaExclamationTriangle /> Gasto Imprevisto</h3><FaTimes onClick={() => setIsImprevistoModalOpen(false)} style={{ cursor: 'pointer', color: '#64748b' }} /></div>
                    <input type="text" placeholder="¿En qué vas a gastar?" value={imprevistoForm.nombre} onChange={(e) => setImprevistoForm({...imprevistoForm, nombre: e.target.value})} style={inputModalStyle} />
                    <input type="number" min="0" onKeyDown={blockInvalidChars} placeholder="Costo" value={imprevistoForm.monto} onChange={(e) => setImprevistoForm({...imprevistoForm, monto: e.target.value})} style={inputModalStyle} />
                    <button onClick={handleGuardarImprevisto} style={{ ...btnMainRemove, width: '100%', marginTop: '10px' }}>Restar en Cascada</button>
                </div>
            )}

            {/* FULLSCREENS */}
            <CalendarFullScreen isOpen={isFullScreenCalendar} onClose={() => setIsFullScreenCalendar(false)} eventos={eventosCalendario} historial={historial} onDeleteEvent={handleDeleteEventFromCalendar} onSaveEvent={handleSaveEventFromCalendar} nombresMeses={['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']} diasSemana={['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']} mesActualGlobal={mesActual} anioActualGlobal={anioActual} />
            <HistorialFullScreen isOpen={isHistorialOpen} onClose={() => setIsHistorialOpen(false)} historial={historial} />
            <MetasFullScreen isOpen={isMetasOpen} onClose={() => setIsMetasOpen(false)} onAddCajon={agregarCajonDesdeMetas} onReplaceAhorro={reemplazarAhorroAdmin} onOpenEmergencia={() => { setIsMetasOpen(false); setIsEmergenciaOpen(true); }} gastosFijosBase={cajones['Gastos Fijos']?.monto || 0} gastosVariablesBase={cajones['Gastos Variables']?.monto || 0} ingresosMensuales={ingresosMensuales} edadUsuario={18} cicloMaestro={cicloMaestro} />
            
            <BovedaFullScreen isOpen={isBovedaFullScreenOpen} onClose={() => setIsBovedaFullScreenOpen(false)} saldoBoveda={boveda} saldoActual={saldoActual} saldoCajaFuerte={cajaFuerte} pinSeguridad={pinSeguridad} onTransaction={handleBovedaTransaction} historial={historial} eventosCalendario={eventosCalendario} onSaveEvent={handleSaveEventFromCalendar} onDeleteEvent={handleDeleteEventFromCalendar} mesActual={mesActual} anioActual={anioActual} cajones={cajones} cicloMaestro={cicloMaestro} onDeleteCajon={borrarCajon} />
            
            <CajaFuerteFullScreen isOpen={isCajaFuerteFullScreenOpen} onClose={() => setIsCajaFuerteFullScreenOpen(false)} saldoCajaFuerte={cajaFuerte} saldoActual={saldoActual} saldoBoveda={boveda} pinSeguridad={pinSeguridad} onTransaction={handleCajaFuerteTransaction} historial={historial} eventosCalendario={eventosCalendario} onSaveEvent={handleSaveEventFromCalendar} onDeleteEvent={handleDeleteEventFromCalendar} mesActual={mesActual} anioActual={anioActual} cajones={cajones} ordenCajones={ordenCajones} completarMeta={completarReto} borrarMeta={borrarCajon} handleManualMeta={handleManualReto} />
            
            <RetosFullScreen isOpen={isRetosFullScreenOpen} onClose={() => setIsRetosFullScreenOpen(false)} cajones={cajones} ordenCajones={ordenCajones} historial={historial} totalAcumulado={totalAcumuladoRetos} completarReto={completarReto} borrarReto={borrarCajon} eventosCalendario={eventosCalendario} onSaveEvent={handleSaveEventFromCalendar} onDeleteEvent={handleDeleteEventFromCalendar} mesActual={mesActual} anioActual={anioActual} />

            <div className="profile-sidebar" style={{ ...profileMenuSidebar, transform: isProfileOpen ? 'translateX(0)' : 'translateX(100%)' }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}><h3 style={{ margin: 0, fontSize: '22px', color: '#f1f5f9' }}>Menú Principal</h3><FaTimes onClick={()=>setIsProfileOpen(false)} style={{cursor:'pointer', fontSize: '24px', color: '#64748b'}}/></div>
                <div style={{textAlign:'center', margin:'30px 0'}}><div style={avatarLargeStyle}>{userName.charAt(0).toUpperCase()}</div><h2 style={{ margin: '15px 0 5px 0', color: '#f1f5f9' }}>{userName}</h2></div>

                <button onClick={() => { setIsProfileOpen(false); setIsRetosFullScreenOpen(true); }} style={{ background: 'rgba(232, 62, 140, 0.1)', padding: '20px', borderRadius: '15px', marginBottom: '25px', border: '1px dashed #e83e8c', textAlign: 'center', cursor: 'pointer', display: 'block', width: '100%', transition: '0.2s' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#e83e8c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FaGamepad /> Acumulado en Retos</h4>
                    <h2 style={{ margin: 0, color: '#e83e8c', fontSize: '32px' }}>${totalAcumuladoRetos.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#e83e8c', opacity: 0.8 }}>Clic para abrir tu sala de trofeos.</p>
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button style={{...profileActionBtn, border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}} onClick={abrirCajaFuerte}><FaLock style={{ fontSize: '18px' }} /> Caja Fuerte (Ahorros y Metas)</button>
                    <button style={{...profileActionBtn, border: '1px solid #10ac84', background: 'rgba(16, 172, 132, 0.1)', color: '#10ac84'}} onClick={abrirBoveda}><FaShieldAlt style={{ fontSize: '18px' }} /> Fondo de Emergencia</button>
                    <button style={profileActionBtn} onClick={() => { setIsProfileOpen(false); setIsHistorialOpen(true); }}><FaHistory style={{ color: '#10ac84', fontSize: '18px' }} /> Historial Detallado</button>
                    <button style={profileActionBtn} onClick={() => { setIsProfileOpen(false); setIsMetasOpen(true); }}><FaBullseye style={{ color: '#ef4444', fontSize: '18px' }} /> Mis Metas y Herramientas</button>
                    <hr style={{ border: '0', borderTop: '1px solid #334155', margin: '10px 0' }} />
                    <button style={profileActionBtn} onClick={abrirEditarPerfil}><FaUserEdit style={{ color: '#10ac84', fontSize: '18px' }} /> Editar Perfil y Contraseña</button>
                    <button style={profileActionBtn} onClick={abrirReconfiguracion}><FaCog style={{ color: '#3b82f6', fontSize: '18px' }} /> Reconfigurar Finanzas Base</button>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                    <button style={logoutBtnStyle} onClick={handleLogout}><FaSignOutAlt style={{ fontSize: '18px' }} /> Cerrar Sesión</button>
                    <button onClick={handleEliminarCuenta} style={deleteAccountBtnStyle}>
                        <FaUserTimes style={{ fontSize: '18px' }} /> Eliminar Cuenta
                    </button>
                </div>
            </div>

            <aside className="sidebar" style={sidebarStyle}>
                <div style={{ marginBottom: '30px' }}><h2 style={{ margin: '0', color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><FaWallet /> FinTrack</h2><span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', display: 'inline-block', marginTop:'8px', border: '1px solid #3b82f6' }}>Ciclo: {cicloMaestro}</span></div>
                <hr style={{ border: '0', borderTop: '1px solid #334155', marginBottom: '20px' }} />
                <div style={calendarContainer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}><span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9' }}><FaCalendarAlt color="#3b82f6" /> {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mesActual]}</span><span onClick={() => setIsFullScreenCalendar(true)} style={{fontSize:'11px', color:'#3b82f6', cursor:'pointer', fontWeight:'bold', background:'rgba(59, 130, 246, 0.1)', padding:'3px 8px', borderRadius:'10px'}}>Ver Todo</span></div>
                    <div style={gridDiasSemana}>{['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => <div key={d} style={headerDia}>{d.substring(0,1)}</div>)}</div>
                    <div style={gridCalendario}>
                        {(() => {
                            const dias = []; const dEnMes = new Date(anioActual, mesActual + 1, 0).getDate(); const pDia = new Date(anioActual, mesActual, 1).getDay();
                            for (let i = 0; i < pDia; i++) dias.push(null); for (let i = 1; i <= dEnMes; i++) dias.push(i);
                            return dias.map((dia, i) => {
                                const esHoy = dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear(); const { tienePago, tieneGasto } = checkEventosDia(dia);
                                let bgColor = 'transparent'; let textColor = '#f1f5f9'; let boxShadowStyle = 'none';
                                if (tienePago && tieneGasto) { bgColor = 'linear-gradient(135deg, rgba(16, 172, 132, 0.8) 50%, rgba(239, 68, 68, 0.8) 50%)'; textColor = 'white'; } else if (tienePago) { bgColor = 'rgba(16, 172, 132, 0.8)'; textColor = 'white'; } else if (tieneGasto) { bgColor = 'rgba(239, 68, 68, 0.8)'; textColor = 'white'; } else if (esHoy) { bgColor = '#3b82f6'; textColor = 'white'; }
                                if (esHoy && (tienePago || tieneGasto)) { boxShadowStyle = 'inset 0 0 0 2px #151b2b, inset 0 0 0 4px #3b82f6, 0 3px 10px rgba(0,0,0,0.3)'; } else if (esHoy) { boxShadowStyle = '0 3px 10px rgba(59, 130, 246, 0.4)'; } else if (tienePago || tieneGasto) { boxShadowStyle = '0 3px 10px rgba(0,0,0,0.3)'; }
                                return <div key={i} onClick={() => { if(dia) handleDayClick(dia); }} style={{...celdaDia, background: bgColor, color: textColor, fontWeight: (tienePago || tieneGasto || esHoy) ? 'bold' : 'normal', cursor: dia ? 'pointer' : 'default', boxShadow: boxShadowStyle}}>{dia || ''}</div>;
                            });
                        })()}
                    </div>
                </div>
                <div style={{ ...remindersContainer, marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}><h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: 0, color: '#f1f5f9' }}><FaHistory color="#3b82f6" /> Últimos Movimientos</h4>{historial.length > 0 && <FaTrash onClick={limpiarHistorial} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '12px' }} title="Vaciar Historial" />}</div>
                    {historial.length === 0 ? ( <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Registra tus ingresos y gastos para ver el historial.</p> ) : ( <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{historial.slice(0, 3).map(h => <div key={h.id} style={miniAlertCard} title={h.hora}><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>{h.nombre}</span><span style={{ fontWeight: 'bold', fontSize: '13px', color: (h.tipo === 'pago' || h.tipo === 'ahorro_in') ? '#10ac84' : '#ef4444' }}>{(h.tipo === 'pago' || h.tipo === 'ahorro_in') ? '+' : '-'}${h.monto}</span></div>)}</div> )}
                </div>
            </aside>

            <main className="main-content" style={mainContentStyle}>
                <div style={mainContainerMaxWidth}>
                    
                    <header style={headerStyle}>
                        <div>
                            <h1 className="text-title" style={{ margin: 0, fontSize: '42px', fontWeight: '900', color: '#f1f5f9', letterSpacing: '-1px' }}>
                                Dashboard
                            </h1>
                            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize:'15px', fontWeight: '500' }}>Todo tu dinero en automático.</p>
                        </div>
                        <div style={profileTriggerStyle} onClick={() => setIsProfileOpen(true)}>
                            <div style={avatarSmallStyle}>{userName.charAt(0).toUpperCase()}</div>
                        </div>
                    </header>

                    <div style={mainCardStyle}>
                        <span style={{ fontSize: '16px', letterSpacing: '0.5px', color: '#94a3b8' }}>Disponible para Gastar (Libre)</span>
                        <h2 className="text-huge" style={{ fontSize: '64px', margin: '15px 0 5px 0', fontWeight: 'bold', color: '#10ac84', textShadow: '0 0 15px rgba(16, 172, 132, 0.4)' }}>${disponibleLibre.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h2>
                        <p style={{ margin: '0 0 30px 0', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}><FaWallet /> Total del Ciclo (Cascada): ${saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                        <div className="btn-group" style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={handleAddMoney} style={btnMainAdd}><FaArrowUp /> Ingresar Dinero</button>
                            <button onClick={handleRemoveMoney} style={btnMainRemove} title="Gasto directo de bolsillo"><FaArrowDown /> Gasto Hormiga</button>
                        </div>
                    </div>

                    <div className="stats-grid" style={statsGridStyle}>
                        <div style={statCardStyle}><div style={{ display: 'flex', gap: '8px', color: '#10ac84', marginBottom: '10px', fontWeight: 'bold' }}><FaArrowUp /> Ingresos Estimados ({cicloMaestro})</div><h3 style={{ margin: 0, fontSize: '26px', color: '#f1f5f9' }}>${totalIngresosCiclo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3></div>
                        <div style={statCardStyle}><div style={{ display: 'flex', gap: '8px', color: '#3b82f6', marginBottom: '10px', fontWeight: 'bold' }}><FaArrowDown /> Gastos Meta ({cicloMaestro})</div><h3 style={{ margin: 0, fontSize: '26px', color: '#f1f5f9' }}>${totalAsignadoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3></div>
                    </div>

                    {showSobranteAlert && sobranteCiclo > 0 && (
                        <div style={{...alertSuccessStyle, background: 'rgba(255, 193, 7, 0.1)', borderLeft: '8px solid #ffc107', color: '#ffc107', position: 'relative'}}>
                            <FaTimes onClick={() => setShowSobranteAlert(false)} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', color: '#ffc107' }} title="Cerrar aviso" />
                            <FaLightbulb style={{ fontSize: '24px', marginRight: '15px', color: '#ffc107', flexShrink: 0 }} />
                            <div>
                                <strong style={{ fontSize: '16px' }}>¡Sobrante proyectado!</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#e2e8f0' }}>Si cumples tus metas, te sobrarán <b>${sobranteCiclo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b> en este ciclo.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', color: '#f1f5f9' }}>Llenado en Cascada</h3>
                        <button onClick={() => setIsEditingCajones(!isEditingCajones)} style={{...editPriorityBtn, background: isEditingCajones ? 'rgba(16, 172, 132, 0.2)' : 'rgba(59, 130, 246, 0.1)', color: isEditingCajones ? '#10ac84' : '#3b82f6', border: `1px solid ${isEditingCajones ? '#10ac84' : '#3b82f6'}`}}>{isEditingCajones ? '✓ Guardar Orden' : '✏️ Editar Prioridades'}</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {estadoCajones.map((cajon, index) => {
                            if (cajon.nombre === 'Libre') return null; 
                            
                            const realIndex = ordenCajones.indexOf(cajon.nombre);
                            const canMoveUp = realIndex > 0 && isAdmin(ordenCajones[realIndex]) === isAdmin(ordenCajones[realIndex - 1]); 
                            const canMoveDown = realIndex < ordenCajones.length - 1 && isAdmin(ordenCajones[realIndex]) === isAdmin(ordenCajones[realIndex + 1]);
                            
                            const esImprevisto = cajones[cajon.nombre]?.frecuencia === 'Imprevisto_Pagado' || cajon.nombre.includes('Imprevisto');
                            const estaAsegurado = cajones[cajon.nombre]?.aseguradoEnCiclo;
                            const esRetoPagado = cajones[cajon.nombre]?.esRetoPagado;

                            const isAsegurado = estaAsegurado || esRetoPagado || cajon.completado;
                            const isFull = cajon.llenado >= cajon.meta || isAsegurado; 
                            const isEmpty = cajon.llenado === 0 && !isAsegurado;

                            return (
                                <div key={cajon.nombre} style={cascadeCard}>
                                    <div className="cajon-header-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                            {isEditingCajones && (
                                                <div style={{ display: 'flex', gap: '5px' }}><button onClick={() => moverCajonArribaAbajo(realIndex, 'up')} disabled={!canMoveUp || cajon.nombre === 'Deuda'} style={{...arrowBtn, opacity: (!canMoveUp || cajon.nombre === 'Deuda') ? 0.3 : 1}}><FaChevronUp /></button><button onClick={() => moverCajonArribaAbajo(realIndex, 'down')} disabled={!canMoveDown || cajon.nombre === 'Deuda'} style={{...arrowBtn, opacity: (!canMoveDown || cajon.nombre === 'Deuda') ? 0.3 : 1}}><FaChevronDown /></button><button onClick={() => abrirEdicionMonto(cajon.nombre)} style={{...arrowBtn, color: '#ff9f43', marginLeft: '5px'}}><FaEdit /></button>{!isAdmin(cajon.nombre) && <button onClick={() => borrarCajon(cajon.nombre, cajon.llenado)} style={{...arrowBtn, color: '#ef4444', marginLeft: '5px'}}><FaTrash /></button>}</div>
                                            )}
                                            <span style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: '#f1f5f9' }}>
                                                <span style={{background: '#1e293b', color: '#94a3b8', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #334155'}}>{realIndex + 1}</span>
                                                {cajon.nombre === 'Deuda' ? '🚨 DEUDA' : cajon.nombre} 
                                                {isFull && <FaCheckCircle color="#10ac84"/>} 
                                                {isEmpty && <FaExclamationCircle color="#ef4444"/>}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f5f9' }}>
                                            {cajon.completado ? (
                                                <span style={{color: '#10ac84'}}>¡COMPLETADO! 🎉</span>
                                            ) : isAsegurado ? (
                                                <span style={{color: '#10ac84'}}>🛡️ Asegurado</span>
                                            ) : (
                                                `$${cajon.llenado.toLocaleString()}`
                                            )}
                                            {!cajon.completado && !isAsegurado && <span style={{fontSize:'13px', color:'#64748b', fontWeight:'normal'}}> / ${cajon.meta.toLocaleString()}</span>}
                                        </span>
                                    </div>
                                    
                                    <div style={progressBg}>
                                        <div style={{ ...progressFill, width: `${isAsegurado ? 100 : cajon.porcentaje}%`, backgroundColor: isFull ? '#10ac84' : isEmpty ? '#ef4444' : (cajon.nombre==='Deuda'?'#ef4444':'#ffc107'), boxShadow: isFull ? '0 0 10px rgba(16, 172, 132, 0.5)' : 'none' }}></div>
                                    </div>
                                    
                                    { (cajon.nombre === 'Fondo de Emergencia' || cajon.nombre.startsWith('Meta:') || cajon.nombre.startsWith('Reto:')) && (
                                        <div style={{ marginTop: '15px', background: '#0b0f19', borderRadius: '10px', border: '1px solid #2a3241', overflow: 'hidden' }}>
                                            <div onClick={() => toggleCajon(cajon.nombre)} style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.2s', background: expandedCajones[cajon.nombre] ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8' }}>
                                                    {cajon.nombre === 'Fondo de Emergencia' ? 'Detalle de Bóveda' : 'Progreso Acumulado'}
                                                </span>
                                                <span style={{ color: '#3b82f6' }}>{expandedCajones[cajon.nombre] ? <FaChevronUp /> : <FaChevronDown />}</span>
                                            </div>
                                            
                                            {expandedCajones[cajon.nombre] && (() => {
                                                let acumuladoReal = 0; let metaTotalAcordeon = 0;
                                                if (cajon.nombre === 'Fondo de Emergencia') { acumuladoReal = boveda; metaTotalAcordeon = cajones['Fondo de Emergencia']?.metaTotal || 0; } 
                                                else if (cajon.nombre.startsWith('Meta:')) { acumuladoReal = cajones[cajon.nombre]?.acumulado || 0; const match = cajon.nombre.match(/\(Total: (\d+(\.\d+)?)\)/); metaTotalAcordeon = match ? parseFloat(match[1]) : 0; } 
                                                else if (cajon.nombre.startsWith('Reto:')) { acumuladoReal = cajones[cajon.nombre]?.acumulado || 0; const match = cajon.nombre.match(/\((\d+)\s*ciclos\)/); const ciclos = match ? parseInt(match[1]) : 0; metaTotalAcordeon = ciclos * cajon.meta; }

                                                const porcentajeAcumulado = metaTotalAcordeon > 0 ? Math.min((acumuladoReal / metaTotalAcordeon) * 100, 100) : 0;

                                                return (
                                                    <div style={{ padding: '0 15px 15px 15px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '8px' }}>
                                                            <span>{cajon.nombre === 'Fondo de Emergencia' ? 'Fondo Acumulado (Bóveda)' : 'Total Guardado'}</span>
                                                            {metaTotalAcordeon > 0 ? ( <span style={{color: '#10ac84'}}>${acumuladoReal.toLocaleString()} / ${metaTotalAcordeon.toLocaleString()}</span> ) : ( <span style={{color: '#ffc107', fontSize: '12px'}}>⚠️ Define la meta</span> )}
                                                        </div>
                                                        {metaTotalAcordeon > 0 && ( <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${porcentajeAcumulado}%`, background: '#10ac84', transition: '0.3s', boxShadow: '0 0 8px rgba(16,172,132,0.8)' }}></div></div> )}
                                                        
                                                        {cajon.completado ? (
                                                            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', textAlign: 'center', color: '#10ac84', fontWeight: 'bold', background: 'rgba(16, 172, 132, 0.1)', border: '1px solid #10ac84', fontSize: '13px' }}>🎉 ¡Objetivo 100% Completado!</div>
                                                        ) : (
                                                            isAsegurado && ( <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', textAlign: 'center', color: '#10ac84', fontWeight: 'bold', border: '1px dashed #10ac84', fontSize: '13px' }}><FaCheckCircle /> Pago guardado en este ciclo</div> )
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {!cajon.completado && !isAsegurado && isFull && (
                                        <>
                                            {cajon.nombre === 'Fondo de Emergencia' ? (
                                                <button onClick={() => asegurarFondos(cajon.nombre, cajon.llenado)} style={{ width: '100%', background: 'rgba(16, 172, 132, 0.1)', color: '#10ac84', border: `1px dashed #10ac84`, padding: '10px', borderRadius: '10px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <FaShieldAlt /> Mover a Bóveda Intocable
                                                </button>
                                            ) : (cajon.nombre.startsWith('Reto:') || cajon.nombre.startsWith('Meta:')) ? (
                                                <button onClick={() => abonarReto(cajon.nombre, cajon.llenado)} style={{ width: '100%', background: cajon.nombre.startsWith('Meta:') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(232, 62, 140, 0.1)', color: cajon.nombre.startsWith('Meta:') ? '#3b82f6' : '#e83e8c', border: `1px dashed ${cajon.nombre.startsWith('Meta:') ? '#3b82f6' : '#e83e8c'}`, padding: '10px', borderRadius: '10px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <FaPiggyBank /> Guardar {cajon.nombre.startsWith('Meta:') ? 'Ahorro' : 'Pago'} del Ciclo
                                                </button> 
                                            ) : (
                                                !['Gastos Fijos', 'Gastos Variables', 'Deuda'].includes(cajon.nombre) && !esImprevisto && (
                                                    <button onClick={() => asegurarFondos(cajon.nombre, cajon.llenado)} style={{ width: '100%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: `1px dashed #3b82f6`, padding: '10px', borderRadius: '10px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <FaLock /> Mover a Caja Fuerte
                                                    </button>
                                                )
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                        {estadoCajones.find(c => c.nombre === 'Libre') && ( <div style={{...cascadeCard, border: '2px solid #3b82f6', animation: 'pulseGlow 3s infinite'}}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>Cajón Libre (Sobrante final)</span><span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>${estadoCajones.find(c => c.nombre === 'Libre').llenado.toLocaleString()}</span></div><div style={progressBg}><div style={{ ...progressFill, width: `100%`, backgroundColor: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.6)' }}></div></div></div> )}
                    </div>

                    <h3 style={{ marginTop: '50px', marginBottom: '20px', fontSize: '22px', color: '#f1f5f9' }}>Detalle por Cajón</h3>
                    <div style={cajonesGridStyle}>
                        {estadoCajones.map((cajon, index) => {
                            if (cajon.nombre === 'Libre') return null;
                            const isFull = cajon.llenado >= cajon.meta || cajon.completado || cajones[cajon.nombre]?.esRetoPagado || cajones[cajon.nombre]?.aseguradoEnCiclo;
                            const isImp = cajon.nombre.includes('🚨') || cajon.nombre.includes('Imprevisto');
                            return (
                                <div key={index} style={cajonCard}>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}><div style={{...iconBox, background: isImp ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: isImp ? '#ef4444' : '#3b82f6'}}><FaBoxOpen /></div><h4 style={{ margin: '0', fontSize: '16px', alignSelf:'center', color: '#e2e8f0' }}>{cajon.nombre}</h4></div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Meta ({cicloMaestro})</p>
                                    <p style={{ margin: '5px 0 25px 0', fontSize: '28px', fontWeight: 'bold', color: '#f1f5f9' }}>${cajon.meta.toLocaleString()}</p>
                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: isFull ? '#10ac84' : '#ff9f43', padding: '15px', backgroundColor: isFull ? 'rgba(16, 172, 132, 0.1)' : 'rgba(255, 193, 7, 0.1)', borderRadius: '15px', border: `1px solid ${isFull ? 'rgba(16, 172, 132, 0.3)' : 'rgba(255, 193, 7, 0.3)'}` }}><span>Fondo Real:</span><span>${cajon.llenado.toLocaleString()}</span></div>
                                </div>
                            );
                        })}
                        <div style={addCajonCard} onClick={() => setIsAddModalOpen(true)}><FaPlus style={{ fontSize: '36px', color: '#3b82f6', marginBottom: '15px' }} /><span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>Añadir Cajón</span><span style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Nueva Meta Fija</span></div>
                        <div style={{...addCajonCard, border: '3px dashed rgba(239, 68, 68, 0.3)', background:'rgba(239, 68, 68, 0.05)'}} onClick={() => setIsImprevistoModalOpen(true)}><FaExclamationTriangle style={{ fontSize: '36px', color: '#ef4444', marginBottom: '15px' }} /><span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>Gasto Imprevisto</span><span style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Impacto en cascada</span></div>
                    </div>
                    <div style={{ height: '100px' }}></div>
                </div>
            </main>
        </div>
    );
};

// ESTILOS CSS-IN-JS (PREMIUM DARK MODE)
const appWrapperStyle = { display: 'flex', backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", color: '#e2e8f0' };
const sidebarStyle = { position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', backgroundColor: '#151b2b', padding: '30px 25px', boxSizing: 'border-box', borderRight: '1px solid #2a3241', overflowY: 'auto', zIndex: 100 };
const mainContentStyle = { marginLeft: '280px', flex: 1, padding: '40px 50px', boxSizing: 'border-box' };
const mainContainerMaxWidth = { maxWidth: '1000px', margin: '0 auto' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1999, backdropFilter: 'blur(5px)' };
const modalCenterStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#151b2b', padding: '35px', borderRadius: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.8)', zIndex: 4000, width: '380px', boxSizing: 'border-box', border: '1px solid #2a3241' };
const inputModalStyle = { padding: '15px', borderRadius: '15px', border: '1px solid #334155', width: '100%', marginBottom: '15px', outline: 'none', background: '#0b0f19', color: '#f1f5f9', fontSize: '15px', boxSizing: 'border-box' };
const labelModalStyle = { fontSize:'13px', fontWeight:'bold', color:'#94a3b8', marginBottom:'8px', display:'block' };
const badgeDayStyle = { background: '#3b82f6', color: '#fff', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' };
const typeSelectorGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const typeBtn = { padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', transition: 'all 0.2s ease' };
const calendarContainer = { backgroundColor: '#0b0f19', padding: '20px', borderRadius: '25px', marginBottom: '30px', border: '1px solid #2a3241' };
const gridDiasSemana = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '15px', fontSize: '12px', color: '#64748b', fontWeight: 'bold' };
const headerDia = { padding: '5px 0' };
const gridCalendario = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' };
const celdaDia = { textAlign: 'center', padding: '8px 0', fontSize: '13px', borderRadius: '12px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' };
const remindersContainer = { backgroundColor: '#151b2b', border: '1px solid #2a3241', padding: '25px 20px', borderRadius: '25px' };
const miniAlertCard = { fontSize: '13px', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', backgroundColor: '#0b0f19', marginBottom: '10px', border: '1px solid #2a3241', gap: '10px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const mainCardStyle = { background: 'linear-gradient(135deg, #151b2b 0%, #0b0f19 100%)', color: 'white', padding: '45px', borderRadius: '35px', boxShadow: '0 20px 45px rgba(0,0,0,0.5)', marginBottom: '40px', border: '1px solid #2a3241' };
const btnMainAdd = { flex: 1, backgroundColor: '#10ac84', color: 'white', border: 'none', borderRadius: '18px', padding: '18px', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(16, 172, 132, 0.3)' };
const btnMainRemove = { flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '18px', padding: '18px', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.3)' };
const alertSuccessStyle = { display: 'flex', alignItems: 'center', padding: '20px 25px', borderRadius: '20px', marginBottom: '40px', transition: 'opacity 0.5s ease-out' };
const statsGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '45px' };
const statCardStyle = { backgroundColor: '#151b2b', padding: '30px', borderRadius: '25px', border: '1px solid #2a3241', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' };
const editPriorityBtn = { padding: '10px 18px', borderRadius: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' };
const arrowBtn = { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' };
const cascadeCard = { backgroundColor: '#151b2b', padding: '25px 30px', borderRadius: '25px', border: '1px solid #2a3241', transition: '0.2s', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' };
const progressBg = { width: '100%', height: '14px', backgroundColor: '#0b0f19', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' };
const progressFill = { height: '100%', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' };
const cajonesGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' };
const cajonCard = { backgroundColor: '#151b2b', padding: '30px', borderRadius: '30px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '1px solid #2a3241' };
const iconBox = { padding: '18px', borderRadius: '20px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const addCajonCard = { border: '3px dashed rgba(59, 130, 246, 0.4)', background:'rgba(59, 130, 246, 0.05)', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: '220px', transition: '0.2s' };
const profileTriggerStyle = { cursor: 'pointer' };
const avatarSmallStyle = { width: '60px', height: '60px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', boxShadow: '0 5px 15px rgba(59,130,246,0.4)' };
const profileMenuSidebar = { position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', background: '#151b2b', zIndex: 2000, padding: '45px', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '-15px 0 40px rgba(0,0,0,0.5)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflowY: 'auto', borderLeft: '1px solid #2a3241' };
const avatarLargeStyle = { width: '110px', height: '110px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '45px', margin: '0 auto', boxShadow: '0 10px 25px rgba(59,130,246,0.4)' };
const profileActionBtn = { width: '100%', padding: '20px', background: '#0b0f19', border: '1px solid #2a3241', borderRadius: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '15px', color: '#e2e8f0', cursor: 'pointer', marginBottom: '15px' };
const logoutBtnStyle = { width: '100%', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '15px', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', marginTop: 'auto' };
const deleteAccountBtnStyle = { width: '100%', padding: '20px', background: 'transparent', color: '#ef4444', border: '2px dashed #ef4444', borderRadius: '15px', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px', transition: '0.2s' };

export default Dashboard;