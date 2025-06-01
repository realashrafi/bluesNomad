/* eslint-disable */
'use client';
import React, {useEffect, useState} from "react";
import MapTiler from "@/app/components/assets/zboom/MapTiler";
import BottomSheet from "@/app/components/view/zboom/Lobby/BottomSheet";
import Timeline from "@/app/components/assets/zboom/Timeline";
import useFilteredStages from "@/app/components/assets/zboom/useFilteredStages";
import {useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import Cookies from "js-cookie";


const GameMenu: React.FC = () => {
    const [focusedMarkerId, setFocusedMarkerId] = useState<string | undefined>(undefined);
    const [progressMarkerId, setProgressMarkerId] = useState<string | undefined>(undefined);
    const [excludedIds, setExcludedIds] = useState(['stage1', 'stage2']);
    const router = useRouter();
    const {data, isLoading, error, refetch} = useQuery({
        queryKey: ['user-stages'],
        queryFn: async () => {
            const response = await fetch('/api/user-stages', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('خطا در دریافت ');
            }
            return response.json();
        },
        enabled: true,
        staleTime: 2 * 60 * 1000,
    });

    // console.log(data)
    useEffect(() => {
        refetch()
        const lastStage = localStorage.getItem("lastStageFocus");
        if (data?.latestStage) {
            setFocusedMarkerId(data?.latestStage);
        } else if (lastStage) {
            setFocusedMarkerId(lastStage);
        }
        if (data?.lastAllSuccessStage) {
            setProgressMarkerId(data?.lastAllSuccessStage);
        }
    }, [data]);

    const stages = [
        {
            id: "stage1",
            lat: 35.679565,
            lng: 51.418841,
            Serial: 1,
            pitch: 30,
            title: '',
            date: '',
            description: <div className="">
                <h3 className="font-bold">مرحله ۱: برج میلاد</h3>
                <p className="text-sm">ماموریت در بلندترین برج ایران!</p>
                <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage1");
                        // console.log("Progress set to stage1");
                        router.push("/hub0/game/zboom/levels/1");
                    }}
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="">

                </div>
            ),
        },
        {
            id: "stage2",
            lat: 35.689373,
            lng: 51.427585,
            Serial: 2,
            pitch: 30,
            title: '',
            date: '',
            description: <div className="">
                <h3 className="font-bold">مرحله ۲: میدان آزادی</h3>
                <p className="text-sm">چالش در نماد تهران!</p>
                <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage2");
                        router.push("/hub0/game/zboom/levels/2");
                        // console.log("Progress set to stage2");
                    }}
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="">

                </div>
            ),
        },
        {
            id: "stage3",
            lat: 35.740516,
            lng: 51.446960,
            Serial: 3,
            pitch: 45,
            title: '',
            date: '',
            description: <div className="">
                <h3 className="font-bold">مرحله ۳: میدان تجریش</h3>
                <p className="text-sm">ماجراجویی در بازار سنتی!</p>
                <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage3");
                        console.log("Progress set to stage3");
                    }}
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="">

                </div>
            ),
        },
        {
            id: "stage4",
            lat: 35.709244,
            lng: 51.404911,
            Serial: 4,
            pitch: 60,
            title: '',
            date: '',
            description: <div className="">
                <h3 className="font-bold">مرحله ۴: پارک لاله</h3>
                <p className="text-sm">چالش در قلب طبیعت تهران!</p>
                <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage4");
                        console.log("Progress set to stage4");
                    }}
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="">

                </div>
            ),
        },
        {
            id: "stage5",
            lat: 35.758005,
            lng: 51.434722,
            Serial: 5,
            pitch: 30,
            title: '',
            date: '',
            description: <div className="">
                <h3 className="font-bold">مرحله ۵: میدان انقلاب</h3>
                <p className="text-sm">ماموریت در مرکز فرهنگی تهران!</p>
                <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage5");
                        console.log("Progress set to stage5");
                    }}
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="">

                </div>
            ),
        },
        {
            id: "stage6",
            lat: 35.736690,
            lng: 51.432627,
            Serial: 6,
            pitch: 45,
            title: '',
            date: '',
            description: <div className="">
                <h3 className="font-bold">مرحله ۶: تئاتر شهر</h3>
                <p className="text-sm">چالش در قلب هنر تهران!</p>
                <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage6");
                        console.log("Progress set to stage6");
                    }}
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="">

                </div>
            ),
        },
        {
            id: "stage7",
            lat: 35.757865,
            lng: 51.409466,
            Serial: 7,
            pitch: 60,
            title: '',
            date: '',
            description: <div className="">
                <h3 className="font-bold">مرحله ۷: پارک ملت</h3>
                <p className="text-sm">ماجراجویی در پارک سرسبز!</p>
                <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage7");
                        console.log("Progress set to stage7");
                    }}
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="">

                </div>
            ),
        },
        {
            id: "stage8",
            lat: 35.763657,
            lng: 51.418059,
            Serial: 8,
            pitch: 45,
            title: '',
            date: '',
            description: <div className="">
                <h3 className="font-bold">مرحله ۸: کاخ گلستان</h3>
                <p className="text-sm">ماموریت در قلب تاریخ تهران!</p>
                <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage8");
                        console.log("Progress set to stage8");
                    }}
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="">

                </div>
            ),
        },
    ];
    const processStringArray = (stringArray?: string[], lastAllSuccessStage?: any): string[] => {
        if (lastAllSuccessStage === null) return ['stage1'];
        if (lastAllSuccessStage === 'stage1') return ['stage1', 'stage2'];
        if (!stringArray) return [];
        if (stringArray.length > 1) return [...stringArray, `stage${stringArray.length + 1}`];
        return stringArray;
    };
    const filteredStages = useFilteredStages(stages, processStringArray(data?.uniqueStages, data?.lastAllSuccessStage));
    // هندل کردن انتخاب مرحله
    const handleStageSelect = (stageId: string) => {
        setFocusedMarkerId(stageId);
        localStorage.setItem("lastStageFocus", stageId);
        console.log("Focused on stage:", stageId);
    };

    const handleEventClick = (event: any) => {
        handleStageSelect(event.id)
        // console.log(`ایونت ${event.id} کلیک شد:`, event);
    };

    return (
        <div className="flex p-2 w-full overflow-hidden">
            {/* منوی مراحل */}
            <BottomSheet>
                <Timeline events={filteredStages} onEventClick={handleEventClick} defaultSelectedId={focusedMarkerId}/>
                {/*<div className="w-48  bg-gray-100">*/}
                {/*    <h3 className="text-lg font-bold mb-4">مراحل بازی</h3>*/}
                {/*    <ul className="space-y-2">*/}
                {/*        {stages.map((stage) => (*/}
                {/*            <li key={stage.id}>*/}
                {/*                <button*/}
                {/*                    onClick={() => handleStageSelect(stage.id)}*/}
                {/*                    className={`w-full text-right py-2 px-4 rounded ${*/}
                {/*                        focusedMarkerId === stage.id*/}
                {/*                            ? "bg-red-500 text-white"*/}
                {/*                            : "bg-gray-300 text-black"*/}
                {/*                    } hover:bg-red-600 hover:text-white transition`}*/}
                {/*                >*/}
                {/*                    مرحله {stage.Serial}*/}
                {/*                </button>*/}
                {/*            </li>*/}
                {/*        ))}*/}
                {/*    </ul>*/}
                {/*    <button*/}
                {/*        className="mt-4 w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"*/}
                {/*        onClick={() => {*/}
                {/*            setProgressMarkerId(undefined);*/}
                {/*            console.log("Progress reset");*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        ریست پیشرفت*/}
                {/*    </button>*/}
                {/*</div>*/}
            </BottomSheet>
            {/* نقشه */}
            <div className="fixed inset-0">
                <MapTiler
                    center={[51.409915, 35.757545]}
                    zoom={17}
                    markers={filteredStages}
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