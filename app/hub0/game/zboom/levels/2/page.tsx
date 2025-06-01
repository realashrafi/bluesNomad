import React from 'react';
import MemoryFlipColorChallenge from "@/app/components/assets/game/MemoryFlipColorChallenge";

function Page() {
    return (
        <div>
            <MemoryFlipColorChallenge
                stage={'stage2'}
                levels={[4,5]}
                totalTime={95}
                memorizeTime={5}
                lives={5} // 5 جان
                hints={3} // 2 راهنمایی
                // onGameOver={(score, level) => console.log(`Game Over! Score: ${score}, Level: ${level}`)}
                // onLevelComplete={(level, score) => console.log(`Level ${level} completed with score: ${score}`)}
            />
        </div>
    );
}

export default Page;