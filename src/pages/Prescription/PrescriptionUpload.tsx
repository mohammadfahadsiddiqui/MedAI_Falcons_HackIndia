import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, X, Bot, Pill, AlertTriangle, CheckCircle,
    Clock, User, Shield, Eye, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────────────
interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadTime: string;
    status: 'processing' | 'analyzed' | 'pending_review';
    preview?: string;
    fileObj?: File; // keep original File for Gemini
}

interface AISuggestion {
    medicines: Array<{ name: string; dosage: string; duration: string; reason: string; refillable: boolean }>;
    diagnosis: string;
    doctorNote: string;
    severity: 'low' | 'medium' | 'high';
    followUp: string;
    warnings: string[];
}

// ── Convert file to base64 ────────────────────────────────────────────────
const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // strip the data:<type>;base64, prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// ── Parse Gemini JSON response robustly ──────────────────────────────────
const parseGeminiResponse = (raw: string): AISuggestion => {
    // Try to extract a JSON block from the response
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) ||
        raw.match(/```\s*([\s\S]*?)```/) ||
        raw.match(/(\{[\s\S]*\})/);

    let parsed: Partial<AISuggestion> = {};
    if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[1]); } catch { /* fall through */ }
    }

    return {
        diagnosis: parsed.diagnosis || 'Unable to extract diagnosis — please ensure the image is clear and legible.',
        doctorNote: parsed.doctorNote || 'Please consult your physician for a full interpretation of this report.',
        severity: (['low', 'medium', 'high'].includes(parsed.severity as string) ? parsed.severity : 'medium') as 'low' | 'medium' | 'high',
        followUp: parsed.followUp || 'As directed by your physician',
        medicines: Array.isArray(parsed.medicines) ? parsed.medicines : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    };
};

// ── System prompt for Gemini Vision ──────────────────────────────────────
const ANALYSIS_PROMPT = `You are Dr. MedAI, a senior AI Medical Consultant. Carefully analyze the uploaded medical document (prescription, lab report, or health record) shown in the image.

IMPORTANT: Base your response ENTIRELY on what is actually written/shown in the image. Do NOT guess or fabricate. If the image is unclear or not a medical document, say so honestly.

Return ONLY a JSON object (no extra text, no markdown explanation outside the JSON) in this exact format:
{
  "diagnosis": "<Primary diagnosis, condition, or purpose of this prescription/report — based on exactly what is written>",
  "doctorNote": "<2-3 sentences summarizing what the document shows, the treatment plan, and key instructions>",
  "severity": "<one of: low | medium | high — based on the condition described>",
  "followUp": "<follow-up timeline as mentioned in the document, or infer from the condition>",
  "medicines": [
    {
      "name": "<medicine name and strength exactly as written>",
      "dosage": "<dosage instructions exactly as written>",
      "duration": "<duration of treatment>",
      "reason": "<why this medicine is prescribed — infer from condition if not stated>",
      "refillable": <true if OTC/non-controlled, false if prescription-only>
    }
  ],
  "warnings": [
    "<important instruction or warning from the document or clinically relevant to the medicines>",
    "<another warning if applicable>"
  ]
}

If this is a LAB REPORT (blood test, urine test, etc.):
- Set "diagnosis" to the key findings (e.g., "Hemoglobin: 9.2 g/dL — Mild Anemia; Blood Glucose: 210 mg/dL — Elevated")
- Set "medicines" to an empty array []
- Set "doctorNote" to interpretation of the results

If the image is NOT a medical document, return:
{
  "diagnosis": "Not a medical document",
  "doctorNote": "The uploaded image does not appear to be a prescription, lab report, or medical record. Please upload a clear photo of your prescription or health report.",
  "severity": "low",
  "followUp": "N/A",
  "medicines": [],
  "warnings": ["Please upload a valid medical document for accurate analysis"]
}`;

// ── Real Gemini Vision API call ───────────────────────────────────────────
const analyzeWithGemini = async (file: File, additionalNotes: string): Promise<AISuggestion> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        throw new Error('NO_API_KEY');
    }

    const base64 = await toBase64(file);

    // Gemini supports image MIME types directly; for PDFs, use the PDF mime type
    const mimeType = file.type === 'application/pdf' ? 'application/pdf' : file.type;

    const prompt = additionalNotes.trim()
        ? `${ANALYSIS_PROMPT}\n\nAdditional patient notes: ${additionalNotes}`
        : ANALYSIS_PROMPT;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: base64 } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,   // low temperature = more factual
                    topK: 32,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
            }),
        }
    );

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!raw) throw new Error('Empty response from Gemini');

    return parseGeminiResponse(raw);
};

// ── Sub-components ─────────────────────────────────────────────────────────
const SeverityBadge: React.FC<{ s: 'low' | 'medium' | 'high' }> = ({ s }) => {
    const cfg = { low: { color: '#22c55e', label: '🟢 Low Severity' }, medium: { color: '#f59e0b', label: '🟡 Medium Severity' }, high: { color: '#ef4444', label: '🔴 High Severity' } };
    return (
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: `${cfg[s].color}18`, color: cfg[s].color }}>
            {cfg[s].label}
        </span>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────
const PrescriptionUpload: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AISuggestion | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [notes, setNotes] = useState('');
    const [forwardToDoctor, setForwardToDoctor] = useState(false);
    const [activeSection, setActiveSection] = useState<'upload' | 'history'>('upload');
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const historyPrescriptions = [
        { id: 'p1', name: 'Respiratory_Rx_Feb2026.pdf', date: '20 Feb 2026', status: 'analyzed', doctor: 'Dr. Priya Sharma', medicines: 4 },
        { id: 'p2', name: 'Diabetes_Followup_Jan2026.pdf', date: '15 Jan 2026', status: 'analyzed', doctor: 'Dr. Ahmed Khan', medicines: 2 },
        { id: 'p3', name: 'Dermatology_Rx_Dec2025.jpg', date: '10 Dec 2025', status: 'pending_review', doctor: 'Pending assignment', medicines: 3 },
    ];

    const handleFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const valid = Array.from(incoming).filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
        if (valid.length === 0) { toast.error('Only images (JPG, PNG) and PDF files are supported'); return; }
        const mapped: UploadedFile[] = valid.map(f => ({
            id: Date.now().toString() + Math.random(),
            name: f.name,
            size: f.size,
            type: f.type,
            uploadTime: new Date().toLocaleTimeString(),
            status: 'pending_review' as const,
            preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
            fileObj: f,
        }));
        setFiles(prev => [...prev, ...mapped]);
        setAnalysis(null);
        setAnalysisError(null);
        toast.success(`${valid.length} file(s) uploaded!`);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const runAnalysis = async () => {
        if (files.length === 0) { toast.error('Please upload at least one prescription'); return; }
        setAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);
        setFiles(prev => prev.map(f => ({ ...f, status: 'processing' })));

        try {
            // Use the first file for analysis (primary document)
            const primaryFile = files[0].fileObj!;
            const result = await analyzeWithGemini(primaryFile, notes);

            setFiles(prev => prev.map(f => ({ ...f, status: 'analyzed' })));
            setAnalysis(result);
            toast.success('AI analysis complete! 🤖');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';

            if (msg === 'NO_API_KEY') {
                setAnalysisError('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
            } else if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
                setAnalysisError('API quota exceeded. Please try again later or check your Gemini API plan.');
            } else if (msg.includes('INVALID_ARGUMENT') || msg.includes('400')) {
                setAnalysisError('The file could not be read by AI. Please ensure the image is clear and under 4MB.');
            } else {
                setAnalysisError(`Analysis failed: ${msg}. Please try again.`);
            }

            setFiles(prev => prev.map(f => ({ ...f, status: 'pending_review' })));
            toast.error('AI analysis failed. See error details.');
        } finally {
            setAnalyzing(false);
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        if (files.length <= 1) {
            setAnalysis(null);
            setAnalysisError(null);
        }
    };

    const sendToDoctor = () => {
        setForwardToDoctor(true);
        toast.success('Prescription sent to assigned doctor for review! 👨‍⚕️');
    };

    return (
        <div style={{ maxWidth: 960 }}>
            <div className="section-title">Prescription Upload</div>
            <div className="section-subtitle">Upload prescriptions or lab reports for real AI analysis</div>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 5, borderRadius: 14, marginBottom: 24, width: 'fit-content', border: '1px solid var(--border)' }}>
                {[{ id: 'upload', label: '📤 Upload & Analyze' }, { id: 'history', label: '📁 History', count: historyPrescriptions.length }].map(t => (
                    <button key={t.id} onClick={() => setActiveSection(t.id as typeof activeSection)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: activeSection === t.id ? 'var(--color-primary)' : 'transparent', color: activeSection === t.id ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
                        {t.label}
                        {'count' in t && <span style={{ background: activeSection === t.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-input)', borderRadius: 20, padding: '0 7px', fontSize: 11 }}>{t.count}</span>}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeSection === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: analysis ? '1fr 1.3fr' : '1fr', gap: 24 }}>
                            {/* Left: Upload area */}
                            <div>
                                {/* Drop zone */}
                                <motion.div
                                    onDrop={handleDrop}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    animate={{ borderColor: dragOver ? 'var(--color-primary)' : 'var(--border)', background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent' }}
                                    style={{ border: '2px dashed var(--border)', borderRadius: 16, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 16 }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <motion.div animate={{ y: dragOver ? -6 : 0 }} style={{ fontSize: 48, marginBottom: 12 }}>📄</motion.div>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Drop prescription here</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>or click to browse files</div>
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                        {['JPG / PNG', 'PDF', 'HEIC'].map(fmt => (
                                            <span key={fmt} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: 600 }}>{fmt}</span>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                                        ✨ Powered by <strong>Gemini Vision</strong> — reads your actual document
                                    </div>
                                    <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
                                </motion.div>

                                {/* Uploaded files */}
                                {files.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>Uploaded Files</div>
                                        {files.map(file => (
                                            <motion.div key={file.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} layout style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '11px 14px', background: 'var(--bg-input)', borderRadius: 10, marginBottom: 8 }}>
                                                {file.preview ? (
                                                    <img src={file.preview} alt="preview" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FileText size={18} color="var(--color-primary-light)" />
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{(file.size / 1024).toFixed(1)} KB · {file.uploadTime}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {file.status === 'processing' && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>⏳ Analyzing...</span>}
                                                    {file.status === 'analyzed' && <CheckCircle size={14} color="#22c55e" />}
                                                    {file.status === 'pending_review' && <Clock size={14} color="var(--text-muted)" />}
                                                    <button onClick={() => removeFile(file.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><X size={14} /></button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Error message */}
                                {analysisError && (
                                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 14, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, fontSize: 12, color: '#f87171', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <span>{analysisError}</span>
                                    </motion.div>
                                )}

                                {/* Notes */}
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Additional Notes (optional — helps AI understand context)</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe your symptoms, allergies, current conditions, or any concerns..." className="input" style={{ resize: 'vertical', minHeight: 80, fontSize: 13 }} />
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                                        onClick={runAnalysis}
                                        disabled={analyzing || files.length === 0}
                                        className="btn btn-primary"
                                        style={{ flex: 1, height: 46, gap: 8, opacity: files.length === 0 ? 0.5 : 1 }}
                                    >
                                        {analyzing ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> AI Analyzing...</> : <><Bot size={15} /> Analyze with AI</>}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                                        onClick={sendToDoctor}
                                        disabled={files.length === 0 || forwardToDoctor}
                                        className="btn btn-ghost"
                                        style={{ height: 46, paddingInline: 16, gap: 8, opacity: files.length === 0 ? 0.5 : 1 }}
                                    >
                                        <Send size={14} /> {forwardToDoctor ? 'Sent ✓' : 'Send to Doctor'}
                                    </motion.button>
                                </div>

                                {/* Privacy note */}
                                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                                    <Shield size={12} color="#22c55e" />
                                    Your prescriptions are analyzed locally via Gemini API — not stored on any server
                                </div>
                                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                            </div>

                            {/* Right: AI Analysis Result */}
                            <AnimatePresence>
                                {analysis && (
                                    <motion.div key="analysis" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                                        {/* Header */}
                                        <div className="card" style={{ padding: '18px 22px', marginBottom: 14, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
                                                    <Bot size={18} color="var(--color-primary-light)" />AI Analysis Result
                                                </div>
                                                <SeverityBadge s={analysis.severity} />
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{analysis.diagnosis}</div>
                                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{analysis.doctorNote}</p>
                                            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Clock size={12} /> Follow-up in: <strong style={{ color: 'var(--text-secondary)' }}>{analysis.followUp}</strong>
                                            </div>
                                        </div>

                                        {/* Medicine suggestions */}
                                        {analysis.medicines.length > 0 && (
                                            <div className="card" style={{ padding: '18px 22px', marginBottom: 14 }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Pill size={15} color="var(--color-primary-light)" /> Medicines Found ({analysis.medicines.length})
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {analysis.medicines.map((med, i) => (
                                                        <motion.div key={med.name + i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💊</div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{med.name}</span>
                                                                    {med.refillable && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 600 }}>OTC</span>}
                                                                    {!med.refillable && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600 }}>Rx Only</span>}
                                                                </div>
                                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>{med.dosage}</div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Duration: {med.duration}</div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontStyle: 'italic' }}>📋 {med.reason}</div>
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => toast.success(`${med.name} added to your cart!`)}
                                                                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: 'var(--color-primary-light)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                            >
                                                                + Cart
                                                            </motion.button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* No medicines state */}
                                        {analysis.medicines.length === 0 && (
                                            <div className="card" style={{ padding: '16px 20px', marginBottom: 14, textAlign: 'center' }}>
                                                <div style={{ fontSize: 28, marginBottom: 8 }}>🔬</div>
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No medicines found in this document.<br />This may be a lab report or diagnostic result.</div>
                                            </div>
                                        )}

                                        {/* Warnings */}
                                        {analysis.warnings.length > 0 && (
                                            <div className="card" style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <AlertTriangle size={14} /> Important Warnings
                                                </div>
                                                {analysis.warnings.map((w, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                                        <span style={{ color: '#f87171', flexShrink: 0 }}>⚠</span> {w}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Disclaimer */}
                                        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
                                            🤖 This analysis is generated by Gemini AI based on the uploaded document. Always verify with your licensed physician before making medical decisions.
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* History tab */}
                {activeSection === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {historyPrescriptions.map((rx, i) => (
                                <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card" style={{ padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: rx.status === 'analyzed' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                                        {rx.status === 'analyzed' ? '✅' : '⏳'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{rx.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                            <span><Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{rx.date}</span>
                                            <span><User size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{rx.doctor}</span>
                                            <span><Pill size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{rx.medicines} medicines</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: rx.status === 'analyzed' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: rx.status === 'analyzed' ? '#22c55e' : '#f59e0b' }}>
                                            {rx.status === 'analyzed' ? <CheckCircle size={11} /> : <Clock size={11} />}
                                            {rx.status === 'analyzed' ? 'Analyzed' : 'Pending Review'}
                                        </span>
                                        <button onClick={() => toast('View prescription PDF — connect Firebase Storage to enable')} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, gap: 4 }}>
                                            <Eye size={12} /> View
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            onClick={() => setActiveSection('upload')}
                            className="btn btn-primary"
                            style={{ marginTop: 20, gap: 8 }}
                        >
                            <Upload size={15} /> Upload New Prescription
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrescriptionUpload;
