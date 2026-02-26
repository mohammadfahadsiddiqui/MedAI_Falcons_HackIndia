import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Activity, Zap, AlertTriangle, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface RiskReport {
    overallScore: number;
    level: 'Low' | 'Moderate' | 'High' | 'Critical';
    summary: string;
    organs: { name: string; icon: string; score: number; status: string; risk: string }[];
    predictions: { timeline: string; event: string; probability: string; action: string }[];
    preventive: string[];
    diet: string[];
    lifestyle: string[];
}

const LEVEL_COLOR = { Low: '#22c55e', Moderate: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
const LEVEL_BG = { Low: 'rgba(34,197,94,0.1)', Moderate: 'rgba(245,158,11,0.1)', High: 'rgba(249,115,22,0.1)', Critical: 'rgba(239,68,68,0.1)' };

const parseReport = (raw: string): RiskReport => {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
    try { if (jsonMatch) return JSON.parse(jsonMatch[1]); } catch { }
    return {
        overallScore: 50, level: 'Moderate', summary: raw.slice(0, 300),
        organs: [], predictions: [], preventive: [], diet: [], lifestyle: [],
    };
};

const HealthTwin: React.FC = () => {
    const [form, setForm] = useState({ age: '35', gender: 'male', weight: '75', height: '170', bpSystolic: '120', bpDiastolic: '80', glucose: '95', cholesterol: '180', smoking: 'no', alcohol: 'occasional', sleep: '7', stress: '5', exercise: '3', family: '' });
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<RiskReport | null>(null);

    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const analyze = async () => {
        setLoading(true);
        setReport(null);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const prompt = `You are a senior AI medical expert. Analyze this patient's health profile and generate a 6–12 month predictive health risk report.

Patient Data:
- Age: ${form.age}, Gender: ${form.gender}
- Weight: ${form.weight}kg, Height: ${form.height}cm (BMI: ${(parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)})
- Blood Pressure: ${form.bpSystolic}/${form.bpDiastolic} mmHg
- Fasting Glucose: ${form.glucose} mg/dL
- Cholesterol: ${form.cholesterol} mg/dL
- Smoking: ${form.smoking}, Alcohol: ${form.alcohol}
- Sleep: ${form.sleep} hrs/night, Stress level: ${form.stress}/10
- Exercise: ${form.exercise} days/week
- Family history: ${form.family || 'None reported'}

Return ONLY this JSON:
{
  "overallScore": <0-100, higher = higher risk>,
  "level": "<Low|Moderate|High|Critical>",
  "summary": "<2-3 sentence overall assessment>",
  "organs": [
    {"name":"Heart","icon":"❤️","score":<0-100>,"status":"<Healthy/At Risk/Concerning>","risk":"<brief risk note>"},
    {"name":"Liver","icon":"🟤","score":<0-100>,"status":"<Healthy/At Risk/Concerning>","risk":"<brief risk note>"},
    {"name":"Kidneys","icon":"🫘","score":<0-100>,"status":"<Healthy/At Risk/Concerning>","risk":"<brief risk note>"},
    {"name":"Pancreas","icon":"🟡","score":<0-100>,"status":"<Healthy/At Risk/Concerning>","risk":"<brief risk note>"},
    {"name":"Lungs","icon":"🫁","score":<0-100>,"status":"<Healthy/At Risk/Concerning>","risk":"<brief risk note>"},
    {"name":"Brain","icon":"🧠","score":<0-100>,"status":"<Healthy/At Risk/Concerning>","risk":"<brief risk note>"}
  ],
  "predictions": [
    {"timeline":"3 months","event":"<predicted health event or milestone>","probability":"<Low/Medium/High>","action":"<recommended action>"},
    {"timeline":"6 months","event":"<predicted health event or milestone>","probability":"<Low/Medium/High>","action":"<recommended action>"},
    {"timeline":"12 months","event":"<predicted health event or milestone>","probability":"<Low/Medium/High>","action":"<recommended action>"}
  ],
  "preventive": ["<specific preventive action 1>","<action 2>","<action 3>","<action 4>"],
  "diet": ["<specific diet recommendation 1>","<recommendation 2>","<recommendation 3>"],
  "lifestyle": ["<lifestyle change 1>","<lifestyle change 2>","<lifestyle change 3>"]
}`;

        try {
            if (!apiKey) throw new Error('No API key');
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 2048 } }),
            });
            const data = await res.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            setReport(parseReport(raw));
            toast.success('Health Twin analysis complete! 🧬');
        } catch {
            toast.error('Analysis failed. Check your API key.');
        } finally { setLoading(false); }
    };

    const inputStyle = { fontSize: 13, marginBottom: 0 };
    const labelStyle = { fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 };
    const fieldWrap = { marginBottom: 14 };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={22} color="white" />
                </div>
                <div>
                    <div className="section-title" style={{ marginBottom: 0 }}>Digital Health Twin 🧬</div>
                    <div className="section-subtitle" style={{ marginBottom: 0 }}>AI predicts your health risks for the next 6–12 months</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: report ? '380px 1fr' : '1fr', gap: 24, marginTop: 24 }}>
                {/* Form */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} color="var(--color-primary-light)" /> Your Health Profile
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                        {[
                            { label: 'Age', key: 'age', type: 'number', ph: '35' },
                            { label: 'Weight (kg)', key: 'weight', type: 'number', ph: '70' },
                            { label: 'Height (cm)', key: 'height', type: 'number', ph: '170' },
                            { label: 'BP Systolic', key: 'bpSystolic', type: 'number', ph: '120' },
                            { label: 'BP Diastolic', key: 'bpDiastolic', type: 'number', ph: '80' },
                            { label: 'Glucose (mg/dL)', key: 'glucose', type: 'number', ph: '95' },
                            { label: 'Cholesterol', key: 'cholesterol', type: 'number', ph: '180' },
                            { label: 'Sleep (hrs/night)', key: 'sleep', type: 'number', ph: '7' },
                        ].map(f => (
                            <div key={f.key} style={fieldWrap}>
                                <label style={labelStyle}>{f.label}</label>
                                <input className="input" type={f.type} placeholder={f.ph} value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
                            </div>
                        ))}
                    </div>
                    {/* Selects */}
                    {[
                        { label: 'Gender', key: 'gender', opts: [['male', '♂ Male'], ['female', '♀ Female'], ['other', 'Other']] },
                        { label: 'Smoking', key: 'smoking', opts: [['no', 'Non-smoker'], ['occasional', 'Occasional'], ['regular', 'Regular Smoker'], ['heavy', 'Heavy Smoker']] },
                        { label: 'Alcohol', key: 'alcohol', opts: [['no', 'None'], ['occasional', 'Occasional'], ['moderate', 'Moderate'], ['heavy', 'Heavy']] },
                        { label: 'Exercise (days/week)', key: 'exercise', opts: [['0', 'None'], ['1', '1 day'], ['2', '2 days'], ['3', '3 days'], ['4', '4 days'], ['5', '5+ days']] },
                    ].map(f => (
                        <div key={f.key} style={fieldWrap}>
                            <label style={labelStyle}>{f.label}</label>
                            <select className="input" value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)} style={inputStyle}>
                                {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                    ))}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Stress Level: {form.stress}/10</label>
                        <input type="range" min={1} max={10} value={form.stress} onChange={e => set('stress', e.target.value)} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
                    </div>
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Family History (optional)</label>
                        <input className="input" placeholder="e.g. Diabetes, Heart Disease, Cancer" value={form.family} onChange={e => set('family', e.target.value)} style={inputStyle} />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={analyze} disabled={loading}
                        className="btn btn-primary" style={{ width: '100%', height: 48, fontSize: 15, fontWeight: 700, gap: 10, marginTop: 4 }}>
                        {loading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing your health twin...</>
                            : <><Brain size={16} /> Generate Health Twin</>}
                    </motion.button>
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {report && (
                        <motion.div key="report" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Overall Score */}
                            <div className="card" style={{ padding: 24, background: `linear-gradient(135deg,${LEVEL_BG[report.level]},rgba(99,102,241,0.05))`, border: `1px solid ${LEVEL_COLOR[report.level]}30` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: `conic-gradient(${LEVEL_COLOR[report.level]} ${report.overallScore * 3.6}deg, var(--bg-input) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                                        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ fontSize: 24, fontWeight: 900, color: LEVEL_COLOR[report.level], fontFamily: 'var(--font-display)' }}>{report.overallScore}</div>
                                            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>RISK SCORE</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Overall Health Risk</div>
                                        <div style={{ fontSize: 28, fontWeight: 900, color: LEVEL_COLOR[report.level], fontFamily: 'var(--font-display)' }}>{report.level}</div>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '8px 0 0' }}>{report.summary}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Organ Map */}
                            {report.organs.length > 0 && (
                                <div className="card" style={{ padding: 20 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🫀 Organ Health Map</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                                        {report.organs.map(o => {
                                            const c = o.score < 30 ? '#22c55e' : o.score < 60 ? '#f59e0b' : '#ef4444';
                                            return (
                                                <div key={o.name} style={{ background: 'var(--bg-input)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: 28, marginBottom: 4 }}>{o.icon}</div>
                                                    <div style={{ fontSize: 12, fontWeight: 700 }}>{o.name}</div>
                                                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, margin: '8px 0 4px', position: 'relative', overflow: 'hidden' }}>
                                                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${o.score}%`, background: c, borderRadius: 2, transition: 'width 1s ease' }} />
                                                    </div>
                                                    <div style={{ fontSize: 10, color: c, fontWeight: 700 }}>{o.status}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{o.risk}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Timeline Predictions */}
                            {report.predictions.length > 0 && (
                                <div className="card" style={{ padding: 20 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📅 6–12 Month Predictions</div>
                                    {report.predictions.map((p, i) => {
                                        const pc = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' }[p.probability] || '#6366f1';
                                        return (
                                            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                                                <div style={{ width: 64, flexShrink: 0, textAlign: 'center' }}>
                                                    <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{p.timeline}</div>
                                                </div>
                                                <div style={{ flex: 1, background: 'var(--bg-input)', borderRadius: 10, padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.event}</span>
                                                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: pc + '18', color: pc, fontWeight: 700 }}>{p.probability}</span>
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}><ChevronRight size={11} />{p.action}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Recommendations */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                                {[
                                    { title: '🛡️ Preventive Actions', items: report.preventive, color: '#6366f1' },
                                    { title: '🥗 Diet Plan', items: report.diet, color: '#22c55e' },
                                    { title: '🏃 Lifestyle Changes', items: report.lifestyle, color: '#f59e0b' },
                                ].map(sec => (
                                    <div key={sec.title} className="card" style={{ padding: 16 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{sec.title}</div>
                                        {sec.items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 7, fontSize: 12, color: 'var(--text-secondary)' }}>
                                                <CheckCircle size={12} color={sec.color} style={{ flexShrink: 0, marginTop: 1 }} />{item}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                🤖 Generated by Gemini 2.5 Flash AI · Not a medical diagnosis · Consult your physician
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty state */}
                {!report && !loading && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🧬</div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Your Digital Health Twin</div>
                        <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 320 }}>Fill in your health profile and let AI predict your risk for the next 6–12 months with personalized prevention plans.</div>
                        <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
                            {['❤️ Heart Risk', '🍬 Diabetes Risk', '🧠 Mental Health', '🫘 Kidney Health'].map(t => (
                                <div key={t} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)', fontWeight: 600 }}>{t}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthTwin;
