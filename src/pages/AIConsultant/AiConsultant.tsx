import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Send, User, Paperclip, Mic, MicOff, Volume2, VolumeX,
    ThumbsUp, ThumbsDown, RotateCcw, Sparkles,
    Brain, AlertTriangle, Heart, Activity, Plus, Clock, Trash2, MessageSquare,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    severity?: 'low' | 'medium' | 'high' | 'emergency';
    timestamp: string; // store as ISO string for JSON serialization
    riskScore?: number;
    liked?: boolean | null;
    isVoice?: boolean;
}

interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    messages: Message[];
    lastRisk?: { score: number; severity: 'low' | 'medium' | 'high' | 'emergency' };
}

type Language = 'English' | 'Hindi' | 'Urdu';

// ── Constants ────────────────────────────────────────────────────────────────
const SEV_COLOR = {
    low: '#22c55e', medium: '#f59e0b', high: '#f97316', emergency: '#ef4444',
} as const;

const SEV_ICON = { low: '🟢', medium: '🟡', high: '🟠', emergency: '🔴' };

const QUICK_CHIPS = [
    '🤕 Headache', '🌡️ Fever', '😮‍💨 Chest Pain', '🤢 Nausea',
    '😴 Fatigue', '😤 Shortness of Breath', '🔪 Stomach Pain', '😰 Dizziness',
];

const LANG_CODE: Record<Language, string> = { English: 'en-IN', Hindi: 'hi-IN', Urdu: 'ur-PK' };
const LANG_FLAGS: Record<Language, string> = { English: '🇺🇸', Hindi: '🇮🇳', Urdu: '🇵🇰' };
const STORAGE_KEY = 'medai_chat_sessions';

// ── Language rules injected into the system prompt ──────────────────────────
const LANG_RULES: Record<Language, string> = {
    English: 'Respond entirely in clear, simple English. Use plain everyday words.',
    Hindi: `हमेशा शुद्ध हिंदी में जवाब दें। रोमन लिपि (Hinglish) का उपयोग बिल्कुल न करें।
उदाहरण के लिए:
  रोगी: मुझे सिर दर्द और बुखार है।
  आप: आपके लक्षणों को देखते हुए यह एक सामान्य वायरल संक्रमण हो सकता है।
  💊 **सुझाई गई दवाएँ (OTC)**
  - पैरासिटामोल 500mg — हर 6 घंटे — बुखार और दर्द के लिए
  🏥 **डॉक्टर के पास कब जाएं**
  - लक्षण 3 दिन से अधिक रहें।`,
    Urdu: `ہمیشہ خالص اردو میں جواب دیں۔ رومن یا انگریزی الفاظ کا استعمال نہ کریں۔
مثال کے طور پر:
  مریض: مجھے سر درد اور بخار ہے۔
  آپ: آپ کی علامات سے لگتا ہے کہ یہ ایک عام وائرل انفیکشن ہو سکتا ہے۔
  💊 **تجویز کردہ ادویات (OTC)**
  - پیراسیٹامول 500mg — ہر 6 گھنٹے — بخار اور درد کے لیے
  🏥 **ڈاکٹر کے پاس کب جائیں**
  - علامات 3 دن سے زیادہ رہیں۔`,
};

// ── System Prompt (Intent-Aware) ─────────────────────────────────────────────
const SYSTEM_PROMPT = (lang: Language) => `You are Dr. MedAI, a senior AI Medical Consultant with 20+ years of virtual clinical experience. You are powered by Gemini and trained on comprehensive medical knowledge.

LANGUAGE RULE (MOST IMPORTANT):
${LANG_RULES[lang]}
You MUST write every word of your reply in ${lang} script. Do not mix languages.

CRITICAL RULES:
- Respond ONLY in ${lang}.
- You have FULL memory of this conversation. Always reference prior messages when relevant.
- Be warm, empathetic, professional, and conversational.
- FIRST, silently classify the user's message into one of these 6 INTENT TYPES, then respond in the appropriate format below:

════════════════════════════════════════
INTENT 1 — SYMPTOM REPORT
Trigger: User describes physical symptoms, pain, discomfort, or illness ("I have a headache", "my stomach hurts", "I feel dizzy").
Response format:
🔍 **Symptom Analysis**
[2-3 sentences referencing current AND prior symptoms from this conversation]

📊 **Risk Assessment: X/10**
[Score explanation — Low 1-3, Moderate 4-6, High 7-8, Emergency 9-10]

💊 **Suggested Medicines (OTC)**
- [Name] — [dose] — [purpose]
- [Name] — [dose] — [purpose]

🏥 **When to See a Doctor**
- [specific trigger condition]
- [recommended timeline]

🥗 **Lifestyle & Home Remedies**
- [2-3 tips]

⚠️ **Red Flags — Go to ER If:**
- [critical warning 1]
- [critical warning 2]

---
*AI guidance only. Always consult a licensed physician.*

════════════════════════════════════════
INTENT 2 — GENERAL HEALTH QUESTION
Trigger: User asks for health information, facts, or explanations ("what is diabetes?", "how does blood pressure work?", "what causes anemia?").
Response format:
Answer clearly and educationally in 3-5 paragraphs. Use bullet points for key facts. Do NOT use the symptom analysis format. End with a brief note to consult a doctor for personal medical decisions.

════════════════════════════════════════
INTENT 3 — MEDICATION / DRUG INQUIRY
Trigger: User asks about a specific medicine ("what is paracetamol used for?", "can I take ibuprofen with blood pressure tablets?", "side effects of metformin?").
Response format:
💊 **About [Medicine Name]**
- **Category:** [drug class]
- **Used for:** [conditions]
- **Standard dose:** [typical dosage]
- **Common side effects:** [list]
- **Important warnings:** [list]
- **Drug interactions to avoid:** [if applicable]

---
*Always consult a pharmacist or doctor before starting/changing medication.*

════════════════════════════════════════
INTENT 4 — FOLLOW-UP / CLARIFICATION
Trigger: User asks a follow-up to a previous answer, asks for more detail, or references previous discussion ("what did you mean by that?", "can you explain more?", "so what should I do first?").
Response format:
Answer conversationally, referencing the specific prior message. Keep it concise. If the follow-up is about symptoms, add a short updated summary.

════════════════════════════════════════
INTENT 5 — EMERGENCY / CRISIS
Trigger: User describes a life-threatening situation (chest pain + shortness of breath, unconsciousness, severe allergic reaction, stroke symptoms, suicidal thoughts).
Response format:
🚨 **EMERGENCY — Act Immediately**
**Call emergency services (102 / 112) RIGHT NOW.**
[2-3 sentences of immediate first-aid while waiting for help]

⚠️ **Do NOT:** [things to avoid]

*This is a medical emergency. Do not delay. Call emergency services immediately.*

════════════════════════════════════════
INTENT 6 — OFF-TOPIC / NON-MEDICAL
Trigger: User asks something unrelated to health ("what is the weather?", "write me a poem", "who won the cricket match?").
Response format:
Politely decline in 1-2 sentences. Remind the user that you are a medical AI and redirect them to ask health-related questions. Offer some example questions they can ask.

════════════════════════════════════════
REMEMBER: Match the intent first, then choose the correct response format. Never use the symptom analysis template for a general health question. Never give a casual answer for an emergency. Be the best AI doctor possible.`;

// ── Storage helpers ──────────────────────────────────────────────────────────
function loadSessions(): ChatSession[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch { /* quota full */ }
}

function makeWelcomeMsg(name?: string): Message {
    return {
        id: '0', role: 'ai',
        timestamp: new Date().toISOString(),
        content: `Hello ${name || 'there'}! 👋\n\nI'm **Dr. MedAI**, your personal AI Medical Consultant.\n\n🩺 I remember our entire conversation — just keep chatting!\n\n✨ I'll automatically **speak my reply** whenever you use the 🎤 mic.\n\nDescribe your symptoms by typing or speaking:`,
    };
}

function makeNewSession(name?: string): ChatSession {
    return {
        id: Date.now().toString(),
        title: 'New Consultation',
        createdAt: new Date().toISOString(),
        messages: [makeWelcomeMsg(name)],
    };
}

// ── Voice Hooks ──────────────────────────────────────────────────────────────
const useSpeechRecognition = (lang: Language, onAutoSend: (text: string) => void) => {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recRef = useRef<SpeechRecognition | null>(null);
    const finalRef = useRef('');
    const onAutoSendRef = useRef(onAutoSend);
    useEffect(() => { onAutoSendRef.current = onAutoSend; }, [onAutoSend]);

    const API = typeof window !== 'undefined'
        ? ((window as unknown as Record<string, unknown>).SpeechRecognition as typeof SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition as typeof SpeechRecognition)
        : null;

    const supported = Boolean(API);

    const start = useCallback(() => {
        if (!API) { toast.error('Voice input not supported in this browser'); return; }
        const rec = new API();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = LANG_CODE[lang];
        finalRef.current = '';
        rec.onresult = (e: SpeechRecognitionEvent) => {
            let interim = '';
            let final = '';
            for (const result of Array.from(e.results) as SpeechRecognitionResult[]) {
                if (result.isFinal) final += result[0].transcript;
                else interim += result[0].transcript;
            }
            finalRef.current = final || interim;
            setTranscript(finalRef.current);
        };
        rec.onend = () => {
            setListening(false);
            // ── AUTO-SEND: fire when recognition ends with a transcript ──
            const text = finalRef.current.trim();
            if (text) {
                setTimeout(() => onAutoSendRef.current(text), 150);
            }
        };
        rec.onerror = (e: Event & { error?: string }) => {
            setListening(false);
            if (e.error !== 'no-speech') toast.error('Voice recognition error: ' + (e.error || 'unknown'));
        };
        recRef.current = rec;
        rec.start();
        setListening(true);
        setTranscript('');
    }, [API, lang]);

    const stop = useCallback(() => { recRef.current?.stop(); }, []);

    return { listening, transcript, supported, start, stop, setTranscript };
};

const useSpeechSynthesis = () => {
    const [speaking, setSpeaking] = useState(false);
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    const speak = useCallback((text: string, lang: Language) => {
        if (!supported) return;
        window.speechSynthesis.cancel();
        const clean = text.replace(/[*#🔍📊💊🏥🥗⚠️🟢🟡🟠🔴]/gu, '').replace(/\n+/g, '. ').slice(0, 800);
        const utt = new SpeechSynthesisUtterance(clean);
        utt.lang = LANG_CODE[lang];
        utt.rate = 0.92;
        utt.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const pref = voices.find(v => v.lang.startsWith(LANG_CODE[lang].split('-')[0]) && v.localService);
        if (pref) utt.voice = pref;
        utt.onstart = () => setSpeaking(true);
        utt.onend = () => setSpeaking(false);
        utt.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utt);
    }, [supported]);

    const cancel = useCallback(() => { window.speechSynthesis?.cancel(); setSpeaking(false); }, []);

    return { speaking, supported, speak, cancel };
};

// ── Format AI content ────────────────────────────────────────────────────────
const FormatContent: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div style={{ fontSize: 13, lineHeight: 1.75 }}>
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
                if (line.match(/^[🔍📊💊🏥🥗⚠️]/u) || (line.startsWith('**') && line.endsWith('**'))) {
                    return <div key={i} style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: i > 0 ? 12 : 0, marginBottom: 3, fontSize: 13 }}>{line.replace(/\*\*/g, '')}</div>;
                }
                if (line.startsWith('---')) return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />;
                if (line.startsWith('- ') || line.startsWith('• ')) {
                    return <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 4, paddingLeft: 6 }}><span style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: 2 }}>▪</span><span style={{ color: 'var(--text-secondary)' }}>{line.slice(2).replace(/\*\*/g, '')}</span></div>;
                }
                if (line.startsWith('*') && line.endsWith('*')) {
                    return <div key={i} style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic', marginTop: 8 }}>{line.replace(/\*/g, '')}</div>;
                }
                return <div key={i} style={{ color: 'var(--text-secondary)' }}>{line.replace(/\*\*/g, '')}</div>;
            })}
        </div>
    );
};

// ── Sidebar panel: session list + history ────────────────────────────────────
const SessionSidebar: React.FC<{
    sessions: ChatSession[];
    activeId: string;
    onSelect: (id: string) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
}> = ({ sessions, activeId, onSelect, onNew, onDelete }) => (
    <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onNew}
            className="btn btn-primary"
            style={{ width: '100%', gap: 8, height: 44 }}
        >
            <Plus size={16} /> New Chat
        </motion.button>

        <div className="card" style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 6px 8px' }}>
                Chat History
            </div>
            {sessions.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 20 }}>
                    No saved chats yet
                </div>
            )}
            {[...sessions].reverse().map(session => (
                <div key={session.id}
                    style={{
                        padding: '10px 10px', borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                        background: session.id === activeId ? 'rgba(99,102,241,0.12)' : 'transparent',
                        border: '1px solid ' + (session.id === activeId ? 'rgba(99,102,241,0.3)' : 'transparent'),
                        display: 'flex', gap: 8, alignItems: 'flex-start', transition: 'all 0.2s',
                    }}
                    onClick={() => onSelect(session.id)}
                >
                    <MessageSquare size={13} style={{ flexShrink: 0, marginTop: 2, color: session.id === activeId ? 'var(--color-primary-light)' : 'var(--text-muted)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: session.id === activeId ? 'var(--color-primary-light)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {session.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={9} />
                            {new Date(session.createdAt).toLocaleDateString()} · {session.messages.filter(m => m.role === 'user').length} msgs
                        </div>
                    </div>
                    {sessions.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); onDelete(session.id); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, opacity: 0, transition: 'opacity 0.2s' }}
                            className="session-delete-btn"
                        >
                            <Trash2 size={11} />
                        </button>
                    )}
                </div>
            ))}
        </div>

        <style>{`.session-delete-btn { opacity: 0 !important; } div:hover > .session-delete-btn { opacity: 1 !important; }`}</style>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AiConsultant: React.FC = () => {
    const { user } = useAppStore();
    const userName = user?.displayName?.split(' ')[0] || 'there';

    // Session state
    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        const saved = loadSessions();
        if (saved.length === 0) return [makeNewSession(userName)];
        return saved;
    });
    const [activeSessionId, setActiveSessionId] = useState<string>(sessions[sessions.length - 1].id);
    const [showSessions, setShowSessions] = useState(true);

    const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
    const messages = activeSession.messages;
    const lastRisk = activeSession.lastRisk;

    const setMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
        setSessions(prev => prev.map(s =>
            s.id === activeSessionId ? { ...s, messages: updater(s.messages) } : s
        ));
    }, [activeSessionId]);

    const setLastRisk = useCallback((risk: { score: number; severity: 'low' | 'medium' | 'high' | 'emergency' }) => {
        setSessions(prev => prev.map(s =>
            s.id === activeSessionId ? { ...s, lastRisk: risk } : s
        ));
    }, [activeSessionId]);

    // Persist sessions to localStorage whenever they change
    useEffect(() => { saveSessions(sessions); }, [sessions]);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<Language>('English');
    const [showRightPanel, setShowRightPanel] = useState(true);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-send callback: fired by the voice hook when speech recognition ends
    const handleAutoSend = useCallback((text: string) => {
        setInput(text);
        // small delay lets React flush the state before sendMessage reads it
        setTimeout(() => sendMessage(text, true), 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, activeSessionId]);

    const { listening, transcript, supported: voiceIn, start: startListen, stop: stopListen, setTranscript } = useSpeechRecognition(language, handleAutoSend);
    const { speaking, supported: voiceOut, speak, cancel: cancelSpeak } = useSpeechSynthesis();

    useEffect(() => { if (listening) setInput(transcript); }, [transcript, listening]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

    // Auto-generate session title from first user message
    const updateSessionTitle = useCallback((sessionId: string, userText: string) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId && s.title === 'New Consultation'
                ? { ...s, title: userText.slice(0, 36) + (userText.length > 36 ? '…' : '') }
                : s
        ));
    }, []);

    const parseRisk = (content: string) => {
        const match = content.match(/Risk Assessment[:\s]*(\d+)\/10/i);
        const score = match ? parseInt(match[1]) : 3;
        const severity: 'low' | 'medium' | 'high' | 'emergency' = score >= 9 ? 'emergency' : score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low';
        return { score, severity };
    };

    const detectSeverity = (text: string): 'low' | 'medium' | 'high' | 'emergency' => {
        const l = text.toLowerCase();
        if (l.includes('chest pain') || l.includes('not breathing') || l.includes('unconscious')) return 'emergency';
        if (l.includes('severe') || l.includes('intense') || l.includes('high fever')) return 'high';
        if (l.includes('fever') || l.includes('moderate') || l.includes('persistent')) return 'medium';
        return 'low';
    };

    const sendMessage = async (overrideText?: string, isVoice = false) => {
        const text = (overrideText ?? input).trim();
        if (!text || loading) return;

        const usedVoice = isVoice || listening;
        if (listening) stopListen();

        const userMsg: Message = {
            id: Date.now().toString(), role: 'user', content: text,
            timestamp: new Date().toISOString(), isVoice: usedVoice,
        };

        setMessages(prev => [...prev, userMsg]);
        updateSessionTitle(activeSessionId, text);
        setInput('');
        setTranscript('');
        setLoading(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            let aiText = '';

            if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
                // Send FULL conversation history (minus welcome) for context
                const history = messages
                    .filter(m => m.id !== '0')
                    .map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.content }] }));

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: [{ text: SYSTEM_PROMPT(language) }] },
                            contents: [...history, { role: 'user', parts: [{ text }] }],
                            generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1200 },
                        }),
                    }
                );
                const data = await res.json();
                aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ No response generated. Please try again.';
            } else {
                await new Promise(r => setTimeout(r, 1600));
                // Smart offline fallback: detect intent locally
                const tl = text.toLowerCase();
                const isEmergency = tl.includes('chest pain') || tl.includes('can\'t breathe') || tl.includes('unconscious') || tl.includes('stroke');
                const isMedication = tl.includes('medicine') || tl.includes('tablet') || tl.includes('drug') || tl.includes('dose') || tl.includes('paracetamol') || tl.includes('ibuprofen') || tl.includes('side effect');
                const isGeneralQuestion = tl.includes('what is') || tl.includes('what are') || tl.includes('how does') || tl.includes('explain') || tl.includes('difference between') || tl.includes('why do');
                const isOffTopic = !isEmergency && !isMedication && !isGeneralQuestion && (tl.includes('weather') || tl.includes('cricket') || tl.includes('poem') || tl.includes('joke') || tl.includes('news'));

                // ── Symptom-specific offline intelligence ──────────────────
                const getSymptomResponse = (t: string): string => {
                    const s = t.toLowerCase();

                    // ── SHORTNESS OF BREATH ───────────────────────────────────
                    if (s.includes('shortness of breath') || s.includes('short of breath') || s.includes('breathing difficulty') || s.includes('breathless') || s.includes('cant breathe') || s.includes("can't breathe") || s.includes('difficulty breathing')) {
                        return `🔍 **Symptom Analysis**
Shortness of breath (dyspnea) can range from mild exertion-related breathlessness to a serious cardiac or pulmonary emergency. The cause must be determined carefully.

📊 **Risk Assessment: 6/10**
Moderate-High — shortness of breath warrants prompt evaluation, especially if sudden or at rest.

💊 **Suggested Medicines (OTC)**
- Loratadine 10mg — Once daily — If allergy/asthma related
- Salbutamol (Ventolin) inhaler — As prescribed — Bronchodilator for asthma/COPD

🏥 **When to See a Doctor**
- Breathlessness persists more than 30 minutes at rest
- Accompanied by cough, wheezing, or chest tightness
- Occurs without exertion

🥗 **Lifestyle & Home Remedies**
- Sit upright — do not lie flat
- Use pursed-lip breathing (inhale slowly, exhale through pursed lips)
- Open a window or use a fan for airflow
- Avoid smoke, dust, and strong perfumes

⚠️ **Red Flags — Call 112 Immediately If:**
- Sudden severe breathlessness with chest pain
- Lips or fingertips turning blue (cyanosis)
- Cannot speak full sentences
- Breathlessness after leg swelling (possible clot)

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── CHEST PAIN (non-emergency phrasing) ──────────────────
                    if (s.includes('chest pain') || s.includes('chest tight') || s.includes('chest pressure') || s.includes('chest discomfort')) {
                        return `🚨 **EMERGENCY ALERT**
Chest pain is a potential cardiac emergency until proven otherwise.

📊 **Risk Assessment: 9/10**
HIGH RISK — Do not ignore chest pain.

**Call 102 / 112 immediately if this is new, severe, or crushing chest pain.**

🏥 **Immediate Steps**
- Sit or lie down in a comfortable position
- Loosen tight clothing
- If prescribed, take Aspirin 325mg (chew, do not swallow whole) while waiting for help
- Do NOT drive yourself to the hospital

⚠️ **Red Flags — Call Emergency NOW If:**
- Pain radiating to left arm, jaw, or back
- Sweating, nausea, or lightheadedness with chest pain
- Pain at rest lasting more than 5 minutes
- Shortness of breath accompanying the pain

---
*This may be a medical emergency. Seek immediate medical attention.*`;
                    }

                    // ── HEADACHE ──────────────────────────────────────────────
                    if (s.includes('headache') || s.includes('head pain') || s.includes('migraine') || s.includes('head ache')) {
                        return `🔍 **Symptom Analysis**
Headaches are among the most common complaints. Most are tension-type or migraine; however, sudden severe headaches require urgent evaluation.

📊 **Risk Assessment: 3/10**
Low-Moderate — most headaches resolve with simple treatment.

💊 **Suggested Medicines (OTC)**
- Paracetamol 500–1000mg — Every 6 hours (max 4g/day) — Pain relief
- Ibuprofen 400mg — Every 8 hours with food — Anti-inflammatory pain relief
- Aspirin 500mg — Every 6 hours — Pain & inflammation (avoid if under 16)

🏥 **When to See a Doctor**
- Headaches occur more than 15 days/month
- Not relieved by OTC medications after 2 days
- Associated with visual changes or nausea/vomiting

🥗 **Lifestyle & Home Remedies**
- Rest in a dark, quiet room
- Apply cold or warm compress to forehead or neck
- Stay hydrated — drink at least 2L water
- Gentle neck/shoulder stretches for tension headache

⚠️ **Red Flags — ER Immediately If:**
- Sudden "thunderclap" headache (worst ever, comes on in seconds)
- Headache with fever, stiff neck, or rash (meningitis risk)
- Headache after head injury
- Headache with confusion, weakness, or vision loss

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── FEVER ─────────────────────────────────────────────────
                    if (s.includes('fever') || s.includes('high temperature') || s.includes('temperature') || s.includes('pyrexia')) {
                        return `🔍 **Symptom Analysis**
Fever (body temperature above 38°C/100.4°F) is a natural immune response, usually caused by viral or bacterial infections.

📊 **Risk Assessment: 4/10**
Moderate — monitor carefully; most fevers resolve within 3–5 days.

💊 **Suggested Medicines (OTC)**
- Paracetamol 500–1000mg — Every 6 hours — Fever & pain reduction
- Ibuprofen 400mg — Every 8 hours with food — Fever & inflammation
- ORS Sachets — After every loose stool/episode — Rehydration

🏥 **When to See a Doctor**
- Fever above 39.5°C (103°F) in adults
- Fever lasts more than 3 days without improvement
- Accompanied by symptoms like rash, difficulty breathing, or stiff neck

🥗 **Lifestyle & Home Remedies**
- Rest and sleep as much as possible
- Drink plenty of fluids — water, clear broths, oral rehydration solution
- Lukewarm sponge bath to bring down temperature
- Avoid over-bundling — wear light clothing

⚠️ **Red Flags — ER Immediately If:**
- Fever above 40°C (104°F)
- Convulsions or seizures
- Severe headache + stiff neck + rash
- Difficulty breathing or confusion

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── NAUSEA / VOMITING ─────────────────────────────────────
                    if (s.includes('nausea') || s.includes('nauseous') || s.includes('vomit') || s.includes('throwing up') || s.includes('sick stomach') || s.includes('feel sick')) {
                        return `🔍 **Symptom Analysis**
Nausea and vomiting are common symptoms with many causes including viral gastroenteritis, food poisoning, motion sickness, or medication side effects.

📊 **Risk Assessment: 3/10**
Low-Moderate — most cases resolve within 24–48 hours with rest and hydration.

💊 **Suggested Medicines (OTC)**
- Domperidone 10mg — 30 min before meals (max 3×/day) — Anti-nausea
- ORS Sachets — Sip slowly throughout the day — Prevent dehydration
- Activated charcoal — As directed — If food poisoning suspected

🏥 **When to See a Doctor**
- Vomiting persists more than 24 hours
- Unable to keep any fluids down for 8+ hours
- Blood in vomit (red or coffee-ground appearance)

🥗 **Lifestyle & Home Remedies**
- Sip clear fluids (water, ginger tea, clear broth) slowly
- BRAT diet — Bananas, Rice, Applesauce, Toast
- Ginger — chew fresh ginger or drink ginger tea
- Rest with head elevated; avoid lying flat immediately after eating

⚠️ **Red Flags — ER Immediately If:**
- Vomiting blood
- Severe abdominal pain with vomiting
- Signs of dehydration — extreme thirst, no urination, sunken eyes, dizziness
- Vomiting after head injury

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── DIZZINESS ─────────────────────────────────────────────
                    if (s.includes('dizzy') || s.includes('dizziness') || s.includes('vertigo') || s.includes('lightheaded') || s.includes('spinning') || s.includes('faint')) {
                        return `🔍 **Symptom Analysis**
Dizziness can be caused by inner ear issues (vertigo), dehydration, low blood pressure, anemia, or more serious neurological conditions.

📊 **Risk Assessment: 4/10**
Moderate — most dizziness is benign but persistent or sudden dizziness needs evaluation.

💊 **Suggested Medicines (OTC)**
- Meclizine (Antivert) 25mg — Every 8 hours — Motion sickness/vertigo
- ORS Sachets — As directed — If dehydration is suspected
- Iron supplements — Once daily with meals — If anemia-related

🏥 **When to See a Doctor**
- Dizziness lasting more than 20 minutes per episode
- Recurrent episodes without known cause
- Associated with hearing loss or ringing in ears

🥗 **Lifestyle & Home Remedies**
- Sit or lie down immediately when feeling dizzy
- Move slowly when changing positions (sit before standing)
- Stay well hydrated — drink 2–3L water daily
- Epley maneuver (for BPPV) — ask your doctor to demonstrate

⚠️ **Red Flags — ER Immediately If:**
- Sudden severe dizziness with headache (stroke risk)
- Dizziness with double vision, slurred speech, or weakness
- Loss of consciousness
- Dizziness after head injury

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── STOMACH / ABDOMINAL PAIN ──────────────────────────────
                    if (s.includes('stomach') || s.includes('abdominal') || s.includes('belly') || s.includes('abdomen') || s.includes('stomach ache') || s.includes('cramp') || s.includes('stomach pain')) {
                        return `🔍 **Symptom Analysis**
Stomach pain can arise from many causes including gastritis, IBS, indigestion, constipation, or more serious conditions like appendicitis.

📊 **Risk Assessment: 4/10**
Moderate — location, severity, and duration of pain are key indicators.

💊 **Suggested Medicines (OTC)**
- Antacid (Gelusil/Pudin Hara) — After meals — Acidity/indigestion
- Mebeverine 135mg — 20 min before meals — IBS cramping
- Omeprazole 20mg — Once daily before breakfast — Gastritis/GERD

🏥 **When to See a Doctor**
- Pain persists more than 24 hours
- Associated with fever or vomiting
- Pain localized to the right lower abdomen (appendix area)

🥗 **Lifestyle & Home Remedies**
- Eat smaller, frequent meals
- Avoid spicy, oily, and acidic foods
- Peppermint tea or warm ginger water
- Apply a warm compress or heating pad to the abdomen

⚠️ **Red Flags — ER Immediately If:**
- Sudden severe "board-like" rigid abdomen
- Pain in right lower quadrant with fever (appendicitis)
- Vomiting blood or black tarry stools
- Pain after abdominal injury

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── FATIGUE / TIREDNESS ───────────────────────────────────
                    if (s.includes('fatigue') || s.includes('tired') || s.includes('exhausted') || s.includes('weakness') || s.includes('weak') || s.includes('lethargy') || s.includes('no energy')) {
                        return `🔍 **Symptom Analysis**
Fatigue is one of the most common complaints and can be caused by poor sleep, anemia, thyroid issues, infection, or other underlying conditions.

📊 **Risk Assessment: 3/10**
Low-Moderate — most fatigue improves with lifestyle changes; persistent fatigue needs investigation.

💊 **Suggested Medicines (OTC)**
- Iron + Folic Acid supplement — Once daily with meals — If anemia suspected
- Vitamin B12 supplement — Once daily — Nerve & energy support
- Vitamin D3 1000IU — Once daily — Deficiency is common and causes fatigue

🏥 **When to See a Doctor**
- Fatigue persists more than 2 weeks without improvement
- Accompanied by significant weight loss
- With joint pains, hair loss, or cold intolerance (thyroid)

🥗 **Lifestyle & Home Remedies**
- Maintain a consistent sleep schedule (7–9 hours/night)
- Moderate exercise — even a 20-minute walk improves energy
- Balanced diet with iron-rich foods (spinach, lentils, meat)
- Limit caffeine and alcohol; stay well hydrated

⚠️ **Red Flags — See Doctor Urgently If:**
- Extreme fatigue with shortness of breath (cardiac/anemia)
- Fatigue with chest pain or palpitations
- Sudden severe fatigue after illness (post-viral syndrome)

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── COUGH ─────────────────────────────────────────────────
                    if (s.includes('cough') || s.includes('coughing') || s.includes('dry cough') || s.includes('wet cough') || s.includes('phlegm') || s.includes('mucus')) {
                        return `🔍 **Symptom Analysis**
Cough is a protective reflex. Most acute coughs are caused by viral upper respiratory infections; persistent coughs need further investigation.

📊 **Risk Assessment: 3/10**
Low-Moderate — acute coughs typically resolve within 2–3 weeks.

💊 **Suggested Medicines (OTC)**
- Dextromethorphan syrup — Every 6–8 hours — Dry cough suppressant
- Ambroxol/Bromhexine syrup — 3× daily — Expectorant for wet cough with phlegm
- Loratadine 10mg — Once daily — If allergy-triggered cough
- Honey + warm water — As needed — Natural soothing remedy

🏥 **When to See a Doctor**
- Cough persists more than 3 weeks (chronic cough)
- Blood in sputum (coughing up blood)
- Accompanied by high fever or chest pain

🥗 **Lifestyle & Home Remedies**
- Steam inhalation — 2× daily for 10 minutes
- Honey and ginger tea — soothes throat inflammation
- Warm salt water gargle — 3× daily
- Sleep with head slightly elevated to reduce post-nasal drip

⚠️ **Red Flags — ER Immediately If:**
- Coughing blood (hemoptysis)
- Severe breathlessness with cough
- Cough with high fever + chest pain (pneumonia risk)
- Wheezing + breathlessness (asthma crisis)

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── SORE THROAT ───────────────────────────────────────────
                    if (s.includes('sore throat') || s.includes('throat pain') || s.includes('throat') || s.includes('tonsil') || s.includes('strep')) {
                        return `🔍 **Symptom Analysis**
Sore throat is most commonly caused by viral infections (80%) or bacterial strep throat (20%). Identifying the cause determines treatment.

📊 **Risk Assessment: 3/10**
Low — most sore throats resolve within 5–7 days.

💊 **Suggested Medicines (OTC)**
- Strepsils / Benzocaine lozenges — Every 2–3 hours — Local throat pain relief
- Paracetamol 500mg — Every 6 hours — Pain and fever
- Chlorhexidine gargle — 3× daily — Antiseptic mouth/throat wash

🏥 **When to See a Doctor**
- Throat pain severe enough to prevent swallowing
- White patches or pus on tonsils (bacterial infection)
- Fever above 38.5°C with throat pain
- Symptoms persist beyond 7 days

🥗 **Lifestyle & Home Remedies**
- Warm salt water gargle — mix ½ tsp salt in 250ml warm water, gargle 4× daily
- Honey and lemon in warm water — soothing and antimicrobial
- Cold ice cream or popsicles — numbs throat temporarily
- Rest voice and avoid irritants like smoke

⚠️ **Red Flags — ER Immediately If:**
- Difficulty breathing due to throat swelling
- Drooling because swallowing is impossible
- Voice sounds muffled ("hot potato voice") — possible abscess

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── BACK PAIN ─────────────────────────────────────────────
                    if (s.includes('back pain') || s.includes('backache') || s.includes('lower back') || s.includes('spine') || s.includes('back ache')) {
                        return `🔍 **Symptom Analysis**
Back pain is extremely common and usually caused by muscle strain, poor posture, or disc issues. Most acute back pain improves within 4–6 weeks.

📊 **Risk Assessment: 3/10**
Low-Moderate — the vast majority resolves with conservative management.

💊 **Suggested Medicines (OTC)**
- Ibuprofen 400mg — Every 8 hours with food — Anti-inflammatory for muscle/disc pain
- Diclofenac gel — Apply 3–4× daily — Topical pain relief
- Muscle relaxant (Cyclobenzaprine) — As prescribed — Muscle spasm relief

🏥 **When to See a Doctor**
- Pain lasting more than 6 weeks
- Radiating down leg (sciatica — nerve involvement)
- Associated with numbness or tingling in legs

🥗 **Lifestyle & Home Remedies**
- Continue gentle activity — prolonged bed rest worsens back pain
- Apply ice pack first 48 hours, then switch to heat
- Gentle stretching — cat-cow, knee-to-chest stretches
- Check your posture and ergonomic setup

⚠️ **Red Flags — See Doctor Urgently If:**
- Back pain with loss of bladder/bowel control (cauda equina emergency)
- Back pain after significant trauma or fall
- Associated with fever and weight loss (infection or cancer risk)
- Severe pain at night that wakes you from sleep

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── ALLERGY ───────────────────────────────────────────────
                    if (s.includes('allergy') || s.includes('allergic') || s.includes('rash') || s.includes('hives') || s.includes('itching') || s.includes('sneezing') || s.includes('runny nose')) {
                        return `🔍 **Symptom Analysis**
Allergic reactions range from mild (sneezing, itchy eyes) to life-threatening (anaphylaxis). Identifying the trigger is key to management.

📊 **Risk Assessment: 3/10**
Low-Moderate — most allergic reactions are manageable; severe reactions are emergencies.

💊 **Suggested Medicines (OTC)**
- Loratadine 10mg — Once daily — Non-drowsy antihistamine
- Cetirizine 10mg — Once daily (evening) — Antihistamine for itching/hives
- Hydrocortisone 1% cream — Apply twice daily — Skin rash/itching

🏥 **When to See a Doctor**
- Allergic symptoms persist despite antihistamines
- Rash spreading rapidly
- Recurring allergic episodes (consider allergy testing)

🥗 **Lifestyle & Home Remedies**
- Avoid identified triggers (pollen, pet dander, dust mites, specific foods)
- Cool water compress for skin itching
- Wear loose, breathable cotton clothing
- Keep a symptom diary to identify triggers

⚠️ **Red Flags — Call 112 Immediately If (Anaphylaxis):**
- Throat swelling or difficulty swallowing
- Sudden widespread hives with breathing difficulty
- Drop in blood pressure, fainting, or rapid weak pulse
- Severe reaction after bee sting, medication, or food

---
*AI guidance only. Always consult a licensed physician.*`;
                    }

                    // ── DEFAULT: generic but improved ────────────────────────
                    const score = 4;
                    return `🔍 **Symptom Analysis**
Thank you for sharing your symptoms. Based on your description, this presentation warrants careful monitoring. For a precise diagnosis and tailored treatment plan, a clinical assessment is essential.

📊 **Risk Assessment: ${score}/10**
Moderate — monitor your symptoms closely and seek medical attention if they worsen or persist.

💊 **General Supportive Care**
- Paracetamol 500mg — Every 6 hours as needed — Pain and fever relief
- Adequate fluid intake — 2–3L of water daily
- Rest as much as needed

🏥 **When to See a Doctor**
- Symptoms persist beyond 72 hours without improvement
- Symptoms worsen significantly within 24 hours
- Any new or severe symptom develops

🥗 **Lifestyle & Home Remedies**
- Rest adequately — allow your body to heal
- Stay well hydrated with water and clear fluids
- Eat light, nutritious meals

⚠️ **Red Flags — ER Immediately If:**
- Chest pain or difficulty breathing
- Loss of consciousness or sudden severe pain
- High fever above 40°C

---
*AI guidance only. Add your Gemini API key in .env for personalized AI responses based on your exact symptoms.*`;
                };

                if (isEmergency) {
                    aiText = `🚨 **EMERGENCY — Act Immediately**
**Call emergency services (102 / 112) RIGHT NOW.**
Keep the person calm and still. Loosen any tight clothing. Do not give food or water. Stay on the line with emergency services.

⚠️ **Do NOT:** Drive yourself to the hospital, take any medication without medical guidance, or leave the person alone.

*This is a medical emergency. Do not delay calling for help.*`;
                } else if (isOffTopic) {
                    aiText = `I'm Dr. MedAI, a medical AI assistant — I can only help with health-related questions! 😊

Here are some things you can ask me:
- "I have a headache and mild fever — what should I do?"
- "What is the correct dosage for paracetamol?"
- "What are the symptoms of diabetes?"
- "Can I take ibuprofen with high blood pressure medication?"

Feel free to describe your symptoms or ask any health question!`;
                } else if (isMedication) {
                    aiText = `💊 **Medication Information**
I'd be happy to help with your medication question. For accurate and personalized medication advice — especially around dosages, interactions, and suitability for your specific condition — please consult a licensed pharmacist or doctor.

**General OTC Safety Tips:**
- Always read the label and follow recommended dosages
- Check for drug interactions if taking multiple medicines
- Don't exceed the maximum daily dose
- If symptoms persist beyond 3 days, see a doctor

---
*For a personalized answer, please add your Gemini API key to enable full AI responses.*`;
                } else if (isGeneralQuestion) {
                    aiText = `Great question! I'm happy to explain.

As a medical AI, I can provide general health education on a wide range of topics including diseases, conditions, body systems, preventive care, and healthy lifestyle.

**To get a comprehensive, personalized answer powered by Gemini AI**, please add your **VITE_GEMINI_API_KEY** to the project's \`.env\` file. Without it, I can only provide general guidance.

**General health tip:** Always rely on peer-reviewed sources and licensed healthcare professionals for medical decisions.

---
*Add your Gemini API key for full AI-powered answers.*`;
                } else {
                    aiText = getSymptomResponse(text);
                }
            }

            const { score, severity } = parseRisk(aiText);
            setLastRisk({ score, severity: severity || detectSeverity(text) });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(), role: 'ai', content: aiText,
                severity: severity || detectSeverity(text),
                riskScore: score, timestamp: new Date().toISOString(), liked: null,
            };

            setMessages(prev => [...prev, aiMsg]);

            // Auto-speak if user sent via voice
            if (usedVoice && voiceOut) {
                setTimeout(() => speak(aiText, language), 300);
            }
        } catch {
            toast.error('Failed to get AI response. Check your API key.');
        } finally {
            setLoading(false);
        }
    };

    // New chat
    const handleNewChat = () => {
        const session = makeNewSession(userName);
        setSessions(prev => [...prev, session]);
        setActiveSessionId(session.id);
        setInput('');
        toast.success('New consultation started!');
    };

    const handleDeleteSession = (id: string) => {
        if (sessions.length <= 1) return;
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
            const remaining = sessions.filter(s => s.id !== id);
            setActiveSessionId(remaining[remaining.length - 1].id);
        }
        toast('Chat deleted', { icon: '🗑️' });
    };

    const toggleLike = (id: string, val: boolean) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: m.liked === val ? null : val } : m));
    };

    const handleVoiceToggle = () => {
        if (listening) { stopListen(); } else { startListen(); }
    };

    const handleSpeakMsg = (msg: Message) => {
        if (speaking) { cancelSpeak(); return; }
        speak(msg.content, language);
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 12, position: 'relative', overflow: 'hidden' }}>
            {/* Ambient orbs */}
            <div className="orb orb-purple" style={{ width: 280, height: 280, top: -60, left: -40, pointerEvents: 'none' }} />
            <div className="orb orb-cyan" style={{ width: 180, height: 180, bottom: 60, right: 280, pointerEvents: 'none', animationDelay: '3s' }} />

            {/* ── Session Sidebar ── */}
            <AnimatePresence initial={false}>
                {showSessions && (
                    <motion.div initial={{ opacity: 0, x: -20, width: 0 }} animate={{ opacity: 1, x: 0, width: 240 }} exit={{ opacity: 0, x: -20, width: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} style={{ flexShrink: 0, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                        <SessionSidebar
                            sessions={sessions}
                            activeId={activeSessionId}
                            onSelect={id => { setActiveSessionId(id); setInput(''); }}
                            onNew={handleNewChat}
                            onDelete={handleDeleteSession}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main Chat ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div className="card-premium">
                    <div style={{ background: 'var(--bg-card)', borderRadius: 'calc(var(--radius-lg) - 2px)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* History toggle */}
                            <button onClick={() => setShowSessions(p => !p)} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11, gap: 5 }}>
                                <Clock size={13} /> {showSessions ? 'Hide' : 'History'}
                            </button>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,0.5)' }}>
                                    <Bot size={19} color="white" />
                                </div>
                                <span style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, background: '#22c55e', borderRadius: '50%', border: '2px solid var(--bg-card)', animation: 'glow-pulse 2s infinite' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display)' }}>Dr. MedAI</div>
                                <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Sparkles size={10} /> Gemini 2.5 Flash · Full context memory
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Language */}
                            <div style={{ display: 'flex', gap: 3, background: 'var(--bg-input)', padding: '3px 5px', borderRadius: 10 }}>
                                {(['English', 'Hindi', 'Urdu'] as Language[]).map(l => (
                                    <button key={l} onClick={() => setLanguage(l)} style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: language === l ? 700 : 400, background: language === l ? 'var(--color-primary)' : 'transparent', color: language === l ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', gap: 4, display: 'flex', alignItems: 'center' }}>
                                        {LANG_FLAGS[l]} {l}
                                    </button>
                                ))}
                            </div>
                            {/* New Chat button */}
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleNewChat} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12, gap: 6 }}>
                                <Plus size={13} /> New Chat
                            </motion.button>
                            <button onClick={() => setShowRightPanel(p => !p)} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11, gap: 5 }}>
                                <Brain size={13} /> {showRightPanel ? 'Hide' : 'Panel'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.map((msg, idx) => (
                        <div key={msg.id} className={msg.role === 'user' ? 'animate-msg-right' : 'animate-msg-left'} style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

                            {msg.role === 'ai' && (
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4, boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}>
                                    <Bot size={16} color="white" />
                                </div>
                            )}

                            <div style={{ maxWidth: '78%' }}>
                                {msg.severity && msg.role === 'ai' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                                        <div style={{ flex: 1, height: 2, background: SEV_COLOR[msg.severity], borderRadius: 2, opacity: 0.5 }} />
                                        <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 20, background: SEV_COLOR[msg.severity] + '20', color: SEV_COLOR[msg.severity], fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {SEV_ICON[msg.severity]} {msg.severity}{msg.riskScore != null && ` · ${msg.riskScore}/10`}
                                        </span>
                                    </div>
                                )}

                                <div className={msg.role === 'ai' ? 'chat-ai-bubble' : 'chat-user-bubble'} style={{ padding: '13px 17px' }}>
                                    {msg.isVoice && msg.role === 'user' && (
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Mic size={9} /> Voice message
                                        </div>
                                    )}
                                    {msg.role === 'ai'
                                        ? <FormatContent content={msg.content} />
                                        : <span style={{ fontSize: 14, color: 'white', lineHeight: 1.6 }}>{msg.content}</span>
                                    }
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.role === 'ai' && (
                                        <div style={{ display: 'flex', gap: 3 }}>
                                            {voiceOut && (
                                                <button onClick={() => handleSpeakMsg(msg)} title={speaking ? 'Stop' : 'Listen'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: speaking ? 'var(--color-primary-light)' : 'var(--text-muted)', padding: '2px 4px', borderRadius: 6, transition: 'color 0.2s' }}>
                                                    {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                                </button>
                                            )}
                                            <button onClick={() => toggleLike(msg.id, true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: msg.liked === true ? '#22c55e' : 'var(--text-muted)', padding: '2px 4px', borderRadius: 6 }}>
                                                <ThumbsUp size={11} />
                                            </button>
                                            <button onClick={() => toggleLike(msg.id, false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: msg.liked === false ? '#ef4444' : 'var(--text-muted)', padding: '2px 4px', borderRadius: 6 }}>
                                                <ThumbsDown size={11} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--bg-input),var(--bg-card))', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4, fontWeight: 700, fontSize: 14 }}>
                                    {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}>
                                <Bot size={16} color="white" />
                            </div>
                            <div className="chat-ai-bubble" style={{ padding: '14px 20px', display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>Dr. MedAI is analyzing...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quick Chips */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', paddingInline: 2 }}>
                    {QUICK_CHIPS.map(chip => (
                        <motion.button key={chip} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="chip"
                            onClick={() => { setInput(chip.replace(/[^\w\s]/gu, '').trim()); inputRef.current?.focus(); }}>
                            {chip}
                        </motion.button>
                    ))}
                </div>

                {/* Input area */}
                <div className="card" style={{ padding: '12px 14px' }}>
                    {listening && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '7px 12px', background: 'rgba(239,68,68,0.07)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.18)' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'glow-pulse 1s infinite', display: 'inline-block' }} />
                            <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Listening in {language}... speak clearly · AI will auto-reply with voice 🔊</span>
                        </motion.div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <button className="btn btn-ghost" style={{ width: 40, height: 40, padding: 0, borderRadius: 10, flexShrink: 0 }}
                            onClick={() => toast('Attach reports — configure Firebase Storage', { icon: '📎' })}>
                            <Paperclip size={15} />
                        </button>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder={listening ? '🎤 Listening...' : `Ask anything — symptoms, medications, health questions... (${language})`}
                            className="input"
                            rows={2}
                            style={{ resize: 'none', flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6 }}
                        />
                        {voiceIn && (
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleVoiceToggle}
                                className={'btn voice-btn' + (listening ? ' recording' : '')}
                                style={{ width: 44, height: 44, padding: 0, borderRadius: 12, flexShrink: 0, background: listening ? 'rgba(239,68,68,0.12)' : 'var(--bg-input)', border: '1px solid ' + (listening ? 'rgba(239,68,68,0.35)' : 'var(--border)'), color: listening ? '#ef4444' : 'var(--text-secondary)' }}
                                title={listening ? 'Stop' : 'Voice input (AI will auto-speak reply)'}
                            >
                                {listening ? <MicOff size={16} /> : <Mic size={16} />}
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className="btn btn-primary"
                            style={{ width: 44, height: 44, padding: 0, borderRadius: 12, flexShrink: 0, opacity: !input.trim() || loading ? 0.5 : 1 }}
                        >
                            <Send size={16} />
                        </motion.button>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 7, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 14 }}>
                        <span>🔒 Encrypted</span>
                        <span>🧠 Full chat memory</span>
                        <span>💾 Auto-saved</span>
                        <span>🎤 Voice → auto-speaks reply</span>
                    </div>
                </div>
            </div>

            {/* ── Right Panel ── */}
            <AnimatePresence>
                {showRightPanel && (
                    <motion.div initial={{ opacity: 0, x: 20, width: 0 }} animate={{ opacity: 1, x: 0, width: 256 }} exit={{ opacity: 0, x: 20, width: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

                        {/* Health Summary */}
                        <div className="card-premium" style={{ flexShrink: 0 }}>
                            <div style={{ background: 'var(--bg-card)', borderRadius: 'calc(var(--radius-lg) - 2px)', padding: 18 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <Activity size={14} color="var(--color-primary-light)" /> Health Summary
                                </div>
                                {lastRisk ? (
                                    <>
                                        <div style={{ textAlign: 'center', marginBottom: 14 }}>
                                            <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'var(--font-display)', color: SEV_COLOR[lastRisk.severity], lineHeight: 1 }}>{lastRisk.score}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Risk Score / 10</div>
                                            <div style={{ marginTop: 8, height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: (lastRisk.score / 10 * 100) + '%' }} transition={{ duration: 0.8 }} style={{ height: '100%', background: SEV_COLOR[lastRisk.severity], borderRadius: 3 }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                                            {[
                                                { label: 'Severity', value: lastRisk.severity.toUpperCase(), color: SEV_COLOR[lastRisk.severity] },
                                                { label: 'Messages', value: String(messages.filter(m => m.role === 'user').length), color: 'var(--color-primary-light)' },
                                            ].map(s => (
                                                <div key={s.label} style={{ background: 'var(--bg-input)', borderRadius: 9, padding: '9px 10px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '16px 0' }}>
                                        <Heart size={28} style={{ opacity: 0.2, marginBottom: 8 }} />
                                        <div>Send a message to see your health summary</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Severity Guide */}
                        <div className="card" style={{ padding: 16, flexShrink: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <AlertTriangle size={13} color="var(--color-accent)" /> Severity Guide
                            </div>
                            {([
                                { level: 'low' as const, label: 'Low (1–3)', desc: 'Self-care sufficient' },
                                { level: 'medium' as const, label: 'Medium (4–6)', desc: 'Monitor, see doctor if worsening' },
                                { level: 'high' as const, label: 'High (7–8)', desc: 'Doctor within 24 hrs' },
                                { level: 'emergency' as const, label: 'Emergency (9–10)', desc: 'Go to ER immediately!' },
                            ]).map(item => (
                                <div key={item.level} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: SEV_COLOR[item.level], flexShrink: 0, marginTop: 3 }} />
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: SEV_COLOR[item.level] }}>{item.label}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Voice tip */}
                        {voiceIn && (
                            <div className="card" style={{ padding: 14, flexShrink: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Mic size={13} color="var(--color-primary-light)" /> Voice Chat Tips
                                </div>
                                {['1. Select language above', '2. Click 🎤 and speak symptoms', '3. AI automatically speaks reply', '4. Click 🔊 on any message to re-listen', '5. All chats auto-saved to history'].map((t, i) => (
                                    <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, lineHeight: 1.5 }}>{t}</div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AiConsultant;
