import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Brain, FileText, AlertTriangle, TrendingUp, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const PATIENTS = [
    { id: 'p1', name: 'Aisha Khan', age: 45, condition: 'Type 2 Diabetes', risk: 'High', lastVisit: '20 Feb', bp: '142/88', glucose: '178' },
    { id: 'p2', name: 'Ravi Sharma', age: 62, condition: 'Hypertension + CKD', risk: 'Critical', lastVisit: '18 Feb', bp: '168/96', glucose: '110' },
    { id: 'p3', name: 'Fatima Ali', age: 32, condition: 'Hypothyroidism', risk: 'Low', lastVisit: '22 Feb', bp: '112/74', glucose: '88' },
    { id: 'p4', name: 'Mohammed Hassan', age: 55, condition: 'Coronary Artery Disease', risk: 'High', lastVisit: '15 Feb', bp: '138/84', glucose: '132' },
];
const RISK_COLOR: Record<string, string> = { Low: '#22c55e', Moderate: '#f59e0b', High: '#f97316', Critical: '#ef4444' };

const callGemini = async (prompt: string) => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error('No API key');
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 600 } })
    });
    const d = await r.json();
    return d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const DoctorDashboard: React.FC = () => {
    const [tab, setTab] = useState<'patients' | 'soap' | 'diagnosis' | 'drugs' | 'revenue'>('patients');
    const [soap, setSoap] = useState({ subjective: '', objective: '', history: '' });
    const [soapResult, setSoapResult] = useState('');
    const [diag, setDiag] = useState({ symptoms: '', age: '', vitals: '' });
    const [diagResult, setDiagResult] = useState('');
    const [drug, setDrug] = useState({ drug1: '', drug2: '' });
    const [drugResult, setDrugResult] = useState('');
    const [loading, setLoading] = useState(false);

    const genSoap = async () => {
        if (!soap.subjective) { toast.error('Enter patient symptoms'); return; }
        setLoading(true);
        try {
            const r = await callGemini(`You are a physician. Generate a professional SOAP note from this consultation data:\n\nSubjective (patient complaint): ${soap.subjective}\nObjective findings: ${soap.objective}\nMedical history: ${soap.history}\n\nFormat as:\nSUBJECTIVE:\n[detailed subjective]\n\nOBJECTIVE:\n[detailed objective findings]\n\nASSESSMENT:\n[diagnosis/working diagnosis]\n\nPLAN:\n[treatment plan, medications, follow-up]\n\nKeep it professional and concise (200 words).`);
            setSoapResult(r);
            toast.success('SOAP note generated! 📋');
        } catch { toast.error('Failed'); } finally { setLoading(false); }
    };

    const genDiag = async () => {
        if (!diag.symptoms) { toast.error('Enter symptoms'); return; }
        setLoading(true);
        try {
            const r = await callGemini(`You are a senior physician. Given these clinical details, suggest the top 5 differential diagnoses with ICD-10 codes.\n\nSymptoms: ${diag.symptoms}\nAge/Gender: ${diag.age}\nVitals/Labs: ${diag.vitals}\n\nFor each diagnosis provide:\n1. Condition name + ICD-10 code\n2. Key supporting evidence from the case\n3. How to confirm (test or exam)\n4. Urgency level (Routine/Urgent/Emergency)\n\nBe clinical and concise.`);
            setDiagResult(r);
            toast.success('Differential diagnosis ready! 🩺');
        } catch { toast.error('Failed'); } finally { setLoading(false); }
    };

    const checkDrugs = async () => {
        if (!drug.drug1 || !drug.drug2) { toast.error('Enter both medications'); return; }
        setLoading(true);
        try {
            const r = await callGemini(`As a clinical pharmacist, check if these two drugs interact:\n\nDrug 1: ${drug.drug1}\nDrug 2: ${drug.drug2}\n\nProvide:\n1. Interaction severity (None/Minor/Moderate/Major/Contraindicated)\n2. Mechanism of interaction\n3. Clinical consequences\n4. Management recommendation\n5. Alternative medications if needed\n\nBe concise and clinically accurate.`);
            setDrugResult(r);
            toast.success('Interaction check complete! ⚠️');
        } catch { toast.error('Failed'); } finally { setLoading(false); }
    };

    const tabs = [{ id: 'patients', l: '👥 Patients' }, { id: 'soap', l: '📋 SOAP Notes' }, { id: 'diagnosis', l: '🩺 Differential Dx' }, { id: 'drugs', l: '⚠️ Drug Checker' }, { id: 'revenue', l: '💰 Analytics' }] as const;

    const textareaProps = (rows = 4) => ({ className: 'input' as const, style: { resize: 'vertical' as const, fontSize: 13, minHeight: rows * 32 }, });
    const inputProps = { className: 'input' as const, style: { fontSize: 13 } };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#0891b2,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Stethoscope size={22} color="white" /></div>
                <div><div className="section-title" style={{ marginBottom: 0 }}>Doctor AI Dashboard 👨‍⚕️</div><div className="section-subtitle" style={{ marginBottom: 0 }}>AI SOAP notes · Differential diagnosis · Drug interactions · Analytics</div></div>
            </div>

            <div className="grid-4" style={{ margin: '20px 0' }}>
                {[{ l: 'Total Patients', v: PATIENTS.length, i: '👥', c: '#6366f1' }, { l: 'Critical Cases', v: PATIENTS.filter(p => p.risk === 'Critical').length, i: '🚨', c: '#ef4444' }, { l: 'High Risk', v: PATIENTS.filter(p => p.risk === 'High').length, i: '⚠️', c: '#f97316' }, { l: 'Today Appointments', v: 8, i: '📅', c: '#22c55e' }].map((s, i) => (
                    <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }} className="card" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: s.c, fontFamily: 'var(--font-display)' }}>{s.v}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.l}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 5, borderRadius: 14, marginBottom: 24, width: 'fit-content', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t.id ? 'var(--color-primary)' : 'transparent', color: tab === t.id ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{t.l}</button>
                ))}
            </div>

            {tab === 'patients' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {PATIENTS.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }} className="card" style={{ padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg,${RISK_COLOR[p.risk]}30,${RISK_COLOR[p.risk]}10)`, border: `2px solid ${RISK_COLOR[p.risk]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{p.name[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.age}y · {p.condition} · Last: {p.lastVisit}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>BP</div><div style={{ fontSize: 13, fontWeight: 700 }}>{p.bp}</div></div>
                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Glucose</div><div style={{ fontSize: 13, fontWeight: 700 }}>{p.glucose}</div></div>
                                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: RISK_COLOR[p.risk] + '18', color: RISK_COLOR[p.risk], fontWeight: 700 }}>{p.risk}</span>
                                    <button onClick={() => toast(`Opening ${p.name}'s full chart`)} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>View Chart</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {tab === 'soap' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div className="card" style={{ padding: 22 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={15} color="var(--color-primary-light)" />Patient Consultation Input</div>
                            {[{ l: 'Chief Complaint / Symptoms (Subjective)', k: 'subjective', ph: "Patient reports 3-day history of fever 38.5°C, productive cough, fatigue..." }, { l: 'Clinical Findings (Objective)', k: 'objective', ph: "T: 38.5°C, PR: 92/min, RR: 20, SpO2: 97%, Chest: crackles at base..." }, { l: 'Medical History & Current Medications', k: 'history', ph: "Known hypertensive, on Amlodipine 5mg. No known drug allergies..." }].map(f => (
                                <div key={f.k} style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>{f.l}</label>
                                    <textarea {...textareaProps()} placeholder={f.ph} value={soap[f.k as keyof typeof soap]} onChange={e => setSoap(p => ({ ...p, [f.k]: e.target.value }))} />
                                </div>
                            ))}
                            <button onClick={genSoap} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: 46, gap: 8, fontSize: 14 }}>
                                {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Generating...</> : <><Brain size={14} />Generate SOAP Note</>}
                            </button>
                            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                        </div>
                        <div className="card" style={{ padding: 22 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={15} color="#22c55e" />AI-Generated SOAP Note</div>
                            {soapResult
                                ? <pre style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{soapResult}</pre>
                                : <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}><FileText size={40} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} /><div>Fill in the consultation details and click Generate</div></div>
                            }
                        </div>
                    </div>
                </motion.div>
            )}

            {tab === 'diagnosis' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div className="card" style={{ padding: 22 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Stethoscope size={15} color="var(--color-primary-light)" />Clinical Presentation</div>
                            {[{ l: 'Symptoms & Duration', k: 'symptoms', ph: 'Chest pain radiating to left arm, onset 2 hrs ago, severe 8/10, diaphoresis...' }, { l: 'Patient Demographics', k: 'age', ph: '65-year-old male, smoker 20 pack-years, hypertensive...' }, { l: 'Vitals & Labs', k: 'vitals', ph: 'BP 180/100, HR 110, Troponin: 2.4 ng/mL, ECG: ST elevation...' }].map(f => (
                                <div key={f.k} style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>{f.l}</label>
                                    <textarea {...textareaProps(3)} placeholder={f.ph} value={diag[f.k as keyof typeof diag]} onChange={e => setDiag(p => ({ ...p, [f.k]: e.target.value }))} />
                                </div>
                            ))}
                            <button onClick={genDiag} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: 46, gap: 8, fontSize: 14 }}>
                                {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Analyzing...</> : <><Brain size={14} />Suggest Differential Diagnosis</>}
                            </button>
                        </div>
                        <div className="card" style={{ padding: 22 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={15} color="#8b5cf6" />AI Differential Diagnoses</div>
                            {diagResult
                                ? <pre style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{diagResult}</pre>
                                : <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}><Brain size={40} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} /><div>Enter clinical details to get AI differential diagnoses with ICD-10 codes</div></div>
                            }
                        </div>
                    </div>
                </motion.div>
            )}

            {tab === 'drugs' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
                        <div className="card" style={{ padding: 22 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={15} color="#f59e0b" />Drug Interaction Checker</div>
                            {[{ l: 'Medication 1', k: 'drug1', ph: 'e.g. Warfarin 5mg' }, { l: 'Medication 2', k: 'drug2', ph: 'e.g. Aspirin 100mg' }].map(f => (
                                <div key={f.k} style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>{f.l}</label>
                                    <input {...inputProps} placeholder={f.ph} value={drug[f.k as keyof typeof drug]} onChange={e => setDrug(p => ({ ...p, [f.k]: e.target.value }))} />
                                </div>
                            ))}
                            <button onClick={checkDrugs} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: 46, gap: 8 }}>
                                {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Checking...</> : <><AlertTriangle size={14} />Check Interaction</>}
                            </button>
                        </div>
                        <div className="card" style={{ padding: 22 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>⚠️ Interaction Result</div>
                            {drugResult
                                ? <pre style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{drugResult}</pre>
                                : <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}><AlertTriangle size={40} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} /><div>Enter two medications to check for interactions</div></div>
                            }
                        </div>
                    </div>
                </motion.div>
            )}

            {tab === 'revenue' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid-4" style={{ marginBottom: 20 }}>
                        {[{ l: 'Monthly Revenue', v: '₹1,24,500', c: '#22c55e', i: '💰' }, { l: 'This Week', v: '₹28,200', c: '#6366f1', i: '📈' }, { l: 'Avg per Patient', v: '₹2,490', c: '#f59e0b', i: '👤' }, { l: 'Patient Retention', v: '87%', c: '#06b6d4', i: '🔄' }].map((s, i) => (
                            <motion.div key={s.l} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }} className="card" style={{ padding: '20px 22px' }}>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: s.c, fontFamily: 'var(--font-display)' }}>{s.v}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.l}</div>
                            </motion.div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {[{ title: 'Top Conditions Treated', items: [{ l: 'Diabetes Management', v: 28, c: '#6366f1' }, { l: 'Hypertension', v: 22, c: '#06b6d4' }, { l: 'Respiratory Infections', v: 18, c: '#22c55e' }, { l: 'Thyroid Disorders', v: 14, c: '#f59e0b' }, { l: 'Cardiac Follow-up', v: 12, c: '#ef4444' }] }, { title: 'AI Improvement Suggestions', items: [{ l: 'Recall diabetic patients for HbA1c review', v: null, c: '#6366f1' }, { l: '8 patients overdue for annual checkup', v: null, c: '#f59e0b' }, { l: 'Offer video consultations to increase reach', v: null, c: '#22c55e' }, { l: 'Add thyroid package to lab test offerings', v: null, c: '#8b5cf6' }, { l: 'Prescribe Metformin review for 3 patients', v: null, c: '#ef4444' }] }].map(sec => (
                            <div key={sec.title} className="card" style={{ padding: 22 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{sec.title}</div>
                                {sec.items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{item.l}</div>
                                            {item.v && <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 3 }}><div style={{ height: '100%', width: `${item.v * 2.5}%`, background: item.c, borderRadius: 3 }} /></div>}
                                        </div>
                                        {item.v && <span style={{ fontSize: 12, fontWeight: 700, color: item.c, minWidth: 30 }}>{item.v}%</span>}
                                        {!item.v && <TrendingUp size={14} color={item.c} />}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DoctorDashboard;
