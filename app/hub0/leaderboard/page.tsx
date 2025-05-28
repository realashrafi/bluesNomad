/* eslint-disable */
'use client'
import React, {useEffect, useState} from 'react';
import {GlowingEffectView} from "@/app/components/assets/ui/GlowingEffectView";
import {useQuery} from "@tanstack/react-query";
import Cookies from "js-cookie";
import {ImEye} from "react-icons/im";
import Loading from "@/app/components/assets/ui/Loading";
import { TbMoodEmptyFilled } from "react-icons/tb";

function Page() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);


    useEffect(() => {
        const token = Cookies.get('token');
        setIsAuthenticated(!!token);
    }, []);

    const {data, isLoading, error} = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const response = await fetch('/api/leaderboard', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('خطا در دریافت لیدربورد');
            }
            return response.json();
        },
        enabled: true,
        staleTime: 2 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <Loading/>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <p className="text-base md:text-lg text-red-500" dir="rtl">
                    خطا در دریافت لیدربورد: {error.message}
                </p>
            </div>
        );
    }
    const leaderboard = data?.leaderboard || [];
    if (leaderboard.length === 0) {
        return (
            <div className="flex flex-col gap-2 items-center justify-center min-h-screen p-4">
                <p className="text-base md:text-lg animate-ping duration-1000" >نداریم</p>
                <TbMoodEmptyFilled className={'text-[100px] animate-spin duration-1000'}/>
            </div>
        );
    }

    //@ts-expect-error
    const convertor = (props) => {

        const leaderboard = props || [];
        //@ts-expect-error
        return leaderboard.map((item, index: number) => ({
            id: item._id,
            title: item.name,
            description: (
                <div
                    className="group relative block w-full mx-auto  "
                >
                    <div
                        className="relative flex h-full w-60 transform items-end  transition-transform group-hover:scale-105"
                    >
                        <button
                            className="w-full flex items-center justify-center group-hover:hidden bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                            <span
                                className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                            <ImEye className={'text-xl'}/>
                        </button>

                        <div
                            className="absolute flex text-green-400 flex-col items-start justify-center opacity-0 transition-opacity group-hover:relative group-hover:opacity-100 "
                        >
                            <span className={'flex items-center justify-center gap-1'}>
                                <span>Email :</span>
                                {item.email}
                            </span>
                            <span className={'flex items-center justify-center gap-1'}>
                                <span>Level :</span>
                                {item.level}
                            </span>
                            <span className={'flex  items-center justify-center gap-1'}>
                                <span>Best Score :</span>
                                {item.maxScore}
                            </span>
                        </div>
                    </div>
                </div>

            ),
            icon: <div className={'w-5 h-5 flex items-center justify-center'}>{index + 1}</div>,
        }));
    };
    const itemsPage = convertor(leaderboard)
    return (
        <div className="flex items-center justify-center mx-auto mt-10 p-4 rounded ">
            <GlowingEffectView items={itemsPage}/>
        </div>
    );
}

export default Page;