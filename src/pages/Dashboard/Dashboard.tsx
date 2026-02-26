import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Heart, Droplets, Moon, Flame, TrendingUp,
    TrendingDown, Zap, AlertTriangle, Award, ChevronRight, Bot
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { useNavigate } from 'react-router-dom';

const weekData = [
    { day: 'Mon', health: 72, steps: 6200, sleep: 7 },
    { day: 'Tue', health: 68, steps: 4800, sleep: 6.5 },
    { day: 'Wed', health: 81, steps: 9100, sleep: 8 },
    { day: 'Thu', health: 75, steps: 7300, sleep: 7 },
    { day: 'Fri', health: 88, steps: 10200, sleep: 8.5 },
    { day: 'Sat', health: 91, steps: 11500, sleep: 9 },
    { day: 'Sun', health: 85, steps: 8900, sleep: 8 },
];

const tips = [
    '💧 Drink at least 8 glasses of water daily to maintain optimal hydration.',
    '🚶 A 30-minute walk daily can reduce cardiovascular risk by 35%.',
    '😴 Quality sleep between 7–9 hours supports immune function and mental clarity.',
    '🥦 Include 5 portions of fruits and vegetables daily for essential nutrients.',
    '🧘 5 minutes of mindful breathing reduces cortisol levels significantly.',
];

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    unit?: string;
    trend?: number;
    color: string;
    bgGradient: string;
    delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, unit, trend, color, bgGradient, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="card"
        style={{ padding: 20, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
        whileHover={{ scale: 1.02 }}
    >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: bgGradient, opacity: 0.15 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color="white" />
            </div>
            {trend !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: trend >= 0 ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: 600 }}>
                    {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {value}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </motion.div>
);

const Dashboard: React.FC = () => {
    const { user } = useAppStore();
    const navigate = useNavigate();
    const [tipIdx] = useState(Math.floor(Math.random() * tips.length));
    const [healthScore] = useState(87);
    const firstName = user?.displayName?.split(' ')[0] || 'there';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div>
            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
                    {greeting}, <span className="gradient-text">{firstName}</span> 👋
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                    Here's your health overview for today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </motion.div>

            {/* AI Health Score */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                    padding: '24px 28px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: -30, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>AI Health Score</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 56, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'white' }}>{healthScore}</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>/100</span>
                    </div>
                    <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginTop: 8 }}>
                        <Zap size={11} style={{ marginRight: 4 }} /> Excellent – Keep it up!
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'right' }}>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 2 }}>Heart Rate</div>
                        <strong style={{ fontSize: 18 }}>72</strong> <span style={{ fontSize: 12, opacity: 0.7 }}>bpm</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 2 }}>Blood O₂</div>
                        <strong style={{ fontSize: 18 }}>98%</strong>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/ai-consultant')}
                        style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 14px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(10px)' }}
                    >
                        <Bot size={13} /> Ask AI <ChevronRight size={12} />
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats grid */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                <StatCard icon={Droplets} label="Water intake" value="6" unit="/ 8 glasses" trend={12} color="#06b6d4" bgGradient="linear-gradient(135deg,#06b6d4,#0284c7)" delay={0.1} />
                <StatCard icon={Moon} label="Sleep last night" value="7.5" unit="hrs" trend={5} color="#8b5cf6" bgGradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" delay={0.15} />
                <StatCard icon={Flame} label="Calories burned" value="1,847" unit="kcal" trend={8} color="#f97316" bgGradient="linear-gradient(135deg,#f97316,#ea580c)" delay={0.2} />
                <StatCard icon={Activity} label="Steps today" value="8,432" trend={-3} color="#22c55e" bgGradient="linear-gradient(135deg,#22c55e,#16a34a)" delay={0.25} />
            </div>

            {/* Chart + Tip */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Health Trend Chart */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>Health Trend</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Past 7 days overview</div>
                        </div>
                        <span className="badge badge-primary">7 Day</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={weekData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                            <Area type="monotone" dataKey="health" stroke="#6366f1" strokeWidth={2} fill="url(#healthGrad)" dot={{ fill: '#6366f1', r: 3 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Tip of the day */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="card" style={{ padding: 20, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={13} color="white" />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>Health Tip</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tips[tipIdx]}</p>
                    </motion.div>

                    {/* Emergency SOS */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ padding: 20, borderRadius: 16, background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                        onClick={() => navigate('/emergency')}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(239,68,68,0.4)', position: 'relative' }}>
                                <AlertTriangle size={18} color="white" />
                                <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2px solid rgba(239,68,68,0.3)', animation: 'pulse 2s infinite' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: '#f87171' }}>Emergency SOS</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap to activate instantly</div>
                            </div>
                            <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Quick Actions</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                        { icon: Bot, label: 'Ask AI', path: '/ai-consultant', color: '#6366f1' },
                        { icon: Activity, label: 'Log Health', path: '/health-tracker', color: '#22c55e' },
                        { icon: Heart, label: 'My Profile', path: '/profile', color: '#ec4899' },
                        { icon: Award, label: 'Insights', path: '/insights', color: '#f59e0b' },
                    ].map((item) => (
                        <motion.div
                            key={item.path}
                            whileHover={{ scale: 1.04, y: -2 }}
                            onClick={() => navigate(item.path)}
                            className="card"
                            style={{ padding: '18px 14px', textAlign: 'center', cursor: 'pointer' }}
                        >
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                <item.icon size={20} color={item.color} />
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
