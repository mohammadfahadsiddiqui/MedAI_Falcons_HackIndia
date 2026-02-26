import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, RefreshCw, MessageCircle, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OpinionResult {
    diagnoses: { name: string; icd10: string; confidence: number; evidence: string; tests: string; urgency: string }[];
    consensus: string;
    redFlags: string[];
    followUpQ: string[];
}

const parseOpinion = (raw: string): OpinionResult => {
    const m = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
    try { if (m) return JSON.parse(m[1]); } catch { }
    return { diagnoses: [], consensus: raw.slice(0, 300), redFlags: [], followUpQ: [] };
};

const SecondOpinion: React.FC = () => {
    const [form, setForm] = useState({ diagnosis: '', symptoms: '', age: '', labs: '', history: '' });
    const [result, setResult] = useState<OpinionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [followUp, setFollowUp] = useState('');
    const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const analyze = async () => {
        if (!form.symptoms) { toast.error('Enter your symptoms'); return; }
        setLoading(true); setResult(null);
        const key = import.meta.env.VITE_GEMINI_API_KEY;
        const prompt = `You are a senior AI medical consultant providing a second opinion. Analyze this case and return ONLY JSON:

Current Diagnosis: ${form.diagnosis || 'Not specified'}
Symptoms: ${form.symptoms}
Patient: ${form.age}
Labs/Reports: ${form.labs}
Medical History: ${form.history}

Return ONLY this JSON (no other text):
{
  "diagnoses": [
    {"name":"<diagnosis>","icd10":"<code>","confidence":<0-100>,"evidence":"<supporting evidence from case>","tests":"<tests to confirm>","urgency":"<Routine/Urgent/Emergency>"},
    {"name":"<diagnosis 2>","icd10":"<code>","confidence":<0-100>,"evidence":"<evidence>","tests":"<tests>","urgency":"<level>"},
    {"name":"<diagnosis 3>","icd10":"<code>","confidence":<0-100>,"evidence":"<evidence>","tests":"<tests>","urgency":"<level>"}
  ],
  "consensus": "<2-sentence summary agree/disagree with original diagnosis and AI recommendation>",
  "redFlags": ["<urgent warning sign 1>","<warning 2>","<warning 3>"],
  "followUpQ": ["<follow-up question the doctor should ask 1>","<question 2>","<question 3>"]
}`;
        try {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 1200 } })
            });
            const d = await r.json();
            const raw = d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            setResult(parseOpinion(raw));
            toast.success('Second opinion ready! 🩺');
        } catch { toast.error('Analysis failed. Check API key.'); }
        finally { setLoading(false); }
    };

    const sendChat = async () => {
        if (!chatInput.trim()) return;
        const userMsg = chatInput; setChatInput('');
        setChat(p => [...p, { role: 'user', text: userMsg }]);
        setChatLoading(true);
        const key = import.meta.env.VITE_GEMINI_API_KEY;
        try {
            const ctx = result ? `Context: Patient has ${form.symptoms}, age ${form.age}. AI suggested diagnoses: ${result.diagnoses.map(d => d.name).join(', ')}.` : '';
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `You are a senior AI medical consultant. ${ctx}\n\nPatient question: ${userMsg}\n\nAnswer concisely and clinically (100 words max).` }] }] })
            });
            const d = await r.json();
            const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to respond.';
            setChat(p => [...p, { role: 'ai', text: reply }]);
        } catch { setChat(p => [...p, { role: 'ai', text: 'Sorry, I could not process that.' }]); }
        finally { setChatLoading(false); }
    };

    const urgColor: Record<string, string> = { Routine: '#22c55e', Urgent: '#f59e0b', Emergency: '#ef4444' };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#f97316,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={22} color="white" /></div>
                <div><div className="section-title" style={{ marginBottom: 0 }}>AI Second Opinion 🩺</div><div className="section-subtitle" style={{ marginBottom: 0 }}>Cross-check your diagnosis · Get alternative perspectives · Ask follow-up questions</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: result ? '380px 1fr' : '600px 1fr', gap: 24, marginTop: 20 }}>
                {/* Input Form */}
                <div className="card" style={{ padding: 22 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📋 Case Details</div>
                    {[
                        { l: 'Current Diagnosis (if any)', k: 'diagnosis', ph: 'e.g. Viral URTI, Community-acquired Pneumonia...' },
                        { l: 'Symptoms & Duration *', k: 'symptoms', ph: 'e.g. Fever 38.8°C for 4 days, productive cough, chest tightness, fatigue...' },
                        { l: 'Patient Age, Gender & Background', k: 'age', ph: 'e.g. 45-year-old female, non-smoker, no known allergies...' },
                        { l: 'Lab Results & Investigations', k: 'labs', ph: 'e.g. WBC 14.2K, CRP 48, Chest X-ray: bilateral infiltrates...' },
                        { l: 'Medical History & Current Medications', k: 'history', ph: 'e.g. Asthma, on Salbutamol inhaler PRN. No recent travel.' },
                    ].map(f => (
                        <div key={f.k} style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>{f.l}</label>
                            <textarea className="input" rows={2} placeholder={f.ph} value={form[f.k as keyof typeof form]} onChange={e => set(f.k, e.target.value)} style={{ resize: 'vertical', fontSize: 13 }} />
                        </div>
                    ))}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }} onClick={analyze} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: 46, fontSize: 14, gap: 8, marginTop: 4 }}>
                        {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Analyzing case...</> : <><Brain size={14} />Get AI Second Opinion</>}
                    </motion.button>
                    <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic' }}>🤖 Powered by Gemini 2.5 Flash · For educational purposes · Always consult a licensed physician</div>
                </div>

                {/* Results */}
                {result ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Consensus */}
                        <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Brain size={15} color="var(--color-primary-light)" />AI Consensus</div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{result.consensus}</p>
                        </div>

                        {/* Differential Diagnoses */}
                        {result.diagnoses.map((dx, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .08 }} className="card" style={{ padding: 18 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{dx.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>ICD-10: {dx.icd10}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: (urgColor[dx.urgency] || '#6366f1') + '18', color: urgColor[dx.urgency] || '#6366f1', fontWeight: 700 }}>{dx.urgency}</span>
                                        <span style={{ fontSize: 14, fontWeight: 900, color: dx.confidence > 70 ? '#22c55e' : dx.confidence > 40 ? '#f59e0b' : '#ef4444', fontFamily: 'var(--font-display)' }}>{dx.confidence}%</span>
                                    </div>
                                </div>
                                <div style={{ height: 4, background: 'var(--bg-input)', borderRadius: 2, marginBottom: 10 }}>
                                    <div style={{ height: '100%', width: `${dx.confidence}%`, background: dx.confidence > 70 ? '#22c55e' : dx.confidence > 40 ? '#f59e0b' : '#ef4444', borderRadius: 2, transition: 'width 1s ease' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-secondary)' }}>Evidence:</strong> {dx.evidence}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-secondary)' }}>Confirm with:</strong> {dx.tests}</div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Red Flags + Follow-up */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div className="card" style={{ padding: 18, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#f87171' }}>🚨 Red Flags</div>
                                {result.redFlags.map((r, i) => <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 7, fontSize: 12, color: 'var(--text-secondary)' }}><span style={{ color: '#ef4444' }}>⚠</span>{r}</div>)}
                            </div>
                            <div className="card" style={{ padding: 18 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>❓ Questions to Ask Your Doctor</div>
                                {result.followUpQ.map((q, i) => <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 7, fontSize: 12, color: 'var(--text-secondary)' }}><ChevronRight size={11} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-primary-light)' }} />{q}</div>)}
                            </div>
                        </div>

                        {/* Follow-up Chat */}
                        <div className="card" style={{ padding: 18 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><MessageCircle size={14} color="var(--color-primary-light)" />Ask a Follow-up Question</div>
                            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {chat.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 12, background: m.role === 'user' ? 'var(--color-primary)' : 'var(--bg-input)', color: m.role === 'user' ? 'white' : 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>{m.text}</div>
                                    </div>
                                ))}
                                {chatLoading && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>AI is thinking...</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="input" placeholder="Ask anything about this diagnosis..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} style={{ flex: 1, fontSize: 13 }} />
                                <button onClick={sendChat} disabled={chatLoading} className="btn btn-primary" style={{ padding: '0 18px' }}><MessageCircle size={15} /></button>
                            </div>
                        </div>
                    </div>
                ) : !loading && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🩺</div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>AI Second Opinion</div>
                        <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 320 }}>Enter your case details to get 3 evidence-based differential diagnoses with confidence scores, red flags, and follow-up questions.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecondOpinion;
