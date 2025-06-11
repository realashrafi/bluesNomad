/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';

// تعریف تایپ‌ها
interface Prize {
    id: number;
    name: string;
    color: string;
    emoji: string;
    bgColor: string;
}

// تابع شافل برای مرتب‌سازی تصادفی
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const PrizeTiles: React.FC = () => {
    const initialPrizes: Prize[] = [
        { id: 1, name: 'جایزه', color: 'from-pink-500 to-rose-500', emoji: '1', bgColor: 'bg-pink-500/10' },
        { id: 2, name: 'جایزه', color: 'from-emerald-500 to-teal-500', emoji: '2', bgColor: 'bg-emerald-500/10' },
        { id: 3, name: 'جایزه', color: 'from-blue-500 to-indigo-500', emoji: '3', bgColor: 'bg-blue-500/10' },
        { id: 4, name: 'جایزه', color: 'from-purple-500 to-violet-500', emoji: '4', bgColor: 'bg-purple-500/10' },
        { id: 5, name: 'جایزه', color: 'from-amber-500 to-orange-500', emoji: '5', bgColor: 'bg-amber-500/10' },
    ];

    const [prizes, setPrizes] = useState<Prize[]>(initialPrizes); // بدون شافل اولیه
    const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
    const [wonPrizes, setWonPrizes] = useState<Prize[]>([]);
    const [isRevealing, setIsRevealing] = useState<boolean>(false);
    const [clickedTile, setClickedTile] = useState<number | null>(null);

    // شافل کردن تایل‌ها فقط در سمت کلاینت
    useEffect(() => {
        setPrizes(shuffleArray(initialPrizes));
    }, []); // فقط یک‌بار بعد از mount اجرا می‌شه

    const selectPrize = (prize: Prize): void => {
        if (isRevealing) return;

        setIsRevealing(true);
        setClickedTile(prize.id);
        setSelectedPrize(null);

        // شبیه‌سازی انتظار برای افکت تعلیق
        setTimeout(() => {
            setSelectedPrize(prize);
            setWonPrizes((prev) => [...prev, prize]);
            setPrizes((prev) => prev.filter((p) => p.id !== prize.id));

            setTimeout(() => {
                setIsRevealing(false);
                setClickedTile(null);
            }, 1500);
        }, 1500);
    };

    const resetGame = (): void => {
        setPrizes(shuffleArray(initialPrizes)); // شافل هنگام ریست
        setSelectedPrize(null);
        setWonPrizes([]);
        setIsRevealing(false);
        setClickedTile(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br -mt-2 from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* پس‌زمینه متحرک */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl">
                {/* عنوان */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-4">
                        جایزه
                    </h1>
                    <p dir={'rtl'} className="text-xl text-gray-300 font-medium">جایزه رو کشف کن!</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
                </div>

                {prizes.length > 0 ? (
                    <>
                        {/* تایل‌های جایزه */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                            {prizes.map((prize, index) => (
                                <div
                                    key={prize.id}
                                    onClick={() => selectPrize(prize)}
                                    className={`relative group cursor-pointer transform transition-all duration-500 ${
                                        clickedTile === prize.id
                                            ? 'scale-110 z-20'
                                            : isRevealing
                                                ? 'scale-95 opacity-50'
                                                : 'hover:scale-105 hover:-rotate-2'
                                    }`}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    {/* افکت نوری پس‌زمینه */}
                                    <div
                                        className={`absolute -inset-1 bg-gradient-to-r ${prize.color} rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500`}
                                    ></div>

                                    {/* تایل اصلی */}
                                    <div
                                        className={`relative ${prize.bgColor} backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl h-40 flex flex-col items-center justify-center text-center transition-all duration-300 group-hover:border-white/40`}
                                    >
                                        {/* حالت عادی (مخفی) */}
                                        {clickedTile !== prize.id && (
                                            <>
                                                <div className="text-5xl mb-3 group-hover:scale-110 transition duration-300">❓</div>
                                                <div className="text-white font-bold text-sm leading-tight">جایزه مخفی</div>
                                            </>
                                        )}

                                        {/* حالت انتخاب شده */}
                                        {clickedTile === prize.id && (
                                            <div className="animate-pulse">
                                                <div className="text-6xl mb-2 animate-bounce">✨</div>
                                                <div className="text-white font-bold text-sm">در حال باز کردن...</div>
                                            </div>
                                        )}

                                        {/* افکت کلیک */}
                                        <div
                                            className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-active:opacity-100 transition-opacity duration-150"
                                        ></div>
                                    </div>

                                    {/* شماره تایل */}
                                    <div
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 shadow-lg"
                                    >
                                        {index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* راهنما */}
                        <div className="text-center mb-8">
                            <p className="text-gray-400 text-lg">👆 روی هر جایزه کلیک کن تا جایزه مخفی رو کشف کنی!</p>
                        </div>
                    </>
                ) : (
                    <div className="text-center mb-12 p-12 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20">
                        <div className="text-8xl mb-6 animate-bounce">🎉</div>
                        <h2 className="text-4xl font-bold text-white mb-4">تمام جوایز تموم شد!</h2>
                        <p className="text-xl text-gray-300">همه جایزه ها کشف شد! فوق‌العاده بود! 🏆</p>
                    </div>
                )}

                {/* دکمه ری‌ست */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={resetGame}
                        disabled={isRevealing}
                        className={`group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform ${
                            isRevealing
                                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed scale-95'
                                : 'bg-gradient-to-r from-red-500 via-purple-500 to-purple-600 text-white hover:scale-110 hover:-rotate-2 active:scale-95 shadow-2xl hover:shadow-pink-500/25'
                        }`}
                    >
                        <div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400 to-purple-400 opacity-0 transition-opacity duration-300 blur animate-pulse ${
                                isRevealing ? 'opacity-0' : 'group-hover:opacity-75'
                            }`}
                        ></div>
                        <span className="relative z-10 flex items-center gap-2">🔄 شروع مجدد</span>
                    </button>
                </div>

                {/* پنل‌های اطلاعات */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* جایزه برنده */}
                    {selectedPrize && (
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl animate-pulse">
                            <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                🏆 آخرین جایزه برنده
                            </h3>
                            <div className="text-center p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl">
                                <div className="text-6xl mb-4 animate-bounce">{selectedPrize.emoji}</div>
                                <div className="text-2xl font-bold text-white">{selectedPrize.name}</div>
                            </div>
                        </div>
                    )}

                    {/* آمار */}
                {/*    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">*/}
                {/*        <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">*/}
                {/*            📊 آمار بازی*/}
                {/*        </h3>*/}
                {/*        <div className="space-y-4">*/}
                {/*            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">*/}
                {/*                <span className="text-white font-medium">تایل‌های باقی‌مانده:</span>*/}
                {/*                <span className="text-2xl font-bold text-green-400">{prizes.length}</span>*/}
                {/*            </div>*/}
                {/*            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">*/}
                {/*                <span className="text-white font-medium">جوایز برده شده:</span>*/}
                {/*                <span className="text-2xl font-bold text-purple-400">{wonPrizes.length}</span>*/}
                {/*            </div>*/}
                {/*            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">*/}
                {/*                <span className="text-white font-medium">پیشرفت:</span>*/}
                {/*                <span className="text-lg font-bold text-yellow-400">*/}
                {/*  {Math.round((wonPrizes.length / initialPrizes.length) * 100)}%*/}
                {/*</span>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                    {/* جوایز برده شده */}
                    {wonPrizes.length > 0 && (
                        <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                            <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                ✨ مجموعه جوایز شما ({wonPrizes.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {wonPrizes.map((prize, index) => (
                                    <div
                                        key={prize.id}
                                        className="flex flex-col items-center gap-2 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 hover:scale-105 transition-all duration-300 border border-white/10"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <span className="text-3xl">{prize.emoji}</span>
                                        <span className="text-white font-medium text-center text-xs leading-tight">
                      {prize.name}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrizeTiles;