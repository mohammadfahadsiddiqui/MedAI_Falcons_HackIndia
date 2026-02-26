import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase/config';
import { Heart, Mail, Lock, Eye, EyeOff, Chrome, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Welcome back! 👋');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            toast.success('Welcome to MedAI! 🎉');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* BG decoration */}
            <div style={{
                position: 'absolute', top: '-20%', right: '-10%',
                width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', left: '-10%',
                width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 420 }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 18,
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                    }}>
                        <Heart size={28} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                        Welcome to <span className="gradient-text">MedAI</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
                        Your intelligent health companion
                    </p>
                </div>

                <div className="card" style={{ padding: 32, background: 'var(--bg-card)' }}>
                    {/* Google btn */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="btn btn-ghost"
                        style={{ width: '100%', marginBottom: 20, padding: '12px 20px', fontSize: 14, fontWeight: 500 }}
                    >
                        <Chrome size={18} />
                        Continue with Google
                    </motion.button>

                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginBottom: 20, position: 'relative' }}>
                        <span style={{ background: 'var(--bg-card)', padding: '0 12px', position: 'relative', zIndex: 1 }}>or continue with email</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
                    </div>

                    <form onSubmit={handleEmailLogin}>
                        {/* Email */}
                        <div style={{ marginBottom: 16, position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                style={{ paddingLeft: 40 }}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 24, position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                style={{ paddingLeft: 40, paddingRight: 44 }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%', height: 46, fontSize: 15 }}
                        >
                            {loading ? 'Signing in...' : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </motion.button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>
                            Create one
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
