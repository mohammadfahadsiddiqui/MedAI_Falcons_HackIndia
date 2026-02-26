import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Bot, Activity, User, Stethoscope,
    AlertTriangle, Lightbulb, Settings, Shield, LogOut,
    Heart, ChevronRight, Pill, FlaskConical, Calculator, FileText,
    Brain, SmilePlus, Search, Users, Dna, ClipboardList
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAppStore } from '../../store/useAppStore';
import { useCartStore } from '../../store/useCartStore';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bot, label: 'AI Consultant', path: '/ai-consultant' },
    { icon: Activity, label: 'Health Tracker', path: '/health-tracker' },
    { icon: User, label: 'Health Profile', path: '/profile' },
    { icon: Pill, label: 'Pharmacy', path: '/pharmacy', badge: true },
    { icon: FileText, label: 'Prescriptions', path: '/prescriptions' },
    { icon: FlaskConical, label: 'Lab Tests', path: '/lab-tests' },
    { icon: Calculator, label: 'Dosage Calc', path: '/dosage-calculator' },
    { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
    { icon: AlertTriangle, label: 'Emergency', path: '/emergency' },
    { icon: Lightbulb, label: 'AI Insights', path: '/insights' },
    // ─── 2026 AI Features ───────────────────────────────
    { icon: Dna, label: 'Health Twin', path: '/health-twin', section: 'AI 2026' },
    { icon: SmilePlus, label: 'Mental Health', path: '/mental-health' },
    { icon: ClipboardList, label: 'Doctor Dashboard', path: '/doctor-dashboard' },
    { icon: Search, label: 'Second Opinion', path: '/second-opinion' },
    { icon: Users, label: 'Family Vault', path: '/family-vault' },
    { icon: Brain, label: 'Medications', path: '/medications' },
    // ────────────────────────────────────────────────────
    { icon: Shield, label: 'Admin Panel', path: '/admin' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const cartCount = useCartStore(s => s.getTotalItems());

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            height: '100vh',
            position: 'fixed',
            left: 0, top: 0,
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            overflowY: 'auto',
        }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                    }}>
                        <Heart size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
                            Med<span style={{ color: 'var(--color-primary-light)' }}>AI</span>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>HEALTH ECOSYSTEM</div>
                    </div>
                </motion.div>
            </div>

            {/* User mini-card */}
            {user && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.displayName || 'User'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.email}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px 12px' }}>
                {navItems.map((item, idx) => (
                    <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                    >
                        {(item as any).section && (
                            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: 'var(--color-primary-light)', paddingLeft: 12, marginTop: 10, marginBottom: 4, textTransform: 'uppercase' }}>
                                ✦ {(item as any).section}
                            </div>
                        )}
                        <NavLink
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 10,
                                marginBottom: 4,
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                background: isActive
                                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                                    : 'transparent',
                                boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                                fontSize: 13,
                                fontWeight: isActive ? 600 : 400,
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                position: 'relative',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={16} />
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                    {(item as any).badge && cartCount > 0 && (
                                        <span style={{
                                            background: '#ef4444', color: 'white',
                                            borderRadius: '50%', width: 18, height: 18,
                                            fontSize: 10, fontWeight: 800,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {cartCount}
                                        </span>
                                    )}
                                    {isActive && !(item as any).badge && <ChevronRight size={14} />}
                                    {isActive && (item as any).badge && cartCount === 0 && <ChevronRight size={14} />}
                                </>
                            )}
                        </NavLink>
                    </motion.div>
                ))}
            </nav>

            {/* Logout */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                <button
                    onClick={handleLogout}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 10, fontSize: 13, color: 'var(--color-danger)' }}
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
