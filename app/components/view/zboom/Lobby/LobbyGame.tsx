'use client';
import React, { useState } from "react";
import MapTiler from "@/app/components/assets/zboom/MapTiler";

const GameMenu: React.FC = () => {
    const [focusedMarkerId, setFocusedMarkerId] = useState<string | undefined>(undefined);
    const [progressMarkerId, setProgressMarkerId] = useState<string | undefined>(undefined);

    // تعریف ۸ مرحله با لوکیشن‌های تهران و زاویه‌های pitch
    const stages = [
        {
            id: "stage1",
            lat: 35.7219,
            lng: 51.3347,
            Serial: 1,
            pitch: 30,
            popupContent: (
                <div className="p-4">
                    <h3 className="font-bold">مرحله ۱: برج میلاد</h3>
                    <p className="text-sm">ماموریت در بلندترین برج ایران!</p>
                    <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setProgressMarkerId("stage1");
                            console.log("Progress set to stage1");
                        }}
                    >
                        شروع
                    </button>
                </div>
            ),
        },
        {
            id: "stage2",
            lat: 35.6886,
            lng: 51.3500,
            Serial: 2,
            pitch: 30,
            popupContent: (
                <div className="p-4">
                    <h3 className="font-bold">مرحله ۲: میدان آزادی</h3>
                    <p className="text-sm">چالش در نماد تهران!</p>
                    <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setProgressMarkerId("stage2");
                            console.log("Progress set to stage2");
                        }}
                    >
                        شروع
                    </button>
                </div>
            ),
        },
        {
            id: "stage3",
            lat: 35.8112,
            lng: 51.4351,
            Serial: 3,
            pitch: 45,
            popupContent: (
                <div className="p-4">
                    <h3 className="font-bold">مرحله ۳: میدان تجریش</h3>
                    <p className="text-sm">ماجراجویی در بازار سنتی!</p>
                    <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setProgressMarkerId("stage3");
                            console.log("Progress set to stage3");
                        }}
                    >
                        شروع
                    </button>
                </div>
            ),
        },
        {
            id: "stage4",
            lat: 35.7355,
            lng: 51.4211,
            Serial: 4,
            pitch: 60,
            popupContent: (
                <div className="p-4">
                    <h3 className="font-bold">مرحله ۴: پارک لاله</h3>
                    <p className="text-sm">چالش در قلب طبیعت تهران!</p>
                    <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setProgressMarkerId("stage4");
                            console.log("Progress set to stage4");
                        }}
                    >
                        شروع
                    </button>
                </div>
            ),
        },
        {
            id: "stage5",
            lat: 35.7000,
            lng: 51.4013,
            Serial: 5,
            pitch: 30,
            popupContent: (
                <div className="p-4">
                    <h3 className="font-bold">مرحله ۵: میدان انقلاب</h3>
                    <p className="text-sm">ماموریت در مرکز فرهنگی تهران!</p>
                    <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setProgressMarkerId("stage5");
                            console.log("Progress set to stage5");
                        }}
                    >
                        شروع
                    </button>
                </div>
            ),
        },
        {
            id: "stage6",
            lat: 35.6944,
            lng: 51.4215,
            Serial: 6,
            pitch: 45,
            popupContent: (
                <div className="p-4">
                    <h3 className="font-bold">مرحله ۶: تئاتر شهر</h3>
                    <p className="text-sm">چالش در قلب هنر تهران!</p>
                    <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setProgressMarkerId("stage6");
                            console.log("Progress set to stage6");
                        }}
                    >
                        شروع
                    </button>
                </div>
            ),
        },
        {
            id: "stage7",
            lat: 35.7578,
            lng: 51.4102,
            Serial: 7,
            pitch: 60,
            popupContent: (
                <div className="p-4">
                    <h3 className="font-bold">مرحله ۷: پارک ملت</h3>
                    <p className="text-sm">ماجراجویی در پارک سرسبز!</p>
                    <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setProgressMarkerId("stage7");
                            console.log("Progress set to stage7");
                        }}
                    >
                        شروع
                    </button>
                </div>
            ),
        },
        {
            id: "stage8",
            lat: 35.7061,
            lng: 51.4349,
            Serial: 8,
            pitch: 45,
            popupContent: (
                <div className="p-4">
                    <h3 className="font-bold">مرحله ۸: کاخ گلستان</h3>
                    <p className="text-sm">ماموریت در قلب تاریخ تهران!</p>
                    <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setProgressMarkerId("stage8");
                            console.log("Progress set to stage8");
                        }}
                    >
                        شروع
                    </button>
                </div>
            ),
        },
    ];

    // هندل کردن انتخاب مرحله
    const handleStageSelect = (stageId: string) => {
        setFocusedMarkerId(stageId);
        console.log("Focused on stage:", stageId);
    };

    return (
        <div className="flex h-screen w-full">
            {/* منوی مراحل */}
            <div className="w-48 p-4 bg-gray-100">
                <h3 className="text-lg font-bold mb-4">مراحل بازی</h3>
                <ul className="space-y-2">
                    {stages.map((stage) => (
                        <li key={stage.id}>
                            <button
                                onClick={() => handleStageSelect(stage.id)}
                                className={`w-full text-right py-2 px-4 rounded ${
                                    focusedMarkerId === stage.id
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-300 text-black"
                                } hover:bg-red-600 hover:text-white transition`}
                            >
                                مرحله {stage.Serial}
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    className="mt-4 w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => {
                        setProgressMarkerId(undefined);
                        console.log("Progress reset");
                    }}
                >
                    ریست پیشرفت
                </button>
            </div>

            {/* نقشه */}
            <div className="flex-1 h-full">
                <MapTiler
                    center={[51.409915, 35.757545]}
                    zoom={17}
                    markers={stages}
                    focusMarkerId={focusedMarkerId}
                    progressMarkerId={progressMarkerId}
                    onMarkerClick={handleStageSelect}
                    className="h-full w-full"
                    defaultPitch={45}
                />
            </div>
        </div>
    );
};

export default GameMenu;