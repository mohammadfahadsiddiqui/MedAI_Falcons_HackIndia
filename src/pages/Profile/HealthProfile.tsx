import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Phone, Edit3, Save, CheckCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../store/useAppStore';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HealthProfile: React.FC = () => {
    const { user } = useAppStore();
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.displayName || 'John Doe',
        age: '28',
        gender: 'Male',
        blood_group: 'O+',
        height: '175',
        weight: '72',
        phone: '',
        address: '',
        conditions: 'None',
        allergies: 'Penicillin',
        medications: 'None',
        family_history: 'Hypertension (Father)',
        emergency_name: 'Jane Doe',
        emergency_phone: '+1-555-0100',
        emergency_relation: 'Spouse',
    });

    const completion = Object.values(profile).filter(v => v && v !== 'None').length / Object.values(profile).length * 100;

    const save = () => {
        setEditing(false);
        toast.success('Profile saved! ✅');
    };

    const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode; color: string }> = ({ icon: Icon, title, children, color }) => (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={color} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
            </div>
            {children}
        </motion.div>
    );

    const Field: React.FC<{ label: string; field: keyof typeof profile; type?: string }> = ({ label, field, type = 'text' }) => (
        <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>{label}</label>
            {editing ? (
                <input
                    type={type}
                    value={profile[field]}
                    onChange={e => setProfile({ ...profile, [field]: e.target.value })}
                    className="input"
                />
            ) : (
                <div style={{ fontSize: 14, color: profile[field] ? 'var(--text-primary)' : 'var(--text-muted)', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    {profile[field] || '—'}
                </div>
            )}
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="section-title">Health Profile</div>
                    <div className="section-subtitle">Your complete medical information</div>
                </div>
                {editing ? (
                    <motion.button whileHover={{ scale: 1.02 }} onClick={save} className="btn btn-primary">
                        <Save size={15} /> Save Profile
                    </motion.button>
                ) : (
                    <motion.button whileHover={{ scale: 1.02 }} onClick={() => setEditing(true)} className="btn btn-ghost">
                        <Edit3 size={15} /> Edit Profile
                    </motion.button>
                )}
            </div>

            {/* Completion bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={16} color={completion > 80 ? '#22c55e' : '#f59e0b'} /> Profile Completion
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: completion > 80 ? '#22c55e' : '#f59e0b' }}>{Math.round(completion)}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 999 }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 999, background: completion > 80 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #f59e0b, #d97706)' }}
                    />
                </div>
            </motion.div>

            <div className="grid-2">
                {/* Personal Info */}
                <Section icon={User} title="Personal Information" color="#6366f1">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Field label="Full Name" field="name" />
                        <div className="grid-2">
                            <Field label="Age" field="age" type="number" />
                            <Field label="Gender" field="gender" />
                        </div>
                        <div className="grid-2">
                            <Field label="Height (cm)" field="height" type="number" />
                            <Field label="Weight (kg)" field="weight" type="number" />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Blood Group</label>
                            {editing ? (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {bloodGroups.map(bg => (
                                        <button key={bg} onClick={() => setProfile({ ...profile, blood_group: bg })}
                                            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: profile.blood_group === bg ? 'var(--color-danger)' : 'var(--bg-input)', color: profile.blood_group === bg ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                                            {bg}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 700, fontSize: 15 }}>
                                    {profile.blood_group}
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                {/* Medical Info */}
                <Section icon={Activity} title="Medical Information" color="#06b6d4">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Field label="Medical Conditions" field="conditions" />
                        <Field label="Allergies" field="allergies" />
                        <Field label="Current Medications" field="medications" />
                        <Field label="Family Medical History" field="family_history" />
                    </div>
                </Section>

                {/* Emergency Contact */}
                <Section icon={Phone} title="Emergency Contact" color="#ef4444">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Field label="Contact Name" field="emergency_name" />
                        <Field label="Phone Number" field="emergency_phone" type="tel" />
                        <Field label="Relationship" field="emergency_relation" />
                    </div>
                </Section>

                {/* Quick stats */}
                <Section icon={Heart} title="Health Summary" color="#ec4899">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Blood Group', value: profile.blood_group, color: '#ef4444' },
                            { label: 'Height', value: `${profile.height} cm` },
                            { label: 'Weight', value: `${profile.weight} kg` },
                            { label: 'BMI', value: profile.height && profile.weight ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1) : '—' },
                            { label: 'Known Allergies', value: profile.allergies },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: item.color || 'var(--text-primary)' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default HealthProfile;
