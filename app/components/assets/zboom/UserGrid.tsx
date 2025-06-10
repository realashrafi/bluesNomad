'use client';
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    id: string;
    name: string;
    email: string;
}

interface UserGridProps {
    users: User[];
}

const UserGrid: React.FC<UserGridProps> = ({ users }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev);
    };

    const handlePrint = () => {
        setIsExpanded(true);
        setTimeout(() => {
            window.print();
        }, 1000);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8" dir="rtl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-800 mb-6 drop-shadow-md print:hidden">
                گرید اطلاعات کاربران
            </h2>
            <div className="flex justify-center mb-6 print:hidden">
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 focus:outline-none shadow-md"
                >
                    چاپ بارکدها
                </button>
            </div>
            <div id="user-grid" className="bg-white/90 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
                <button
                    onClick={toggleAccordion}
                    className="w-full p-4 flex justify-between items-center text-right focus:outline-none print:hidden"
                >
                    <span className="text-sm sm:text-base font-semibold text-gray-800">
                        اطلاعات کاربران
                    </span>
                    <span className="text-blue-600">
                        {isExpanded ? 'بستن' : 'باز کردن'}
                    </span>
                </button>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 print-content">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col items-center justify-center min-h-[200px] print:bg-white print:p-2 print:border print:shadow-none print:min-h-fit"
                                    >
                                        <div className="mb-3 print:mb-2 relative">
                                            <QRCode
                                                value={user.id}
                                                size={128}
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                                level="H" // سطح خطاگیری بالا برای حفظ خوانایی
                                                className="rounded-md"
                                            />
                                            <img
                                                src="/images/zboomLogo.png" // مسیر آیکون خود را وارد کنید
                                                alt="Icon"
                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 print:w-6 print:h-6"
                                            />
                                        </div>
                                        <div className="text-center print:text-center w-full">
                                            <p className="text-sm sm:text-base font-semibold text-gray-800">
                                                نام: {user.name}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600 break-all">
                                                ایمیل: {user.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #user-grid,
                    #user-grid * {
                        visibility: visible;
                    }
                    #user-grid {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        margin: 0;
                        padding: 10mm;
                        border: none;
                        box-shadow: none;
                        background: white !important;
                    }
                    .print-content {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 10mm;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .print-content > div {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        margin-bottom: 10mm;
                        width: 100%;
                        text-align: center !important;
                    }
                    .print-content > div > div {
                        text-align: center !important;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                    .overflow-hidden {
                        height: auto !important;
                        overflow: visible !important;
                    }
                    .bg-white\\/90 {
                        background: white !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserGrid;