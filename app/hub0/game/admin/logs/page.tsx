'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import Loading from '@/app/components/assets/ui/Loading';
import { TbMoodEmptyFilled } from 'react-icons/tb';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// تعریف نوع‌ها برای پاسخ API
interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface GameLog {
    score: number;
    level: number;
    stage: string;
    isSuccess: boolean;
    isUsedHint: boolean;
    unUsedHints: number;
    timestamp: string;
}

interface UserData {
    user: User;
    gameLogs: GameLog[];
}

interface ApiResponse {
    users: UserData[];
}

// تابع برای فراخوانی API
const fetchAdminLogs = async (): Promise<ApiResponse> => {
    const token = Cookies.get('token');
    if (!token) {
        throw new Error('توکن یافت نشد');
    }

    const response = await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در دریافت اطلاعات');
    }

    return response.json();
};

function Page() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

    // بررسی وجود توکن
    useEffect(() => {
        const token = Cookies.get('token');
        setIsAuthenticated(!!token);
    }, []);

    // استفاده از useQuery برای فراخوانی API
    const { data, isLoading, error } = useQuery<ApiResponse, Error>({
        queryKey: ['adminLogs'],
        queryFn: fetchAdminLogs,
        enabled: isAuthenticated,
    });

    // تابع برای مدیریت گسترش/جمع شدن ردیف‌ها
    const toggleRow = (userId: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    // حالت عدم احراز هویت
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 ">
                <p className="text-lg md:text-xl font-semibold text-red-600 animate-pulse" dir="rtl">
                    لطفاً ابتدا وارد سیستم شوید
                </p>
            </div>
        );
    }

    // حالت لودینگ
    if (isLoading) {
        return <Loading />;
    }

    // حالت خطا
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 ">
                <p className="text-lg md:text-xl font-semibold text-red-600" dir="rtl">
                    خطا در دریافت اطلاعات: {error.message}
                </p>
            </div>
        );
    }

    // اگر داده‌ای وجود نداشته باشد
    if (!data || !data.users || data.users.length === 0) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center min-h-screen p-4 ">
                <p className="text-lg md:text-xl font-semibold text-gray-700 animate-pulse" dir="rtl">
                    داده‌ای یافت نشد
                </p>
                <TbMoodEmptyFilled className="text-6xl md:text-8xl text-gray-500 animate-spin duration-1000" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 mt-10" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-blue-800 mb-8 drop-shadow-md">
                    اطلاعات کاربران و لاگ‌های بازی
                </h1>
                <div className="overflow-x-auto rounded-xl shadow-lg">
                    <table className="w-full border-collapse bg-white/90 rounded-xl">
                        <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <th className="p-3 sm:p-4 text-center font-semibold text-sm sm:text-base rounded-tr-xl">
                                ردیف
                            </th>
                            <th className="p-3 sm:p-4 text-center font-semibold text-sm sm:text-base">نام</th>
                            <th className="p-3 sm:p-4 text-center font-semibold text-sm sm:text-base">ایمیل</th>
                            <th className="p-3 sm:p-4 text-center font-semibold text-sm sm:text-base">تاریخ ثبت‌نام</th>
                            <th className="p-3 sm:p-4 text-center font-semibold text-sm sm:text-base rounded-tl-xl">
                                گسترش
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.users.map((item, index) => (
                            <React.Fragment key={item.user.id}>
                                <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                                    <td className="p-3 sm:p-4 text-center text-gray-700 text-sm sm:text-base">
                                        {index + 1}
                                    </td>
                                    <td className="p-3 sm:p-4 text-center text-gray-700 text-sm sm:text-base">
                                        {item.user.name}
                                    </td>
                                    <td className="p-3 sm:p-4 text-center text-gray-700 text-sm sm:text-base">
                                        {item.user.email}
                                    </td>
                                    <td className="p-3 sm:p-4 text-center text-gray-700 text-sm sm:text-base">
                                        {new Date(item.user.createdAt).toLocaleString('fa-IR', {
                                            dateStyle: 'short',
                                            timeStyle: 'short',
                                        })}
                                    </td>
                                    <td className="p-3 sm:p-4 text-center">
                                        <button
                                            onClick={() => toggleRow(item.user.id)}
                                            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800 transition-all duration-300 focus:outline-none"
                                        >
                                            {expandedRows[item.user.id] ? (
                                                <FaChevronUp className="w-5 h-5" />
                                            ) : (
                                                <FaChevronDown className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRows[item.user.id] && item.gameLogs.length > 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 bg-gray-100/90">
                                            <div className="overflow-x-auto transition-all duration-300 ease-in-out">
                                                <table className="w-full border-collapse bg-white/90 rounded-lg shadow-md">
                                                    <thead>
                                                    <tr className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs sm:text-sm">
                                                        <th className="p-2 sm:p-3 text-center font-semibold rounded-tr-lg">
                                                            امتیاز
                                                        </th>
                                                        <th className="p-2 sm:p-3 text-center font-semibold">سطح</th>
                                                        <th className="p-2 sm:p-3 text-center font-semibold">استیج</th>
                                                        <th className="p-2 sm:p-3 text-center font-semibold">موفقیت</th>
                                                        <th className="p-2 sm:p-3 text-center font-semibold">استفاده از راهنما</th>
                                                        <th className="p-2 sm:p-3 text-center font-semibold">راهنماهای استفاده‌نشده</th>
                                                        <th className="p-2 sm:p-3 text-center font-semibold rounded-tl-lg">
                                                            زمان
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {item.gameLogs.map((log, logIndex) => (
                                                        <tr
                                                            key={logIndex}
                                                            className="border-b border-gray-200 hover:bg-purple-50 transition-colors duration-200"
                                                        >
                                                            <td className="p-2 sm:p-3 text-center text-gray-700 text-xs sm:text-sm">
                                                                {log.score}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-center text-gray-700 text-xs sm:text-sm">
                                                                {log.level}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-center text-gray-700 text-xs sm:text-sm">
                                                                {log.stage}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-center text-gray-700 text-xs sm:text-sm">
                                                                {log.isSuccess ? 'بله' : 'خیر'}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-center text-gray-700 text-xs sm:text-sm">
                                                                {log.isUsedHint ? 'بله' : 'خیر'}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-center text-gray-700 text-xs sm:text-sm">
                                                                {log.unUsedHints}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-center text-gray-700 text-xs sm:text-sm">
                                                                {new Date(log.timestamp).toLocaleString('fa-IR', {
                                                                    dateStyle: 'short',
                                                                    timeStyle: 'short',
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {expandedRows[item.user.id] && item.gameLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 bg-gray-100 text-center text-gray-600 text-sm sm:text-base">
                                            بدون لاگ بازی
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Page;