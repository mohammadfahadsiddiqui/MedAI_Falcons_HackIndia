import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FlaskConical, Upload, FileText, Download, ChevronDown, ChevronUp,
    Search, TrendingUp, TrendingDown, Minus, Plus, Trash2,
    ShoppingCart, X, CheckCircle, Package, TestTube,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ReferenceLine } from 'recharts';
import toast from 'react-hot-toast';
import { CATALOG_TESTS, TEST_PACKAGES, TEST_CATEGORIES, type CatalogTest, type TestPackage } from './labTestsData';

// ── Types ─────────────────────────────────────────────────────────────────
interface LabTest { id: string; name: string; value: number; unit: string; normalMin: number; normalMax: number; date: string; category: string; }
interface LabReport { id: string; name: string; lab: string; date: string; status: 'Normal' | 'Abnormal' | 'Critical'; tests: LabTest[]; }
interface CartItem { id: string; name: string; price: number; type: 'test' | 'package'; icon: string; }

// ── Mock Reports ──────────────────────────────────────────────────────────
const mockReports: LabReport[] = [
    {
        id: 'R001', name: 'Complete Blood Count (CBC)', lab: 'Metropolis Labs', date: '25 Feb 2026', status: 'Abnormal',
        tests: [
            { id: 't1', name: 'Hemoglobin', value: 11.2, unit: 'g/dL', normalMin: 12, normalMax: 17, date: '25 Feb 2026', category: 'CBC' },
            { id: 't2', name: 'WBC Count', value: 7800, unit: '/μL', normalMin: 4000, normalMax: 11000, date: '25 Feb 2026', category: 'CBC' },
            { id: 't3', name: 'Platelets', value: 245000, unit: '/μL', normalMin: 150000, normalMax: 400000, date: '25 Feb 2026', category: 'CBC' },
            { id: 't4', name: 'RBC Count', value: 4.1, unit: 'M/μL', normalMin: 4.5, normalMax: 5.9, date: '25 Feb 2026', category: 'CBC' },
        ]
    },
    {
        id: 'R002', name: 'Lipid Profile', lab: 'SRL Diagnostics', date: '20 Feb 2026', status: 'Normal',
        tests: [
            { id: 't5', name: 'Total Cholesterol', value: 182, unit: 'mg/dL', normalMin: 0, normalMax: 200, date: '20 Feb 2026', category: 'Lipid' },
            { id: 't6', name: 'LDL Cholesterol', value: 105, unit: 'mg/dL', normalMin: 0, normalMax: 130, date: '20 Feb 2026', category: 'Lipid' },
            { id: 't7', name: 'HDL Cholesterol', value: 52, unit: 'mg/dL', normalMin: 40, normalMax: 999, date: '20 Feb 2026', category: 'Lipid' },
            { id: 't8', name: 'Triglycerides', value: 125, unit: 'mg/dL', normalMin: 0, normalMax: 150, date: '20 Feb 2026', category: 'Lipid' },
        ]
    },
    {
        id: 'R003', name: 'Blood Glucose & HbA1c', lab: 'Apollo Diagnostics', date: '15 Feb 2026', status: 'Critical',
        tests: [
            { id: 't9', name: 'Fasting Blood Sugar', value: 148, unit: 'mg/dL', normalMin: 70, normalMax: 100, date: '15 Feb 2026', category: 'Glucose' },
            { id: 't10', name: 'HbA1c', value: 7.8, unit: '%', normalMin: 0, normalMax: 5.7, date: '15 Feb 2026', category: 'Glucose' },
            { id: 't11', name: 'Post-Prandial Glucose', value: 196, unit: 'mg/dL', normalMin: 0, normalMax: 140, date: '15 Feb 2026', category: 'Glucose' },
        ]
    },
];

const trendData = [
    { month: 'Sep', Hemoglobin: 10.8, Glucose: 160, Cholesterol: 192 },
    { month: 'Oct', Hemoglobin: 11.0, Glucose: 155, Cholesterol: 188 },
    { month: 'Nov', Hemoglobin: 11.5, Glucose: 150, Cholesterol: 185 },
    { month: 'Dec', Hemoglobin: 10.9, Glucose: 152, Cholesterol: 182 },
    { month: 'Jan', Hemoglobin: 11.1, Glucose: 148, Cholesterol: 178 },
    { month: 'Feb', Hemoglobin: 11.2, Glucose: 148, Cholesterol: 182 },
];

// ── Helpers ───────────────────────────────────────────────────────────────
const SC: Record<string, string> = { Normal: '#22c55e', Abnormal: '#f59e0b', Critical: '#ef4444' };
const getS = (v: number, mn: number, mx: number) => v < mn ? 'Low' : v > mx ? 'High' : 'Normal';

const SPill: React.FC<{ s: 'Low' | 'Normal' | 'High' }> = ({ s }) => {
    const cfg = { Low: { c: '#06b6d4', I: TrendingDown }, Normal: { c: '#22c55e', I: Minus }, High: { c: '#ef4444', I: TrendingUp } };
    const { c, I } = cfg[s];
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: c + '18', color: c }}><I size={10} />{s}</span>;
};

const NBar: React.FC<{ t: LabTest }> = ({ t }) => {
    const s = getS(t.value, t.normalMin, t.normalMax);
    const c = s === 'Normal' ? '#22c55e' : s === 'Low' ? '#06b6d4' : '#ef4444';
    const pct = t.normalMax - t.normalMin > 0 ? Math.max(0, Math.min(100, ((t.value - t.normalMin) / (t.normalMax - t.normalMin)) * 100)) : 50;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: c }}>{t.value} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>{t.unit}</span></span>
                    <SPill s={s} />
                </div>
            </div>
            <div style={{ position: 'relative', height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#06b6d4 0%,#22c55e 40%,#22c55e 60%,#ef4444 100%)', opacity: .25, borderRadius: 4 }} />
                <div style={{ position: 'absolute', height: '100%', width: 3, background: c, left: pct + '%', borderRadius: 2, transform: 'translateX(-50%)', boxShadow: '0 0 6px ' + c }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                <span>Low &lt;{t.normalMin}</span>
                <span style={{ color: '#22c55e' }}>Normal {t.normalMin}–{t.normalMax}</span>
                <span>High &gt;{t.normalMax}</span>
            </div>
        </div>
    );
};

// ── Cart Drawer ───────────────────────────────────────────────────────────
const CartDrawer: React.FC<{ items: CartItem[]; onRemove: (id: string) => void; onClear: () => void; onClose: () => void }> = ({ items, onRemove, onClear, onClose }) => {
    const total = items.reduce((s, i) => s + i.price, 0);
    return (
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 360, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ShoppingCart size={18} color="var(--color-primary-light)" />My Cart ({items.length})</div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                {items.length === 0
                    ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 20px' }}>
                        <ShoppingCart size={48} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} />
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Your cart is empty</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Add tests or packages to book</div>
                    </div>
                    : items.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.type === 'package' ? '📦 Package' : '🧪 Single Test'}</div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-light)', flexShrink: 0 }}>₹{item.price}</div>
                            <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><X size={14} /></button>
                        </div>
                    ))
                }
            </div>
            {items.length > 0 && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-primary-light)', fontFamily: 'var(--font-display)' }}>₹{total.toLocaleString()}</span>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }} onClick={() => { toast.success('Appointment request sent! Our team will call to confirm.'); onClear(); onClose(); }}
                        className="btn btn-primary" style={{ width: '100%', height: 48, fontSize: 15, fontWeight: 700, gap: 8 }}>
                        <CheckCircle size={16} />Book & Pay ₹{total.toLocaleString()}
                    </motion.button>
                    <button onClick={onClear} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, marginTop: 10, padding: 4 }}>Clear cart</button>
                </div>
            )}
        </motion.div>
    );
};

// ── Test Card ─────────────────────────────────────────────────────────────
const TestCard: React.FC<{ test: CatalogTest; inCart: boolean; onCart: (t: CatalogTest) => void }> = ({ test, inCart, onCart }) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}
        style={{ background: 'var(--bg-card)', border: '1px solid ' + (inCart ? 'rgba(99,102,241,0.4)' : 'var(--border)'), borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', transition: 'border-color 0.2s' }}>
        {test.popular && <span style={{ position: 'absolute', top: -8, right: 12, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f59e0b', color: 'white' }}>POPULAR</span>}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{test.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>{test.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{test.description}</div>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: 600 }}>🧪 {test.sampleType}</span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: 600 }}>⏱ {test.turnaround}</span>
            {test.fasting && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600 }}>🍽 Fasting Required</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-primary-light)', fontFamily: 'var(--font-display)' }}>₹{test.price}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>₹{test.originalPrice}</span>
                <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, marginLeft: 6 }}>{Math.round((1 - test.price / test.originalPrice) * 100)}% off</span>
            </div>
            <motion.button whileTap={{ scale: .93 }} onClick={() => onCart(test)}
                style={{
                    padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    background: inCart ? 'rgba(34,197,94,0.12)' : 'var(--color-primary)',
                    color: inCart ? '#22c55e' : 'white', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s'
                }}>
                {inCart ? <><CheckCircle size={13} />Added</> : <><Plus size={13} />Add</>}
            </motion.button>
        </div>
    </motion.div>
);

// ── Package Card ──────────────────────────────────────────────────────────
const PkgCard: React.FC<{ pkg: TestPackage; inCart: boolean; onCart: (p: TestPackage) => void }> = ({ pkg, inCart, onCart }) => (
    <motion.div whileHover={{ y: -3 }} style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))', border: '1px solid ' + (inCart ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)'), borderRadius: 16, padding: '20px 22px', position: 'relative', transition: 'border-color 0.2s' }}>
        {pkg.badge && <span style={{ position: 'absolute', top: -10, left: 16, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'var(--color-primary)', color: 'white' }}>{pkg.badge}</span>}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ fontSize: 36 }}>{pkg.icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{pkg.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{pkg.description}</div>
                <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4, fontWeight: 600 }}>✓ Recommended for: {pkg.recommended}</div>
            </div>
        </div>
        <div style={{ background: 'var(--bg-input)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Includes {pkg.testsCount} Tests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {pkg.includes.slice(0, 8).map(t => <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)', fontWeight: 600 }}>{t}</span>)}
                {pkg.includes.length > 8 && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 12, background: 'var(--bg-card)', color: 'var(--text-muted)', fontWeight: 600 }}>+{pkg.includes.length - 8} more</span>}
            </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary-light)', fontFamily: 'var(--font-display)' }}>₹{pkg.price.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 8 }}>₹{pkg.originalPrice.toLocaleString()}</span>
                <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>Save ₹{(pkg.originalPrice - pkg.price).toLocaleString()} ({Math.round((1 - pkg.price / pkg.originalPrice) * 100)}% off)</div>
            </div>
            <motion.button whileTap={{ scale: .93 }} onClick={() => onCart(pkg)}
                style={{
                    padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    background: inCart ? 'rgba(34,197,94,0.12)' : 'var(--color-primary)',
                    color: inCart ? '#22c55e' : 'white', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                }}>
                {inCart ? <><CheckCircle size={14} />Added</> : <><ShoppingCart size={14} />Book Package</>}
            </motion.button>
        </div>
    </motion.div>
);

// ── Lab Calculator ────────────────────────────────────────────────────────
const LabCalculator: React.FC = () => {
    const [mode, setMode] = useState<'bmi' | 'gfr' | 'custom'>('bmi');
    const [h, setH] = useState(170); const [w, setW] = useState(70); const [age, setAge] = useState(30);
    const [crea, setCrea] = useState(1.0); const [sex, setSex] = useState<'male' | 'female'>('male');
    const [cv, setCv] = useState(''); const [cmin, setCmin] = useState(''); const [cmax, setCmax] = useState('');
    const bmi = w / Math.pow(h / 100, 2);
    const bmiCat = bmi < 18.5 ? { label: 'Underweight', c: '#06b6d4' } : bmi < 25 ? { label: 'Normal', c: '#22c55e' } : bmi < 30 ? { label: 'Overweight', c: '#f59e0b' } : { label: 'Obese', c: '#ef4444' };
    const gfr = (140 - age) * w / (72 * crea) * (sex === 'female' ? .85 : 1);
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24, maxWidth: 500 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FlaskConical size={16} color="var(--color-primary-light)" />Lab Calculator</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {(['bmi', 'gfr', 'custom'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: mode === m ? 'var(--color-primary)' : 'var(--bg-input)', color: mode === m ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                        {m === 'bmi' ? 'BMI' : m === 'gfr' ? 'eGFR' : 'Custom'}
                    </button>
                ))}
            </div>
            {mode === 'bmi' && (
                <div>
                    {[{ l: 'Height — ' + h + ' cm', v: h, mn: 100, mx: 220, s: setH }, { l: 'Weight — ' + w + ' kg', v: w, mn: 20, mx: 200, s: setW }].map(f => (
                        <div key={f.l}><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{f.l}</label>
                            <input type="range" min={f.mn} max={f.mx} value={f.v} onChange={e => f.s(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)', marginBottom: 12 }} /></div>
                    ))}
                    <div style={{ background: 'var(--bg-input)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Your BMI</div>
                        <div style={{ fontSize: 36, fontWeight: 900, color: bmiCat.c, fontFamily: 'var(--font-display)' }}>{bmi.toFixed(1)}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: bmiCat.c, marginTop: 4 }}>{bmiCat.label}</div>
                    </div>
                </div>
            )}
            {mode === 'gfr' && (
                <div>
                    {[{ l: 'Age — ' + age + ' yrs', v: age, mn: 18, mx: 90, s: setAge }, { l: 'Weight — ' + w + ' kg', v: w, mn: 30, mx: 150, s: setW }].map(f => (
                        <div key={f.l}><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{f.l}</label>
                            <input type="range" min={f.mn} max={f.mx} value={f.v} onChange={e => f.s(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)', marginBottom: 12 }} /></div>
                    ))}
                    <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Serum Creatinine (mg/dL)</label>
                        <input type="number" step={0.1} min={0.4} max={10} value={crea} onChange={e => setCrea(Number(e.target.value))} className="input" style={{ fontSize: 13 }} /></div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                        {(['male', 'female'] as const).map(g => (
                            <button key={g} onClick={() => setSex(g)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid ' + (sex === g ? 'var(--color-primary)' : 'var(--border)'), background: sex === g ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)', color: sex === g ? 'var(--color-primary-light)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                {g === 'male' ? '♂ Male' : '♀ Female'}
                            </button>
                        ))}
                    </div>
                    <div style={{ background: 'var(--bg-input)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>eGFR (CKD-EPI)</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: gfr >= 60 ? '#22c55e' : '#ef4444', fontFamily: 'var(--font-display)' }}>{gfr.toFixed(1)}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>mL/min/1.73m² · {gfr >= 90 ? 'Normal (G1)' : gfr >= 60 ? 'Mildly Reduced (G2)' : gfr >= 30 ? 'Moderately Reduced (G3)' : 'Severely Reduced (G4-5)'}</div>
                    </div>
                </div>
            )}
            {mode === 'custom' && (
                <div>
                    <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Your Test Value</label><input className="input" placeholder="e.g. 145" value={cv} onChange={e => setCv(e.target.value)} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        <div><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Normal Min</label><input className="input" placeholder="e.g. 70" value={cmin} onChange={e => setCmin(e.target.value)} style={{ fontSize: 13 }} /></div>
                        <div><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Normal Max</label><input className="input" placeholder="e.g. 100" value={cmax} onChange={e => setCmax(e.target.value)} style={{ fontSize: 13 }} /></div>
                    </div>
                    {cv && cmin && cmax && (() => {
                        const v = parseFloat(cv), mn = parseFloat(cmin), mx = parseFloat(cmax); const s = v < mn ? 'Low' : v > mx ? 'High' : 'Normal'; const c = s === 'Normal' ? '#22c55e' : s === 'Low' ? '#06b6d4' : '#ef4444'; return (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-input)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 900, color: c, fontFamily: 'var(--font-display)' }}>{cv}</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: c, marginTop: 4 }}>{s}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Normal range: {cmin}–{cmax}</div>
                            </motion.div>
                        );
                    })()}
                </div>
            )}
        </motion.div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────
const LabTests: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'reports' | 'trends' | 'book' | 'calculator' | 'logs'>('book');
    const [expandedReport, setExpandedReport] = useState<string | null>('R001');
    const [trendMetric, setTrendMetric] = useState('Hemoglobin');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('All');
    const [bookView, setBookView] = useState<'tests' | 'packages'>('packages');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [logForm, setLogForm] = useState({ test: '', value: '', unit: '', date: new Date().toISOString().split('T')[0], notes: '' });
    const [logs, setLogs] = useState<Array<typeof logForm & { id: string }>>([]);
    const [repSearch, setRepSearch] = useState('');

    const filteredTests = useMemo(() => CATALOG_TESTS.filter(t => (category === 'All' || t.category === category) && (t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))), [category, search]);

    const inCart = (id: string) => cart.some(c => c.id === id);

    const addTest = (t: CatalogTest) => {
        if (inCart(t.id)) { setCart(p => p.filter(c => c.id !== t.id)); toast(`Removed ${t.name}`, { icon: '🗑️' }); }
        else { setCart(p => [...p, { id: t.id, name: t.name, price: t.price, type: 'test', icon: t.icon }]); toast.success(`${t.name} added to cart`); }
    };
    const addPkg = (p: TestPackage) => {
        if (inCart(p.id)) { setCart(prev => prev.filter(c => c.id !== p.id)); toast(`Removed ${p.name}`, { icon: '🗑️' }); }
        else { setCart(prev => [...prev, { id: p.id, name: p.name, price: p.price, type: 'package', icon: p.icon }]); toast.success(`${p.name} package added!`); }
    };
    const addLog = () => {
        if (!logForm.test || !logForm.value) { toast.error('Fill in test name and value'); return; }
        setLogs(p => [{ ...logForm, id: Date.now().toString() }, ...p]);
        setLogForm({ test: '', value: '', unit: '', date: new Date().toISOString().split('T')[0], notes: '' });
        toast.success('Test log added!');
    };

    const filteredReports = mockReports.filter(r => r.name.toLowerCase().includes(repSearch.toLowerCase()) || r.lab.toLowerCase().includes(repSearch.toLowerCase()));

    const tabs = [
        { id: 'book', label: '🛒 Book Tests' },
        { id: 'reports', label: '📋 Reports', count: mockReports.length },
        { id: 'trends', label: '📈 Trends' },
        { id: 'calculator', label: '🧮 Calculator' },
        { id: 'logs', label: '📝 My Logs', count: logs.length },
    ] as const;

    return (
        <div style={{ position: 'relative' }}>
            {/* Header */}
            <div className="section-title">Lab Tests</div>
            <div className="section-subtitle">Book tests, view reports, track trends & use health calculators</div>

            {/* Summary Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Reports', value: mockReports.length, color: '#6366f1', icon: '📋' },
                    { label: 'Tests Available', value: CATALOG_TESTS.length + '+', color: '#06b6d4', icon: '🧪' },
                    { label: 'Health Packages', value: TEST_PACKAGES.length, color: '#8b5cf6', icon: '📦' },
                    { label: 'Cart Items', value: cart.length, color: '#22c55e', icon: '🛒' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }}
                        className="card" style={{ padding: '18px 20px', cursor: s.label === 'Cart Items' ? 'pointer' : undefined }} onClick={s.label === 'Cart Items' ? () => setShowCart(true) : undefined}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tab bar + Cart button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 5, borderRadius: 14, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            style={{ padding: '9px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent', color: activeTab === tab.id ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {tab.label}
                            {'count' in tab && (tab as { count?: number }).count !== undefined && (tab as { count?: number }).count! > 0 && (
                                <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,.25)' : 'var(--bg-input)', borderRadius: 20, padding: '0 7px', fontSize: 11 }}>{(tab as { count?: number }).count}</span>
                            )}
                        </button>
                    ))}
                </div>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }} onClick={() => setShowCart(true)}
                    className="btn btn-primary" style={{ position: 'relative', gap: 8, padding: '10px 18px' }}>
                    <ShoppingCart size={15} />Cart
                    {cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#ef4444', borderRadius: '50%', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{cart.length}</span>}
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {/* ── BOOK TESTS TAB ── */}
                {activeTab === 'book' && (
                    <motion.div key="book" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        {/* Sub-tabs */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            {[{ id: 'packages', label: '📦 Health Packages', sub: 'Best Value Bundles' }, { id: 'tests', label: '🧪 Individual Tests', sub: `${CATALOG_TESTS.length}+ Tests` }].map(v => (
                                <button key={v.id} onClick={() => { setBookView(v.id as 'tests' | 'packages'); setSearch(''); setCategory('All'); }}
                                    style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid ' + (bookView === v.id ? 'var(--color-primary)' : 'var(--border)'), cursor: 'pointer', background: bookView === v.id ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)', textAlign: 'left', transition: 'all 0.2s' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: bookView === v.id ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>{v.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{v.sub}</div>
                                </button>
                            ))}
                        </div>

                        {bookView === 'packages' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(420px,1fr))', gap: 18 }}>
                                {TEST_PACKAGES.map(p => <PkgCard key={p.id} pkg={p} inCart={inCart(p.id)} onCart={addPkg} />)}
                            </div>
                        )}

                        {bookView === 'tests' && (
                            <div>
                                {/* Search + Category Filter */}
                                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..." className="input" style={{ paddingLeft: 36 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                                    {TEST_CATEGORIES.map(c => (
                                        <button key={c} onClick={() => setCategory(c)}
                                            style={{ padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: category === c ? 'var(--color-primary)' : 'var(--bg-input)', color: category === c ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                                {filteredTests.length === 0
                                    ? <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}><TestTube size={40} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} /><div style={{ fontSize: 14, fontWeight: 600 }}>No tests found</div></div>
                                    : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                                        {filteredTests.map(t => <TestCard key={t.id} test={t} inCart={inCart(t.id)} onCart={addTest} />)}
                                    </div>
                                }
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── REPORTS TAB ── */}
                {activeTab === 'reports' && (
                    <motion.div key="reports" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input value={repSearch} onChange={e => setRepSearch(e.target.value)} placeholder="Search reports..." className="input" style={{ paddingLeft: 36 }} />
                            </div>
                            <button onClick={() => toast('Connect Firebase Storage to upload real reports')} className="btn btn-ghost" style={{ gap: 6, fontSize: 13 }}><Upload size={14} />Upload Report</button>
                        </div>
                        {filteredReports.map(report => (
                            <motion.div key={report.id} layout className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
                                <div style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}>
                                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: SC[report.status] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                            {report.status === 'Normal' ? '✅' : report.status === 'Abnormal' ? '⚠️' : '🚨'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{report.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{report.lab} · {report.date}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: SC[report.status] + '18', color: SC[report.status] }}>{report.status}</span>
                                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={e => { e.stopPropagation(); toast('Download PDF available with Firebase Storage setup'); }}><Download size={12} /></button>
                                        {expandedReport === report.id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedReport === report.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                                                {report.tests.map(t => <NBar key={t.id} t={t} />)}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ── TRENDS TAB ── */}
                {activeTab === 'trends' && (
                    <motion.div key="trends" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            {Object.keys(trendData[0]).filter(k => k !== 'month').map(m => (
                                <button key={m} onClick={() => setTrendMetric(m)} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: trendMetric === m ? 'var(--color-primary)' : 'var(--bg-input)', color: trendMetric === m ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{m}</button>
                            ))}
                        </div>
                        <div className="card" style={{ padding: 24 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>{trendMetric} — 6 Month Trend</div>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={trendData} margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' } as React.CSSProperties} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' } as React.CSSProperties} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                                    <Line type="monotone" dataKey={trendMetric} stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                                    {trendMetric === 'Hemoglobin' && <ReferenceLine y={12} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Min Normal', fill: '#f59e0b', fontSize: 10 }} />}
                                    {trendMetric === 'Glucose' && <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Max Normal', fill: '#f59e0b', fontSize: 10 }} />}
                                    {trendMetric === 'Cholesterol' && <ReferenceLine y={200} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Max Normal', fill: '#f59e0b', fontSize: 10 }} />}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="card" style={{ padding: 24, marginTop: 20 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>All Metrics Bar Comparison</div>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={trendData} margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' } as React.CSSProperties} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' } as React.CSSProperties} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                                    <Bar dataKey="Hemoglobin" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* ── CALCULATOR TAB ── */}
                {activeTab === 'calculator' && (
                    <motion.div key="calc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><LabCalculator /></motion.div>
                )}

                {/* ── LOGS TAB ── */}
                {activeTab === 'logs' && (
                    <motion.div key="logs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={15} color="var(--color-primary-light)" />Add Lab Log</div>
                                {[{ label: 'Test Name', key: 'test', ph: 'e.g. Blood Sugar' }, { label: 'Value', key: 'value', ph: 'e.g. 145' }, { label: 'Unit', key: 'unit', ph: 'e.g. mg/dL' }].map(f => (
                                    <div key={f.key} style={{ marginBottom: 12 }}>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>{f.label}</label>
                                        <input className="input" placeholder={f.ph} value={logForm[f.key as keyof typeof logForm]} onChange={e => setLogForm({ ...logForm, [f.key]: e.target.value })} style={{ fontSize: 13 }} />
                                    </div>
                                ))}
                                <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>Date</label>
                                    <input type="date" className="input" value={logForm.date} onChange={e => setLogForm({ ...logForm, date: e.target.value })} style={{ fontSize: 13 }} /></div>
                                <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .5 }}>Notes (optional)</label>
                                    <textarea className="input" placeholder="Add any notes..." value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })} style={{ fontSize: 13, resize: 'vertical', minHeight: 64 }} /></div>
                                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }} onClick={addLog} className="btn btn-primary" style={{ width: '100%', height: 44, gap: 8 }}><Plus size={15} />Add Log</motion.button>
                            </div>
                            <div>
                                {logs.length === 0
                                    ? <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={40} style={{ opacity: .2, marginBottom: 12 }} /><div style={{ fontSize: 14, fontWeight: 600 }}>No logs yet</div><div style={{ fontSize: 12 }}>Add your first lab test result</div>
                                    </div>
                                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {logs.map((log, i) => (
                                            <motion.div key={log.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .05 }} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🧪</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{log.test}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{log.date}{log.unit && ' · ' + log.unit}</div>
                                                    {log.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontStyle: 'italic' }}>{log.notes}</div>}
                                                </div>
                                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-light)', fontFamily: 'var(--font-display)' }}>{log.value}</div>
                                                <button onClick={() => setLogs(p => p.filter(l => l.id !== log.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Trash2 size={14} /></button>
                                            </motion.div>
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer Overlay */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, backdropFilter: 'blur(2px)' }} />
                        <CartDrawer items={cart} onRemove={id => setCart(p => p.filter(c => c.id !== id))} onClear={() => setCart([])} onClose={() => setShowCart(false)} />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LabTests;
