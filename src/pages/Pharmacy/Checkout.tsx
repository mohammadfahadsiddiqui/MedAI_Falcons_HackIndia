import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, CreditCard, ChevronRight,
    Shield, Tag, Package, CheckCircle, ArrowLeft, Clock
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useNavigate } from 'react-router-dom';

const paymentMethods = [
    { id: 'upi', label: 'UPI / QR Code', icon: '📱', desc: 'Pay with any UPI app' },
    { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
    { id: 'wallet', label: 'MedAI Wallet', icon: '👛', desc: 'Balance: ₹0.00' },
    { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
];

const savedAddresses = [
    { id: 1, label: 'Home', address: '123 Main Street, Sector 14', city: 'New Delhi', pin: '110001', icon: '🏠' },
    { id: 2, label: 'Work', address: '456 Business Park, Block B', city: 'Gurugram', pin: '122001', icon: '🏢' },
];

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { items, getTotalPrice, getSavings, clearCart } = useCartStore();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedAddress, setSelectedAddress] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState('upi');
    const [placing, setPlacing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', pin: '' });
    const [useNewAddress, setUseNewAddress] = useState(false);

    const deliveryCharge = getTotalPrice() >= 299 ? 0 : 49;
    const total = getTotalPrice() + deliveryCharge;

    if (items.length === 0 && step !== 3) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</div>
                <button onClick={() => navigate('/pharmacy')} className="btn btn-primary" style={{ marginTop: 16 }}>
                    Browse Medicines
                </button>
            </div>
        );
    }

    const placeOrder = async () => {
        setPlacing(true);
        await new Promise(r => setTimeout(r, 2000));
        clearCart();
        setStep(3);
        setPlacing(false);
    };

    const stepLabels = ['Delivery', 'Payment', 'Confirmation'];

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Back button */}
            <button
                onClick={() => step > 1 ? setStep(s => (s - 1) as 1 | 2 | 3) : navigate('/pharmacy')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, padding: 0 }}
            >
                <ArrowLeft size={16} /> {step === 1 ? 'Back to Pharmacy' : 'Back'}
            </button>

            <div className="section-title" style={{ marginBottom: 4 }}>Checkout</div>
            <div className="section-subtitle" style={{ marginBottom: 24 }}>Complete your medicine order</div>

            {/* Step progress */}
            {step < 3 && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
                    {stepLabels.map((label, i) => (
                        <React.Fragment key={label}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: step > i + 1 ? '#22c55e' : step === i + 1 ? 'var(--color-primary)' : 'var(--bg-input)',
                                    color: step >= i + 1 ? 'white' : 'var(--text-muted)',
                                    fontWeight: 700, fontSize: 14, transition: 'all 0.3s',
                                    boxShadow: step === i + 1 ? '0 0 15px rgba(99,102,241,0.4)' : 'none',
                                }}>
                                    {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                                </div>
                                <span style={{ fontSize: 11, color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 700 : 400 }}>{label}</span>
                            </div>
                            {i < stepLabels.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#22c55e' : 'var(--border)', margin: '0 12px', marginBottom: 24, transition: 'background 0.3s' }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr' : '1.5fr 1fr', gap: 24 }}>
                {/* Left panel */}
                <div>
                    <AnimatePresence mode="wait">
                        {/* Step 1: Address */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <MapPin size={16} color="var(--color-primary-light)" /> Delivery Address
                                    </div>

                                    {/* Saved addresses */}
                                    {!useNewAddress && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                                            {savedAddresses.map(addr => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddress(addr.id)}
                                                    style={{
                                                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                                                        border: `2px solid ${selectedAddress === addr.id ? 'var(--color-primary)' : 'var(--border)'}`,
                                                        background: selectedAddress === addr.id ? 'rgba(99,102,241,0.07)' : 'var(--bg-input)',
                                                        display: 'flex', gap: 12, alignItems: 'center',
                                                    }}
                                                >
                                                    <span style={{ fontSize: 22 }}>{addr.icon}</span>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{addr.label}</div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{addr.address}, {addr.city} – {addr.pin}</div>
                                                    </div>
                                                    {selectedAddress === addr.id && <CheckCircle size={18} color="var(--color-primary)" style={{ marginLeft: 'auto' }} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button onClick={() => setUseNewAddress(!useNewAddress)} className="btn btn-ghost" style={{ width: '100%', fontSize: 13, padding: '10px 16px' }}>
                                        {useNewAddress ? '← Use saved address' : '+ Add new address'}
                                    </button>

                                    {useNewAddress && (
                                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {[{ key: 'name', label: 'Full Name', placeholder: 'John Doe' }, { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' }, { key: 'address', label: 'Address Line', placeholder: 'House no, Street, Area' }, { key: 'city', label: 'City', placeholder: 'New Delhi' }, { key: 'pin', label: 'PIN Code', placeholder: '110001' }].map(f => (
                                                <div key={f.key}>
                                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</label>
                                                    <input className="input" placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', height: 48, fontSize: 15 }}>
                                    Continue to Payment <ChevronRight size={16} />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CreditCard size={16} color="var(--color-primary-light)" /> Payment Method
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {paymentMethods.map(pm => (
                                            <div
                                                key={pm.id}
                                                onClick={() => setSelectedPayment(pm.id)}
                                                style={{
                                                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                                                    border: `2px solid ${selectedPayment === pm.id ? 'var(--color-primary)' : 'var(--border)'}`,
                                                    background: selectedPayment === pm.id ? 'rgba(99,102,241,0.07)' : 'var(--bg-input)',
                                                    display: 'flex', gap: 12, alignItems: 'center', transition: 'all 0.2s',
                                                }}
                                            >
                                                <span style={{ fontSize: 22 }}>{pm.icon}</span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{pm.label}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{pm.desc}</div>
                                                </div>
                                                {selectedPayment === pm.id && <CheckCircle size={18} color="var(--color-primary)" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card" style={{ padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Shield size={16} color="#22c55e" />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Your payment information is 256-bit SSL encrypted and completely secure.</span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                    onClick={placeOrder}
                                    disabled={placing}
                                    className="btn btn-primary"
                                    style={{ width: '100%', height: 50, fontSize: 15, background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 20px rgba(34,197,94,0.35)' }}
                                >
                                    {placing ? (
                                        <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Placing Order...</>
                                    ) : (
                                        <><CheckCircle size={16} /> Place Order · ₹{total.toFixed(0)}</>
                                    )}
                                </motion.button>
                                <style>{`@keyframes spin { from{ transform: rotate(0deg) } to{ transform: rotate(360deg) } } `}</style>
                            </motion.div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}>
                                    <CheckCircle size={40} color="white" />
                                </motion.div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Order Placed! 🎉</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Your medicines are being prepared for delivery</p>

                                <div className="card" style={{ padding: 20, marginBottom: 20, textAlign: 'left' }}>
                                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Order #MED-{Math.random().toString(36).slice(2, 8).toUpperCase()}</div>
                                    {[
                                        { label: 'Estimated Delivery', value: '2–4 hours', icon: '🚚' },
                                        { label: 'Payment', value: paymentMethods.find(p => p.id === selectedPayment)?.label || '', icon: '💳' },
                                        { label: 'Deliver To', value: savedAddresses[selectedAddress - 1]?.label + ' · ' + savedAddresses[selectedAddress - 1]?.city, icon: '📍' },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{row.icon} {row.label}</span>
                                            <span style={{ fontWeight: 600 }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                    <button onClick={() => navigate('/pharmacy/orders')} className="btn btn-primary" style={{ gap: 8 }}>
                                        <Package size={15} /> Track Order
                                    </button>
                                    <button onClick={() => navigate('/pharmacy')} className="btn btn-ghost">
                                        Continue Shopping
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Order Summary */}
                {step < 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Order Summary</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, maxHeight: 250, overflowY: 'auto' }}>
                                {items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span style={{ fontSize: 18 }}>{item.image}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>×{item.quantity}</div>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(0)}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                                    <span>Subtotal ({items.length} items)</span><span>₹{getTotalPrice().toFixed(0)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                                    <span>Delivery</span><span style={{ color: deliveryCharge === 0 ? '#22c55e' : 'inherit' }}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#22c55e', fontWeight: 600 }}>
                                    <span>Savings</span><span>-₹{getSavings().toFixed(0)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                                    <span>Total</span><span style={{ color: 'var(--color-primary-light)' }}>₹{total.toFixed(0)}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.18)', display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Tag size={13} color="#22c55e" />
                                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Saving ₹{getSavings().toFixed(0)} on this order!</span>
                            </div>

                            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                                <Clock size={12} /> Estimated delivery: 2–4 hours
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
