import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Moon, Droplets, Flame, Trash2, Scale
} from 'lucide-react';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface HealthLog {
    id: string;
    date: string;
    sleep: number;
    water: number;
    exercise: number;
    bp_systolic: number;
    bp_diastolic: number;
    sugar: number;
    weight: number;
}

const mockLogs: HealthLog[] = [
    { id: '1', date: '2026-02-20', sleep: 7.5, water: 6, exercise: 40, bp_systolic: 118, bp_diastolic: 76, sugar: 92, weight: 72 },
    { id: '2', date: '2026-02-21', sleep: 8, water: 7, exercise: 30, bp_systolic: 120, bp_diastolic: 78, sugar: 96, weight: 71.8 },
    { id: '3', date: '2026-02-22', sleep: 6, water: 5, exercise: 0, bp_systolic: 125, bp_diastolic: 82, sugar: 102, weight: 72.1 },
    { id: '4', date: '2026-02-23', sleep: 7, water: 8, exercise: 60, bp_systolic: 116, bp_diastolic: 74, sugar: 89, weight: 71.5 },
    { id: '5', date: '2026-02-24', sleep: 9, water: 8, exercise: 45, bp_systolic: 114, bp_diastolic: 73, sugar: 86, weight: 71.3 },
];

const metricConfig = [
    { key: 'sleep', label: 'Sleep', unit: 'hrs', icon: Moon, color: '#8b5cf6', max: 10 },
    { key: 'water', label: 'Water', unit: 'glasses', icon: Droplets, color: '#06b6d4', max: 10 },
    { key: 'exercise', label: 'Exercise', unit: 'min', icon: Flame, color: '#f97316', max: 120 },
    { key: 'weight', label: 'Weight', unit: 'kg', icon: Scale, color: '#22c55e', max: 150 },
];

const defaultForm = { sleep: '', water: '', exercise: '', bp_systolic: '', bp_diastolic: '', sugar: '', weight: '' };

const HealthTracker: React.FC = () => {
    const [logs, setLogs] = useState<HealthLog[]>(mockLogs);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [activeMetric, setActiveMetric] = useState('sleep');

    const addLog = () => {
        const newLog: HealthLog = {
            id: Date.now().toString(),
            date: format(new Date(), 'yyyy-MM-dd'),
            sleep: +form.sleep || 0,
            water: +form.water || 0,
            exercise: +form.exercise || 0,
            bp_systolic: +form.bp_systolic || 0,
            bp_diastolic: +form.bp_diastolic || 0,
            sugar: +form.sugar || 0,
            weight: +form.weight || 0,
        };
        setLogs([newLog, ...logs]);
        setForm(defaultForm);
        setShowAdd(false);
        toast.success('Health log added! ✅');
    };

    const deleteLog = (id: string) => {
        setLogs(logs.filter(l => l.id !== id));
        toast.success('Log deleted');
    };

    const chartData = [...logs].reverse().map(l => ({ date: format(new Date(l.date), 'MM/dd'), [activeMetric]: l[activeMetric as keyof HealthLog] }));

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="section-title">Health Tracker</div>
                    <div className="section-subtitle">Monitor your daily health metrics over time</div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAdd(true)} className="btn btn-primary">
                    <Plus size={16} /> Log Today
                </motion.button>
            </div>

            {/* Metric selector */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {metricConfig.map(m => (
                    <motion.button
                        key={m.key}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setActiveMetric(m.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                            borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
                            background: activeMetric === m.key ? m.color + '22' : 'var(--bg-input)',
                            color: activeMetric === m.key ? m.color : 'var(--text-secondary)',
                            borderWidth: 1, borderStyle: 'solid',
                            borderColor: activeMetric === m.key ? m.color + '44' : 'transparent',
                            transition: 'all 0.2s',
                        }}
                    >
                        <m.icon size={14} /> {m.label}
                    </motion.button>
                ))}
            </div>

            {/* Chart */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
                    {metricConfig.find(m => m.key === activeMetric)?.label} Trend
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                        <Line
                            type="monotone"
                            dataKey={activeMetric}
                            stroke={metricConfig.find(m => m.key === activeMetric)?.color || '#6366f1'}
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: metricConfig.find(m => m.key === activeMetric)?.color || '#6366f1' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Logs table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>Recent Logs</div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-input)' }}>
                                {['Date', 'Sleep', 'Water', 'Exercise', 'BP', 'Sugar', 'Weight', ''].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, i) => (
                                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{format(new Date(log.date), 'MMM dd, yyyy')}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{log.sleep}h</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{log.water}g</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{log.exercise}min</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{log.bp_systolic}/{log.bp_diastolic}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{log.sugar} mg/dL</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{log.weight} kg</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button onClick={() => deleteLog(log.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Log Modal */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Log Health Data</div>
                            <div className="grid-2">
                                {[
                                    { key: 'sleep', label: 'Sleep (hrs)', placeholder: 'e.g. 7.5' },
                                    { key: 'water', label: 'Water (glasses)', placeholder: 'e.g. 8' },
                                    { key: 'exercise', label: 'Exercise (min)', placeholder: 'e.g. 30' },
                                    { key: 'weight', label: 'Weight (kg)', placeholder: 'e.g. 72' },
                                    { key: 'bp_systolic', label: 'BP Systolic', placeholder: 'e.g. 120' },
                                    { key: 'bp_diastolic', label: 'BP Diastolic', placeholder: 'e.g. 80' },
                                    { key: 'sugar', label: 'Blood Sugar (mg/dL)', placeholder: 'e.g. 95' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                                        <input
                                            type="number"
                                            placeholder={f.placeholder}
                                            value={form[f.key as keyof typeof form]}
                                            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                <button onClick={() => setShowAdd(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                                <motion.button whileHover={{ scale: 1.01 }} onClick={addLog} className="btn btn-primary" style={{ flex: 2 }}>Save Log</motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HealthTracker;
