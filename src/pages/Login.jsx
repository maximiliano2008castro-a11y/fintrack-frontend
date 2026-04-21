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

    const handleLogin = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password) return alert('⚠️ Ingresa correo y contraseña.');
        
        // ==========================================
        // 🔴 INICIO DE SESIÓN CON NODE.JS
        // ==========================================
        try {
            const respuesta = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password: password })
            });

            if (respuesta.ok) {
                console.log("¡Login exitoso desde Node.js!");
            } else {
                const errorData = await respuesta.json();
                return alert('❌ Error: ' + (errorData.message || 'Credenciales incorrectas'));
            }
        } catch (error) {
            console.error("No se pudo conectar a Node.js para Login. Usando modo local.", error);
            // MODO SUPERVIVENCIA (Solo si Node.js está apagado)
            const db = JSON.parse(localStorage.getItem('finTrack_DB') || '{}');
            const userProfile = db[cleanEmail];
            if (!userProfile) return alert('❌ Esta cuenta no existe en la base local ni en el servidor.');
            if (userProfile.password !== password) return alert('❌ Contraseña incorrecta.');
        }
        // ==========================================

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
        if (password !== confirmPassword) {
            return alert('❌ Las contraseñas no coinciden.');
        }

        // ==========================================
        // 🔴 REGISTRO CON NODE.JS (PUERTO 5000)
        // ==========================================
        const datosParaNode = {
            email: cleanEmail,
            password: password
        };

        try {
            const respuesta = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosParaNode)
            });

            let resultado;
            try {
                resultado = await respuesta.json();
            } catch(e) {
                resultado = { message: "El servidor no devolvió un JSON válido. Revisa tu authController." };
            }

            if (respuesta.ok) {
                alert("✅ ¡BINGO! Conectado a Node.js y guardado en MySQL.");
                
                // Mantenemos la estructura en el navegador para que tu app siga funcionando como siempre
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
            alert("❌ ERROR DE CONEXIÓN: React no pudo llegar a Node.js. Asegúrate de que el servidor en el puerto 5000 esté corriendo y CORS esté activo.");
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

// ESTILOS DE TU DISEÑO
const wrapperStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212', fontFamily: 'sans-serif' };
const cardStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '5px', width: '100%', maxWidth: '400px', border: '5px solid #f39c12', boxShadow: '15px 15px 0px #000' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = { padding: '15px', border: '2px solid #000', outline: 'none', fontSize: '16px', fontWeight: 'bold' };
const btnPrimary = { padding: '15px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const footerTextStyle = { textAlign: 'center', marginTop: '20px', fontWeight: 'bold', color: '#000' };
const actionLinkStyle = { color: '#f39c12', cursor: 'pointer', textDecoration: 'underline' };

export default Login;