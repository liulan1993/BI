"use client";

import { motion, type Variants } from 'framer-motion';

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
const DemoHeroGeometric = () => {
    return (
        <HeroGeometric
            title1="指标量化"
            title2="动态分析模型"
        />
    );
}

export default DemoHeroGeometric;
