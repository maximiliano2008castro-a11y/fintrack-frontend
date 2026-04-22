import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [isLoginView, setIsLoginView] = useState(true);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
        localStorage.removeItem('configGlobal');
    }, [navigate]);

    // 🔴 FILTRO DE SEGURIDAD ESTRICTO PARA CONTRASEÑAS
    const validarPasswordSegura = (pass) => {
        if (pass.length < 8) return "Debe tener al menos 8 caracteres.";
        if (!/[A-Z]/.test(pass)) return "Debe incluir al menos una letra MAYÚSCULA.";
        if (!/[a-z]/.test(pass)) return "Debe incluir al menos una letra minúscula.";
        if (!/[0-9]/.test(pass)) return "Debe incluir al menos un número.";
        if (!/[@$!%*?&.,\-_]/.test(pass)) return "Debe incluir al menos un carácter especial (ej. @$!%*?&).";
        return "OK";
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password) return alert('⚠️ Ingresa correo y contraseña.');
        
        try {
            // 👇 TU LINK REAL AQUÍ 👇
            const respuesta = await fetch('https://fintrack-backend-27ml.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password: password })
            });

            if (respuesta.ok) {
                console.log("¡Login exitoso desde la nube!");
            } else {
                const errorData = await respuesta.json();
                return alert('❌ Error: ' + (errorData.message || 'Credenciales incorrectas'));
            }
        } catch (error) {
            console.error("No se pudo conectar al servidor. Usando modo local.", error);
            const db = JSON.parse(localStorage.getItem('finTrack_DB') || '{}');
            const userProfile = db[cleanEmail];
            if (!userProfile) return alert('❌ Esta cuenta no existe en la base local ni en el servidor.');
            if (userProfile.password !== password) return alert('❌ Contraseña incorrecta.');
        }

        localStorage.setItem('token', 'active_session');
        localStorage.setItem('userEmail', cleanEmail);
        
        const dbLocal = JSON.parse(localStorage.getItem('finTrack_DB') || '{}');
        localStorage.setItem('userName', dbLocal[cleanEmail]?.nombre || '');
        
        navigate('/dashboard');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !password || !confirmPassword) {
            return alert('⚠️ Llena todos los campos.');
        }

        // 🔴 APLICAMOS EL FILTRO DE SEGURIDAD AQUÍ
        const estadoPassword = validarPasswordSegura(password);
        if (estadoPassword !== "OK") {
            return alert(`🛡️ Contraseña insegura:\n${estadoPassword}`);
        }

        if (password !== confirmPassword) {
            return alert('❌ Las contraseñas no coinciden.');
        }

        const datosParaNode = {
            email: cleanEmail,
            password: password
        };

        try {
            // 👇 TU LINK REAL AQUÍ 👇
            const respuesta = await fetch('https://fintrack-backend-27ml.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosParaNode)
            });

            let resultado;
            try {
                resultado = await respuesta.json();
            } catch(e) {
                resultado = { message: "El servidor no devolvió un JSON válido." };
            }

            if (respuesta.ok) {
                alert("✅ ¡BINGO! Conectado a Render y guardado en TiDB.");
                
                const db = JSON.parse(localStorage.getItem('finTrack_DB') || '{}');
                db[cleanEmail] = { 
                    nombre: '', 
                    password: password, 
                    pinSeguridad: '', 
                    fechaNacimiento: '', 
                    configGlobal: { ingresos: [] }, 
                    historial: [], 
                    agenda: [] 
                };
                
                localStorage.setItem('finTrack_DB', JSON.stringify(db));
                localStorage.setItem('token', 'active_session');
                localStorage.setItem('userEmail', cleanEmail);
                localStorage.setItem('userName', ''); 
                
                navigate('/dashboard');
            } else {
                alert("❌ EL BACKEND RECHAZÓ EL DATO: " + resultado.message);
            }
            
        } catch (error) {
            alert("❌ ERROR DE CONEXIÓN: React no pudo llegar a Render.");
            console.error("Detalle técnico del error:", error);
        }
    };

    const switchView = (isLogin) => {
        setIsLoginView(isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div style={wrapperStyle}>
            <div style={cardStyle}>
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    <h1 style={{color:'#000', fontSize:'32px', margin:0}}>FINTRACK<br/><span style={{color:'#f39c12'}}>LOGIN</span></h1>
                </div>

                {isLoginView ? (
                    <>
                        <form onSubmit={handleLogin} style={formStyle}>
                            <input type="email" placeholder="Correo Electrónico" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} />
                            <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle} />
                            <button type="submit" style={btnPrimary}>ACCEDER</button>
                        </form>
                        <div style={footerTextStyle}>
                            ¿Eres nuevo? <span onClick={() => switchView(false)} style={actionLinkStyle}>Regístrate aquí</span>
                        </div>
                    </>
                ) : (
                    <>
                        <form onSubmit={handleRegister} style={formStyle}>
                            <input type="email" placeholder="Correo Electrónico" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} />
                            <input type="password" placeholder="Crea tu Contraseña" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle} />
                            <input type="password" placeholder="Confirma tu Contraseña" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={inputStyle} />
                            
                            {/* 🔴 TEXTO DE AYUDA VISUAL PARA EL USUARIO */}
                            <div style={{fontSize: '11px', color: '#666', lineHeight: '1.4', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}>
                                <b>Tu contraseña debe tener:</b><br/>
                                • Mín. 8 caracteres • 1 MAYÚSCULA<br/>
                                • 1 minúscula • 1 número • 1 carácter especial
                            </div>

                            <button type="submit" style={btnPrimary}>REGISTRARSE</button>
                        </form>
                        <div style={footerTextStyle}>
                            ¿Ya tienes cuenta? <span onClick={() => switchView(true)} style={actionLinkStyle}>Inicia sesión</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ESTILOS
const wrapperStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212', fontFamily: 'sans-serif' };
const cardStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '5px', width: '100%', maxWidth: '400px', border: '5px solid #f39c12', boxShadow: '15px 15px 0px #000' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = { padding: '15px', border: '2px solid #000', outline: 'none', fontSize: '16px', fontWeight: 'bold' };
const btnPrimary = { padding: '15px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const footerTextStyle = { textAlign: 'center', marginTop: '20px', fontWeight: 'bold', color: '#000' };
const actionLinkStyle = { color: '#f39c12', cursor: 'pointer', textDecoration: 'underline' };

export default Login;