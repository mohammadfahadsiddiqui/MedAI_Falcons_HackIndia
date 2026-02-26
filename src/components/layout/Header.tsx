import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, X, CheckCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Your health at a glance' },
    '/ai-consultant': { title: 'AI Consultant', subtitle: 'Chat with your AI medical assistant' },
    '/health-tracker': { title: 'Health Tracker', subtitle: 'Monitor your daily health logs' },
    '/profile': { title: 'Health Profile', subtitle: 'Your personal medical information' },
    '/doctors': { title: 'Doctor Consultation', subtitle: 'Find and book specialists' },
    '/emergency': { title: 'Emergency SOS', subtitle: '24/7 emergency response system' },
    '/insights': { title: 'AI Insights', subtitle: 'Personalized health analysis' },
    '/admin': { title: 'Admin Panel', subtitle: 'System management & analytics' },
    '/settings': { title: 'Settings', subtitle: 'Preferences & privacy controls' },
};

const Header: React.FC = () => {
    const { isDark, toggleTheme, notifications, unreadCount, markAllRead } = useAppStore();
    const [showNotif, setShowNotif] = useState(false);
    const location = useLocation();
    const page = pageTitles[location.pathname] || { title: 'MedAI', subtitle: 'Health Ecosystem' };

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 'var(--sidebar-width)',
            right: 0,
            height: 'var(--header-height)',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            zIndex: 99,
        }}>
            {/* Left: Page title */}
            <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {page.title}
                </h1>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{page.subtitle}</p>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Theme toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="btn btn-ghost"
                    style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isDark ? 'moon' : 'sun'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isDark ? <Moon size={16} /> : <Sun size={16} />}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>

                {/* Notification bell */}
                <div style={{ position: 'relative' }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNotif(!showNotif)}
                        className="btn btn-ghost"
                        style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }}
                    >
                        <Bell size={16} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 6, right: 6,
                                width: 8, height: 8, borderRadius: '50%',
                                background: 'var(--color-danger)',
                                border: '2px solid var(--bg-surface)',
                            }} />
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotif && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'absolute', top: 48, right: 0,
                                    width: 320,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 16,
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 999,
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} style={{ color: 'var(--color-primary-light)', fontSize: 12, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <CheckCheck size={13} /> Mark all read
                                            </button>
                                        )}
                                        <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                                        <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                                        <p>No notifications yet</p>
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                        {notifications.map((n) => (
                                            <div key={n.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'rgba(99,102,241,0.05)' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
