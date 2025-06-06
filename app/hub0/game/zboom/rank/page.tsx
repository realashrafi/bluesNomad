/* eslint-disable */
//@ts-nocheck
'use client'
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import {Input} from "@/app/components/assets/ui/Input";

function page() {
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
            setRank(data.rank);
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
                    <BarcodeScannerComponent
                        width={300}
                        height={300}
                        onUpdate={(err, result) => {
                            if (result) {
                                handleScan(result.text);
                            }
                        }}
                    />
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
                            className="w-full  text-black p-2 border rounded"
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
                {/* نمایش رتبه یا خطا */}
                {rank && (
                    <p className="text-base md:text-lg text-green-400 text-center mt-4" dir="rtl">
                        شماره شما: {rank}
                    </p>
                )}
                {rankError && (
                    <p className="text-base md:text-lg text-red-500 text-center mt-4" dir="rtl">
                        خطا: {rankError}
                    </p>
                )}
            </div>
        </div>
    );
}

export default page;