/* eslint-disable */
//@ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Input } from '@/app/components/assets/ui/Input';

function Page() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [scannedId, setScannedId] = useState('');
    const [rank, setRank] = useState(null);
    const [rankError, setRankError] = useState(null);

    useEffect(() => {
        const token = Cookies.get('token');
        setIsAuthenticated(!!token);
    }, []);

    // تابع برای درخواست رتبه
    const fetchRank = async (userId) => {
        try {
            const response = await fetch('/api/rank', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'خطا در دریافت رتبه');
            }
            const data = await response.json();
            setRank(data);
            setRankError(null);
        } catch (err) {
            setRankError(err.message);
            setRank(null);
        }
    };

    // مدیریت اسکن بارکد
    const handleScan = (userId) => {
        setScannedId(userId);
        fetchRank(userId);
    };

    // مدیریت ورودی دستی
    const handleManualSubmit = () => {
        if (manualInput) {
            fetchRank(manualInput);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <p className="text-base md:text-lg text-red-500" dir="rtl">
                    لطفاً ابتدا وارد شوید
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-xl md:text-2xl mb-6" dir="rtl">بررسی بارکد</h1>
            <div className="w-full max-w-md mb-6">
                {/* اسکنر بارکد */}
                <div className="mb-4 flex items-center justify-center flex-col gap-2">
                    <div className="relative w-[300px] h-[300px] lg:mb-0 mb-32">
                        <BarcodeScannerComponent
                            width={300}
                            height={300}
                            onUpdate={(err, result) => {
                                if (result) {
                                    handleScan(result.text);
                                }
                            }}
                        />
                        {/* افکت اسکن */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="scan-line w-full h-1 bg-green-500 opacity-70 animate-scan" />
                        </div>
                        <div className="absolute inset-0 rounded-md opacity-50" />
                    </div>
                    <p className="text-sm text-center" dir="rtl">
                        شناسه اسکن‌شده: {scannedId || 'هیچ'}
                    </p>
                </div>
                {/* ورودی دستی */}
                <div className="flex flex-col gap-2">
                    <div>
                        <label className="">بارکد</label>
                        <Input
                            type="text"
                            className="w-full text-black p-2 border rounded"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        onClick={handleManualSubmit}
                        className="bg-green-950 text-green-400 border border-green-400 p-2 rounded hover:brightness-150"
                    >
                        بررسی
                    </button>
                </div>
                {/* نمایش مدال برای رتبه یا برنده */}
                {(rank || rankError) && (
                    <div className="medal-container mt-6 flex flex-col items-center">
                        {rank && (
                            <div className="medal fixed top-36 bg-yellow-500 text-white rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-lg animate-pop">
                                <p className="text-lg font-bold" dir="rtl">رتبه</p>
                                <p className="text-3xl font-bold" dir="rtl">{rank.rank}</p>
                            </div>
                        )}
                        {rank?.isTopFive === true && (
                            <div className="medal fixed top-80 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full w-48 h-48 flex flex-col items-center justify-center shadow-lg animate-pop mt-4">
                                <p className="text-lg font-bold" dir="rtl">برنده</p>
                                <p className="text-sm text-center px-2" dir="rtl">
                                    تبریک! شما به عنوان برنده جایزه بزرگ انتخاب شدید!
                                </p>
                            </div>
                        )}
                        {rankError && (
                            <div className="medal fixed top-36 bg-red-500 text-white rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-lg animate-pop">
                                <p className="text-lg font-bold" dir="rtl">خطا</p>
                                <p className="text-sm text-center px-2" dir="rtl">{rankError}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* استایل‌های افکت اسکن و مدال */}
            <style jsx global>{`
                .animate-scan {
                    animation: scan 2s infinite linear;
                }
                @keyframes scan {
                    0% {
                        transform: translateY(-150px);
                    }
                    50% {
                        transform: translateY(150px);
                    }
                    100% {
                        transform: translateY(-150px);
                    }
                }
                .medal-container {
                    position: relative;
                    z-index: 10;
                }
                .medal {
                    border: 4px solid #ffd700;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
                }
                .animate-pop {
                    animation: pop 0.5s ease-out;
                }
                @keyframes pop {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    80% {
                        transform: scale(1.1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}

export default Page;