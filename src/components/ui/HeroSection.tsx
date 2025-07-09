"use client";

import React, { useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';

// =======================================================================
//  ShaderBackground Component (Integrated)
//  这是被集成进来的着色器背景组件。
// =======================================================================
const ShaderBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 顶点着色器源代码
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    // 片段着色器源代码
    const fsSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
  
      const float overallSpeed = 0.2;
      const float gridSmoothWidth = 0.015;
      const float scale = 5.0;
      // 线条颜色为青绿色 (#0cf2a0)
      const vec4 lineColor = vec4(0.047, 0.949, 0.627, 1.0);
      const float minLineWidth = 0.01;
      const float maxLineWidth = 0.2;
      const float lineSpeed = 1.0 * overallSpeed;
      const float lineAmplitude = 1.0;
      const float lineFrequency = 0.2;
      const float warpSpeed = 0.2 * overallSpeed;
      const float warpFrequency = 0.5;
      const float warpAmplitude = 1.0;
      const float offsetFrequency = 0.5;
      const float offsetSpeed = 1.33 * overallSpeed;
      const float minOffsetSpread = 0.6;
      const float maxOffsetSpread = 2.0;
      const int linesPerGroup = 16;
  
      #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
      #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
      #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
  
      float random(float t) {
        return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
      }
  
      float getPlasmaY(float x, float horizontalFade, float offset) {
        return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
      }
  
      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        vec2 space = (gl_FragCoord.xy - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;
  
        float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
        float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);
  
        space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
        space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;
  
        vec4 lines = vec4(0.0);
        
        for(int l = 0; l < linesPerGroup; l++) {
          float normalizedLineIndex = float(l) / float(linesPerGroup);
          float offsetTime = iTime * offsetSpeed;
          float offsetPosition = float(l) + space.x * offsetFrequency;
          float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
          float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
          float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
          float linePosition = getPlasmaY(space.x, horizontalFade, offset);
          
          float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);
  
          float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
          vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
          float circle = drawCircle(circlePosition, 0.01, space) * 4.0;
  
          line = line + circle;
          lines += line * lineColor * rand;
        }
  
        vec4 fragColor = lines;
        fragColor *= verticalFade;
  
        gl_FragColor = fragColor;
      }
    `;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { alpha: true });
        if (!gl) {
            console.warn('WebGL not supported.');
            return;
        }

        const loadShader = (glContext: WebGLRenderingContext, type: number, source: string) => {
            const shader = glContext.createShader(type);
            if (!shader) return null;
            glContext.shaderSource(shader, source);
            glContext.compileShader(shader);
            if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
                console.error('Shader compile error: ', glContext.getShaderInfoLog(shader));
                glContext.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const initShaderProgram = (glContext: WebGLRenderingContext, vsSrc: string, fsSrc: string) => {
            const vertexShader = loadShader(glContext, glContext.VERTEX_SHADER, vsSrc);
            const fragmentShader = loadShader(glContext, glContext.FRAGMENT_SHADER, fsSrc);
            if (!vertexShader || !fragmentShader) return null;
            const shaderProgram = glContext.createProgram();
            if (!shaderProgram) return null;
            glContext.attachShader(shaderProgram, vertexShader);
            glContext.attachShader(shaderProgram, fragmentShader);
            glContext.linkProgram(shaderProgram);
            if (!glContext.getProgramParameter(shaderProgram, glContext.LINK_STATUS)) {
                console.error('Shader program link error: ', glContext.getProgramInfoLog(shaderProgram));
                return null;
            }
            return shaderProgram;
        };

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        if (!shaderProgram) return;

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
                time: gl.getUniformLocation(shaderProgram, 'iTime'),
            },
        };

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let startTime = Date.now();
        let animationFrameId: number;

        const render = () => {
            const currentTime = (Date.now() - startTime) / 1000;
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(programInfo.program);
            gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
            gl.uniform1f(programInfo.uniformLocations.time, currentTime);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [fsSource, vsSource]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-0" // 使用 absolute 定位并填充父容器
        />
    );
};


// =======================================================================
//  HeroGeometric Component
// =======================================================================
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
            {/* 背景：在这里调用 ShaderBackground 组件 */}
            <ShaderBackground />

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
                            <span style={{ color: '#FFC700' }}>
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

// =======================================================================
//  Default Export
// =======================================================================
/**
 * 这是最终导出的、合并后的英雄组件。
 * 它渲染了 HeroGeometric 组件。
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
