"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, type Variants } from 'framer-motion';
import { MenuIcon, CloseIcon } from './icons';
import LoginCard from './LoginCard';

const AppHeader = () => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const [isScrolled, setIsScrolled] = useState<boolean>(false);
   const [isLoginOpen, setIsLoginOpen] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(false); // 新增：用于跟踪登录状态

   // 新增：在组件挂载时检查用户登录状态
   useEffect(() => {
       const checkLoginStatus = () => {
           // 通过检查是否存在 'session' cookie 来判断用户是否登录
           const hasSessionCookie = document.cookie.split(';').some((item) => item.trim().startsWith('session='));
           setIsLoggedIn(hasSessionCookie);
       };
       checkLoginStatus();
       // 由于 LoginCard 登录成功后会刷新页面，此组件将重新挂载，
       // 并再次执行此 effect，从而更新登录状态。
   }, []); // 空依赖数组确保此 effect 只在组件挂载时运行

   // 监听滚动事件，用于改变导航栏样式
   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (latest) => {
       setIsScrolled(latest > 10);
   });

   // 控制移动端菜单或登录卡片打开时 body 的滚动
   useEffect(() => {
       if (isMobileMenuOpen || isLoginOpen) {
           document.body.style.overflow = 'hidden';
       } else {
           document.body.style.overflow = 'unset';
       }
       return () => { document.body.style.overflow = 'unset'; };
   }, [isMobileMenuOpen, isLoginOpen]);

   // --- Framer Motion 动画变体 ---
   const headerVariants: Variants = {
       top: {
           backgroundColor: "rgba(17, 17, 17, 0.8)",
           borderBottomColor: "rgba(55, 65, 81, 0.5)",
       },
       scrolled: {
           backgroundColor: "rgba(17, 17, 17, 0.95)",
           borderBottomColor: "rgba(75, 85, 99, 0.7)",
           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
       }
   };

   const mobileMenuVariants: Variants = {
       hidden: { opacity: 0, y: -20 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
       exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" } }
   };

    return (
        <>
            <motion.header
                variants={headerVariants}
                initial="top"
                animate={isScrolled ? "scrolled" : "top"}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="px-6 w-full md:px-10 lg:px-16 fixed top-0 z-30 backdrop-blur-md border-b"
            >
                <nav className="flex justify-between items-center max-w-screen-xl mx-auto h-[70px]">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#0CF2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="#0CF2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="#0CF2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-3xl font-bold text-white ml-2">Apex</span>
                    </div>

                    {/* 右侧操作按钮 */}
                    <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
                        {/* 关键修改：根据登录状态显示不同按钮 */}
                        {isLoggedIn ? (
                            // 登录后：显示不可点击的按钮
                            <button
                                disabled
                                className="bg-[#0CF2A0] text-[#111111] px-5 py-2 rounded-md text-base font-semibold whitespace-nowrap opacity-50 cursor-not-allowed"
                            >
                                健康指数看板
                            </button>
                        ) : (
                            // 登录前：显示登录按钮
                            <motion.button
                                onClick={() => setIsLoginOpen(true)}
                                className="bg-[#0CF2A0] text-[#111111] px-5 py-2 rounded-md text-base font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
                                whileHover={{ scale: 1.03, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                健康指数看板登录
                            </motion.button>
                        )}
                        
                        {/* 移动端菜单按钮 */}
                        <motion.button
                            className="md:hidden text-gray-300 hover:text-white z-50"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        >
                            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </motion.button>
                    </div>
                </nav>

                {/* 移动端菜单 */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            key="mobile-menu"
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-sm shadow-lg py-4 border-t border-gray-800/50"
                        >
                           {/* 移动端导航链接已根据要求删除 */}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            <LoginCard isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
};

export default AppHeader;
