"use client";

import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    type SVGProps,
} from 'react';
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
    useMotionValue,
    useTransform,
    animate,
    type Variants,
} from 'framer-motion';
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";


// --- 辅助函数 ---

/**
 * 合并 Tailwind CSS 类名，无冲突。
 * @param inputs - 要合并的类名。
 * @returns {string} - 合并后的类名字符串。
 */
function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

// --- 英雄组件及其依赖项 ---

/**
 * HeroGeometric 组件是一个具有视觉吸引力的英雄部分。
 * @param {object} props - 组件属性。
 * @param {string} [props.title1] - 主标题的第一行。
 * @param {string} [props.title2] - 主标题的第二行。
 * @returns {JSX.Element} - 渲染后的英雄部分组件。
 */
function HeroGeometric({
    title1 = "指标量化",
    title2 = "动态分析模型",
}: {
    title1?: string;
    title2?: string;
}) {
    const fadeUpVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <div className="relative w-full flex items-center justify-center overflow-hidden">
            {/* 内容 */}
            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                                {title1}
                            </span>
                            <br />
                            <span style={{ color: '#0cf2a0' }}>
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-base sm:text-lg md:text-xl text-white mb-8 leading-relaxed font-light tracking-wide mx-auto px-4">
                            本看板将您身体的各项关键信号，以客观、量化的方式清晰呈现，为您勾勒出一张精密的健康蓝图。这是一个由您主导的、不断精进的闭环健康管理系统。<br />让您在健康之路上，始终走在前沿。
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

/**
 * 这是最终导出的、合并后的英雄组件。
 * 它渲染了 HeroGeometric 组件，并传入了特定的属性。
 * @returns {JSX.Element} - 渲染后的演示组件。
 */
function DemoHeroGeometric() {
    return (
        <HeroGeometric
            title1="指标量化"
            title2="动态分析模型"
        />
    );
}

// --- 径向图表组件 ---

interface AnimatedRadialChartProps {
  value?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabels?: boolean;
  duration?: number;
}

function AnimatedRadialChart({
  value = 74,
  size = 300,
  strokeWidth: customStrokeWidth,
  className,
  showLabels = true,
  duration = 2,
}: AnimatedRadialChartProps) {
  const strokeWidth = customStrokeWidth ?? Math.max(12, size * 0.06);
  const radius = size * 0.35;
  const center = size / 2;
  const circumference = Math.PI * radius;
  const innerLineRadius = radius - strokeWidth - 4;
  const animatedValue = useMotionValue(0);
  const offset = useTransform(animatedValue, [0, 100], [circumference, 0]);
  const progressAngle = useTransform(animatedValue, [0, 100], [-Math.PI, 0]);
  const innerRadius = radius - strokeWidth / 2;

  useEffect(() => {
    const controls = animate(animatedValue, value, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, animatedValue, duration]);

  const fontSize = Math.max(16, size * 0.1);
  const labelFontSize = Math.max(12, size * 0.04);

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size * 0.7 }}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`} className="overflow-visible">
        <defs>
          <linearGradient id={`progressGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0cf2a0" />
            <stop offset="100%" stopColor="#09d187" />
          </linearGradient>
          <linearGradient id={`textGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#d1d5db" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6b7280" stopOpacity="0.3" />
          </linearGradient>
          <filter id={`dropshadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>
        <path d={`M ${center - innerLineRadius} ${center} A ${innerLineRadius} ${innerLineRadius} 0 0 1 ${center + innerLineRadius} ${center}`} fill="none" stroke="#6b7280" strokeWidth="1" strokeLinecap="butt" opacity="0.6" />
        <path d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`} fill="none" stroke="#374151" strokeWidth={strokeWidth} strokeLinecap="butt" filter={`url(#dropshadow-${size})`} />
        <motion.path d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`} fill="none" stroke={`url(#progressGradient-${size})`} strokeWidth={strokeWidth} strokeLinecap="butt" strokeDasharray={circumference} strokeDashoffset={offset} filter={`url(#dropshadow-${size})`} />
        <motion.line x1={useTransform(progressAngle, (angle) => center + Math.cos(angle) * innerRadius)} y1={useTransform(progressAngle, (angle) => center + Math.sin(angle) * innerRadius)} x2={useTransform(progressAngle, (angle) => center + Math.cos(angle) * innerRadius - Math.cos(angle) * 30)} y2={useTransform(progressAngle, (angle) => center + Math.sin(angle) * innerRadius - Math.sin(angle) * 30)} stroke={`url(#textGradient-${size})`} strokeWidth="1" strokeLinecap="butt" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="font-bold tracking-tight mt-10" style={{ fontSize: `${fontSize}px` }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: duration * 0.75 }}>
          <span style={{ background: "linear-gradient(to right, #ffffff, #9ca3af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", }}>
            <motion.span>{useTransform(animatedValue, (latest) => Math.round(latest))}</motion.span>%
          </span>
        </motion.div>
      </div>
      {showLabels && (
        <>
          <motion.div className="absolute text-gray-400 font-medium" style={{ fontSize: `${labelFontSize}px`, left: center - radius - 5, top: center + strokeWidth / 2, }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: duration * 0.25 }} >
            0%
          </motion.div>
          <motion.div className="absolute text-gray-400 font-medium" style={{ fontSize: `${labelFontSize}px`, left: center + radius - 20, top: center + strokeWidth / 2, }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: duration * 0.25 }} >
            100%
          </motion.div>
        </>
      )}
    </div>
  );
}

function RadialChartSection() {
  const chartData = [
    { title: "体能指数", value: 25 },
    { title: "恢复指数", value: 50 },
    { title: "睡眠质量", value: 75 },
    { title: "压力水平", value: 95 },
  ];

  return (
    <div className="w-full py-16">
        <div className="flex flex-wrap justify-center gap-8">
            {chartData.map((chart, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                    <h3 className="text-3xl font-bold text-white">
                        {chart.title}
                    </h3>
                    <AnimatedRadialChart
                        value={chart.value}
                        size={300}
                        strokeWidth={30}
                        showLabels={true}
                        duration={2}
                    />
                </div>
            ))}
        </div>
    </div>
  );
}


// --- 类型定义 ---

// Canvas 中点的类型
interface Dot {
    x: number;
    y: number;
    baseColor: string;
    targetOpacity: number;
    currentOpacity: number;
    opacitySpeed: number;
    baseRadius: number;
    currentRadius: number;
}

// --- 图标组件 ---

const MenuIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


// --- 主页面组件 ---
/**
 * 页面主组件
 * @description 包含一个交互式的 Canvas 背景和一个简化的导航栏。
 * 这个组件现在是默认导出的页面组件。
 */
const Page = () => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const animationFrameId = useRef<number | null>(null);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const [isScrolled, setIsScrolled] = useState<boolean>(false);

   // 监听滚动事件，用于改变导航栏样式
   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (latest) => {
       setIsScrolled(latest > 10);
   });

   // --- Canvas 交互式背景逻辑 ---
   const dotsRef = useRef<Dot[]>([]);
   const gridRef = useRef<Record<string, number[]>>({});
   const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
   const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

   // 定义常量以方便调整
   const DOT_SPACING = 25;
   const BASE_OPACITY_MIN = 0.40;
   const BASE_OPACITY_MAX = 0.50;
   const BASE_RADIUS = 1;
   const INTERACTION_RADIUS = 150;
   const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
   const OPACITY_BOOST = 0.6;
   const RADIUS_BOOST = 2.5;
   const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5));

   // 鼠标移动事件处理
   const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            mousePositionRef.current = { x: null, y: null };
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        mousePositionRef.current = { x: canvasX, y: canvasY };
   }, []);

   // 创建背景粒子点
   const createDots = useCallback(() => {
       const { width, height } = canvasSizeRef.current;
       if (width === 0 || height === 0) return;

       const newDots: Dot[] = [];
       const newGrid: Record<string, number[]> = {};
       const cols = Math.ceil(width / DOT_SPACING);
       const rows = Math.ceil(height / DOT_SPACING);

       for (let i = 0; i < cols; i++) {
           for (let j = 0; j < rows; j++) {
               const x = i * DOT_SPACING + DOT_SPACING / 2;
               const y = j * DOT_SPACING + DOT_SPACING / 2;
               const cellX = Math.floor(x / GRID_CELL_SIZE);
               const cellY = Math.floor(y / GRID_CELL_SIZE);
               const cellKey = `${cellX}_${cellY}`;

               if (!newGrid[cellKey]) {
                   newGrid[cellKey] = [];
               }

               const dotIndex = newDots.length;
               newGrid[cellKey].push(dotIndex);

               const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
               newDots.push({
                   x,
                   y,
                   baseColor: `rgba(87, 220, 205, ${BASE_OPACITY_MAX})`,
                   targetOpacity: baseOpacity,
                   currentOpacity: baseOpacity,
                   opacitySpeed: (Math.random() * 0.005) + 0.002,
                   baseRadius: BASE_RADIUS,
                   currentRadius: BASE_RADIUS,
               });
           }
       }
       dotsRef.current = newDots;
       gridRef.current = newGrid;
   }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

   // 窗口大小调整事件处理
   const handleResize = useCallback(() => {
       const canvas = canvasRef.current;
       if (!canvas) return;
       const container = canvas.parentElement;
       const width = container ? container.clientWidth : window.innerWidth;
       const height = container ? container.clientHeight : window.innerHeight;

       if (canvas.width !== width || canvas.height !== height ||
           canvasSizeRef.current.width !== width || canvasSizeRef.current.height !== height)
       {
           canvas.width = width;
           canvas.height = height;
           canvasSizeRef.current = { width, height };
           createDots();
       }
   }, [createDots]);

   // Canvas 动画循环
   const animateDots = useCallback(() => {
       const canvas = canvasRef.current;
       const ctx = canvas?.getContext('2d');
       const dots = dotsRef.current;
       const grid = gridRef.current;
       const { width, height } = canvasSizeRef.current;
       const { x: mouseX, y: mouseY } = mousePositionRef.current;

       if (!ctx || !dots || !grid || width === 0 || height === 0) {
           animationFrameId.current = requestAnimationFrame(animateDots);
           return;
       }

       ctx.clearRect(0, 0, width, height);
       
       const activeDotIndices = new Set<number>();
       if (mouseX !== null && mouseY !== null) {
           const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE);
           const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE);
           const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE);
           for (let i = -searchRadius; i <= searchRadius; i++) {
               for (let j = -searchRadius; j <= searchRadius; j++) {
                   const checkCellX = mouseCellX + i;
                   const checkCellY = mouseCellY + j;
                   const cellKey = `${checkCellX}_${checkCellY}`;
                   if (grid[cellKey]) {
                       grid[cellKey].forEach(dotIndex => activeDotIndices.add(dotIndex));
                   }
               }
           }
       }

       dots.forEach((dot, index) => {
           dot.currentOpacity += dot.opacitySpeed;
           if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
               dot.opacitySpeed = -dot.opacitySpeed;
               dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX));
               dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
           }

           let interactionFactor = 0;
           dot.currentRadius = dot.baseRadius;

           if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
               const dx = dot.x - mouseX;
               const dy = dot.y - mouseY;
               const distSq = dx * dx + dy * dy;

               if (distSq < INTERACTION_RADIUS_SQ) {
                   const distance = Math.sqrt(distSq);
                   interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS);
                   interactionFactor = interactionFactor * interactionFactor;
               }
           }
           
           const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST);
           dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST;

           const colorMatch = dot.baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
           const r = colorMatch ? colorMatch[1] : '87';
           const g = colorMatch ? colorMatch[2] : '220';
           const b = colorMatch ? colorMatch[3] : '205';

           ctx.beginPath();
           ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
           ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
           ctx.fill();
       });

       animationFrameId.current = requestAnimationFrame(animateDots);
   }, [GRID_CELL_SIZE, INTERACTION_RADIUS_SQ, OPACITY_BOOST, RADIUS_BOOST, BASE_OPACITY_MIN, BASE_OPACITY_MAX]);

   // --- Effects ---

   // 初始化和清理 Canvas 动画及事件监听器
   useEffect(() => {
       handleResize();
       const handleMouseLeave = () => {
            mousePositionRef.current = { x: null, y: null };
        };

       window.addEventListener('mousemove', handleMouseMove, { passive: true });
       window.addEventListener('resize', handleResize);
       document.documentElement.addEventListener('mouseleave', handleMouseLeave);

       animationFrameId.current = requestAnimationFrame(animateDots);

       return () => {
           window.removeEventListener('resize', handleResize);
           window.removeEventListener('mousemove', handleMouseMove);
           document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
           if (animationFrameId.current) {
               cancelAnimationFrame(animationFrameId.current);
           }
       };
   }, [handleResize, handleMouseMove, animateDots]);

   // 控制移动端菜单打开时 body 的滚动
   useEffect(() => {
       if (isMobileMenuOpen) {
           document.body.style.overflow = 'hidden';
       } else {
           document.body.style.overflow = 'unset';
       }
       return () => { document.body.style.overflow = 'unset'; };
   }, [isMobileMenuOpen]);

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

  // --- JSX 渲染 ---
  return (
    <div className="relative bg-[#111111] text-gray-300 min-h-screen flex flex-col overflow-x-hidden">
        {/* Canvas 背景 */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

        {/* 导航栏 */}
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
                    <motion.a
                        href="#"
                        className="bg-[#0CF2A0] text-[#111111] px-5 py-2 rounded-md text-base font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        健康指数看板
                    </motion.a>
                    
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
                        variants={mobileMenuVariants} initial="hidden" animate="visible" exit="exit"
                        className="md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-sm shadow-lg py-4 border-t border-gray-800/50"
                    >
                       {/* 移动端导航链接已根据要求删除 */}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>

        {/* 主内容区域 */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 relative z-10">
            <DemoHeroGeometric />
            <RadialChartSection />
        </main>

    </div>
  );
};

export default Page;
