/* eslint-disable */
'use client';
import React, {useEffect, useRef, useState} from "react";
import MapTiler from "@/app/components/assets/zboom/MapTiler";
import BottomSheet from "@/app/components/view/zboom/Lobby/BottomSheet";
import Timeline from "@/app/components/assets/zboom/Timeline";
import useFilteredStages from "@/app/components/assets/zboom/useFilteredStages";
import {useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import Cookies from "js-cookie";
import Loading from "@/app/components/assets/ui/Loading";
import SvgImage from "@/app/components/assets/zboom/SvgImage";
import CelebrationEffect from "@/app/components/assets/zboom/CelebrationEffect";
import Link from "next/link";


const GameMenu: React.FC = () => {
    const [focusedMarkerId, setFocusedMarkerId] = useState<string | undefined>(undefined);
    const [progressMarkerId, setProgressMarkerId] = useState<string | undefined>(undefined);
    const router = useRouter();
    const bottomSheetRef = useRef<any>(null);
    const {data, isLoading, refetch} = useQuery({
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
        staleTime: 2 * 60 * 1000,
    });
    const changeHeight = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.setHeight(350);
        }
    };

    useEffect(() => {
        refetch()
        const lastStage = localStorage.getItem("lastStageFocus");
        if (data?.latestStage) {
            setFocusedMarkerId(data?.latestStage);
        } else if (lastStage) {
            setFocusedMarkerId(lastStage);
        }
    }, [data]);
    // useEffect(() => {
    //     if (data?.lastAllSuccessStage) {
    //         setProgressMarkerId(data?.lastAllSuccessStage);
    //     }
    // }, [data]);
    const stages = [
        {
            id: "stage1",
            lat: 35.679565,
            lng: 51.418841,
            Serial: 1,
            pitch: 60,
            title: '',
            date: '',
            icon: <>
                <SvgImage src="/svg/icon1.svg"
                          alt="stage1"
                          size={40}
                          className="hover:scale-110 transition-transform"
                />
            </>,
            description: <div className="">
                <h3 className="font-bold">مرحله اول: فرمان شاهانه</h3>
                <p className="text-sm">کاخ گلستان</p>
                <button
                    className="disabled:opacity-20 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage1");
                        // console.log("Progress set to stage1");
                        router.push("/hub0/game/zboom/levels/1");
                    }}
                    disabled={
                        data?.playedStages?.some(
                            (stage: any) => stage.stage === "stage1" && stage.isSuccess === true
                        ) || false
                    }
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="text-black text-sm">
                    در یکی از شب‌های پرمهتاب در کاخ گلستان، ناصرالدین‌شاه قاجار، که از بی‌حوصلگی و روزمرگی به ستوه آمده
                    بود، تصمیم گرفت یک "مسابقه بزرگ همگانی" برگزار کند.
                    شاه با صدای بلند گفت:
                    – امیرکبیر! اگر بخواهیم یک سابقه برگزار کنیم ، چگونه هدایا را به برندگان دهیم ؟
                    امیر با همان نگاه تیز و صدای شمرده‌اش گفت:
                    – قربان، باید آن را در زیبوم ثبت نام کنیم ، تا زیبوم هدایا را به دست برندگان برساند
                </div>
            ),
        },
        {
            id: "stage2",
            lat: 35.689373,
            lng: 51.427585,
            Serial: 2,
            pitch: 60,
            title: '',
            date: '',
            icon: <>
                <SvgImage src="/svg/icon2.svg"
                          alt="stage2"
                          size={40}
                          className="hover:scale-110 transition-transform"
                />
            </>,
            description: <div className="">
                <h3 className="font-bold">مرحله دوم: سفر به عمارت </h3>
                <p className="text-sm">عمارت مسعودیه</p>
                <button
                    className="disabled:opacity-20 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        // setProgressMarkerId("stage2");
                        router.push("/hub0/game/zboom/levels/2");
                        // console.log("Progress set to stage2");
                    }}
                    disabled={
                        data?.playedStages?.some(
                            (stage: any) => stage.stage === "stage2" && stage.isSuccess === true
                        ) || false
                    }
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="text-black text-sm">
                    شاه غلام مخصوصش، غلام‌رضا را صدا زد:
                    – غلام‌رضا! تو مأموری، برو عمارت مسعودیه، هدیه مسابقه را ثبت کن؛ جایزه باید رسمی باشد!
                    غلام‌رضا با چشم‌هایی گردشده از مسئولیت، رکاب زد و تا غروب به عمارت رسید.
                </div>
            ),
        },
        {
            id: "stage3",
            lat: 35.740516,
            lng: 51.446960,
            Serial: 3,
            pitch: 60,
            title: '',
            date: '',
            icon: <>
                <SvgImage src="/svg/icon3.svg"
                          alt="stage3"
                          size={40}
                          className="hover:scale-110 transition-transform"
                />
            </>,
            description: <div className="">
                <h3 className="font-bold">مرحله سوم: ثبت در اداره پست</h3>
                <p className="text-sm">اداره پست قاجاری</p>
                <button
                    className="disabled:opacity-20 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        router.push("/hub0/game/zboom/levels/3");
                    }}
                    disabled={
                        data?.playedStages?.some(
                            (stage: any) => stage.stage === "stage3" && stage.isSuccess === true
                        ) || false
                    }
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="text-black text-sm">
                    هدیه باید ثبت سفارش می‌شد. پس غلام راهی اداره پست شد، جایی که نامه‌ها با مُهر لاکی و قلم نی نوشته
                    می‌شد.
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
            icon: <>
                <SvgImage src="/svg/icon4.svg"
                          alt="stage4"
                          size={40}
                          className="hover:scale-110 transition-transform"
                />
            </>,
            description: <div className="">
                <h3 className="font-bold">مرحله چهارم: هماهنگی</h3>
                <p className="text-sm">اداره حمل‌ونقل</p>
                <button
                    className="disabled:opacity-20 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        router.push("/hub0/game/zboom/levels/4");
                    }}
                    disabled={
                        data?.playedStages?.some(
                            (stage: any) => stage.stage === "stage4" && stage.isSuccess === true
                        ) || false
                    }
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="text-black text-sm">
                    غلام‌رضا باید پیک مخصوص را رزرو می‌کرد تا هدیه در بازه زمانی مشخص برسد. در اداره حمل‌ونقل، چرخ‌دستی
                    و قاطر اجاره می‌دادند.
                    کارمند گفت:
                    – می‌خواهی امروز بفرستی یا فردا؟
                </div>
            ),
        },
        {
            id: "stage5",
            lat: 35.758005,
            lng: 51.434722,
            Serial: 5,
            pitch: 60,
            title: '',
            date: '',
            icon: <>
                <SvgImage src="/svg/icon5.svg"
                          alt="stage5"
                          size={40}
                          className="hover:scale-110 transition-transform"
                />
            </>,
            description: <div className="">
                <h3 className="font-bold">مرحله پنجم: مراجعه به خزانه سلطنتی</h3>
                <p className="text-sm">خزانه سلطنتی</p>
                <button
                    className="disabled:opacity-20 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        router.push("/hub0/game/zboom/levels/5");
                    }}
                    disabled={
                        data?.playedStages?.some(
                            (stage: any) => stage.stage === "stage5" && stage.isSuccess === true
                        ) || false
                    }
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="text-black text-sm">
                    هر خدمتی بهایی دارد! غلام به خزانه رفت تا بودجه این مأموریت را پرداخت کند.
                    غلام با هزار زحمت رسید پرداخت را گرفت، مهر شد، پول پرداخت شد.
                </div>
            ),
        },
        {
            id: "stage6",
            lat: 35.736690,
            lng: 51.432627,
            Serial: 6,
            pitch: 60,
            title: '',
            date: '',
            icon: <>
                <SvgImage src="/svg/icon6.svg"
                          alt="stage6"
                          size={40}
                          className="hover:scale-110 transition-transform"
                />
            </>,
            description: <div className="">
                <h3 className="font-bold">مرحله ششم: فری کثیف</h3>
                <p className="text-sm">ساندویچ‌های قجری</p>
                <button
                    className="disabled:opacity-20 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        router.push("/hub0/game/zboom/levels/6");
                    }}
                    disabled={
                        data?.playedStages?.some(
                            (stage: any) => stage.stage === "stage6" && stage.isSuccess === true
                        ) || false
                    }
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="text-black text-sm">
                    پیش از توزیع، باید هدایا از "پوری کثیف" دریافت می‌شد.
                    غلام به دکان فری کثیف رفت، جایی در دل بازارچه، که ساندویچ‌هایش بوی تاریخ می‌داد.
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
            icon: <>
                <SvgImage src="/svg/icon7.svg"
                          alt="stage7"
                          size={40}
                          className="hover:scale-110 transition-transform"
                />
            </>,
            description: <div className="">
                <h3 className="font-bold">مرحله هفتم: توزیع در ونک</h3>
                <p className="text-sm">هاب ونک</p>
                <button
                    className="disabled:opacity-20 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        router.push("/hub0/game/zboom/levels/7");
                    }}
                    disabled={
                        data?.playedStages?.some(
                            (stage: any) => stage.stage === "stage7" && stage.isSuccess === true
                        ) || false
                    }
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="text-black text-sm">
                    با سبدهای پر از ساندویچ، هدیه و دستور توزیع، غلام‌رضا به میدان ونک رسید تا آن ها عدایا را به دست
                    برندگان برساند.
                </div>
            ),
        },
        {
            id: "stage8",
            lat: 35.763657,
            lng: 51.418059,
            Serial: 8,
            pitch: 60,
            title: '',
            date: '',
            icon: <>
                <SvgImage src="/svg/icon8.svg"
                          alt="stage8"
                          size={40}
                          className="hover:scale-110 transition-transform"
                />
            </>,
            description: <div className="">
                <h3 className="font-bold">مرحله پایانی: تحویل</h3>
                <p className="text-sm"> برنده در تابان غربی</p>
                <button
                    className="disabled:opacity-20 mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        router.push("/hub0/game/zboom/levels/8");
                    }}
                    disabled={
                        data?.playedStages?.some(
                            (stage: any) => stage.stage === "stage8" && stage.isSuccess === true
                        ) || false
                    }
                >
                    شروع
                </button>
            </div>,
            popupContent: (
                <div className="text-black text-sm">
                    و اما برنده… در منطقه‌ای دور، به نام «تابان غربی»، منتظر بود.
                    غلام، پس از این مسیر طولانی، هدیه را با احترام به برنده تقدیم کرد.
                    شاه گفت:
                    – زنده‌باد غلام‌رضا! او اکنون سردار مأموریت‌های خاص قجری است!
                </div>
            ),
        },
    ];
    // console.log('////////////////////////////////', data?.playedStages?.some(
    //     (stage: any) => stage.stage === "stage8" && stage.isSuccess === true
    // ))
    const processStringArray = (stringArray?: string[], lastAllSuccessStage?: any): string[] => {
        if (lastAllSuccessStage === null) return ['stage1'];
        if (lastAllSuccessStage === 'stage8') return ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7', 'stage8'];
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
        // console.log("Focused on stage:", stageId);
    };

    const handleEventClick = (event: any) => {
        handleStageSelect(event.id)
        changeHeight()
        // console.log(`ایونت ${event.id} کلیک شد:`, event);
    };


    return (
        <div className="flex p-2 w-full overflow-hidden">
            {isLoading && <div className={'absolute z-50 flex justify-center items-center inset-0 w-full h-full'}>
                <Loading/>
            </div>}
            <img className={'fixed top-2 left-2 z-50 w-10 h-10'} alt={'ZBOOM'} src={'/images/zboomLogo.png'}/>
            {data?.playedStages?.some(
                (stage: any) => stage.stage === "stage8" && stage.isSuccess === true
            ) && <Link href={'/hub0/game/zboom/rank'}><SvgImage src="/svg/rewardIcon.svg"
                                           alt="stage8"
                                           size={40}
                                           className={'fixed hover:scale-110 animate-bounce transition-transform top-16 left-2 z-50 w-10 h-10'}
            /></Link>}
            {data?.playedStages?.some(
                (stage: any) => stage.stage === "stage8" && stage.isSuccess === true
            ) && <CelebrationEffect/>}
            {/* منوی مراحل */}
            <BottomSheet ref={bottomSheetRef}>
                <Timeline events={filteredStages} onEventClick={handleEventClick} defaultSelectedId={focusedMarkerId}/>
                <button onClick={() => {
                    router.push("/")
                }}
                        className="bg-green-950  text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span
                        className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    <div className="flex items-center rounded-lg px-3 py-1">
                        بازگشت
                    </div>
                </button>
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
                    zoom={18}
                    markers={filteredStages}
                    focusMarkerId={focusedMarkerId}
                    progressMarkerId={data?.lastAllSuccessStage}
                    onMarkerClick={handleStageSelect}
                    className="h-full w-full"
                    defaultPitch={45}
                />
            </div>
        </div>
    );
};

export default GameMenu;