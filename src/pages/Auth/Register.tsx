import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../firebase/config';
import { Heart, Mail, Lock, User, Chrome, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const createUserDoc = async (uid: string, name: string, email: string) => {
        await setDoc(doc(db, 'users', uid), {
            profile: { name, email, createdAt: new Date().toISOString() },
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
            await updateProfile(cred.user, { displayName: form.name });
            await createUserDoc(cred.user.uid, form.name, form.email);
            toast.success('Account created! Welcome 🎉');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        try {
            const cred = await signInWithPopup(auth, googleProvider);
            await createUserDoc(cred.user.uid, cred.user.displayName || '', cred.user.email || '');
            toast.success('Welcome to MedAI! 🎉');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}>
                        <Heart size={28} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
                        Join <span className="gradient-text">MedAI</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>Create your health account today</p>
                </div>

                <div className="card" style={{ padding: 32 }}>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleGoogle} disabled={loading} className="btn btn-ghost" style={{ width: '100%', marginBottom: 20, padding: '12px 20px', fontSize: 14 }}>
                        <Chrome size={18} /> Continue with Google
                    </motion.button>

                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginBottom: 20, position: 'relative' }}>
                        <span style={{ background: 'var(--bg-card)', padding: '0 12px', position: 'relative', zIndex: 1 }}>or register with email</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
                    </div>

                    <form onSubmit={handleRegister}>
                        <div style={{ marginBottom: 14, position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" style={{ paddingLeft: 40 }} required />
                        </div>
                        <div style={{ marginBottom: 14, position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" style={{ paddingLeft: 40 }} required />
                        </div>
                        <div style={{ marginBottom: 24, position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type={showPw ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" style={{ paddingLeft: 40, paddingRight: 44 }} required minLength={6} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', height: 46, fontSize: 15 }}>
                            {loading ? 'Creating account...' : <><>Create Account</> <ArrowRight size={16} /></>}
                        </motion.button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
