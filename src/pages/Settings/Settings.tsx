import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Moon, Database, Trash, Download, Lock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
    const { isDark, toggleTheme } = useAppStore();
    const [notifs, setNotifs] = useState({ reminders: true, insights: true, emergency: true, appointments: false });
    const [privacy, setPrivacy] = useState({ shareData: false, analytics: true, encryptLocal: true });

    const Toggle: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
        <motion.div
            onClick={onChange}
            style={{
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                background: value ? 'var(--color-primary)' : 'var(--bg-input)',
                border: '1px solid var(--border)',
                position: 'relative', transition: 'background 0.25s',
            }}
        >
            <motion.div
                animate={{ x: value ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            />
        </motion.div>
    );

    const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color="var(--color-primary-light)" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
            </div>
            {children}
        </motion.div>
    );

    const Row: React.FC<{ label: string; desc: string; right: React.ReactNode }> = ({ label, desc, right }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
            </div>
            {right}
        </div>
    );

    return (
        <div style={{ maxWidth: 720 }}>
            <div className="section-title">Settings</div>
            <div className="section-subtitle">Preferences, notifications, and privacy controls</div>

            <Section icon={Moon} title="Appearance">
                <Row label="Dark Mode" desc="Toggle between dark and light theme"
                    right={<Toggle value={isDark} onChange={toggleTheme} />} />
                <Row label="Theme" desc="Current active theme"
                    right={<span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{isDark ? '🌙 Dark' : '☀️ Light'}</span>} />
            </Section>

            <Section icon={Bell} title="Notifications">
                {Object.entries(notifs).map(([key, val]) => (
                    <Row key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} desc={`Receive ${key} notifications`}
                        right={<Toggle value={val} onChange={() => setNotifs({ ...notifs, [key]: !val })} />} />
                ))}
            </Section>

            <Section icon={Shield} title="Privacy & Security">
                {Object.entries(privacy).map(([key, val]) => (
                    <Row key={key} label={key.replace(/([A-Z])/g, ' $1')} desc={`Enable ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        right={<Toggle value={val} onChange={() => setPrivacy({ ...privacy, [key]: !val })} />} />
                ))}
                <Row label="Two-Factor Authentication" desc="Secure your account with 2FA"
                    right={<button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}><Lock size={13} /> Enable</button>} />
            </Section>

            <Section icon={Database} title="Data Management">
                <Row label="Export Health Data" desc="Download all your health records as PDF"
                    right={<button onClick={() => toast('Export feature available with Firebase setup')} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}><Download size={13} /> Export</button>} />
                <Row label="Delete Account" desc="Permanently delete your account and all data"
                    right={<button onClick={() => toast.error('Account deletion requires email confirmation')} className="btn" style={{ fontSize: 12, padding: '6px 12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}><Trash size={13} /> Delete</button>} />
            </Section>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                MedAI v2.0.0 · Built with ❤️ · <a href="#" style={{ color: 'var(--color-primary-light)' }}>Privacy Policy</a> · <a href="#" style={{ color: 'var(--color-primary-light)' }}>Terms</a>
            </div>
        </div>
    );
};

export default Settings;
