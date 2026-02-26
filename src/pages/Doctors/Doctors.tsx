import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Search } from 'lucide-react';

const specializations = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Psychiatrist', 'General'];

const doctors = [
    { id: 1, name: 'Dr. Priya Sharma', spec: 'Cardiologist', rating: 4.9, reviews: 312, exp: '15 yrs', available: true, fee: '$80', avatar: '👩‍⚕️' },
    { id: 2, name: 'Dr. Ahmed Khan', spec: 'Neurologist', rating: 4.8, reviews: 248, exp: '12 yrs', available: true, fee: '$90', avatar: '👨‍⚕️' },
    { id: 3, name: 'Dr. Maria Chen', spec: 'Dermatologist', rating: 4.7, reviews: 189, exp: '8 yrs', available: false, fee: '$70', avatar: '👩‍⚕️' },
    { id: 4, name: 'Dr. James Wilson', spec: 'Orthopedic', rating: 4.9, reviews: 421, exp: '20 yrs', available: true, fee: '$100', avatar: '👨‍⚕️' },
    { id: 5, name: 'Dr. Aisha Patel', spec: 'Psychiatrist', rating: 4.8, reviews: 156, exp: '10 yrs', available: true, fee: '$85', avatar: '👩‍⚕️' },
    { id: 6, name: 'Dr. Carlos Ruiz', spec: 'General', rating: 4.6, reviews: 387, exp: '18 yrs', available: false, fee: '$60', avatar: '👨‍⚕️' },
];

const Doctors: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = doctors.filter(d =>
        (filter === 'All' || d.spec === filter) &&
        (d.name.toLowerCase().includes(search.toLowerCase()) || d.spec.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <div className="section-title">Doctor Directory</div>
            <div className="section-subtitle">Find and book top specialists</div>

            {/* Search + filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..." className="input" style={{ paddingLeft: 36 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {specializations.map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: filter === s ? 600 : 400, background: filter === s ? 'var(--color-primary)' : 'var(--bg-input)', color: filter === s ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>{s}</button>
                    ))}
                </div>
            </div>

            <div className="grid-2">
                {filtered.map((doc, i) => (
                    <motion.div key={doc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card gradient-border" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                                {doc.avatar}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{doc.name}</div>
                                <div style={{ fontSize: 13, color: 'var(--color-primary-light)', marginTop: 2 }}>{doc.spec}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>
                                        <Star size={12} fill="#f59e0b" /> {doc.rating} ({doc.reviews})
                                    </div>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.exp} exp</span>
                                    <span style={{ fontSize: 12, color: doc.available ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                        {doc.available ? '● Available' : '● Busy'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-primary-light)' }}>{doc.fee}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per visit</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                            <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, padding: '8px 12px' }} disabled={!doc.available}>Video Call</button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn btn-primary" style={{ flex: 2, fontSize: 12, padding: '8px 12px' }} disabled={!doc.available}>
                                <Calendar size={13} /> Book Appointment
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Doctors;
