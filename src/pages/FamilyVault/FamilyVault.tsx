import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Brain, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface FamilyMember {
    id: string; name: string; relation: string; age: number; gender: 'male' | 'female' | 'other';
    bloodGroup: string; conditions: string; medications: string; allergies: string;
    lastCheckup: string; emergencyContact: string;
}

const RELATIONS = ['Self', 'Spouse/Partner', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const RISK_PATTERNS = [
    { condition: 'Diabetes', genes: 'Both parents diabetic', risk: 'Very High — 70% lifetime risk', color: '#f59e0b', icon: '🍬' },
    { condition: 'Hypertension', genes: 'Father hypertensive', risk: 'High — 40% risk before 50', color: '#ef4444', icon: '❤️' },
    { condition: 'Heart Disease', genes: 'Family history present', risk: 'Moderate — recommend annual cardiac screening', color: '#f97316', icon: '💔' },
];

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#f97316'];

const blank = (): Omit<FamilyMember, 'id'> => ({
    name: '', relation: 'Spouse/Partner', age: 30, gender: 'female',
    bloodGroup: 'Unknown', conditions: '', medications: '', allergies: '', lastCheckup: '', emergencyContact: '',
});

const FamilyVault: React.FC = () => {
    const [members, setMembers] = useState<FamilyMember[]>([
        { id: '1', name: 'Amina Hassan', relation: 'Self', age: 34, gender: 'female', bloodGroup: 'B+', conditions: 'Hypothyroidism', medications: 'Levothyroxine 50mcg', allergies: 'Penicillin', lastCheckup: '2026-01-15', emergencyContact: '+92 300 1234567' },
        { id: '2', name: 'Tariq Hassan', relation: 'Spouse/Partner', age: 38, gender: 'male', bloodGroup: 'O+', conditions: 'Type 2 Diabetes, Hypertension', medications: 'Metformin 500mg, Amlodipine 5mg', allergies: 'None', lastCheckup: '2025-12-10', emergencyContact: '+92 300 1234567' },
        { id: '3', name: 'Zainab Hassan', relation: 'Daughter', age: 8, gender: 'female', bloodGroup: 'B+', conditions: 'Mild Asthma', medications: 'Salbutamol inhaler (PRN)', allergies: 'Dust mites, pollen', lastCheckup: '2026-02-01', emergencyContact: '+92 300 1234567' },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Omit<FamilyMember, 'id'>>(blank());
    const [selected, setSelected] = useState<string | null>('1');
    const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

    const save = () => {
        if (!form.name) { toast.error('Enter member name'); return; }
        setMembers(p => [...p, { ...form, id: Date.now().toString() }]);
        setForm(blank()); setShowForm(false);
        toast.success(`${form.name} added to Family Vault! 👨‍👩‍👧`);
    };

    const remove = (id: string) => { setMembers(p => p.filter(m => m.id !== id)); if (selected === id) setSelected(null); toast('Member removed', { icon: '🗑️' }); };

    const selectedMember = members.find(m => m.id === selected);
    const inp = { className: 'input' as const, style: { fontSize: 13, marginBottom: 0 } };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#22c55e,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={22} color="white" /></div>
                <div><div className="section-title" style={{ marginBottom: 0 }}>Family Health Vault 👨‍👩‍👧</div><div className="section-subtitle" style={{ marginBottom: 0 }}>Manage all family members' health records in one secure place</div></div>
            </div>

            <div className="grid-4" style={{ margin: '20px 0' }}>
                {[{ l: 'Family Members', v: members.length, i: '👥', c: '#6366f1' }, { l: 'With Conditions', v: members.filter(m => m.conditions).length, i: '🏥', c: '#f59e0b' }, { l: 'Allergies Recorded', v: members.filter(m => m.allergies && m.allergies !== 'None').length, i: '⚠️', c: '#ef4444' }, { l: 'Checkups Due', v: members.filter(m => { const d = new Date(m.lastCheckup); return d < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000); }).length, i: '📅', c: '#22c55e' }].map((s, i) => (
                    <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }} className="card" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: s.c, fontFamily: 'var(--font-display)' }}>{s.v}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.l}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                {/* Member list */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Members</div>
                        <button onClick={() => setShowForm(p => !p)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12, gap: 5 }}><Plus size={12} />Add</button>
                    </div>
                    <AnimatePresence>
                        {showForm && (
                            <motion.div key="form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card" style={{ padding: 16, marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Add Family Member</div>
                                {[{ l: 'Full Name', k: 'name', ph: 'Enter name' }, { l: 'Conditions', k: 'conditions', ph: 'e.g. Diabetes, Asthma' }, { l: 'Medications', k: 'medications', ph: 'Current meds' }, { l: 'Allergies', k: 'allergies', ph: 'Known allergies' }, { l: 'Emergency Contact', k: 'emergencyContact', ph: '+92 300 ...' }].map(f => (
                                    <div key={f.k} style={{ marginBottom: 10 }}>
                                        <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3, fontWeight: 600 }}>{f.l}</label>
                                        <input {...inp} placeholder={f.ph} value={form[f.k as keyof typeof form] as string} onChange={e => set(f.k, e.target.value)} />
                                    </div>
                                ))}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                    <div>
                                        <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3, fontWeight: 600 }}>Relation</label>
                                        <select {...inp} value={form.relation} onChange={e => set('relation', e.target.value)}>{RELATIONS.map(r => <option key={r}>{r}</option>)}</select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3, fontWeight: 600 }}>Blood Group</label>
                                        <select {...inp} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>{BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}</select>
                                    </div>
                                </div>
                                <input type="number" {...inp} placeholder="Age" value={form.age} onChange={e => set('age', Number(e.target.value))} style={{ ...inp.style, width: '100%', marginBottom: 10 }} />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={save} className="btn btn-primary" style={{ flex: 1, height: 36, fontSize: 12 }}>Save</button>
                                    <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ height: 36, fontSize: 12 }}>Cancel</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {members.map((m, i) => (
                            <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .06 }}
                                onClick={() => setSelected(m.id)} className="card"
                                style={{ padding: '12px 14px', cursor: 'pointer', border: '1px solid ' + (selected === m.id ? 'rgba(99,102,241,0.4)' : 'var(--border)'), transition: 'border-color 0.2s', display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>{m.name[0]}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{m.relation} · {m.age}y · {m.bloodGroup}</div>
                                </div>
                                <button onClick={e => { e.stopPropagation(); remove(m.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><Trash2 size={13} /></button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Member Detail */}
                <div>
                    {selectedMember ? (
                        <motion.div key={selectedMember.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="card" style={{ padding: 24, marginBottom: 16, background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(34,197,94,0.05))' }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white' }}>{selectedMember.name[0]}</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 18 }}>{selectedMember.name}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{selectedMember.relation} · {selectedMember.age} years · {selectedMember.gender} · {selectedMember.bloodGroup}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                                    {[{ l: 'Conditions', v: selectedMember.conditions || 'None', i: '🏥' }, { l: 'Medications', v: selectedMember.medications || 'None', i: '💊' }, { l: 'Allergies', v: selectedMember.allergies || 'None', i: '⚠️' }, { l: 'Last Checkup', v: selectedMember.lastCheckup || 'Not recorded', i: '📅' }, { l: 'Emergency Contact', v: selectedMember.emergencyContact || 'Not set', i: '📞' }, { l: 'Blood Group', v: selectedMember.bloodGroup, i: '🩸' }].map(f => (
                                        <div key={f.l} style={{ background: 'var(--bg-input)', borderRadius: 10, padding: '12px 14px' }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{f.i} {f.l}</div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{f.v}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Family disease patterns */}
                            <div className="card" style={{ padding: 20 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={15} color="var(--color-primary-light)" />AI Family Disease Pattern Analysis</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Based on conditions across your {members.length} family members:</div>
                                {RISK_PATTERNS.map(p => (
                                    <div key={p.condition} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 10, marginBottom: 10 }}>
                                        <span style={{ fontSize: 28 }}>{p.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{p.condition}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.genes}</div>
                                        </div>
                                        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: p.color + '18', color: p.color, fontWeight: 700, textAlign: 'right', maxWidth: 180 }}>{p.risk}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: 10, padding: '12px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                                    <Shield size={14} color="var(--color-primary-light)" style={{ flexShrink: 0, marginTop: 1 }} />
                                    Recommendation: Annual blood glucose + lipids + BP check for all adults in this family
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 56, marginBottom: 16 }}>👨‍👩‍👧</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Select a family member</div>
                            <div style={{ fontSize: 13 }}>Click on a member to view their complete health record</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FamilyVault;
