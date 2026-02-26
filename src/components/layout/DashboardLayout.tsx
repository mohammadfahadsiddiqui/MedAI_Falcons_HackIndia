import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppStore } from '../../store/useAppStore';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { isDark } = useAppStore();

    return (
        <div className={isDark ? '' : 'light'} style={{ minHeight: '100vh' }}>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <Header />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="page-container"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
