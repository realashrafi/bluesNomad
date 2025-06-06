'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Loading from '@/app/components/assets/ui/Loading';

interface RoomData {
    roomId: string;
    sideA: string[];
    sideB: string[];
    readyUsers: string[];
    isActive: boolean;
    grid?: number[];
    startTime?: number;
}

interface ReactionTime {
    userId: string;
    reactionTime: number;
}

interface GameResult {
    sideAReactionTimes: ReactionTime[];
    sideBReactionTimes: ReactionTime[];
    winner: 'SideA' | 'SideB' | 'Draw';
}

const ReactionGame: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [grid, setGrid] = useState<number[]>(Array(8).fill(0));
    const [gameStarted, setGameStarted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [clickTime, setClickTime] = useState<number | null>(null);

    useEffect(() => {
        const token = Cookies.get('token');
        setIsAuthenticated(!!token);

        const fetchUserId = async () => {
            if (!token) return;
            try {
                console.log('Fetching user ID...');
                const res = await fetch('/api/game/userid', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                console.log('User ID response:', data);
                if (data.userId) {
                    setUserId(data.userId);
                } else {
                    setError('Failed to fetch user ID');
                }
            } catch (e) {
                console.error('Error fetching user ID:', e);
                setError('Invalid token');
            }
        };

        fetchUserId();

        const pollRoom = async () => {
            if (!token || !roomId) return;
            try {
                console.log('Polling room:', roomId);
                const res = await fetch(`/api/game/${roomId}/check_room`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                console.log('Check room response:', data);
                if (data.error === 'Room not found') {
                    setError('اتاق یافت نشد. به لابی برگردید.');
                    setTimeout(() => router.push('/join-room'), 2000);
                } else if (data.error) {
                    setError(data.error);
                } else {
                    setRoomData(data.room);
                    setGameResult(data.gameResult);
                    setGameStarted(data.room.isActive && !!data.room.grid);
                    if (data.room.grid) {
                        setGrid(data.room.grid);
                    }
                }
            } catch (e) {
                console.error('Error polling room:', e);
                setError('Failed to fetch room');
            }
        };

        pollRoom();
        const interval = setInterval(pollRoom, 2000);
        return () => clearInterval(interval);
    }, [roomId, router]);

    const setReady = async () => {
        const token = Cookies.get('token');
        try {
            console.log('Setting ready for room:', roomId);
            const res = await fetch(`/api/game/${roomId}/ready`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            console.log('Ready response:', data);
            if (data.error) {
                setError(data.error);
            } else {
                setRoomData(data.room);
                setIsReady(true);
            }
        } catch (e) {
            console.error('Error setting ready:', e);
            setError('Failed to set ready');
        }
    };

    const handleCellClick = async (cellId: number) => {
        if (!gameStarted || grid[cellId] !== 1 || !roomData?.startTime || clickTime) return;
        const token = Cookies.get('token');
        const reactionTime = Date.now() - roomData.startTime;
        setClickTime(reactionTime);
        try {
            console.log('Cell clicked:', { cellId, reactionTime });
            const res = await fetch(`/api/game/${roomId}/cell_click`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cellId, reactionTime }),
            });
            const data = await res.json();
            console.log('Cell click response:', data);
            if (data.error) {
                setError(data.error);
            }
        } catch (e) {
            console.error('Error processing click:', e);
            setError('Failed to process click');
        }
    };

    if (!isAuthenticated) {
        return <div className="text-red-500">لطفاً وارد شوید</div>;
    }

    if (error) {
        return <div className="text-red-500">خطا: {error}</div>;
    }

    if (!roomId || !roomData) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl mb-4">بازی Reaction Time - اتاق {roomId}</h1>
            {!gameStarted && isReady && <p>منتظر آماده شدن بقیه...</p>}
            <div className="mb-4">
                <p>تیم A: {roomData.sideA.map((id) => id.toString().slice(-4)).join(', ')}</p>
                <p>تیم B: {roomData.sideB.map((id) => id.toString().slice(-4)).join(', ')}</p>
                <p>آماده: {roomData.readyUsers.map((id) => id.toString().slice(-4)).join(', ')}</p>
            </div>
            {!gameStarted && (roomData.sideA.includes(userId!) || roomData.sideB.includes(userId!)) && !isReady && (
                <button
                    onClick={setReady}
                    className="mb-4 px-4 py-2 bg-green-950 text-green-400 border border-green-400 rounded-md"
                >
                    آماده‌ام
                </button>
            )}
            {gameStarted && (
                <div className="grid grid-cols-8 gap-2 w-80 h-10">
                    {grid.map((value, index) => (
                        <div
                            key={index}
                            onClick={() => handleCellClick(index)}
                            className={`w-10 h-10 border border-gray-400 cursor-pointer ${
                                value === 1 ? 'bg-green-400' : 'bg-gray-800'
                            } ${index < 4 ? 'border-l-4 border-l-blue-500' : 'border-r-4 border-r-red-500'}`}
                        />
                    ))}
                </div>
            )}
            {gameResult && (
                <div className="mt-4">
                    <h2>نتیجه بازی:</h2>
                    <p>برنده: {gameResult.winner === 'SideA' ? 'تیم A' : gameResult.winner === 'SideB' ? 'تیم B' : 'مساوی'}</p>
                    <p>
                        میانگین تیم A:{' '}
                        {(
                            gameResult.sideAReactionTimes.reduce((sum, r) => sum + r.reactionTime, 0) /
                            gameResult.sideAReactionTimes.length
                        ).toFixed(2)}{' '}
                        میلی‌ثانیه
                    </p>
                    <p>
                        میانگین تیم B:{' '}
                        {(
                            gameResult.sideBReactionTimes.reduce((sum, r) => sum + r.reactionTime, 0) /
                            gameResult.sideBReactionTimes.length
                        ).toFixed(2)}{' '}
                        میلی‌ثانیه
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReactionGame;