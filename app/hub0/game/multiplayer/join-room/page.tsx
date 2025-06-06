'use client';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/assets/ui/Loading';

interface Room {
    roomId: string;
    gameMode: '1v1' | '2v2' | '3v3' | '4v4';
    sideA: string[];
    sideB: string[];
    isActive: boolean;
}

const JoinRoomPage: React.FC = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [newRoomId, setNewRoomId] = useState('');
    const [gameMode, setGameMode] = useState<'1v1' | '2v2' | '3v3' | '4v4'>('1v1');
    const [side, setSide] = useState<'SideA' | 'SideB'>('SideA');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('token');
        setIsAuthenticated(!!token);

        const fetchRooms = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/game/rooms', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                } else {
                    setRooms(data.rooms);
                }
            } catch (e) {
                setError('Failed to fetch rooms');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const createRoom = async () => {
        const token = Cookies.get('token');
        if (!newRoomId) {
            setError('لطفاً یک ID برای اتاق وارد کنید');
            return;
        }
        try {
            const res = await fetch('/api/game/create_room', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId: newRoomId, gameMode, side }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                router.push(`/hub0/game/multiplayer/${newRoomId}`);
            }
        } catch (e) {
            setError('Failed to create room');
        }
    };

    const joinRoom = async (roomId: string) => {
        const token = Cookies.get('token');
        try {
            const res = await fetch(`/api/game/${roomId}/join_room`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameMode, side }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                router.push(`/hub0/game/multiplayer/${roomId}`);
            }
        } catch (e) {
            setError('Failed to join room');
        }
    };

    if (!isAuthenticated) {
        return <div className="text-red-500">لطفاً وارد شوید</div>;
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl mb-4">لابی بازی Reaction Time</h1>
            {error && <div className="text-red-500 mb-4">خطا: {error}</div>}
            <div className="mb-8 w-full max-w-md text-black">
                <h2 className="text-xl mb-2 text-white">ساخت اتاق جدید</h2>
                <input
                    type="text"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    placeholder="ID اتاق (مثال: room123)"
                    className="mb-2 p-2 w-full border border-gray-400 rounded"
                />
                <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value as '1v1' | '2v2' | '3v3' | '4v4')}
                    className="mb-2 p-2 w-full border border-gray-400 rounded"
                >
                    <option value="1v1">۱ به ۱</option>
                    <option value="2v2">۲ به ۲</option>
                    <option value="3v3">۳ به ۳</option>
                    <option value="4v4">۴ به ۴</option>
                </select>
                <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as 'SideA' | 'SideB')}
                    className="mb-2 p-2 w-full border border-gray-400 rounded"
                >
                    <option value="SideA">تیم A</option>
                    <option value="SideB">تیم B</option>
                </select>
                <button
                    onClick={createRoom}
                    className="px-4 py-2 bg-green-950 text-green-400 border border-green-400 rounded-md w-full"
                >
                    ساخت اتاق
                </button>
            </div>
            <div className="w-full max-w-md">
                <h2 className="text-xl mb-2">اتاق‌های موجود</h2>
                {rooms.length === 0 ? (
                    <p>هیچ اتاقی موجود نیست</p>
                ) : (
                    <ul className="space-y-2">
                        {rooms.map((room) => (
                            <li
                                key={room.roomId}
                                className="flex justify-between items-center p-2 border border-gray-400 rounded"
                            >
                <span>
                  {room.roomId} ({room.gameMode}) - تیم A: {room.sideA.length} | تیم B: {room.sideB.length}
                </span>
                                <button
                                    onClick={() => joinRoom(room.roomId)}
                                    disabled={room.isActive}
                                    className={`px-4 py-2 rounded-md ${
                                        room.isActive
                                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                            : 'bg-green-950 text-green-400 border border-green-400'
                                    }`}
                                >
                                    پیوستن
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default JoinRoomPage;