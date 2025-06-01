import React from 'react';
import MemoryFlipColorChallenge from "@/app/components/assets/game/MemoryFlipColorChallenge";

function Page() {
    return (
        <div>
         <MemoryFlipColorChallenge
            levels={[6, 7]} // فقط سطوح 6 و 7
            totalTime={20} // 20 ثانیه برای هر مرحله
            memorizeTime={5} // 5 ثانیه برای به‌خاطرسپردن
            lives={5} // 5 جان
            hints={2} // 2 راهنمایی
            colors={['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500']} // رنگ‌های سفارشی
            onGameOver={(score, level) => console.log(`Game Over! Score: ${score}, Level: ${level}`)}
            onLevelComplete={(level, score) => console.log(`Level ${level} completed with score: ${score}`)}
        />
        </div>
    );
}

export default Page;