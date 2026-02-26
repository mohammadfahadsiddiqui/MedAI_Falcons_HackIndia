import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Heart } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAppStore();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-base)', flexDirection: 'column', gap: 16,
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'pulse 2s infinite',
                    boxShadow: '0 0 30px rgba(99,102,241,0.5)',
                }}>
                    <Heart size={24} color="white" />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading MedAI...</div>
                <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }`}</style>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

export default ProtectedRoute;
