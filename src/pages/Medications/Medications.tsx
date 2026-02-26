import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Trash2, Bell, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Medication {
    id: string; name: string; dose: string; frequency: string; startDate: string; endDate: string;
    purpose: string; prescribedBy: string; refillDate: string; taken: boolean; category: string;
}

const FREQ = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 6 hours', 'Every 8 hours', 'Once weekly', 'As needed (PRN)'];
const CAT = ['Chronic', 'Acute', 'Supplement', 'PRN'];
const CAT_COLOR: Record<string, string> = { Chronic: '#6366f1', Acute: '#ef4444', Supplement: '#22c55e', PRN: '#f59e0b' };
const INTERACTIONS = [
    { pair: ['Warfarin', 'Aspirin'], severity: 'Major', effect: 'Significantly increased bleeding risk. Monitor INR closely.' },
    { pair: ['Metformin', 'Alcohol'], severity: 'Moderate', effect: 'Lactic acidosis risk. Avoid alcohol.' },
    { pair: ['Statins', 'Grapefruit'], severity: 'Moderate', effect: 'Increases statin levels — muscle toxicity risk.' },
    { pair: ['ACE inhibitors', 'Potassium supplements'], severity: 'Moderate', effect: 'Risk of dangerous hyperkalemia.' },
];

const defaultMeds: Medication[] = [
    { id: 'm1', name: 'Metformin 500mg', dose: '500mg', frequency: 'Twice daily', startDate: '2025-10-01', endDate: '2026-10-01', purpose: 'Type 2 Diabetes management', prescribedBy: 'Dr. Ahmed Khan', refillDate: '2026-03-01', taken: true, category: 'Chronic' },
    { id: 'm2', name: 'Amlodipine 5mg', dose: '5mg', frequency: 'Once daily', startDate: '2025-08-15', endDate: '2026-08-15', purpose: 'Hypertension', prescribedBy: 'Dr. Sarah Ali', refillDate: '2026-03-15', taken: false, category: 'Chronic' },
    { id: 'm3', name: 'Vitamin D 1000IU', dose: '1000 IU', frequency: 'Once daily', startDate: '2026-01-01', endDate: '2026-07-01', purpose: 'Vitamin D deficiency', prescribedBy: 'Self', refillDate: '2026-04-01', taken: true, category: 'Supplement' },
    { id: 'm4', name: 'Paracetamol 500mg', dose: '500–1000mg', frequency: 'As needed (PRN)', startDate: '2026-02-01', endDate: '', purpose: 'Pain and fever management', prescribedBy: 'Dr. Ahmed Khan', refillDate: '', taken: false, category: 'PRN' },
];

const blank = (): Omit<Medication, 'id' | 'taken'> => ({
    name: '', dose: '', frequency: 'Once daily', startDate: new Date().toISOString().split('T')[0],
    endDate: '', purpose: '', prescribedBy: '', refillDate: '', category: 'Chronic',
});

const Medications: React.FC = () => {
    const [meds, setMeds] = useState<Medication[]>(defaultMeds);
    const [tab, setTab] = useState<'schedule' | 'add' | 'checker' | 'history'>('schedule');
    const [form, setForm] = useState<Omit<Medication, 'id' | 'taken'>>(blank());
    const [drug1, setDrug1] = useState('');
    const [drug2, setDrug2] = useState('');
    const [interResult, setInterResult] = useState('');
    const [loading, setLoading] = useState(false);
    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const toggleTaken = (id: string) => {
        setMeds(p => p.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
        const m = meds.find(x => x.id === id);
        if (m && !m.taken) toast.success(`${m.name} marked as taken ✓`);
    };

    const addMed = () => {
        if (!form.name || !form.dose) { toast.error('Enter medication name and dose'); return; }
        setMeds(p => [...p, { ...form, id: Date.now().toString(), taken: false }]);
        setForm(blank()); setTab('schedule');
        toast.success(`${form.name} added to your medications!`);
    };

    const remove = (id: string) => { const m = meds.find(x => x.id === id); setMeds(p => p.filter(m => m.id !== id)); toast(`${m?.name} removed`, { icon: '🗑️' }); };

    const checkInteraction = async () => {
        if (!drug1 || !drug2) { toast.error('Enter both medications'); return; }
        // First check local known interactions
        const known = INTERACTIONS.find(i =>
            (i.pair[0].toLowerCase().includes(drug1.toLowerCase()) || drug1.toLowerCase().includes(i.pair[0].toLowerCase())) &&
            (i.pair[1].toLowerCase().includes(drug2.toLowerCase()) || drug2.toLowerCase().includes(i.pair[1].toLowerCase()))
        );
        if (known) { setInterResult(`⚠️ ${known.severity} Interaction\n\n${known.effect}\n\nRecommendation: Consult your physician before taking these together.`); return; }
        setLoading(true);
        const key = import.meta.env.VITE_GEMINI_API_KEY;
        try {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `As a clinical pharmacist, check drug interactions between:\nDrug 1: ${drug1}\nDrug 2: ${drug2}\n\nRespond with:\n1. Interaction Severity: None/Minor/Moderate/Major/Contraindicated\n2. Mechanism\n3. Clinical Effect\n4. Recommendation\nKeep under 150 words.` }] }] })
            });
            const d = await r.json();
            setInterResult(d?.candidates?.[0]?.content?.parts?.[0]?.text || 'No data available.');
        } catch { setInterResult('Unable to check. Ensure your Gemini API key is set.'); }
        finally { setLoading(false); }
    };

    const takenCount = meds.filter(m => m.taken).length;
    const refillSoon = meds.filter(m => m.refillDate && new Date(m.refillDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
    const tabs = [{ id: 'schedule', l: '💊 Today\'s Schedule' }, { id: 'add', l: '➕ Add Medication' }, { id: 'checker', l: '⚠️ Interaction Checker' }, { id: 'history', l: '📝 All Medications' }] as const;
    const inp = { className: 'input' as const, style: { fontSize: 13 } };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#f97316,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pill size={22} color="white" /></div>
                <div><div className="section-title" style={{ marginBottom: 0 }}>Smart Medication System 💊</div><div className="section-subtitle" style={{ marginBottom: 0 }}>Track doses, set reminders, check interactions, manage all medications</div></div>
            </div>

            <div className="grid-4" style={{ margin: '20px 0' }}>
                {[{ l: 'Total Medications', v: meds.length, i: '💊', c: '#6366f1' }, { l: 'Taken Today', v: `${takenCount}/${meds.length}`, i: '✅', c: '#22c55e' }, { l: 'Refill Soon', v: refillSoon, i: '🔔', c: refillSoon > 0 ? '#ef4444' : '#22c55e' }, { l: 'Chronic Meds', v: meds.filter(m => m.category === 'Chronic').length, i: '📅', c: '#f59e0b' }].map((s, i) => (
                    <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }} className="card" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: s.c, fontFamily: 'var(--font-display)' }}>{s.v}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.l}</div>
                    </motion.div>
                ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 20, padding: '14px 18px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>Today's Adherence</span>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>{Math.round(takenCount / Math.max(meds.length, 1) * 100)}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${takenCount / Math.max(meds.length, 1) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg,#22c55e,#06b6d4)', borderRadius: 4 }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 5, borderRadius: 14, marginBottom: 24, width: 'fit-content', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t.id ? 'var(--color-primary)' : 'transparent', color: tab === t.id ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{t.l}</button>)}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'schedule' && (
                    <motion.div key="sch" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {meds.map((m, i) => (
                                <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .06 }} className="card"
                                    style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', border: `1px solid ${m.taken ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, transition: 'border-color 0.2s' }}>
                                    <button onClick={() => toggleTaken(m.id)} style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${m.taken ? '#22c55e' : 'var(--border)'}`, background: m.taken ? 'rgba(34,197,94,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {m.taken ? <CheckCircle size={18} color="#22c55e" /> : <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border)' }} />}
                                    </button>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: CAT_COLOR[m.category] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💊</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, opacity: m.taken ? .6 : 1 }}>{m.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.frequency} · {m.purpose}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: CAT_COLOR[m.category] + '18', color: CAT_COLOR[m.category], fontWeight: 600 }}>{m.category}</span>
                                        {m.refillDate && new Date(m.refillDate) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) && (
                                            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}><Bell size={10} />Refill Soon</span>
                                        )}
                                        <button onClick={() => remove(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><Trash2 size={14} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {tab === 'add' && (
                    <motion.div key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div className="card" style={{ padding: 24, maxWidth: 600 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={15} color="var(--color-primary-light)" />Add New Medication</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                {[{ l: 'Medication Name *', k: 'name', ph: 'e.g. Metformin 500mg' }, { l: 'Dose *', k: 'dose', ph: 'e.g. 500mg' }, { l: 'Prescribed By', k: 'prescribedBy', ph: 'Doctor name or Self' }, { l: 'Purpose', k: 'purpose', ph: 'e.g. Diabetes management' }].map(f => (
                                    <div key={f.k}>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>{f.l}</label>
                                        <input {...inp} placeholder={f.ph} value={form[f.k as keyof typeof form] as string} onChange={e => set(f.k, e.target.value)} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Frequency</label>
                                    <select {...inp} value={form.frequency} onChange={e => set('frequency', e.target.value)}>{FREQ.map(f => <option key={f}>{f}</option>)}</select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Category</label>
                                    <select {...inp} value={form.category} onChange={e => set('category', e.target.value)}>{CAT.map(c => <option key={c}>{c}</option>)}</select>
                                </div>
                                {[{ l: 'Start Date', k: 'startDate', t: 'date' }, { l: 'End Date (optional)', k: 'endDate', t: 'date' }, { l: 'Refill Date (optional)', k: 'refillDate', t: 'date' }].map(f => (
                                    <div key={f.k}>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>{f.l}</label>
                                        <input {...inp} type={f.t} value={form[f.k as keyof typeof form] as string} onChange={e => set(f.k, e.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }} onClick={addMed} className="btn btn-primary" style={{ width: '100%', height: 46, fontSize: 14, gap: 8, marginTop: 20 }}>
                                <Plus size={15} />Add Medication
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {tab === 'checker' && (
                    <motion.div key="chk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={15} color="#f59e0b" />Drug Interaction Checker</div>
                                {[{ l: 'Medication 1', v: drug1, s: setDrug1, ph: 'e.g. Warfarin' }, { l: 'Medication 2', v: drug2, s: setDrug2, ph: 'e.g. Aspirin' }].map(f => (
                                    <div key={f.l} style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>{f.l}</label>
                                        <input {...inp} placeholder={f.ph} value={f.v} onChange={e => f.s(e.target.value)} />
                                    </div>
                                ))}
                                <button onClick={checkInteraction} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: 44, gap: 8 }}>
                                    {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Checking...</> : <><AlertTriangle size={14} />Check Interaction</>}
                                </button>
                                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>KNOWN INTERACTIONS TO WATCH</div>
                                    {INTERACTIONS.slice(0, 3).map(i => (
                                        <div key={i.pair.join('+')} style={{ padding: '8px 10px', background: 'var(--bg-input)', borderRadius: 8, marginBottom: 6 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>{i.pair.join(' + ')}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{i.severity} — {i.effect.split('.')[0]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>⚠️ Interaction Result</div>
                                {interResult
                                    ? <pre style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{interResult}</pre>
                                    : <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}><AlertTriangle size={40} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} /><div style={{ fontSize: 14, fontWeight: 600 }}>Enter two medications above</div><div style={{ fontSize: 12, marginTop: 6 }}>AI will instantly check for any dangerous drug interactions</div></div>
                                }
                            </div>
                        </div>
                    </motion.div>
                )}

                {tab === 'history' && (
                    <motion.div key="hist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                            {meds.map((m, i) => (
                                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }} className="card" style={{ padding: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{ fontSize: 28 }}>💊</div>
                                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: CAT_COLOR[m.category] + '18', color: CAT_COLOR[m.category], fontWeight: 600 }}>{m.category}</span>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                                        <div>📋 {m.purpose}</div>
                                        <div>💉 {m.dose} · {m.frequency}</div>
                                        <div>👨‍⚕️ {m.prescribedBy || 'Self'}</div>
                                        {m.startDate && <div>📅 From {m.startDate}{m.endDate && ` to ${m.endDate}`}</div>}
                                        {m.refillDate && <div style={{ color: new Date(m.refillDate) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) ? '#ef4444' : 'inherit' }}>🔔 Refill: {m.refillDate}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <button onClick={() => toggleTaken(m.id)} className="btn btn-ghost" style={{ flex: 1, height: 34, fontSize: 11, gap: 5 }}>{m.taken ? <><CheckCircle size={11} color="#22c55e" />Taken</> : <><Clock size={11} />Mark Taken</>}</button>
                                        <button onClick={() => remove(m.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Medications;
