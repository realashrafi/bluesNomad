'use client'
import React, {useEffect, useState} from 'react';
import MemoryFlipColorChallenge from "@/app/components/assets/game/MemoryFlipColorChallenge";
import {useQuery} from "@tanstack/react-query";
import Cookies from "js-cookie";
import Loading from "@/app/components/assets/ui/Loading";

function Page() {
    const [canPlay, setCanPlay] = useState(false)
    const {data, isLoading} = useQuery({
        queryKey: ['user-stages'],
        queryFn: async () => {
            const response = await fetch('/api/user-stages', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('خطا در دریافت ');
            }
            return response.json();
        },
        enabled: true,
        staleTime: 2 * 60 * 1000,
    });
    useEffect(() => {
        const exceptRoutes = ['stage1','stage2','stage3','stage4','stage5','stage6','stage7','stage8'];
        if (data?.canPlayRoutes) { // بررسی وجود canPlayRoutes
            const isAllInCanPlayRoutes = exceptRoutes.every(route =>
                data.canPlayRoutes.includes(route)
            );
            setCanPlay(isAllInCanPlayRoutes);
        } else {
            setCanPlay(false);
        }
    }, [data, setCanPlay]);
    // console.log(canPlay)
    if (!canPlay) {
        return <Loading/>;
    }
    if (isLoading) {
        return <Loading />;
    }
    return (
        <div>
            <MemoryFlipColorChallenge
                stage={'stage8'}
                levels={[10]}
                totalTime={220}
                memorizeTime={13}
                lives={7} // 5 جان
                hints={10} // 2 راهنمایی
                // onGameOver={(score, level) => console.log(`Game Over! Score: ${score}, Level: ${level}`)}
                // onLevelComplete={(level, score) => console.log(`Level ${level} completed with score: ${score}`)}
            />
        </div>
    );
}

export default Page;