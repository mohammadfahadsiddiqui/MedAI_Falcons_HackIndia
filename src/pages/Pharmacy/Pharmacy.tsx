import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Search, Star, Plus, Minus, Truck,
    Shield, Clock, Tag, FileText, Store, ChevronRight, X, Package
} from 'lucide-react';
import { medicines, categories, featuredStores } from '../../data/medicines';
import { useCartStore, type Medicine } from '../../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Pharmacy: React.FC = () => {
    const navigate = useNavigate();
    const { addToCart, removeFromCart, updateQuantity, getTotalItems, isInCart, items } = useCartStore();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'discount'>('popular');
    const [showCart, setShowCart] = useState(false);

    const filtered = medicines
        .filter(m =>
            (activeCategory === 'All' || m.category === activeCategory) &&
            (m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.brand.toLowerCase().includes(search.toLowerCase()) ||
                m.category.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            if (sortBy === 'discount') return b.discount - a.discount;
            return b.reviews - a.reviews;
        });

    const handleAdd = (medicine: Medicine) => {
        addToCart(medicine);
        toast.success(`${medicine.name} added to cart 🛒`, { duration: 2000 });
    };

    const getItemQty = (id: string) => items.find(i => i.id === id)?.quantity || 0;

    return (
        <div>
            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #0e7490 0%, #6366f1 60%, #8b5cf6 100%)',
                    padding: '28px 32px',
                    marginBottom: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: -60, right: 120, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                        💊 MedAI Pharmacy
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 6 }}>
                        Medicines Delivered to Your Door
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 16 }}>
                        ✅ Genuine medicines &nbsp;·&nbsp; ⚡ 2–4 hour delivery &nbsp;·&nbsp; 🔒 Safe &amp; secure
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 13, fontWeight: 600 }}>
                            🏷️ Up to 30% OFF
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 13, fontWeight: 600 }}>
                            🚚 Free delivery above ₹299
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: 80, flexShrink: 0 }}>🏥</div>
            </motion.div>

            {/* Search + Cart button row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search medicines, brands, categories..."
                        className="input"
                        style={{ paddingLeft: 42, height: 44 }}
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="input"
                    style={{ width: 160, height: 44, cursor: 'pointer' }}
                >
                    <option value="popular">Most Popular</option>
                    <option value="price_asc">Price: Low–High</option>
                    <option value="price_desc">Price: High–Low</option>
                    <option value="discount">Best Discount</option>
                </select>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCart(true)}
                    className="btn btn-primary"
                    style={{ height: 44, gap: 8, minWidth: 120, position: 'relative' }}
                >
                    <ShoppingCart size={16} />
                    My Cart
                    {getTotalItems() > 0 && (
                        <span style={{
                            position: 'absolute', top: -8, right: -8,
                            background: '#ef4444', color: 'white', borderRadius: '50%',
                            width: 20, height: 20, fontSize: 11, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--bg-base)',
                        }}>
                            {getTotalItems()}
                        </span>
                    )}
                </motion.button>
            </div>

            {/* Nearby Stores */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Store size={16} color="var(--color-primary-light)" /> Partner Pharmacies
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {featuredStores.map((store, i) => (
                        <motion.div
                            key={store.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="card"
                            style={{ padding: '14px 16px', cursor: 'pointer', opacity: store.open ? 1 : 0.6 }}
                            whileHover={store.open ? { scale: 1.02, y: -2 } : {}}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-light)', background: 'rgba(99,102,241,0.12)', padding: '2px 8px', borderRadius: 20 }}>{store.badge}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: store.open ? '#22c55e' : '#ef4444' }}>{store.open ? '● Open' : '● Closed'}</span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{store.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span><Star size={10} fill="#f59e0b" color="#f59e0b" style={{ verticalAlign: 'middle', marginRight: 3 }} />{store.rating} · {store.distance}</span>
                                <span><Clock size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />{store.deliveryTime}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <motion.button
                        key={cat}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            background: activeCategory === cat ? 'var(--color-primary)' : 'var(--bg-input)',
                            color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                            boxShadow: activeCategory === cat ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                        }}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>

            {/* Results count + Upload Rx */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> medicines
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => toast('📋 Upload prescription feature — connect Firebase Storage to enable', { duration: 3000 })}
                    className="btn btn-ghost"
                    style={{ fontSize: 12, padding: '7px 14px', gap: 6 }}
                >
                    <FileText size={14} /> Upload Prescription
                </motion.button>
            </div>

            {/* Medicine Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <AnimatePresence>
                    {filtered.map((med, i) => (
                        <motion.div
                            key={med.id}
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ delay: i * 0.03 }}
                            className="card"
                            style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', opacity: med.inStock ? 1 : 0.7 }}
                        >
                            {/* Discount badge */}
                            {med.discount > 0 && (
                                <div style={{ position: 'absolute', top: 14, left: 14, background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 6 }}>
                                    {med.discount}% OFF
                                </div>
                            )}
                            {med.requiresPrescription && (
                                <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 9, fontWeight: 700, padding: '3px 6px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Shield size={9} /> Rx
                                </div>
                            )}

                            {/* Medicine image + info */}
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 8 }}>
                                <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                                    {med.image}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 2 }}>{med.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-primary-light)', marginBottom: 4 }}>{med.brand} · {med.dosage}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                        <span style={{ color: 'var(--text-secondary)' }}>{med.rating} ({med.reviews.toLocaleString()})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                                {med.description.slice(0, 80)}...
                            </p>

                            {/* Delivery */}
                            <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: med.inStock ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                    <Truck size={11} /> {med.inStock ? med.deliveryTime : 'Out of stock'}
                                </span>
                            </div>

                            {/* Price + Cart */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>₹{med.price}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>₹{med.mrp}</span>
                                </div>
                                {!med.inStock ? (
                                    <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Notify Me</span>
                                ) : isInCart(med.id) ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--color-primary)', borderRadius: 10, overflow: 'hidden' }}>
                                        <button
                                            onClick={() => updateQuantity(med.id, getItemQty(med.id) - 1)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', color: 'white', display: 'flex', alignItems: 'center' }}
                                        >
                                            <Minus size={13} />
                                        </button>
                                        <span style={{ color: 'white', fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center' }}>{getItemQty(med.id)}</span>
                                        <button
                                            onClick={() => handleAdd(med)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', color: 'white', display: 'flex', alignItems: 'center' }}
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAdd(med)}
                                        style={{
                                            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                                            color: 'var(--color-primary-light)', borderRadius: 10, padding: '7px 12px',
                                            fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <Plus size={13} /> Add
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No medicines found</div>
                    <div style={{ fontSize: 13 }}>Try a different search term or category</div>
                </div>
            )}

            {/* Cart Drawer */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
                            style={{
                                position: 'fixed', right: 0, top: 0, bottom: 0,
                                width: 400, background: 'var(--bg-card)',
                                borderLeft: '1px solid var(--border)',
                                zIndex: 201, display: 'flex', flexDirection: 'column',
                                boxShadow: 'var(--shadow-lg)',
                            }}
                        >
                            {/* Cart Header */}
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
                                        My Cart <span style={{ color: 'var(--color-primary-light)' }}>({getTotalItems()})</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Review your medicines before checkout</div>
                                </div>
                                <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Cart Items */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                                {items.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                        <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Your cart is empty</div>
                                        <div style={{ fontSize: 13 }}>Add medicines to get started</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {items.map(item => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                layout
                                                style={{ display: 'flex', gap: 12, padding: 14, background: 'var(--bg-input)', borderRadius: 12, alignItems: 'center' }}
                                            >
                                                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                                                    {item.image}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.brand}</div>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-primary-light)', marginTop: 3 }}>₹{(item.price * item.quantity).toFixed(0)}</div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--text-secondary)', display: 'flex' }}>
                                                            <Minus size={12} />
                                                        </button>
                                                        <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--text-secondary)', display: 'flex' }}>
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => { removeFromCart(item.id); toast('Removed from cart'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 10, fontWeight: 600 }}>
                                                        Remove
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Savings banner */}
                                        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Tag size={14} color="#22c55e" />
                                            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>
                                                You're saving ₹{useCartStore.getState().getSavings().toFixed(0)} on this order!
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cart Footer */}
                            {items.length > 0 && (
                                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Subtotal</span>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>₹{useCartStore.getState().getTotalPrice().toFixed(0)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Delivery</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>
                                            {useCartStore.getState().getTotalPrice() >= 299 ? 'FREE' : '₹49'}
                                        </span>
                                    </div>
                                    <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                                        <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-primary-light)' }}>
                                            ₹{(useCartStore.getState().getTotalPrice() + (useCartStore.getState().getTotalPrice() >= 299 ? 0 : 49)).toFixed(0)}
                                        </span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', height: 48, fontSize: 15, gap: 8 }}
                                        onClick={() => { setShowCart(false); navigate('/pharmacy/checkout'); }}
                                    >
                                        Proceed to Checkout <ChevronRight size={16} />
                                    </motion.button>
                                    <button
                                        onClick={() => { setShowCart(false); navigate('/pharmacy/orders'); }}
                                        className="btn btn-ghost"
                                        style={{ width: '100%', height: 40, fontSize: 13, marginTop: 8 }}
                                    >
                                        <Package size={14} /> View My Orders
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pharmacy;
