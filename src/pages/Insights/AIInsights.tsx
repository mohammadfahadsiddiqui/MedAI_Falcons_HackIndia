import React from 'react';
import { motion } from 'framer-motion';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const radarData = [
    { metric: 'Sleep', score: 82 },
    { metric: 'Exercise', score: 68 },
    { metric: 'Hydration', score: 75 },
    { metric: 'Nutrition', score: 71 },
    { metric: 'Stress', score: 60 },
    { metric: 'Heart', score: 88 },
];

const weeklyBar = [
    { week: 'W1', score: 72 }, { week: 'W2', score: 78 }, { week: 'W3', score: 74 },
    { week: 'W4', score: 85 }, { week: 'W5', score: 81 }, { week: 'W6', score: 87 },
    { week: 'W7', score: 91 },
];

const insights = [
    { title: 'Sleep Quality Improving', desc: 'Your average sleep has increased by 45 minutes over the last 2 weeks.', icon: '😴', color: '#8b5cf6', badge: 'Positive Trend' },
    { title: 'Hydration Below Target', desc: 'You\'re falling short of your daily water goal 3 days per week.', icon: '💧', color: '#ef4444', badge: 'Action Needed' },
    { title: 'Exercise Streak', desc: 'You\'ve exercised 5 days in a row — a new personal record!', icon: '🏃', color: '#22c55e', badge: 'Achievement' },
    { title: 'Blood Pressure Stable', desc: 'Your BP readings remain in the normal range (under 120/80).', icon: '❤️', color: '#06b6d4', badge: 'Stable' },
];

const AIInsights: React.FC = () => (
    <div>
        <div className="section-title">AI Health Insights</div>
        <div className="section-subtitle">Personalized analysis powered by MedAI</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Radar chart */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Health Dimensions</div>
                <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                        <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                    </RadarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Weekly trend */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Weekly Health Score</div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyBar} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[60, 100]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                        <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>

        {/* AI Insights cards */}
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>AI Recommendations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {insights.map((ins, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: 28, flexShrink: 0 }}>{ins.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ins.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ins.desc}</div>
                        </div>
                        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: `${ins.color}20`, color: ins.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {ins.badge}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Badges */}
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🏅 Achievement Badges</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
                { emoji: '🔥', label: '5-Day Streak', color: '#f97316' },
                { emoji: '💧', label: 'Hydration Hero', color: '#06b6d4' },
                { emoji: '😴', label: 'Sleep Champion', color: '#8b5cf6' },
                { emoji: '❤️', label: 'Heart Healthy', color: '#ef4444' },
                { emoji: '🏃', label: 'Active Life', color: '#22c55e' },
            ].map(badge => (
                <motion.div key={badge.label} whileHover={{ scale: 1.05, y: -2 }} className="card" style={{ padding: '14px 18px', textAlign: 'center', minWidth: 100 }}>
                    <div style={{ fontSize: 28 }}>{badge.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, marginTop: 6, color: badge.color }}>{badge.label}</div>
                </motion.div>
            ))}
        </div>
    </div>
);

export default AIInsights;
