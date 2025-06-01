/* eslint-disable react/prop-types */
'use client';
import { useState, useEffect } from 'react';
import { Timer, Eye, RotateCcw, Heart, Zap, Award } from 'lucide-react';
import Cookies from 'js-cookie';
import { useMutation } from '@tanstack/react-query';
import LoadingMini from "@/app/components/assets/ui/LoadingMini";

interface Tile {
    id: number;
    color: string;
    matched: boolean;
    flipped: boolean;
}

interface MemoryFlipColorChallengeProps {
    levels?: number[]; // لیست سطوح (مثلاً [6, 7])
    totalTime?: number; // زمان کل هر مرحله (ثانیه)
    memorizeTime?: number; // زمان فاز به‌خاطرسپردن
    lives?: number; // تعداد جان‌ها
    hints?: number; // تعداد راهنمایی‌ها
    colors?: string[]; // لیست رنگ‌ها
    stage?: string; // شماره یا نام مرحله (به‌صورت string)
    isSuccess?: boolean; // موفقیت در مرحله
    isUsedHint?: boolean; // استفاده از راهنمایی
    unUsedHints?: number; // تعداد راهنمایی‌های استفاده‌نشده
    onGameOver?: (score: number, level: number, stage: string, isSuccess: boolean, isUsedHint: boolean, unUsedHints: number) => void; // کال‌بک پایان بازی
    onLevelComplete?: (level: number, score: number, stage: string, isSuccess: boolean, isUsedHint: boolean, unUsedHints: number) => void; // کال‌بک پایان سطح
}

const defaultColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500',
    'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500',
];

export default function MemoryFlipColorChallenge({
                                                     levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                                                     totalTime = 30,
                                                     memorizeTime = 3,
                                                     lives = 3,
                                                     hints = 3,
                                                     colors = defaultColors,
                                                     stage = '1',
                                                     isSuccess = false,
                                                     isUsedHint = false,
                                                     unUsedHints = 0,
                                                     onGameOver,
                                                     onLevelComplete,
                                                 }: MemoryFlipColorChallengeProps) {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [showColors, setShowColors] = useState(false);
    const [memorizePhase, setMemorizePhase] = useState(false);
    const [currentMemorizeTime, setCurrentMemorizeTime] = useState(memorizeTime);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [level, setLevel] = useState(levels[0] || 1);
    const [message, setMessage] = useState('');
    const [bestScore, setBestScore] = useState(0);
    const [currentLives, setCurrentLives] = useState(lives);
    const [currentHints, setCurrentHints] = useState(hints);
    const [stageTime, setStageTime] = useState(totalTime);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isClickLocked, setIsClickLocked] = useState(false);
    const [hasUsedHint, setHasUsedHint] = useState(isUsedHint);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedScore = localStorage.getItem('bestScore');
            setBestScore(parseInt(storedScore || '0', 10));
        }
        const token = Cookies.get('token');
        if (token) {
            setIsAuthenticated(true);
            setMessage('برای شروع بازی، دکمه شروع را فشار دهید');
        } else {
            setIsAuthenticated(false);
            setMessage('لطفاً ابتدا وارد حساب کاربری خود شوید');
            setGameStarted(false);
        }
    }, []);

    const saveScoreMutation = useMutation({
        mutationFn: async ({ score, level, stage, isSuccess, isUsedHint, unUsedHints }: {
            score: number;
            level: number;
            stage: string;
            isSuccess: boolean;
            isUsedHint: boolean;
            unUsedHints: number
        }) => {
            const response = await fetch('/api/game-scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
                body: JSON.stringify({ score, level, stage, isSuccess, isUsedHint, unUsedHints }),
            });
            if (!response.ok) {
                throw new Error('Failed to save score');
            }
            return response.json();
        },
        onSuccess: (data) => {
            console.log('Score saved:', data);
        },
        onError: (error) => {
            console.error('Error saving score:', error);
            setMessage('خطا در ذخیره امتیاز، لطفاً دوباره تلاش کنید');
        },
    });

    const initGame = (newLevel: number = levels[0]) => {
        const numTiles = 4 + newLevel * 2;
        const gameColors = colors.slice(0, numTiles / 2);
        const tilesArray: Tile[] = [];

        for (let i = 0; i < gameColors.length; i++) {
            tilesArray.push(
                { id: i * 2, color: gameColors[i], matched: false, flipped: false },
                { id: i * 2 + 1, color: gameColors[i], matched: false, flipped: false }
            );
        }

        for (let i = tilesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tilesArray[i], tilesArray[j]] = [tilesArray[j], tilesArray[i]];
        }

        setTiles(tilesArray);
        setSelectedTiles([]);
        setGameStarted(true);
        setShowColors(true);
        setMemorizePhase(true);
        setCurrentMemorizeTime(memorizeTime);
        setStageTime(totalTime - (newLevel - 1) * 2);
        setMessage('آماده‌باش! به رنگ‌ها نگاه کن');
        setGameOver(false);
        setLevel(newLevel);
        setHasUsedHint(false);
        setCurrentHints(hints);
    };

    useEffect(() => {
        if (memorizePhase && currentMemorizeTime > 0) {
            const timer = setInterval(() => {
                setCurrentMemorizeTime((prev) => Math.max(prev - 1, 0));
            }, 1000);
            return () => clearInterval(timer);
        } else if (memorizePhase && currentMemorizeTime === 0) {
            setMemorizePhase(false);
            setShowColors(false);
            setMessage('حالا جفت‌ها رو پیدا کن!');
        }
    }, [memorizePhase, currentMemorizeTime]);

// در useEffect مربوط به اتمام زمان یا جان‌ها
    useEffect(() => {
        if (!gameStarted || gameOver || memorizePhase) return;

        if (stageTime > 0) {
            const timer = setInterval(() => {
                setStageTime((prev) => Math.max(prev - 1, 0));
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setCurrentLives((prev) => {
                const newLives = Math.max(prev - 1, 0);
                if (!saveScoreMutation.isPending) {
                    // همیشه isSuccess=false چون بازیکن موفق به اتمام مرحله نشده
                    saveScoreMutation.mutate({ score, level, stage, isSuccess: false, isUsedHint: hasUsedHint, unUsedHints: currentHints });
                }

                if (newLives === 0) {
                    setGameOver(true);
                    setMessage(`بازی تمام شد! امتیاز نهایی: ${score}`);
                    if (score > bestScore) {
                        setBestScore(score);
                        localStorage.setItem('bestScore', score.toString());
                    }
                    onGameOver?.(score, level, stage, false, hasUsedHint, currentHints);
                } else {
                    setMessage('زمان تمام شد! یک قلب از دست رفت.');
                    setTimeout(() => {
                        initGame(level);
                    }, 1500);
                }
                return newLives;
            });
        }
    }, [stageTime, gameStarted, gameOver, memorizePhase, score, level, bestScore, stage, hasUsedHint, currentHints, onGameOver]);

// در useEffect مربوط به تکمیل سطح
    useEffect(() => {
        if (selectedTiles.length === 2) {
            setIsClickLocked(true);
            const [first, second] = selectedTiles;

            if (tiles[first].color === tiles[second].color) {
                const newTiles = [...tiles];
                newTiles[first].matched = true;
                newTiles[second].matched = true;
                setTiles(newTiles);
                const bonus = stageTime > totalTime / 2 ? 5 * level : 0;
                const newScore = score + 10 * level + bonus;
                setScore(newScore);
                setMessage(`آفرین! یک جفت پیدا کردی!${bonus ? ` جایزه: ${bonus}` : ''}`);

                if (newTiles.every((tile) => tile.matched)) {
                    // فقط در صورتی که سطح فعلی آخرین سطح باشد، isSuccess=true
                    const isLevelSuccess = level === levels[levels.length - 1];
                    if (!saveScoreMutation.isPending) {
                        saveScoreMutation.mutate({ score: newScore, level, stage, isSuccess: isLevelSuccess, isUsedHint: hasUsedHint, unUsedHints: currentHints });
                    }

                    if (newScore > bestScore) {
                        setBestScore(newScore);
                        localStorage.setItem('bestScore', newScore.toString());
                    }

                    const nextLevel = levels[levels.indexOf(level) + 1];
                    if (nextLevel) {
                        setLevel(nextLevel);
                        setCurrentHints((prev) => prev + 1);
                        setMessage('مرحله تمام شد! آماده‌ی مرحله‌ی بعدی باش!');
                        onLevelComplete?.(level, newScore, stage, isLevelSuccess, hasUsedHint, currentHints);
                        setTimeout(() => {
                            initGame(nextLevel);
                        }, 1500);
                    } else {
                        setGameOver(true);
                        setMessage(`بازی تمام شد! امتیاز نهایی: ${score}`);
                        onGameOver?.(score, level, stage, isLevelSuccess, hasUsedHint, currentHints);
                    }
                }
            } else {
                setTimeout(() => {
                    const newTiles = [...tiles];
                    newTiles[first].flipped = false;
                    newTiles[second].flipped = false;
                    setTiles(newTiles);
                    setCurrentLives((prev) => {
                        const newLives = Math.max(prev - 1, 0);
                        if (newLives === 0) {
                            setGameOver(true);
                            setMessage(`بازی تمام شد! امتیاز نهایی: ${score}`);
                            if (!saveScoreMutation.isPending) {
                                // همیشه isSuccess=false چون بازیکن موفق به اتمام مرحله نشده
                                saveScoreMutation.mutate({ score, level, stage, isSuccess: false, isUsedHint: hasUsedHint, unUsedHints: currentHints });
                            }
                            if (score > bestScore) {
                                setBestScore(score);
                                localStorage.setItem('bestScore', score.toString());
                            }
                            onGameOver?.(score, level, stage, false, hasUsedHint, currentHints);
                        } else {
                            setMessage('مطابقت نداشت، یک قلب از دست رفت!');
                        }
                        return newLives;
                    });
                    setIsClickLocked(false);
                }, 800);
            }

            setSelectedTiles([]);
        } else {
            setIsClickLocked(false);
        }
    }, [selectedTiles, score, level, bestScore, tiles, stage, hasUsedHint, currentHints, onGameOver, onLevelComplete, levels]);

    const handleTileClick = (index: number) => {
        if (
            memorizePhase ||
            tiles[index].flipped ||
            tiles[index].matched ||
            selectedTiles.length >= 2 ||
            gameOver ||
            !isAuthenticated ||
            isClickLocked
        ) {
            return;
        }

        const newTiles = [...tiles];
        newTiles[index].flipped = true;
        setTiles(newTiles);
        setSelectedTiles([...selectedTiles, index]);
    };

    const useHint = () => {
        if (currentHints > 0 && !memorizePhase && !gameOver && isAuthenticated) {
            setCurrentHints((prev) => prev - 1);
            setHasUsedHint(true);
            setShowColors(true);
            setMessage('راهنمایی استفاده شد!');
            setTimeout(() => {
                setShowColors(false);
                setMessage('حالا جفت‌ها رو پیدا کن!');
            }, 2000);
        }
    };

    const restartGame = () => {
        setScore(0);
        setLevel(levels[0] || 1);
        setCurrentLives(lives);
        setCurrentHints(hints);
        setHasUsedHint(false);
        setGameOver(false);
        setMessage('');
        setGameStarted(false);
        setTiles([]);
    };

    return (
        <div className="flex mx-auto flex-col items-center justify-center rounded-lg p-4 w-full max-w-3xl min-h-screen">
            <div className="w-full text-center mb-4">
                <h1 className="text-xl md:text-2xl font-bold">بازی چالش حافظه رنگی</h1>
                <p className="mt-1 text-base md:text-lg" dir="rtl">{message}</p>
                {saveScoreMutation.isPending && <LoadingMini />}
            </div>

            {isAuthenticated && (
                <div className="flex flex-col sm:flex-row justify-between w-full mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
                    <button className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                        <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        <div className="flex items-center rounded-lg px-3 py-1">
                            <Zap className="text-yellow-500 mr-1" size={20} />
                            <span className="font-bold text-sm md:text-base">امتیاز: {score}</span>
                        </div>
                    </button>
                    <button className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                        <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        <div className="flex items-center rounded-lg px-3 py-1">
                            <Award className="text-purple-500 mr-1" size={20} />
                            <span className="font-bold text-sm md:text-base">بهترین: {bestScore}</span>
                        </div>
                    </button>
                    <button className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                        <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        <div className="flex items-center rounded-lg px-3 py-1">
                            <Timer className="text-red-500 mr-1" size={20} />
                            <span className="font-bold text-sm md:text-base">مرحله: {level}</span>
                        </div>
                    </button>
                    <button className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                        <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        <div className="flex items-center rounded-lg px-3 py-1">
                            <Heart className="text-red-500 mr-1" size={20} />
                            <span className="font-bold text-sm md:text-base">قلب: {currentLives}</span>
                        </div>
                    </button>
                    <button className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                        <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        <div className="flex items-center rounded-lg px-3 py-1">
                            <Eye className="text-indigo-500 mr-1" size={20} />
                            <span className="font-bold text-sm md:text-base">راهنمایی: {currentHints}</span>
                        </div>
                    </button>
                </div>
            )}

            {isAuthenticated && memorizePhase && (
                <div className="text-center mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-red-600">{currentMemorizeTime}</div>
                    <p className="text-xs md:text-sm">ثانیه تا شروع</p>
                </div>
            )}

            {isAuthenticated && !memorizePhase && !gameOver && (
                <div className="text-center mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-green-400">{stageTime}</div>
                    <p className="text-xs md:text-sm">ثانیه باقی‌مانده</p>
                </div>
            )}

            {isAuthenticated && gameStarted && (
                <div
                    className="grid gap-2 w-full"
                    style={{
                        gridTemplateColumns: `repeat(auto-fit, minmax(${Math.min(80, 400 / (4 + level))}px, 1fr))`,
                    }}
                >
                    {tiles.map((tile, index) => (
                        <button
                            key={index}
                            onClick={() => handleTileClick(index)}
                            className={`w-full aspect-square rounded-lg shadow transition-all transform duration-300 ${
                                tile.flipped || tile.matched || memorizePhase || showColors
                                    ? tile.color
                                    : 'bg-gray-300'
                            } ${tile.matched ? 'opacity-50 scale-95' : 'hover:scale-105'} touch-action-manipulation`}
                            disabled={memorizePhase || tile.matched || gameOver || isClickLocked}
                            aria-label={`کارت ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center mt-6 space-y-2 sm:space-y-0 sm:space-x-4">
                {!isAuthenticated ? (
                    <button
                        disabled
                        className="bg-gray-500 text-gray-300 border border-gray-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md opacity-75 outline-none duration-300"
                    >
                        برای بازی باید وارد شوید
                    </button>
                ) : !gameStarted ? (
                    <button className="cursor-pointer" onClick={() => initGame(levels[0])}>
                        <div className="w-[83px] h-[83px] bg-green-50 rounded-full relative shadow-[inset_0px_0px_1px_1px_rgba(0,0,0,0.3),_2px_3px_5px_rgba(0,0,0,0.1)] flex items-center justify-center">
                            <div className="absolute w-[72px] h-[72px] z-10 bg-black rounded-full left-1/2 -translate-x-1/2 top-[5px] blur-[1px]"></div>
                            <label className="group cursor-pointer absolute w-[72px] h-[72px] bg-gradient-to-b from-green-600 to-green-400 rounded-full left-1/2 -translate-x-1/2 top-[5px] shadow-[inset_0px_4px_2px_#60a5fa,inset_0px_-4px_0px_#1e3a8a,0px_0px_2px_rgba(0,0,0,10)] active:shadow-[inset_0px_4px_2px_rgba(96,165,250,0.5),inset_0px_-4px_2px_rgba(37,99,235,0.5),0px_0px_2px_rgba(0,0,0,10)] z-20 flex items-center justify-center">
                                <div className="w-8 group-active:w-[31px] fill-green-100 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.5)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24">
                                        <path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"/>
                                    </svg>
                                </div>
                            </label>
                        </div>
                    </button>
                ) : gameOver ? (
                    <button
                        onClick={restartGame}
                        className="flex items-center bg-green-950 text-white border border-blue-400 border-b-4 font-medium overflow-hidden relative px-6 py-3 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group"
                    >
                        <span className="bg-blue-400 shadow-blue-400 absolute -top-[150%] left-0 inline-flex w-full h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        <RotateCcw className="mr-2" size={18} />
                        شروع مجدد
                    </button>
                ) : (
                    <button
                        onClick={useHint}
                        disabled={memorizePhase || currentHints === 0 || gameOver}
                        className="flex items-center bg-green-950 text-white border border-blue-600 border-b-4 font-medium overflow-hidden relative px-6 py-3 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group disabled:bg-gray-600 disabled:border-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                        <span className="bg-blue-600 shadow-lg absolute -top-[150%] left-0 inline-flex w-full h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        <Eye className="mr-3" size={20} />
                        استفاده از راهنمایی
                    </button>
                )}
            </div>

            <div className="mt-10 text-xs md:text-sm text-center" dir="rtl">
                رنگ‌ها را به خاطر بسپارید و جفت‌ها را پیدا کنید! با هر مرحله، تعداد کارت‌ها افزایش می‌یابد.
            </div>
        </div>
    );
}