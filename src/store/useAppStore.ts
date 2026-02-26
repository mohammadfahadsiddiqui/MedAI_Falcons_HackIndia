import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (n: Notification) => void;
    markAllRead: () => void;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'emergency';
    timestamp: Date;
    read: boolean;
}

interface AppState extends ThemeState, AuthState, NotificationState { }

export const useAppStore = create<AppState>((set) => ({
    // Theme
    isDark: true,
    toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

    // Auth
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),

    // Notifications
    notifications: [],
    unreadCount: 0,
    addNotification: (n) =>
        set((state) => ({
            notifications: [n, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        })),
    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        })),
}));
