import { create } from 'zustand';

export interface Medicine {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    mrp: number;
    discount: number;
    image: string;
    dosage: string;
    description: string;
    requiresPrescription: boolean;
    inStock: boolean;
    rating: number;
    reviews: number;
    deliveryTime: string;
}

export interface CartItem extends Medicine {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addToCart: (medicine: Medicine) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getSavings: () => number;
    isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addToCart: (medicine) => {
        const existing = get().items.find(i => i.id === medicine.id);
        if (existing) {
            set({ items: get().items.map(i => i.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
            set({ items: [...get().items, { ...medicine, quantity: 1 }] });
        }
    },

    removeFromCart: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
    },

    updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
            get().removeFromCart(id);
        } else {
            set({ items: get().items.map(i => i.id === id ? { ...i, quantity } : i) });
        }
    },

    clearCart: () => set({ items: [] }),

    getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    getSavings: () => get().items.reduce((sum, i) => sum + (i.mrp - i.price) * i.quantity, 0),
    isInCart: (id) => get().items.some(i => i.id === id),
}));
