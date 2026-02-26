import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Order {
    id: string;
    date: string;
    items: { name: string; qty: number; price: number; image: string }[];
    total: number;
    status: 'Delivered' | 'On the Way' | 'Processing' | 'Cancelled';
    address: string;
    payment: string;
    eta?: string;
}

const mockOrders: Order[] = [
    {
        id: 'MED-A7X3K1',
        date: '26 Feb 2026, 2:45 AM',
        items: [
            { name: 'Paracetamol 500mg', qty: 2, price: 28, image: '💊' },
            { name: 'Vitamin C 1000mg', qty: 1, price: 120, image: '🍊' },
        ],
        total: 225,
        status: 'On the Way',
        address: 'Home · 123 Main Street, New Delhi',
        payment: 'UPI / QR Code',
        eta: '~35 min remaining',
    },
    {
        id: 'MED-B9Q2L4',
        date: '25 Feb 2026, 11:30 PM',
        items: [
            { name: 'Omega-3 Fish Oil', qty: 1, price: 299, image: '🐟' },
            { name: 'Vitamin D3 2000IU', qty: 1, price: 185, image: '☀️' },
        ],
        total: 533,
        status: 'Delivered',
        address: 'Work · 456 Business Park, Gurugram',
        payment: 'Credit Card',
    },
    {
        id: 'MED-C3P8R7',
        date: '24 Feb 2026, 8:15 PM',
        items: [
            { name: 'Cetirizine 10mg', qty: 3, price: 32, image: '🤧' },
        ],
        total: 145,
        status: 'Delivered',
        address: 'Home · 123 Main Street, New Delhi',
        payment: 'Cash on Delivery',
    },
    {
        id: 'MED-D5M6N2',
        date: '23 Feb 2026, 5:00 PM',
        items: [
            { name: 'Amoxicillin 500mg', qty: 1, price: 95, image: '💉' },
        ],
        total: 144,
        status: 'Cancelled',
        address: 'Home · 123 Main Street, New Delhi',
        payment: 'UPI / QR Code',
    },
];

const statusConfig = {
    'Delivered': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle, steps: 4 },
    'On the Way': { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', icon: Truck, steps: 3 },
    'Processing': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock, steps: 2 },
    'Cancelled': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: Package, steps: 0 },
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const [expanded, setExpanded] = useState(order.status === 'On the Way');
    const cfg = statusConfig[order.status];
    const StatusIcon = cfg.icon;

    const trackingSteps = [
        { label: 'Order Placed', desc: 'Your order has been received', done: true },
        { label: 'Being Prepared', desc: 'Pharmacy is picking your items', done: cfg.steps >= 2 },
        { label: 'On the Way', desc: 'Delivery partner is heading to you', done: cfg.steps >= 3 },
        { label: 'Delivered', desc: 'Order delivered successfully', done: cfg.steps >= 4 },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
            {/* Order Header */}
            <div style={{ padding: '18px 20px', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>#{order.id}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: 12, fontWeight: 700, padding: '4px 12px',
                            borderRadius: 20, background: cfg.bg, color: cfg.color,
                        }}>
                            <StatusIcon size={12} /> {order.status}
                        </span>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                        >
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                </div>

                {/* Item preview */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {order.items.map(item => (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: 20 }}>
                            <span>{item.image}</span> {item.name} ×{item.qty}
                        </div>
                    ))}
                    <div style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 16, color: 'var(--color-primary-light)' }}>
                        ₹{order.total}
                    </div>
                </div>

                {/* ETA for in-progress */}
                {order.eta && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: cfg.color, fontWeight: 600 }}>
                        <Truck size={13} /> {order.eta}
                    </div>
                )}
            </div>

            {/* Expanded details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '20px 20px' }}>
                            {/* Live Tracking (for non-cancelled orders) */}
                            {order.status !== 'Cancelled' && (
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Live Tracking</div>
                                    <div style={{ position: 'relative', paddingLeft: 24 }}>
                                        {/* Vertical line */}
                                        <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--border)', borderRadius: 2 }} />
                                        {trackingSteps.map((step, i) => (
                                            <motion.div
                                                key={step.label}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                style={{ display: 'flex', gap: 12, marginBottom: i < trackingSteps.length - 1 ? 16 : 0, alignItems: 'flex-start' }}
                                            >
                                                <div style={{
                                                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                                                    background: step.done ? cfg.color : 'var(--bg-input)',
                                                    border: `2px solid ${step.done ? cfg.color : 'var(--border)'}`,
                                                    boxShadow: step.done ? `0 0 8px ${cfg.color}60` : 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    zIndex: 1, position: 'relative',
                                                }}>
                                                    {step.done && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: step.done ? 700 : 400, color: step.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{step.desc}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '16px 0', borderTop: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Delivered To</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.address}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.payment}</div>
                                </div>
                            </div>

                            {/* Items breakdown */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Items</div>
                                {order.items.map(item => (
                                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <span>{item.image} {item.name} ×{item.qty}</span>
                                        <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', fontWeight: 800, fontSize: 14 }}>
                                    <span>Total Paid</span>
                                    <span style={{ color: 'var(--color-primary-light)' }}>₹{order.total}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {order.status === 'Delivered' && (
                                <button className="btn btn-ghost" style={{ fontSize: 12, padding: '8px 16px', gap: 6, marginTop: 4 }}>
                                    <RefreshCw size={13} /> Reorder
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState<string>('All');

    const filtered = mockOrders.filter(o => filterStatus === 'All' || o.status === filterStatus);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button onClick={() => navigate('/pharmacy')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 4 }}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="section-title" style={{ marginBottom: 2 }}>My Orders</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mockOrders.length} total orders</div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate('/pharmacy')} className="btn btn-primary" style={{ marginLeft: 'auto', gap: 8, fontSize: 13 }}>
                    <ShoppingBag size={14} /> New Order
                </motion.button>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--bg-card)', padding: 6, borderRadius: 14, width: 'fit-content', border: '1px solid var(--border)' }}>
                {['All', 'On the Way', 'Processing', 'Delivered', 'Cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                            padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            background: filterStatus === status ? 'var(--color-primary)' : 'transparent',
                            color: filterStatus === status ? 'white' : 'var(--text-secondary)',
                        }}
                    >
                        {status}
                        {status !== 'All' && (
                            <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.8 }}>
                                ({mockOrders.filter(o => o.status === status).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Package size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <div style={{ fontSize: 15, fontWeight: 600 }}>No {filterStatus} orders</div>
                </div>
            ) : (
                filtered.map(order => <OrderCard key={order.id} order={order} />)
            )}
        </div>
    );
};

export default Orders;
