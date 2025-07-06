"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { CloseIcon } from './icons';

// 定义视图类型
type View = 'login' | 'register' | 'forgotPassword';

interface LoginCardProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- 动画变体 ---
const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: "easeIn" } },
};

const viewVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
    }),
};

// --- 错误提示组件 ---
const ErrorDisplay = ({ message }: { message?: string | null }) => (
    <AnimatePresence>
        {message && (
            <motion.p
                className="flex items-center gap-1 text-sm text-red-500 pt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {message}
            </motion.p>
        )}
    </AnimatePresence>
);


// --- 视图组件 ---

const LoginView = ({ setView }: { setView: (view: View) => void }) => {
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 模拟API调用和错误处理
        setError("邮箱或密码不正确");
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">登录</h2>
            <p className="text-gray-400 mb-8">欢迎回来！</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email-login" className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
                    <input id="email-login" type="email" placeholder="you@example.com" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                </div>
                <div>
                    <label htmlFor="password-login" className="block text-sm font-medium text-gray-300 mb-2">密码</label>
                    <input id="password-login" type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                    <div className="h-6">
                        <ErrorDisplay message={error} />
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <button type="button" onClick={() => setView('forgotPassword')} className="text-sm text-gray-400 hover:text-[#0CF2A0] transition-colors">忘记密码?</button>
                </div>
                <motion.button type="submit" className="w-full bg-[#0CF2A0] text-[#111111] py-3 rounded-lg text-base font-bold hover:bg-opacity-90 transition-colors duration-200 shadow-lg hover:shadow-xl !mt-6" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    登录
                </motion.button>
                <div className="text-center !mt-6">
                    <p className="text-sm text-gray-400">
                        没有账号? <button type="button" onClick={() => setView('register')} className="font-semibold text-[#0CF2A0] hover:underline">现在注册</button>
                    </p>
                </div>
            </form>
        </div>
    );
};

const RegisterView = ({ setView }: { setView: (view: View) => void }) => {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 模拟API调用和错误处理
        setError("邮箱验证码不正确");
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">创建账号</h2>
            <p className="text-gray-400 mb-8">加入我们，开启您的健康之旅。</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name-register" className="block text-sm font-medium text-gray-300 mb-2">姓名</label>
                    <input id="name-register" type="text" placeholder="您的姓名" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                </div>
                <div>
                    <label htmlFor="email-register" className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
                    <input id="email-register" type="email" placeholder="you@example.com" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                </div>
                <div>
                    <label htmlFor="password-register" className="block text-sm font-medium text-gray-300 mb-2">密码</label>
                    <input id="password-register" type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                </div>
                <div>
                    <label htmlFor="code-register" className="block text-sm font-medium text-gray-300 mb-2">邮箱验证码</label>
                    <div className="flex items-center space-x-2">
                        <input id="code-register" type="text" placeholder="6位验证码" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                        <button type="button" className="flex-shrink-0 bg-gray-600/50 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-gray-600/80 transition-colors duration-200 whitespace-nowrap">
                            发送验证码
                        </button>
                    </div>
                    <div className="h-6">
                        <ErrorDisplay message={error} />
                    </div>
                </div>
                <motion.button type="submit" className="w-full bg-[#0CF2A0] text-[#111111] py-3 rounded-lg text-base font-bold hover:bg-opacity-90 transition-colors duration-200 shadow-lg hover:shadow-xl !mt-6" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    注册
                </motion.button>
                <div className="text-center !mt-6">
                    <p className="text-sm text-gray-400">
                        已有账号? <button type="button" onClick={() => setView('login')} className="font-semibold text-[#0CF2A0] hover:underline">返回登录</button>
                    </p>
                </div>
            </form>
        </div>
    );
};

const ForgotPasswordView = ({ setView }: { setView: (view: View) => void }) => {
    const [errors, setErrors] = useState<{ code?: string; password?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 模拟API调用和错误处理
        setErrors({
            code: "邮箱验证码不正确",
            password: "两次输入的密码不一致"
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">重置密码</h2>
            <p className="text-gray-400 mb-8">请验证您的邮箱并设置新密码。</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email-forgot" className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
                    <input id="email-forgot" type="email" placeholder="you@example.com" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                </div>
                <div>
                    <label htmlFor="code-forgot" className="block text-sm font-medium text-gray-300 mb-2">邮箱验证码</label>
                    <div className="flex items-center space-x-2">
                        <input id="code-forgot" type="text" placeholder="6位验证码" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                        <button type="button" className="flex-shrink-0 bg-gray-600/50 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-gray-600/80 transition-colors duration-200 whitespace-nowrap">
                            发送验证码
                        </button>
                    </div>
                    <div className="h-6">
                        <ErrorDisplay message={errors.code} />
                    </div>
                </div>
                 <div>
                    <label htmlFor="password-forgot" className="block text-sm font-medium text-gray-300 mb-2">新密码</label>
                    <input id="password-forgot" type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                </div>
                 <div>
                    <label htmlFor="confirm-password-forgot" className="block text-sm font-medium text-gray-300 mb-2">确认新密码</label>
                    <input id="confirm-password-forgot" type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[#27272a] border border-gray-600/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0] focus:border-[#0CF2A0] transition-all duration-200" required />
                    <div className="h-6">
                        <ErrorDisplay message={errors.password} />
                    </div>
                </div>
                <motion.button type="submit" className="w-full bg-[#0CF2A0] text-[#111111] py-3 rounded-lg text-base font-bold hover:bg-opacity-90 transition-colors duration-200 shadow-lg hover:shadow-xl !mt-6" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    提交
                </motion.button>
                <div className="text-center !mt-6">
                    <p className="text-sm text-gray-400">
                        记起密码了? <button type="button" onClick={() => setView('login')} className="font-semibold text-[#0CF2A0] hover:underline">返回登录</button>
                    </p>
                </div>
            </form>
        </div>
    );
};


/**
 * LoginCard 组件
 * @description 一个模态对话框，用于用户登录、注册和密码重置。
 */
const LoginCard: React.FC<LoginCardProps> = ({ isOpen, onClose }) => {
    const [view, setView] = useState<View>('login');
    const [direction, setDirection] = useState(0);

    const viewHeights = {
        login: 'h-[510px]',
        register: 'h-[670px]',
        forgotPassword: 'h-[700px]',
    };

    const handleSetView = (newView: View) => {
        const order: View[] = ['forgotPassword', 'login', 'register'];
        setDirection(order.indexOf(newView) > order.indexOf(view) ? 1 : -1);
        setView(newView);
    };

    const handleClose = () => {
        onClose();
        // 延迟重置视图，以确保关闭动画完成后再切换回登录页
        setTimeout(() => {
            setView('login');
        }, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="login-backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center"
                >
                    <motion.div
                        key="login-card"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md m-4 bg-[#18181b] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <motion.button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20" aria-label="Close login card" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <CloseIcon className="w-6 h-6" />
                        </motion.button>
                        
                        <div className={`p-8 md:p-10 relative ${viewHeights[view]} flex items-center transition-all duration-300 ease-in-out`}>
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={view}
                                    custom={direction}
                                    variants={viewVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="absolute w-[calc(100%-64px)] md:w-[calc(100%-80px)]"
                                >
                                    {view === 'login' && <LoginView setView={handleSetView} />}
                                    {view === 'register' && <RegisterView setView={handleSetView} />}
                                    {view === 'forgotPassword' && <ForgotPasswordView setView={handleSetView} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginCard;
