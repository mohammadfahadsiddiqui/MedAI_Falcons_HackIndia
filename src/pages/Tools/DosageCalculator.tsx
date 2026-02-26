import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Info, AlertTriangle, CheckCircle, RotateCcw, User, Weight, Pill } from 'lucide-react';

interface Result {
    dose: string;
    frequency: string;
    maxDaily: string;
    notes: string[];
    warning?: string;
}

const medicineDb: Record<string, { weight?: boolean; age?: boolean; calc: (kg: number, age: number) => Result }> = {
    Paracetamol: {
        weight: true, age: true,
        calc: (kg, age) => ({
            dose: age < 12 ? `${(10 * kg).toFixed(0)}–${(15 * kg).toFixed(0)} mg` : '500–1000 mg',
            frequency: 'Every 4–6 hours',
            maxDaily: age < 12 ? `${(60 * kg).toFixed(0)} mg` : '4000 mg',
            notes: ['Take with or without food', 'Drink plenty of water', 'Do not take with other paracetamol-containing products'],
            warning: age < 3 ? 'Use infant drops for children under 3 — consult a doctor' : undefined,
        }),
    },
    Ibuprofen: {
        weight: true, age: true,
        calc: (kg, age) => ({
            dose: age < 12 ? `${(5 * kg).toFixed(0)}–${(10 * kg).toFixed(0)} mg` : '200–400 mg',
            frequency: 'Every 6–8 hours',
            maxDaily: age < 12 ? `${(40 * kg).toFixed(0)} mg` : '1200 mg (OTC) / 2400 mg (Rx)',
            notes: ['Take with food to avoid stomach upset', 'Not recommended for children under 6 months', 'Avoid on empty stomach'],
            warning: age < 6 ? 'Not recommended for infants under 6 months without doctor advice' : undefined,
        }),
    },
    Amoxicillin: {
        weight: true, age: true,
        calc: (kg, age) => ({
            dose: age < 12 ? `${(25 * kg).toFixed(0)}–${(30 * kg).toFixed(0)} mg` : '250–500 mg',
            frequency: 'Every 8 hours (3 times daily)',
            maxDaily: age < 12 ? `${(90 * kg).toFixed(0)} mg` : '1500 mg',
            notes: ['Complete the full course', 'Can be taken with or without food', 'Store suspension in refrigerator'],
        }),
    },
    Cetirizine: {
        weight: false, age: true,
        calc: (_kg, age) => ({
            dose: age < 6 ? '2.5 mg' : age < 12 ? '5 mg' : '10 mg',
            frequency: 'Once daily',
            maxDaily: age < 6 ? '5 mg' : age < 12 ? '10 mg' : '10 mg',
            notes: ['May cause drowsiness', 'Best taken at night', 'Avoid alcohol'],
        }),
    },
    Metformin: {
        weight: false, age: false,
        calc: () => ({
            dose: '500 mg (starting dose)',
            frequency: 'Twice daily with meals',
            maxDaily: '2000–2550 mg',
            notes: ['Always take with meals to reduce GI side effects', 'Gradually increase dose as directed', 'Monitor blood sugar levels'],
            warning: 'Prescription required — use only under doctor supervision',
        }),
    },
    Vitamin_C: {
        weight: false, age: true,
        calc: (_kg, age) => ({
            dose: age < 12 ? '250 mg' : '500–1000 mg',
            frequency: 'Once daily',
            maxDaily: age < 12 ? '500 mg' : '2000 mg',
            notes: ['Take with water', 'No specific food requirements', 'High doses may cause GI discomfort'],
        }),
    },
    Pantoprazole: {
        weight: false, age: false,
        calc: () => ({
            dose: '40 mg',
            frequency: 'Once daily (30 min before meal)',
            maxDaily: '80 mg',
            notes: ['Take 30 minutes before breakfast', 'Do not crush or chew tablet', 'May take 1–4 days for full effect'],
        }),
    },
};

const ageGroups = ['Infant (0–1yr)', 'Child (2–11yr)', 'Teen (12–17yr)', 'Adult (18–59yr)', 'Senior (60+yr)'];
const ageMap: Record<string, number> = { 'Infant (0–1yr)': 0.5, 'Child (2–11yr)': 7, 'Teen (12–17yr)': 14, 'Adult (18–59yr)': 30, 'Senior (60+yr)': 65 };

const DosageCalculator: React.FC = () => {
    const [medicine, setMedicine] = useState('Paracetamol');
    const [weight, setWeight] = useState(70);
    const [ageGroup, setAgeGroup] = useState('Adult (18–59yr)');
    const [result, setResult] = useState<Result | null>(null);
    const [calculated, setCalculated] = useState(false);

    const handleCalculate = () => {
        const med = medicineDb[medicine];
        if (!med) return;
        const age = ageMap[ageGroup];
        const res = med.calc(weight, age);
        setResult(res);
        setCalculated(true);
    };

    const handleReset = () => { setResult(null); setCalculated(false); setWeight(70); setAgeGroup('Adult (18–59yr)'); setMedicine('Paracetamol'); };

    return (
        <div style={{ maxWidth: 760 }}>
            <div className="section-title">Dosage Calculator</div>
            <div className="section-subtitle">Calculate appropriate medicine doses based on patient weight and age</div>

            {/* Disclaimer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#fbbf24', margin: 0, lineHeight: 1.6 }}>
                    <strong>Medical Disclaimer:</strong> This tool provides general dosage guidance only. Always consult a qualified doctor or pharmacist before administering any medication. Individual dosing may vary based on medical history, kidney/liver function, and other factors.
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Input Panel */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Pill size={16} color="var(--color-primary-light)" /> Patient & Medicine Details
                    </div>

                    {/* Medicine select */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Medicine</label>
                        <select value={medicine} onChange={e => { setMedicine(e.target.value); setCalculated(false); }} className="input" style={{ cursor: 'pointer' }}>
                            {Object.keys(medicineDb).map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                        </select>
                    </div>

                    {/* Age Group */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            <User size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Age Group
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {ageGroups.map(ag => (
                                <motion.button
                                    key={ag}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => { setAgeGroup(ag); setCalculated(false); }}
                                    style={{
                                        padding: '7px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                                        background: ageGroup === ag ? 'var(--color-primary)' : 'var(--bg-input)',
                                        color: ageGroup === ag ? 'white' : 'var(--text-secondary)',
                                        boxShadow: ageGroup === ag ? '0 3px 10px rgba(99,102,241,0.35)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {ag}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Weight slider */}
                    {medicineDb[medicine]?.weight && (
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                <Weight size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Patient Weight — <span style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>{weight} kg</span>
                            </label>
                            <input
                                type="range" min={3} max={150} value={weight}
                                onChange={e => { setWeight(Number(e.target.value)); setCalculated(false); }}
                                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                                <span>3 kg (Newborn)</span><span>150 kg</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                {[10, 20, 30, 50, 70, 90].map(w => (
                                    <button key={w} onClick={() => { setWeight(w); setCalculated(false); }} style={{ flex: 1, padding: '5px 6px', borderRadius: 8, border: `1px solid ${weight === w ? 'var(--color-primary)' : 'var(--border)'}`, background: weight === w ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)', color: weight === w ? 'var(--color-primary-light)' : 'var(--text-muted)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                                        {w}kg
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleCalculate} className="btn btn-primary" style={{ flex: 1, height: 44, gap: 8 }}>
                            <Calculator size={15} /> Calculate Dose
                        </motion.button>
                        <button onClick={handleReset} className="btn btn-ghost" style={{ padding: '0 14px', height: 44 }}>
                            <RotateCcw size={15} />
                        </button>
                    </div>
                </div>

                {/* Result Panel */}
                <div>
                    <AnimatePresence mode="wait">
                        {!calculated ? (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="card"
                                style={{ padding: 32, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)' }}
                            >
                                <Calculator size={48} style={{ opacity: 0.15, marginBottom: 12 }} />
                                <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Fill in details and click</div>
                                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>"Calculate Dose" to see results</div>
                            </motion.div>
                        ) : result && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="card"
                                style={{ padding: 24 }}
                            >
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <CheckCircle size={16} color="#22c55e" />
                                    Dosage Result — {medicine.replace('_', ' ')}
                                </div>

                                {result.warning && (
                                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: '#f87171' }}>{result.warning}</span>
                                    </div>
                                )}

                                {[
                                    { label: '💊 Recommended Dose', value: result.dose, highlight: true },
                                    { label: '⏰ Frequency', value: result.frequency, highlight: false },
                                    { label: '📊 Max Daily Dose', value: result.maxDaily, highlight: false },
                                ].map(row => (
                                    <div key={row.label} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{row.label}</div>
                                        <div style={{ fontSize: row.highlight ? 22 : 15, fontWeight: row.highlight ? 800 : 600, color: row.highlight ? 'var(--color-primary-light)' : 'var(--text-primary)', fontFamily: row.highlight ? 'var(--font-display)' : 'inherit' }}>
                                            {row.value}
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginTop: 14 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>📋 Instructions</div>
                                    {result.notes.map((note, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                            <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {note}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 10, display: 'flex', gap: 8 }}>
                                    <Info size={13} color="var(--color-primary-light)" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Based on: {medicine.replace('_', ' ')} · {ageGroup} · {medicineDb[medicine]?.weight ? `${weight}kg` : 'Standard dose'}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Reference Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ marginTop: 24, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                    📘 Quick Reference — Available Medicines
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-input)' }}>
                            {['Medicine', 'Standard Adult Dose', 'Frequency', 'Weight-Based?'].map(h => (
                                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Paracetamol', '500–1000 mg', 'Every 4–6 hrs', '✅ Yes'],
                            ['Ibuprofen', '200–400 mg', 'Every 6–8 hrs', '✅ Yes (children)'],
                            ['Amoxicillin', '250–500 mg', 'Every 8 hrs', '✅ Yes (children)'],
                            ['Cetirizine', '10 mg', 'Once daily', '❌ Age-based'],
                            ['Metformin', '500 mg', 'Twice daily', '❌ Fixed'],
                            ['Vitamin C', '500–1000 mg', 'Once daily', '❌ Age-based'],
                            ['Pantoprazole', '40 mg', 'Once daily', '❌ Fixed'],
                        ].map(row => (
                            <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                                {row.map((cell, j) => (
                                    <td key={j} style={{ padding: '11px 16px', fontSize: 13, color: j === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

export default DosageCalculator;
