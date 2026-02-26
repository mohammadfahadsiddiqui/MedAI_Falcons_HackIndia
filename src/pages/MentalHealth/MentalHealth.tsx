import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus, Brain, Wind, BookOpen, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const MOODS = ['😞', '😔', '😐', '🙂', '😊', '😄', '🤩'];
const MOOD_LABELS = ['Very Bad', 'Bad', 'Okay', 'Good', 'Great', 'Excellent', 'Amazing'];
const MOOD_COLOR = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#6366f1'];
const CBT = [
    { id: 'breathing', icon: '🌬️', title: '4-7-8 Breathing', dur: '5 min', desc: 'Inhale 4s, Hold 7s, Exhale 8s. Repeat 4 cycles. Calms the nervous system instantly.', steps: ['Sit comfortably', 'Inhale through nose for 4 seconds', 'Hold breath for 7 seconds', 'Exhale completely for 8 seconds', 'Repeat 4 times'] },
    { id: 'grounding', icon: '🌿', title: '5-4-3-2-1 Grounding', dur: '3 min', desc: 'Name things you sense to stop anxiety spirals and return to the present moment.', steps: ['5 things you can SEE', '4 things you can TOUCH', '3 things you can HEAR', '2 things you can SMELL', '1 thing you can TASTE'] },
    { id: 'gratitude', icon: '🙏', title: 'Gratitude Journal', dur: '5 min', desc: 'Write 3 specific things you are grateful for. Scientifically rewires negative thought patterns.', steps: ['Think of something that went well', 'Write WHO helped make it happen', 'Note WHY it mattered', 'Repeat for 3 things total'] },
    { id: 'box', icon: '⬜', title: 'Box Breathing', dur: '4 min', desc: 'Used by Navy SEALs. 4-4-4-4: inhale, hold, exhale, hold.', steps: ['Inhale for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold empty for 4 counts'] },
    { id: 'reframe', icon: '🔄', title: 'Cognitive Reframing', dur: '7 min', desc: 'Challenge automatic negative thoughts with balanced evidence.', steps: ['Write the negative thought exactly', 'Rate belief 0-100%', 'List evidence for AND against it', 'Write a balanced alternative', 'Re-rate your belief'] },
    { id: 'scan', icon: '🧘', title: 'Body Scan', dur: '10 min', desc: 'Progressive relaxation from head to toe to release tension.', steps: ['Close eyes and breathe deeply', 'Focus on scalp — release tension', 'Move to face, jaw, neck, shoulders', 'Continue to chest, stomach, legs', 'End at feet — wiggle toes'] },
];

const ENTRY_DEFAULTS = { mood: 4, energy: 5, anxiety: 3 };
const trendSeed = [
    { date: '02-20', mood: 4, energy: 5, anxiety: 3 }, { date: '02-21', mood: 3, energy: 4, anxiety: 5 },
    { date: '02-22', mood: 5, energy: 6, anxiety: 2 }, { date: '02-23', mood: 4, energy: 5, anxiety: 4 },
    { date: '02-24', mood: 6, energy: 6, anxiety: 2 }, { date: '02-25', mood: 5, energy: 5, anxiety: 3 },
];

const MentalHealth: React.FC = () => {
    const [tab, setTab] = useState<'tracker' | 'cbt' | 'journal' | 'burnout'>('tracker');
    const [today, setToday] = useState(ENTRY_DEFAULTS);
    const [note, setNote] = useState('');
    const [activeCbt, setActiveCbt] = useState<string | null>(null);
    const [journal, setJournal] = useState('');
    const [aiInsight, setAiInsight] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [burnout, setBurnout] = useState({ exhaustion: 5, cynicism: 3, efficacy: 6, overwork: 4, sleep: 5, social: 4 });

    const burnoutScore = Math.round((burnout.exhaustion + burnout.cynicism + burnout.overwork + (10 - burnout.efficacy) + (10 - burnout.sleep) + burnout.social) / 6 * 10);
    const bLevel = burnoutScore < 30 ? { l: 'Low Risk', c: '#22c55e' } : burnoutScore < 60 ? { l: 'Moderate Risk', c: '#f59e0b' } : { l: 'High Risk', c: '#ef4444' };

    const analyzeJournal = async () => {
        if (!journal.trim()) { toast.error('Write something first'); return; }
        setAnalyzing(true);
        const key = import.meta.env.VITE_GEMINI_API_KEY;
        try {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `You are a compassionate mental health AI. Analyze this journal entry and give: 1) Key emotions detected 2) A compassionate reframe 3) One CBT suggestion 4) A brief affirmation. Max 150 words, warm tone.\n\nJournal: "${journal}"` }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 300 } })
            });
            const d = await r.json();
            setAiInsight(d?.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to analyze.');
            toast.success('Journal analyzed 💭');
        } catch { toast.error('Analysis failed'); }
        finally { setAnalyzing(false); }
    };

    const tabs = [{ id: 'tracker', l: '😊 Mood Tracker' }, { id: 'cbt', l: '🧘 CBT Exercises' }, { id: 'journal', l: '📔 AI Journal' }, { id: 'burnout', l: '🔋 Burnout Check' }] as const;
    const sl = (k: string, v: number) => setBurnout(p => ({ ...p, [k]: v }));

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SmilePlus size={22} color="white" /></div>
                <div><div className="section-title" style={{ marginBottom: 0 }}>Mental Health AI Companion 🧠</div><div className="section-subtitle" style={{ marginBottom: 0 }}>Mood tracker · CBT exercises · AI journal · Burnout check</div></div>
            </div>

            <div className="grid-4" style={{ margin: '20px 0' }}>
                {[{ l: 'Today Mood', v: MOOD_LABELS[today.mood], i: MOODS[today.mood], c: MOOD_COLOR[today.mood] }, { l: 'Energy', v: `${today.energy}/10`, i: '⚡', c: '#06b6d4' }, { l: 'Anxiety', v: `${today.anxiety}/10`, i: '😰', c: '#f59e0b' }, { l: 'Burnout Score', v: `${burnoutScore}/100`, i: '🔋', c: bLevel.c }].map((s, i) => (
                    <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }} className="card" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: 'var(--font-display)' }}>{s.v}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.l}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 5, borderRadius: 14, marginBottom: 24, width: 'fit-content', border: '1px solid var(--border)' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t.id ? 'var(--color-primary)' : 'transparent', color: tab === t.id ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{t.l}</button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'tracker' && (
                    <motion.div key="tracker" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Log Today's Mood</div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600 }}>HOW ARE YOU FEELING?</label>
                                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                        {MOODS.map((m, i) => (
                                            <button key={i} onClick={() => setToday(p => ({ ...p, mood: i }))} style={{ fontSize: 26, padding: '5px 7px', borderRadius: 10, border: '2px solid ' + (today.mood === i ? MOOD_COLOR[i] : 'transparent'), background: today.mood === i ? MOOD_COLOR[i] + '15' : 'var(--bg-input)', cursor: 'pointer', transition: 'all 0.2s' }}>{m}</button>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 12, color: MOOD_COLOR[today.mood], fontWeight: 700, marginTop: 5 }}>{MOOD_LABELS[today.mood]}</div>
                                </div>
                                {[{ l: `Energy: ${today.energy}/10`, k: 'energy', c: '#06b6d4' }, { l: `Anxiety: ${today.anxiety}/10`, k: 'anxiety', c: '#f59e0b' }].map(s => (
                                    <div key={s.k} style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>{s.l}</label>
                                        <input type="range" min={1} max={10} value={today[s.k as keyof typeof today]} onChange={e => setToday(p => ({ ...p, [s.k]: Number(e.target.value) }))} style={{ width: '100%', accentColor: s.c }} />
                                    </div>
                                ))}
                                <textarea className="input" rows={3} placeholder="Quick note (optional)..." value={note} onChange={e => setNote(e.target.value)} style={{ resize: 'none', fontSize: 13, marginBottom: 12 }} />
                                <button onClick={() => { toast.success('Mood saved! 😊'); setNote(''); }} className="btn btn-primary" style={{ width: '100%', height: 42 }}>Save Today's Mood</button>
                            </div>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>7-Day Trend</div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={trendSeed}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' } as React.CSSProperties} axisLine={false} tickLine={false} />
                                        <YAxis domain={[1, 7]} tick={{ fontSize: 11, fill: '#64748b' } as React.CSSProperties} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                                        <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} name="Mood" />
                                        <Line type="monotone" dataKey="energy" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} name="Energy" />
                                        <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} name="Anxiety" />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                                    {[['#8b5cf6', 'Mood'], ['#06b6d4', 'Energy'], ['#f59e0b', 'Anxiety']].map(([c, l]) => (
                                        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                                            <span style={{ width: 12, height: 3, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {tab === 'cbt' && (
                    <motion.div key="cbt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                            {CBT.map(ex => (
                                <div key={ex.id} className="card" style={{ padding: 18, cursor: 'pointer', border: activeCbt === ex.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)', transition: 'border-color 0.2s' }} onClick={() => setActiveCbt(activeCbt === ex.id ? null : ex.id)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontSize: 32 }}>{ex.icon}</span>
                                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)', fontWeight: 600, height: 'fit-content' }}>⏱ {ex.dur}</span>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{ex.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{ex.desc}</div>
                                    <AnimatePresence>
                                        {activeCbt === ex.id && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                                                    {ex.steps.map((s, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>{s}
                                                        </div>
                                                    ))}
                                                    <button onClick={() => toast.success(`${ex.title} started! 🧘`)} className="btn btn-primary" style={{ width: '100%', height: 36, fontSize: 12, marginTop: 6, gap: 6 }}><Wind size={12} />Start</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
                {tab === 'journal' && (
                    <motion.div key="journal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={16} color="var(--color-primary-light)" />Today's Journal</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Write freely — AI will respond with warmth and CBT insights</div>
                                <textarea className="input" rows={14} placeholder="How are you feeling today? What's on your mind..." value={journal} onChange={e => setJournal(e.target.value)} style={{ resize: 'none', fontSize: 13, lineHeight: 1.7 }} />
                                <button onClick={analyzeJournal} disabled={analyzing} className="btn btn-primary" style={{ width: '100%', height: 44, marginTop: 12, gap: 8, fontSize: 14 }}>
                                    {analyzing ? <><Brain size={14} style={{ animation: 'spin 1s linear infinite' }} />Analyzing...</> : <><Brain size={14} />Analyze with AI</>}
                                </button>
                                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                            </div>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={16} color="#8b5cf6" />AI Insight</div>
                                {aiInsight
                                    ? <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{aiInsight}</div>
                                    : <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}><BookOpen size={40} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} /><div style={{ fontSize: 14, fontWeight: 600 }}>Write a journal entry</div><div style={{ fontSize: 12, marginTop: 6 }}>AI will analyze your emotions and provide compassionate CBT-based insights</div></div>
                                }
                            </div>
                        </div>
                    </motion.div>
                )}
                {tab === 'burnout' && (
                    <motion.div key="burnout" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>
                            <div className="card" style={{ padding: 24 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>🔋 Burnout Assessment</div>
                                {[{ k: 'exhaustion', l: `Emotional exhaustion: ${burnout.exhaustion}/10` }, { k: 'cynicism', l: `Cynicism/Detachment: ${burnout.cynicism}/10` }, { k: 'efficacy', l: `Sense of efficacy: ${burnout.efficacy}/10 (higher = better)` }, { k: 'overwork', l: `Feeling overworked: ${burnout.overwork}/10` }, { k: 'sleep', l: `Sleep quality: ${burnout.sleep}/10 (higher = better)` }, { k: 'social', l: `Social withdrawal: ${burnout.social}/10` }].map(f => (
                                    <div key={f.k} style={{ marginBottom: 16 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{f.l}</label>
                                        <input type="range" min={1} max={10} value={burnout[f.k as keyof typeof burnout]} onChange={e => sl(f.k, Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="card" style={{ padding: 32, textAlign: 'center', background: `linear-gradient(135deg,${bLevel.c}10,rgba(99,102,241,0.05))`, border: `1px solid ${bLevel.c}30` }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Burnout Risk Score</div>
                                    <div style={{ fontSize: 64, fontWeight: 900, color: bLevel.c, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{burnoutScore}</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: bLevel.c, marginTop: 8 }}>{bLevel.l}</div>
                                    <div style={{ marginTop: 20, height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${burnoutScore}%`, background: 'linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                                    </div>
                                </div>
                                <div className="card" style={{ padding: 20 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🛡️ Recommended Actions</div>
                                    {(burnoutScore < 30 ? ['Keep your current routine', 'Schedule regular breaks', 'Stay socially connected'] : burnoutScore < 60 ? ['Take regular microbreaks', 'Talk to a trusted friend', 'Reduce non-essential commitments', 'Practice 4-7-8 breathing daily'] : ['Speak to a mental health professional', 'Take time off urgently', 'Set strict work-hour limits', 'Practice daily grounding exercises']).map((a, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, fontSize: 12, color: 'var(--text-secondary)' }}><span style={{ color: bLevel.c }}>•</span>{a}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentalHealth;
