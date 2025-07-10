"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, type Variants } from 'framer-motion';
// 路径更正：从同一目录 (./) 导入
import { MenuIcon, CloseIcon, ChevronDownIcon } from './icons'; 
// 路径更正：从同一目录 (./) 导入
import LoginCard from './LoginCard'; 

const AppHeader = () => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const [isScrolled, setIsScrolled] = useState<boolean>(false);
   const [isLoginOpen, setIsLoginOpen] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [userName, setUserName] = useState<string | null>(null);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 新增：控制下拉菜单的显示

   // 在组件挂载时调用 session 接口获取用户信息
   useEffect(() => {
       const fetchUserSession = async () => {
           try {
               const response = await fetch('/api/auth/session');
               if (response.ok) {
                   const data = await response.json();
                   setIsLoggedIn(true);
                   setUserName(data.user.name);
               } else {
                   setIsLoggedIn(false);
                   setUserName(null);
               }
           } catch (error) {
               console.error("Failed to fetch session:", error);
               setIsLoggedIn(false);
               setUserName(null);
           }
       };
       fetchUserSession();
   }, []);

   // 监听滚动事件
   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (latest) => {
       setIsScrolled(latest > 10);
   });

   // 控制 body 滚动
   useEffect(() => {
       if (isMobileMenuOpen || isLoginOpen) {
           document.body.style.overflow = 'hidden';
       } else {
           document.body.style.overflow = 'unset';
       }
       return () => { document.body.style.overflow = 'unset'; };
   }, [isMobileMenuOpen, isLoginOpen]);

   // 登录成功后的回调处理函数
   const handleLoginSuccess = (name: string) => {
       setIsLoggedIn(true);
       setUserName(name);
       setIsLoginOpen(false); // 关闭登录弹窗
       window.dispatchEvent(new Event('auth-change')); // <--- 新增此行
   };

   // 新增：处理退出登录
   const handleLogout = async () => {
       try {
           await fetch('/api/auth/logout', { method: 'POST' });
           setIsLoggedIn(false);
           setUserName(null);
           window.dispatchEvent(new Event('auth-change')); // <--- 新增此行
           setIsDropdownOpen(false);
       } catch (error) {
           console.error("Logout failed:", error);
       }
   };

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

   const dropdownVariants: Variants = {
       hidden: { opacity: 0, y: -10, scale: 0.95 },
       visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: "easeOut" } },
       exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1, ease: "easeIn" } }
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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#0CF2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="#0CF2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="#0CF2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="text-3xl font-bold text-white ml-2">Apex</span>
                    </div>

                    {/* 右侧操作按钮 */}
                    <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
                        {isLoggedIn ? (
                            <>
                                {/* 关键修改：用户欢迎信息和下拉菜单 */}
                                <div 
                                    className="relative"
                                    onMouseEnter={() => setIsDropdownOpen(true)}
                                    onMouseLeave={() => setIsDropdownOpen(false)}
                                >
                                    <button className="flex items-center space-x-1 text-white text-base font-semibold">
                                        <span>欢迎, {userName}!</span>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                variants={dropdownVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="absolute top-full right-0 mt-2 w-32 bg-[#27272a] border border-gray-700/80 rounded-md shadow-lg overflow-hidden"
                                            >
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/60 transition-colors"
                                                >
                                                    退出
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    disabled
                                    className="bg-[#0CF2A0] text-[#111111] px-5 py-2 rounded-md text-base font-semibold whitespace-nowrap opacity-50 cursor-not-allowed"
                                >
                                    健康指数看板
                                </button>
                            </>
                        ) : (
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
                <AnimatePresence>{isMobileMenuOpen && ( <motion.div key="mobile-menu" variants={mobileMenuVariants} initial="hidden" animate="visible" exit="exit" className="md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-sm shadow-lg py-4 border-t border-gray-800/50"></motion.div>)}</AnimatePresence>
            </motion.header>

            <LoginCard isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
        </>
    );
};

export default AppHeader;
