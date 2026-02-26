import React from 'react';
import { motion } from 'framer-motion';
import { Users, Bot, AlertTriangle, Activity, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const userGrowth = [
    { month: 'Sep', users: 120 }, { month: 'Oct', users: 280 }, { month: 'Nov', users: 450 },
    { month: 'Dec', users: 720 }, { month: 'Jan', users: 1100 }, { month: 'Feb', users: 1580 },
];

const aiLogs = [
    { id: 1, user: 'Ahmed K.', query: 'Chest tightness after exercise', severity: 'high', time: '2 min ago' },
    { id: 2, user: 'Priya S.', query: 'Headache for 3 days', severity: 'medium', time: '15 min ago' },
    { id: 3, user: 'Maria C.', query: 'Skin rash on arm', severity: 'low', time: '28 min ago' },
    { id: 4, user: 'James W.', query: 'Knee pain when climbing stairs', severity: 'medium', time: '45 min ago' },
    { id: 5, user: 'Aisha P.', query: 'Anxiety attack symptoms', severity: 'high', time: '1h ago' },
];

const sevColor: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

const Admin: React.FC = () => (
    <div>
        <div className="section-title">Admin Panel</div>
        <div className="section-subtitle">System analytics and management dashboard</div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
                { icon: Users, label: 'Total Users', value: '1,580', color: '#6366f1', bg: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
                { icon: Bot, label: 'AI Chats Today', value: '342', color: '#06b6d4', bg: 'linear-gradient(135deg,#06b6d4,#0284c7)' },
                { icon: AlertTriangle, label: 'SOS Alerts', value: '7', color: '#ef4444', bg: 'linear-gradient(135deg,#ef4444,#dc2626)' },
                { icon: Activity, label: 'Health Logs', value: '8,912', color: '#22c55e', bg: 'linear-gradient(135deg,#22c55e,#16a34a)' },
            ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card" style={{ padding: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <s.icon size={18} color="white" />
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
                </motion.div>
            ))}
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>User Growth</div>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={userGrowth} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                        <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>System Status</div>
                {[
                    { label: 'Firebase Auth', status: 'Operational', ok: true },
                    { label: 'Firestore DB', status: 'Operational', ok: true },
                    { label: 'Gemini AI API', status: 'Operational', ok: true },
                    { label: 'Cloud Functions', status: 'Setup Required', ok: false },
                    { label: 'Firebase Storage', status: 'Setup Required', ok: false },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={13} /> {item.label}
                        </span>
                        <span style={{ fontWeight: 600, color: item.ok ? '#22c55e' : '#f59e0b' }}>
                            {item.ok ? '✅' : '⚠️'} {item.status}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>

        {/* AI Chat Logs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>Recent AI Chat Logs</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-input)' }}>
                        {['User', 'Query', 'Severity', 'Time'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {aiLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{log.user}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300 }}>{log.query}</td>
                            <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${sevColor[log.severity]}20`, color: sevColor[log.severity], fontWeight: 600 }}>
                                    {log.severity}
                                </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{log.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    </div>
);

export default Admin;
