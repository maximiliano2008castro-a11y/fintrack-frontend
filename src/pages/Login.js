import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';

const Login = () => {
    const navigate = useNavigate();
    const [isLoginView, setIsLoginView] = useState(true);

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
        localStorage.removeItem('configGlobal');
    }, [navigate]);

    // Filtro de seguridad para contraseñas
    const validarPasswordSegura = (pass) => {
        if (pass.length < 8) return "Debe tener al menos 8 caracteres.";
        if (!/[A-Z]/.test(pass)) return "Debe incluir al menos una letra MAYÚSCULA.";
        if (!/[a-z]/.test(pass)) return "Debe incluir al menos una letra minúscula.";
        if (!/[0-9]/.test(pass)) return "Debe incluir al menos un número.";
        if (!/[@$!%*?&.,\-_]/.test(pass)) return "Debe incluir al menos un carácter especial (ej. @$!%*?&).";
        return "OK";
    };

    /**
     * Guarda la sesion con el token REAL que emite el servidor.
     * Nunca se guarda la contraseña: el backend la tiene encriptada y aqui no hace falta.
     */
    const guardarSesion = (datos, correo) => {
        localStorage.setItem('token', datos.token);
        localStorage.setItem('userEmail', correo);
        localStorage.setItem('userName', datos.user?.nombre || '');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password) return alert('Ingresa tu correo y contraseña.');

        setCargando(true);
        try {
            const respuesta = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password })
            });

            const datos = await respuesta.json().catch(() => ({}));

            if (!respuesta.ok) {
                return alert(datos.message || 'Correo o contraseña incorrectos.');
            }

            if (!datos.token) {
                return alert('No se pudo iniciar la sesión. Intenta de nuevo en un momento.');
            }

            guardarSesion(datos, cleanEmail);
            navigate('/dashboard');
        } catch (error) {
            console.error('Fallo al conectar con el servidor:', error);
            alert('No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        const cleanNombre = nombre.trim();

        if (!cleanNombre || !cleanEmail || !password || !confirmPassword) {
            return alert('Llena todos los campos.');
        }

        const estadoPassword = validarPasswordSegura(password);
        if (estadoPassword !== "OK") {
            return alert(`Contraseña insegura:\n${estadoPassword}`);
        }

        if (password !== confirmPassword) {
            return alert('Las contraseñas no coinciden.');
        }

        setCargando(true);
        try {
            const respuesta = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: cleanNombre, email: cleanEmail, password })
            });

            const datos = await respuesta.json().catch(() => ({}));

            if (!respuesta.ok) {
                return alert(datos.message || 'No se pudo crear la cuenta.');
            }

            if (!datos.token) {
                alert('Tu cuenta se creó. Inicia sesión para continuar.');
                return switchView(true);
            }

            guardarSesion(datos, cleanEmail);
            navigate('/dashboard');
        } catch (error) {
            console.error('Fallo al conectar con el servidor:', error);
            alert('No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    const switchView = (isLogin) => {
        setIsLoginView(isLogin);
        setNombre('');
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
                            <button type="submit" style={btnPrimary} disabled={cargando}>
                                {cargando ? 'ENTRANDO...' : 'ACCEDER'}
                            </button>
                        </form>
                        <div style={footerTextStyle}>
                            ¿Eres nuevo? <span onClick={() => switchView(false)} style={actionLinkStyle}>Regístrate aquí</span>
                        </div>
                    </>
                ) : (
                    <>
                        <form onSubmit={handleRegister} style={formStyle}>
                            <input type="text" placeholder="Tu nombre" value={nombre} onChange={e=>setNombre(e.target.value)} style={inputStyle} />
                            <input type="email" placeholder="Correo Electrónico" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} />
                            <input type="password" placeholder="Crea tu Contraseña" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle} />
                            <input type="password" placeholder="Confirma tu Contraseña" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={inputStyle} />

                            <div style={{fontSize: '11px', color: '#666', lineHeight: '1.4', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}>
                                <b>Tu contraseña debe tener:</b><br/>
                                • Mín. 8 caracteres • 1 MAYÚSCULA<br/>
                                • 1 minúscula • 1 número • 1 carácter especial
                            </div>

                            <button type="submit" style={btnPrimary} disabled={cargando}>
                                {cargando ? 'CREANDO...' : 'REGISTRARSE'}
                            </button>
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
