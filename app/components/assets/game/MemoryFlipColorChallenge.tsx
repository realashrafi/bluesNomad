//@ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Timer, Eye, EyeOff, Zap, Award, RotateCcw, Heart } from 'lucide-react';

export default function MemoryFlipColorChallenge() {
    const [tiles, setTiles] = useState([]);
    const [selectedTiles, setSelectedTiles] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [showColors, setShowColors] = useState(false);
    const [memorizePhase, setMemorizePhase] = useState(false);
    const [memorizeTime, setMemorizeTime] = useState(3);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [level, setLevel] = useState(1);
    const [message, setMessage] = useState('');
    const [bestScore, setBestScore] = useState(() => {
        return parseInt(localStorage.getItem('bestScore') || '0', 10);
    });
    const [lives, setLives] = useState(3);
    const [hints, setHints] = useState(3);
    const [stageTime, setStageTime] = useState(30);

    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500',
        'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500',
    ];

    const initGame = () => {
        const numTiles = 4 + level * 2;
        const gameColors = colors.slice(0, numTiles / 2);
        const tilesArray = [];

        for (let i = 0; i < gameColors.length; i++) {
            tilesArray.push(
                { id: i * 2, color: gameColors[i], matched: false, flipped: false },
                { id: i * 2 + 1, color: gameColors[i], matched: false, flipped: false }
            );
        }

        // Shuffle tiles
        for (let i = tilesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tilesArray[i], tilesArray[j]] = [tilesArray[j], tilesArray[i]];
        }

        setTiles(tilesArray);
        setSelectedTiles([]);
        setGameStarted(true);
        setShowColors(true);
        setMemorizePhase(true);
        setMemorizeTime(3);
        setStageTime(30 - (level - 1) * 2); // Decrease time per level
        setMessage('آماده‌باش! به رنگ‌ها نگاه کن');
        setGameOver(false);
    };

    useEffect(() => {
        if (memorizePhase && memorizeTime > 0) {
            const timer = setTimeout(() => {
                setMemorizeTime((prev) => Math.max(prev - 1, 0));
            }, 1000);
            return () => clearTimeout(timer);
        } else if (memorizePhase && memorizeTime === 0) {
            setMemorizePhase(false);
            setShowColors(false);
            setMessage('حالا جفت‌ها رو پیدا کن!');
        }
    }, [memorizePhase, memorizeTime]);

    useEffect(() => {
        if (!gameStarted || gameOver || memorizePhase) return;

        if (stageTime > 0) {
            const timer = setTimeout(() => {
                setStageTime((prev) => Math.max(prev - 1, 0));
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setLives((prev) => {
                const newLives = Math.max(prev - 1, 0);
                if (newLives === 0) {
                    setGameOver(true);
                    setMessage(`بازی تمام شد! امتیاز نهایی: ${score}`);
                    if (score > bestScore) {
                        setBestScore(score);
                        localStorage.setItem('bestScore', score.toString());
                    }
                } else {
                    setMessage('زمان تمام شد! یک قلب از دست رفت.');
                    setTimeout(() => {
                        initGame();
                    }, 1500);
                }
                return newLives;
            });
        }
    }, [stageTime, gameStarted, gameOver, memorizePhase]);

    useEffect(() => {
        if (selectedTiles.length === 2) {
            const [first, second] = selectedTiles;

            if (tiles[first].color === tiles[second].color) {
                const newTiles = [...tiles];
                newTiles[first].matched = true;
                newTiles[second].matched = true;
                setTiles(newTiles);
                const bonus = stageTime > 15 ? 5 * level : 0; // Bonus for quick completion
                const newScore = score + 10 * level + bonus;
                setScore(newScore);
                setMessage(`آفرین! یک جفت پیدا کردی!${bonus ? ` جایزه: ${bonus}` : ''}`);

                if (newTiles.every((tile) => tile.matched)) {
                    if (newScore > bestScore) {
                        setBestScore(newScore);
                        localStorage.setItem('bestScore', newScore.toString());
                    }
                    setLevel((prev) => {
                        const newLevel = prev + 1;
                        setHints((prevHints) => prevHints + 1); // Add hint per level
                        return newLevel;
                    });
                    setMessage('مرحله تمام شد! آماده‌ی مرحله‌ی بعدی باش!');
                    setTimeout(() => {
                        initGame();
                    }, 1500);
                }
            } else {
                setTimeout(() => {
                    const newTiles = [...tiles];
                    newTiles[first].flipped = false;
                    newTiles[second].flipped = false;
                    setTiles(newTiles);
                    setLives((prev) => {
                        const newLives = Math.max(prev - 1, 0);
                        if (newLives === 0) {
                            setGameOver(true);
                            setMessage(`بازی تمام شد! امتیاز نهایی: ${score}`);
                            if (score > bestScore) {
                                setBestScore(score);
                                localStorage.setItem('bestScore', score.toString());
                            }
                        } else {
                            setMessage('مطابقت نداشت، یک قلب از دست رفت!');
                        }
                        return newLives;
                    });
                }, 800);
            }

            setSelectedTiles([]);
        }
    }, [selectedTiles, score, level, bestScore, tiles, lives]);

    const handleTileClick = (index) => {
        if (
            memorizePhase ||
            tiles[index].flipped ||
            tiles[index].matched ||
            selectedTiles.length >= 2 ||
            gameOver
        ) {
            return;
        }

        const newTiles = [...tiles];
        newTiles[index].flipped = true;
        setTiles(newTiles);
        setSelectedTiles([...selectedTiles, index]);
    };

    const useHint = () => {
        if (hints > 0 && !memorizePhase && !gameOver) {
            setHints((prev) => prev - 1);
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
        setLevel(1);
        setLives(3);
        setHints(3);
        setGameOver(false);
        setMessage('');
        initGame();
    };

    return (
        <div className="flex mx-auto flex-col items-center justify-center rounded-lg  p-4 w-full max-w-3xl min-h-screen">
            <div className="w-full text-center mb-4">
                <h1 className="text-xl md:text-2xl font-bold ">بازی چالش حافظه رنگی</h1>
                <p className=" mt-1 text-base md:text-lg" dir="rtl">{message}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between w-full mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                    className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative  py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    <div className="flex items-center  rounded-lg px-3 py-1">
                        <Zap className="text-yellow-500 mr-1" size={20} />
                        <span className="font-bold text-sm md:text-base">امتیاز: {score}</span>
                    </div>
                </button>
                <button
                    className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative  py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    <div className="flex items-center  rounded-lg px-3 py-1">
                        <Award className="text-purple-500 mr-1" size={20} />
                        <span className="font-bold text-sm md:text-base">بهترین: {bestScore}</span>
                    </div>
                </button>
                <button
                    className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative  py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    <div className="flex items-center  rounded-lg px-3 py-1">
                        <Timer className="text-red-500 mr-1" size={20} />
                        <span className="font-bold text-sm md:text-base">مرحله: {level}</span>
                    </div>
                </button>
                <button
                    className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative  py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    <div className="flex items-center  rounded-lg px-3 py-1">
                        <Heart className="text-red-500 mr-1" size={20} />
                        <span className="font-bold text-sm md:text-base">قلب: {lives}</span>
                    </div>
                </button>
                <button
                    className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative  py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    <div className="flex items-center  rounded-lg px-3 py-1">
                        <Eye className="text-indigo-500 mr-1" size={20} />
                        <span className="font-bold text-sm md:text-base">راهنمایی: {hints}</span>
                    </div>
                </button>
            </div>

            {memorizePhase && (
                <div className="text-center mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-red-600">{memorizeTime}</div>
                    <p className="text-xs md:text-sm ">ثانیه تا شروع</p>
                </div>
            )}

            {!memorizePhase && !gameOver && (
                <div className="text-center mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-green-400">{stageTime}</div>
                    <p className="text-xs md:text-sm ">ثانیه باقی‌مانده</p>
                </div>
            )}

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
                        disabled={memorizePhase || tile.matched || gameOver}
                    />
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center mt-6 space-y-2 sm:space-y-0 sm:space-x-4">
                {!gameStarted ? (
                        <button
                            onClick={initGame}
                            className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                            <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                            شروع بازی
                        </button>
                ) : gameOver ? (
                    <button
                        onClick={restartGame}
                        className="flex items-center bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                        <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        <RotateCcw className="mr-1" size={20} />
                        بازی دوباره
                    </button>
                ) : (
                    <>
                        <button
                            onClick={useHint}
                            disabled={memorizePhase || hints === 0 || gameOver}
                            className="flex items-center bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                            <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                            <Eye className="mr-1" size={20} />
                            استفاده از راهنمایی
                        </button>
                        <button
                            onClick={restartGame}
                            className="flex items-center bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                            <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                            <RotateCcw className="mr-1" size={20} />
                            شروع مجدد
                        </button>
                    </>
                )}
            </div>

            <div className="mt-4 text-xs md:text-sm  text-center" dir="rtl">
                رنگ‌ها را به خاطر بسپار و جفت‌ها را پیدا کن! با هر مرحله، تعداد کارت‌ها افزایش می‌یابد.
            </div>
        </div>
    );
}