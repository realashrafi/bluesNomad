'use client'
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// تعریف تایپ برای props پارتیکل
interface ParticleProps {
    x: number;
    y: number;
    color: string;
}

// کامپوننت پارتیکل تکی
const Particle: React.FC<ParticleProps> = ({ x, y, color }) => {
    return (
        <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{
                backgroundColor: color,
                left: `${x}%`,
                top: `${y}%`,
            }}
            initial={{
                opacity: 1,
                scale: 1,
                y: 0,
            }}
            animate={{
                y: [0, -100, -200, -300], // حرکت به سمت بالا
                opacity: [1, 0.8, 0.5, 0], // محو شدن تدریجی
                scale: [1, 1.2, 0.8, 0], // تغییر اندازه
                x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100, Math.random() * 300 - 150], // حرکت تصادفی در محور X
            }}
            transition={{
                duration: 3 + Math.random() * 2, // مدت زمان انیمیشن بین 3 تا 5 ثانیه
                ease: "easeOut",
                repeat: Infinity, // تکرار بی‌نهایت
                delay: Math.random() * 1, // تاخیر تصادفی برای هر پارتیکل
            }}
        />
    );
};

// تعریف تایپ برای داده‌های پارتیکل
interface ParticleData {
    x: number;
    y: number;
    color: string;
}

// کامپوننت اصلی افکت جشن
const CelebrationEffect: React.FC = () => {
    const [particles, setParticles] = useState<ParticleData[]>([]);

    // تولید پارتیکل‌ها با موقعیت و رنگ تصادفی
    useEffect(() => {
        const newParticles: ParticleData[] = [];
        const colors: string[] = [
            "#ff6b6b", // قرمز
            "#4ecdc4", // فیروزه‌ای
            "#45b7d1", // آبی
            "#96c93d", // سبز
            "#f7d794", // زرد
        ];

        for (let i = 0; i < 100; i++) {
            newParticles.push({
                x: Math.random() * 100, // موقعیت تصادفی در عرض صفحه
                y: Math.random() * 100, // موقعیت تصادفی در ارتفاع صفحه
                color: colors[Math.floor(Math.random() * colors.length)], // رنگ تصادفی
            });
        }
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
            {particles.map((particle, index) => (
                <Particle
                    key={index}
                    x={particle.x}
                    y={particle.y}
                    color={particle.color}
                />
            ))}
        </div>
    );
};

export default CelebrationEffect;