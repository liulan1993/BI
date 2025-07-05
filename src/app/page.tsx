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


// --- 菜单栏相关组件和数据 ---

// 辅助类：管理单个像素的逻辑
class Pixel {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private x: number;
    private y: number;
    private color: string;
    private speed: number;
    private size: number;
    private sizeStep: number;
    private minSize: number;
    private maxSizeInteger: number;
    private maxSize: number;
    private delay: number;
    private counter: number;
    private counterStep: number;
    public isIdle: boolean;
    private isReverse: boolean;
    private isShimmer: boolean;

    constructor(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        color: string,
        speed: number,
        delay: number,
    ) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = context;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = this.getRandomValue(0.1, 0.9) * speed;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInteger = 2;
        this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
        this.delay = delay;
        this.counter = 0;
        this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
    }

    private getRandomValue(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public draw(): void {
        const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
            this.x + centerOffset,
            this.y + centerOffset,
            this.size,
            this.size,
        );
    }

    public appear(): void {
        this.isIdle = false;
        if (this.counter <= this.delay) {
            this.counter += this.counterStep;
            return;
        }
        if (this.size >= this.maxSize) {
            this.isShimmer = true;
        }
        if (this.isShimmer) {
            this.shimmer();
        } else {
            this.size += this.sizeStep;
        }
        this.draw();
    }

    public disappear(): void {
        this.isShimmer = false;
        this.counter = 0;
        if (this.size <= 0) {
            this.isIdle = true;
        } else {
            this.size -= 0.1;
        }
        this.draw();
    }

    private shimmer(): void {
        if (this.size >= this.maxSize) {
            this.isReverse = true;
        } else if (this.size <= this.minSize) {
            this.isReverse = false;
        }
        if (this.isReverse) {
            this.size -= this.speed;
        } else {
            this.size += this.speed;
        }
    }
}

// React 组件：PixelCanvas
interface PixelCanvasProps {
    gap?: number;
    speed?: number;
    colors?: string[];
    variant?: "default" | "icon";
    animationState: "appear" | "disappear";
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({
    gap = 5,
    speed = 35,
    colors = ["#f8fafc", "#f1f5f9", "#cbd5e1"],
    variant = "default",
    animationState,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pixelsRef = useRef<Pixel[]>([]);
    const animationFrameId = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(performance.now());
    const timeInterval = 1000 / 60; // 60 FPS
    
    const reducedMotion = (typeof window !== 'undefined') ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
    const finalSpeed = reducedMotion ? 0 : Math.max(0, Math.min(100, speed)) * 0.001;

    const getDistanceToCenter = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
        const dpr = window.devicePixelRatio || 1;
        const dx = x - (canvas.width / dpr) / 2;
        const dy = y - (canvas.height / dpr) / 2;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);

    const getDistanceToBottomLeft = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
        const dpr = window.devicePixelRatio || 1;
        const dx = x;
        const dy = (canvas.height / dpr) - y;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);

    const createPixels = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        pixelsRef.current = [];
        const finalGap = Math.max(4, Math.min(50, gap));
        
        const dpr = window.devicePixelRatio || 1;
        const scaledWidth = canvas.width / dpr;
        const scaledHeight = canvas.height / dpr;

        for (let x = 0; x < scaledWidth; x += finalGap) {
            for (let y = 0; y < scaledHeight; y += finalGap) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                let delay = 0;

                if (variant === "icon") {
                    delay = reducedMotion ? 0 : getDistanceToCenter(x, y, canvas);
                } else {
                    delay = reducedMotion ? 0 : getDistanceToBottomLeft(x, y, canvas);
                }

                pixelsRef.current.push(
                    new Pixel(canvas, ctx, x, y, color, finalSpeed, delay)
                );
            }
        }
    }, [gap, colors, variant, reducedMotion, finalSpeed, getDistanceToCenter, getDistanceToBottomLeft]);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.scale(dpr, dpr);
        }

        createPixels();
    }, [createPixels]);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate);

            const now = performance.now();
            const elapsed = now - lastTimeRef.current;

            if (elapsed < timeInterval) return;
            lastTimeRef.current = now - (elapsed % timeInterval);

            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

            let allIdle = true;
            for (const pixel of pixelsRef.current) {
                pixel[animationState]();
                if (!pixel.isIdle) {
                    allIdle = false;
                }
            }

            if (allIdle && animationState === 'disappear' && animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };

        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [animationState, timeInterval]);

    return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }} />;
};

// 标签按钮组件
interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
    const buttonClasses = `
        group relative w-full h-[50px] flex-shrink-0 
        border rounded-full 
        transition-colors duration-200 
        focus:outline-none
        ${isActive ? 'border-[#0cf2a0]' : 'border-gray-600'}
    `;

    return (
        <button
            onClick={onClick}
            className={buttonClasses.trim().replace(/\s+/g, ' ')}
            style={{ "--active-color": "#0cf2a0" } as React.CSSProperties}
        >
            <PixelCanvas
                gap={10}
                speed={25}
                colors={["#056b46", "#08a169", "#0cf2a0"]}
                variant="icon"
                animationState={isActive ? "appear" : "disappear"}
            />
            <div className="relative z-10 h-full w-full flex items-center justify-center p-2">
                <span className={`text-center text-sm font-bold transition-all duration-300 ease-out ${isActive ? 'text-[var(--active-color)] scale-105' : 'text-gray-300'}`}>
                    {children}
                </span>
            </div>
        </button>
    );
};

// --- 四个不同领域的标签页数据 ---

const cardiovascularMetabolicData = [
   { id: 'AIP', title: '血浆动脉粥样硬化指数(AIP)', content: '图表展示区' },
   { id: 'PP', title: '脉压(PP)', content: '图表展示区' },
   { id: 'MAP', title: '平均动脉压(MAP)', content: '图表展示区' },
   { id: 'HOMA-IR', title: '稳态模型胰岛素抵抗指数(HOMA-IR)', content: '图表展示区' },
   { id: 'TyG', title: '甘油三酯葡萄糖指数(TyG)', content: '图表展示区' },
   { id: 'WHtR', title: '腰高比(WHtR)', content: '图表展示区' },
   { id: 'SMI', title: '骨骼肌质量指数(SMI)', content: '图表展示区' },
   { id: 'Non-HDL-C', title: '非高密度脂蛋白胆固醇(Non-HDL-C)', content: '图表展示区' },
   { id: 'RC', title: '残余胆固醇(RC)', content: '图表展示区' },
   { id: 'MSS', title: '代谢综合征评分(MSS)', content: '图表展示区' },
   { id: 'VAI', title: '内脏脂肪指数(VAI)', content: '图表展示区' },
   { id: 'LAP', title: '脂质蓄积指数(LAP)', content: '图表展示区' },
   { id: 'CMI', title: '心脏代谢指数(CMI)', content: '图表展示区' },
   { id: 'QTc', title: '校正QT间期(QTc)', content: '图表展示区' },
   { id: 'LVMI', title: '左心室质量指数(LVMI)', content: '图表展示区' },
   { id: 'RWT', title: '相对室壁厚度(RWT)', content: '图表展示区' },
   { id: 'AD', title: '动脉粥样硬化性血脂异常(AD)', content: '图表展示区' },
   { id: 'PASP', title: '肺动脉收缩压(PASP)', content: '图表展示区' },
   { id: 'E/e', title: 'E/e比值', content: '图表展示区' },
   { id: 'SVI', title: '每搏输出量指数(SVI)', content: '图表展示区' },
   { id: 'CPO', title: '心脏功率输出(CPO)', content: '图表展示区' },
   { id: 'ApoB/ApoA1', title: '载脂蛋白B/载脂蛋白A1比值', content: '图表展示区' },
   { id: 'Non-HDL-C/ApoB', title: '非高密度脂蛋白胆固醇/载脂蛋白B比值', content: '图表展示区' },
   { id: 'LDL-C/ApoB', title: '低密度脂蛋白胆固醇/载脂蛋白B比值', content: '图表展示区' },
   { id: 'CK-MB/CK', title: '肌酸激酶同工酶/肌酸激酶比值', content: '图表展示区' },
   { id: 'ABI', title: '踝臂指数(ABI)', content: '图表展示区' },
   { id: 'CAVI', title: '心踝血管指数(CAVI)', content: '图表展示区' },
   { id: 'TABS', title: '冠状动脉粥样硬化总负荷评分(TABS)', content: '图表展示区' },
   { id: 'SHR', title: '压力性高血糖指数(SHR)', content: '图表展示区' },
   { id: 'GLCI', title: '糖毒性-脂毒性复合指数(GLCI)', content: '图表展示区' },
   { id: 'VLDL-C', title: '极低密度脂蛋白胆固醇(VLDL-C)', content: '图表展示区' },
   { id: 'Lp-PLA2', title: '脂蛋白相关磷脂酶A2(Lp-PLA2)', content: '图表展示区' },
   { id: 'GSP/HbA1c', title: '糖化血清蛋白/糖化血红蛋白比值', content: '图表展示区' },
   { id: 'IGI', title: '胰岛素生成指数(IGI)', content: '图表展示区' },
   { id: 'VAC', title: '心脏-动脉耦合效率(VAC)', content: '图表展示区' },
];

const inflammationImmunityNutritionData = [
   { id: 'NLR', title: '中性粒细胞与淋巴细胞比值(NLR)', content: '图表展示区' },
   { id: 'PLR', title: '血小板与淋巴细胞比值(PLR)', content: '图表展示区' },
   { id: 'SII', title: '全身免疫炎症指数(SII)', content: '图表展示区' },
   { id: 'PNI', title: '预后营养指数(PNI)', content: '图表展示区' },
   { id: 'MHR', title: '单核细胞与高密度脂蛋白胆固醇比值(MHR)', content: '图表展示区' },
   { id: 'SIRI', title: '全身炎症反应指数(SIRI)', content: '图表展示区' },
   { id: 'Globulin', title: '球蛋白(Globulin)', content: '图表展示区' },
   { id: 'GPS/mGPS', title: '格拉斯哥预后评分(GPS/mGPS)', content: '图表展示区' },
   { id: 'ACD_Score', title: '慢性病贫血评分(ACD Score)', content: '图表展示区' },
   { id: 'RAR', title: '红细胞分布宽度与白蛋白比值(RAR)', content: '图表展示区' },
   { id: 'HALP', title: 'HALP评分', content: '图表展示区' },
   { id: 'PAR', title: '血小板与白蛋白比值(PAR)', content: '图表展示区' },
   { id: 'FAR', title: '纤维蛋白原/白蛋白比值(FAR)', content: '图表展示区' },
   { id: 'CONUT', title: '控制营养状态评分(CONUT Score)', content: '图表展示区' },
   { id: 'ACRP', title: '蛋白/C反应蛋白比值(ACRP)', content: '图表展示区' },
   { id: 'Ferritin/ESR', title: '铁蛋白/血沉比值(Ferritin/ESR)', content: '图表展示区' },
   { id: 'LDH/Ferritin', title: '乳酸脱氢酶/铁蛋白比值(LDH/Ferritin)', content: '图表展示区' },
   { id: 'LCR', title: '淋巴细胞/C反应蛋白比值(LCR)', content: '图表展示区' },
   { id: 'AII', title: '过敏性炎症指数(AII)', content: '图表展示区' },
   { id: 'LMR', title: '淋巴细胞/单核细胞比值(LMR)', content: '图表展示区' },
   { id: 'NII', title: '营养-炎症-免疫综合指数(NII)', content: '图表展示区' },
   { id: 'A/G', title: '白蛋白/球蛋白比值(A/G)', content: '图表展示区' },
   { id: 'AAI', title: '自身免疫激活强度(AAI)', content: '图表展示区' },
];

const multiOrganFunctionData = [
   { id: 'AST/ALT', title: 'DR比值(AST/ALT)', content: '图表展示区' },
   { id: 'Mentzer', title: 'Mentzer 指数', content: '图表展示区' },
   { id: 'f/t_PSA', title: '游离/总前列腺特异性抗原比值(f/t PSA)', content: '图表展示区' },
   { id: 'FIB-4', title: 'FIB-4 纤维化指数', content: '图表展示区' },
   { id: 'BUN/Cr', title: '尿素氮/肌酐比值', content: '图表展示区' },
   { id: 'AG', title: '血清阴离子间隙(AG)', content: '图表展示区' },
   { id: 'TSHI', title: '甲状腺稳态指数(TSHI)', content: '图表展示区' },
   { id: 'C-PP', title: '钙磷乘积(C-PP)', content: '图表展示区' },
   { id: 'RPR', title: '红细胞分布宽度/血小板比值(RPR)', content: '图表展示区' },
   { id: 'MPV/P', title: '平均血小板体积/血小板比值(MPV/P)', content: '图表展示区' },
   { id: 'CysC/Cr', title: '胱抑素C/肌酐比值(CysC/Cr)', content: '图表展示区' },
   { id: 'UACR', title: '尿白蛋白/肌酐比值(UACR)', content: '图表展示区' },
   { id: 'PGI/PGII', title: '胃蛋白酶原比值(PGI/PGII)', content: '图表展示区' },
   { id: 'ROMA', title: '卵巢恶性肿瘤风险算法(ROMA)', content: '图表展示区' },
   { id: 'TSAT', title: '转铁蛋白饱和度(TSAT)', content: '图表展示区' },
   { id: 'NFS', title: 'NAFLD纤维化评分(NFS)', content: '图表展示区' },
   { id: 'APRI', title: 'AST与血小板比率指数(APRI)', content: '图表展示区' },
   { id: 'RFI', title: '肾衰指数(RFI)', content: '图表展示区' },
   { id: 'FENa', title: '钠排泄分数(FENa)', content: '图表展示区' },
   { id: 'LSM/SSM', title: '肝脏硬度/脾脏硬度比值', content: '图表展示区' },
   { id: 'TTKG', title: '经肾小管钾浓度梯度(TTKG)', content: '图表展示区' },
   { id: 'Delta_Ratio', title: 'Delta比值(DR)', content: '图表展示区' },
   { id: 'CC', title: '校正钙(CC)', content: '图表展示区' },
   { id: 'A-G', title: '肺泡-动脉氧分压差(A-a Gradient)', content: '图表展示区' },
   { id: 'TSH/FT3', title: '促甲状腺激素/游离T3比值(TSH/FT3)', content: '图表展示区' },
   { id: 'DFR', title: 'D-二聚体/纤维蛋白原比值(DFR)', content: '图表展示区' },
   { id: 'FLI', title: '脂肪肝指数(FLI)', content: '图表展示区' },
   { id: 'BAR', title: '胆红素/白蛋白比值(BAR)', content: '图表展示区' },
   { id: 'SUACR', title: '血清尿酸/肌酐比值(SUACR)', content: '图表展示区' },
   { id: 'IBIL/DBIL', title: '间接胆红素/直接胆红素比值(IBIL/DBIL)', content: '图表展示区' },
   { id: 'BVG', title: '全血粘度梯度(BVG)', content: '图表展示区' },
   { id: 'FAI', title: '游离雄激素指数(FAI)', content: '图表展示区' },
   { id: 'ORI', title: '卵巢储备指数(ORI)', content: '图表展示区' },
   { id: 'MRHS', title: '男性生殖健康综合评分(MRHS)', content: '图表展示区' },
   { id: 'TPCI', title: '甲状腺外周转化指数(TPCI)', content: '图表展示区' },
   { id: 'EAFI', title: '红细胞聚集-纤维蛋白原指数(EAFI)', content: '图表展示区' },
   { id: 'HSI', title: '肝脏脂肪变性指数(HSI)', content: '图表展示区' },
   { id: 'IBIL', title: '间接胆红素(IBIL)', content: '图表展示区' },
   { id: 'eGFR', title: '估算肾小球滤过率(eGFR)', content: '图表展示区' },
   { id: 'INR', title: '凝血酶原时间国际标准化比值(INR)', content: '图表展示区' },
   { id: 'FEUA', title: '尿酸清除率分数(FEUA)', content: '图表展示区' },
   { id: 'BTR', title: '骨转换标志物比值(BTR)', content: '图表展示区' },
   { id: 'Gastrin-17', title: '胃泌素-17(Gastrin-17)', content: '图表展示区' },
   { id: 'VAII', title: '视力不均衡指数(VAII)', content: '图表展示区' },
   { id: 'OPFR', title: '眼压波动风险指数(OPFR)', content: '图表展示区' },
   { id: 'HFHLS', title: '高频听力陡降斜率(HFHLS)', content: '图表展示区' },
   { id: 'NRAI', title: '神经反射衰减指数(NRAI)', content: '图表展示区' },
   { id: 'HLEI', title: '肝脏脂肪输出指数(HLEI)', content: '图表展示区' },
   { id: 'RCRI', title: '肾脏浓缩储备指数(RCRI)', content: '图表展示区' },
   { id: 'CSI', title: '躯干核心稳定指数(CSI)', content: '图表展示区' },
];

const integrativeMedicineData = [
   { id: 'DHEA-S/Cortisol', title: '脱氢表雄酮/皮质醇比值(DHEA-S/C)', content: '图表展示区' },
   { id: 'Cr/CysC', title: '肌酐/胱抑素C比值(Cr/CysC)', content: '图表展示区' },
   { id: 'IMT/LVEF', title: '颈动脉内中膜厚度/左室射血分数比值(IMT/LVEF)', content: '图表展示区' },
   { id: 'FI-Lab', title: '实验室衰弱指数(FI-Lab)', content: '图表展示区' },
   { id: 'CHA2DS2-VASc', title: 'CHA2DS2-VASc评分', content: '图表展示区' },
   { id: 'FINDRISC', title: '芬兰糖尿病风险评分(FINDRISC)', content: '图表展示区' },
   { id: 'ALP/Albumin', title: '碱性磷酸酶/白蛋白比值(ALP/A)', content: '图表展示区' },
   { id: 'SCORE2', title: 'SCORE2/SCORE2-OP评分', content: '图表展示区' },
   { id: 'KFRE', title: '肾脏疾病预后风险方程(KFRE)', content: '图表展示区' },
   { id: 'hs-cTn/hs-CRP', title: '高敏肌钙蛋白/C反应蛋白比值(hs-cTn/hs-CRP)', content: '图表展示区' },
   { id: 'PIRO', title: 'PIRO评分', content: '图表展示区' },
   { id: 'SOFA', title: '序贯性器官衰竭评估(SOFA)评分', content: '图表展示区' },
   { id: 'I-CRI-I', title: '综合心肾炎症指数(I-CRI-I)', content: '图表展示区' },
   { id: 'SIPS', title: '全身炎症-牙周炎评分(SIPS)', content: '图表展示区' },
   { id: 'OSI', title: '骨骼-肌肉共病指数(OSI)', content: '图表展示区' },
   { id: 'MVIS', title: '微血管炎症评分(MVIS)', content: '图表展示区' },
   { id: 'IUII', title: '铁利用-炎症指数(IUII)', content: '图表展示区' },
   { id: 'VFIP', title: '内脏脂肪-炎症乘积(VFIP)', content: '图表展示区' },
   { id: 'UHR', title: '尿酸/高密度脂蛋白胆固醇比值(UHR)', content: '图表展示区' },
   { id: 'PRAS', title: '蛋白尿/视网膜病变/动脉硬化综合征(PRAS)', content: '图表展示区' },
   { id: 'B-C_Age_Gap', title: '生物年龄-年代年龄差(B-C_Age_Gap)', content: '图表展示区' },
   { id: 'MHDS', title: '多维稳态失调评分(MHDS)', content: '图表展示区' },
   { id: 'GHRQ', title: '综合健康风险五分位数(GHRQ)', content: '图表展示区' },
   { id: 'ODI', title: '口腔菌群失调指数(ODI)', content: '图表展示区' },
   { id: 'PSR', title: '痰湿-血瘀复合风险(PSR)', content: '图表展示区' },
   { id: 'QYDI', title: '气阴两虚指数(QYDI)', content: '图表展示区' },
   { id: 'PIBI', title: '牙周炎症负荷指数(PIBI)', content: '图表展示区' },
   { id: 'AII-2', title: '雄激素-炎症指数(AII-2)', content: '图表展示区' },
   { id: 'GLADS', title: '胃肠-肝轴失调评分(GLADS)', content: '图表展示区' },
   { id: 'ISI', title: '免疫衰老指数(ISI)', content: '图表展示区' },
   { id: 'ASRDI', title: '血管僵硬-肾损伤指数(ASRDI)', content: '图表展示区' },
   { id: 'MHCSI', title: '代谢健康-心血管结构指数(MHCSI)', content: '图表展示区' },
   { id: 'GPRI', title: '全局生理储备指数(GPRI)', content: '图表展示区' },
];


// 主组件：可重用的交互式菜单
function InteractiveMenu({ data }: { data: { id: string; title: string; content: string }[] }) {
    const [activeTab, setActiveTab] = useState(data[0].id);
    const activeTabData = data.find(tab => tab.id === activeTab);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto">
                {/* 左侧标签栏 */}
                <div className="lg:col-span-1 flex flex-col space-y-4 pr-2 h-[450px] self-start overflow-y-auto">
                    {data.map(tab => (
                        <TabButton
                            key={tab.id}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.title}
                        </TabButton>
                    ))}
                </div>

                {/* 右侧内容区 */}
                <div className="lg:col-span-2 rounded-2xl p-8 h-[450px] flex items-center justify-center">
                     <div className="text-center w-full h-full flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold text-gray-100 mb-4">{activeTabData?.title}</h2>
                        <div className="w-full h-full flex-grow rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                            <p className="text-gray-500">图表展示区</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
  const animatedValue = useMotionValue(0);
  const offset = useTransform(animatedValue, [0, 100], [circumference, 0]);

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
          <filter id={`dropshadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>
        <path d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`} fill="none" stroke="#374151" strokeWidth={strokeWidth} strokeLinecap="butt" filter={`url(#dropshadow-${size})`} />
        <motion.path d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`} fill="none" stroke={`url(#progressGradient-${size})`} strokeWidth={strokeWidth} strokeLinecap="butt" strokeDasharray={circumference} strokeDashoffset={offset} filter={`url(#dropshadow-${size})`} />
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

function HealthMetricsTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const chartData = [
    { title: "心血管-代谢域", value: 97 },
    { title: "炎症-免疫-营养域", value: 95 },
    { title: "多器官功能域", value: 90 },
    { title: "整合医学与跨领域", value: 93 },
  ];

  const tabContent = [
    <InteractiveMenu key="cardio" data={cardiovascularMetabolicData} />,
    <InteractiveMenu key="inflammation" data={inflammationImmunityNutritionData} />,
    <InteractiveMenu key="organ" data={multiOrganFunctionData} />,
    <InteractiveMenu key="integrative" data={integrativeMedicineData} />,
  ];

  return (
    <div className="w-full py-16">
        {/* Tabs Header */}
        <div className="flex flex-wrap justify-center gap-8">
            {chartData.map((chart, index) => (
                <div
                    key={index}
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => setActiveTab(index)}
                >
                    <div className="relative py-2">
                        <h3 className="text-3xl font-bold text-white">
                            {chart.title}
                        </h3>
                        {activeTab === index && (
                            <motion.div
                                className="absolute bottom-[-2px] left-1/4 w-1/2 h-0.5 bg-[#0cf2a0]"
                                layoutId="underline"
                            />
                        )}
                    </div>
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

        {/* Tabs Content Panel */}
        <div className="mt-12 mx-auto w-full max-w-7xl rounded-lg min-h-[600px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {tabContent[activeTab]}
                </motion.div>
            </AnimatePresence>
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
    <div className="relative bg-[#111111] text-gray-300 min-h-screen flex flex-col">
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

        {/* 主内容区域 */}
        <main className="flex-grow relative z-10 px-4 pt-24 pb-16">
            <div className="flex flex-col items-center text-center">
                <DemoHeroGeometric />
                <HealthMetricsTabs />
            </div>
        </main>

    </div>
  );
};

export default Page;
