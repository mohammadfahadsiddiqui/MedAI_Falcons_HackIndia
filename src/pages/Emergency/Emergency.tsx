import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MapPin, Heart, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Emergency: React.FC = () => {
    const [activated, setActivated] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => { }
            );
        }
    }, []);

    const startSOS = () => {
        setCountdown(5);
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    setActivated(true);
                    setCountdown(null);
                    toast.success('🚨 Emergency SOS Activated! Help is on the way.', { duration: 5000 });
                    simulateSteps();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const simulateSteps = () => {
        setTimeout(() => setStep(1), 1000);
        setTimeout(() => setStep(2), 2500);
        setTimeout(() => setStep(3), 4000);
    };

    const cancel = () => {
        setActivated(false);
        setCountdown(null);
        setStep(0);
        toast('SOS cancelled', { icon: '✅' });
    };

    const steps = [
        { label: 'Location data sent', done: step >= 1 },
        { label: 'Health profile transmitted', done: step >= 2 },
        { label: 'Emergency contacts alerted', done: step >= 3 },
    ];

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="section-title" style={{ textAlign: 'center' }}>Emergency SOS System</div>
            <div className="section-subtitle" style={{ textAlign: 'center' }}>One-tap emergency response — Available 24/7</div>

            {/* SOS Button */}
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Pulse rings */}
                    {activated && (
                        <>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    position: 'absolute', borderRadius: '50%',
                                    border: '2px solid rgba(239,68,68,0.3)',
                                    animation: `pulse-ring 2s ${i * 0.5}s ease-out infinite`,
                                    width: 100 + i * 60, height: 100 + i * 60,
                                    pointerEvents: 'none',
                                }} />
                            ))}
                        </>
                    )}

                    {countdown !== null ? (
                        <div style={{
                            width: 160, height: 160, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column',
                            boxShadow: '0 0 60px rgba(239,68,68,0.6)',
                            cursor: 'pointer',
                            border: '4px solid rgba(255,255,255,0.2)',
                        }} onClick={cancel}>
                            <div style={{ fontSize: 52, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{countdown}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Tap to cancel</div>
                        </div>
                    ) : (
                        <motion.div
                            whileHover={!activated ? { scale: 1.05 } : {}}
                            whileTap={!activated ? { scale: 0.95 } : {}}
                            onClick={!activated ? startSOS : cancel}
                            style={{
                                width: 160, height: 160, borderRadius: '50%',
                                background: activated ? 'linear-gradient(135deg, #dc2626, #7f1d1d)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'column', gap: 8, cursor: 'pointer',
                                boxShadow: activated ? '0 0 60px rgba(239,68,68,0.8)' : '0 0 40px rgba(239,68,68,0.4)',
                                border: '4px solid rgba(255,255,255,0.15)',
                            }}
                        >
                            <AlertTriangle size={40} color="white" />
                            <div style={{ color: 'white', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-display)' }}>
                                {activated ? 'ACTIVE' : 'SOS'}
                            </div>
                        </motion.div>
                    )}
                </div>

                <p style={{ marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
                    {activated ? '🚨 Emergency services alerted' : countdown !== null ? 'Hold to cancel' : 'Hold the button to activate emergency'}
                </p>
            </div>

            {/* Status steps */}
            <AnimatePresence>
                {activated && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Emergency Response Status</div>
                        {steps.map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                {s.done ? <CheckCircle size={18} color="#22c55e" /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border)', animation: 'spin 1s linear infinite' }} />}
                                <span style={{ fontSize: 14, color: s.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.label}</span>
                                {s.done && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Done</span>}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info cards */}
            <div className="grid-2">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                        <MapPin size={18} color="var(--color-primary)" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Your Location</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {location ? <><div>Lat: {location.lat.toFixed(5)}</div><div>Lng: {location.lng.toFixed(5)}</div><div style={{ marginTop: 8, color: '#22c55e', fontWeight: 600, fontSize: 12 }}>✅ Location ready</div></> : <div style={{ color: 'var(--text-muted)' }}>Click SOS to enable location</div>}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                        <Phone size={18} color="#ef4444" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Emergency Contact</span>
                    </div>
                    <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 600 }}>Jane Doe</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>+1-555-0100</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Spouse</div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                        <Heart size={18} color="#ec4899" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Critical Info</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div>🩸 Blood Group: <strong style={{ color: 'var(--text-primary)' }}>O+</strong></div>
                        <div>💊 Allergies: <strong style={{ color: 'var(--text-primary)' }}>Penicillin</strong></div>
                        <div>❤️ Conditions: <strong style={{ color: 'var(--text-primary)' }}>None</strong></div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                        <Shield size={18} color="#f59e0b" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Emergency Numbers</span>
                    </div>
                    {[['Ambulance', '108'], ['Police', '100'], ['Fire', '101']].map(([name, num]) => (
                        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
                            <a href={`tel:${num}`} style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>{num}</a>
                        </div>
                    ))}
                </motion.div>
            </div>

            <style>{`
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(1.8);opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
        </div>
    );
};

export default Emergency;
