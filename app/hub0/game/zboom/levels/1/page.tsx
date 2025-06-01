'use client'
import React from 'react';
import MemoryFlipColorChallenge from "@/app/components/assets/game/MemoryFlipColorChallenge";

function Page() {
    return (
        <div>
            <MemoryFlipColorChallenge
                stage={'stage1'}
                levels={[1, 2,3]}
                totalTime={75}
                memorizeTime={5}
                lives={5} // 5 جان
                hints={2} // 2 راهنمایی
                // onGameOver={(score, level) => console.log(`Game Over! Score: ${score}, Level: ${level}`)}
                // onLevelComplete={(level, score) => console.log(`Level ${level} completed with score: ${score}`)}
            />
        </div>
    );
}

export default Page;