"use client";

import React, { useRef, useEffect, useCallback } from 'react';

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

export default PixelCanvas;
