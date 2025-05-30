"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const GRID_SIZE = 10;

type Cell = {
    row: number;
    col: number;
};

export default function ReactionGridGame() {
    const [activeCell, setActiveCell] = useState<Cell | null>(null);
    const [score, setScore] = useState<number>(0);
    const [misses, setMisses] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);
            setActiveCell({ row, col });

            const timeout = setTimeout(() => {
                setActiveCell((prev) => {
                    if (prev?.row === row && prev?.col === col) {
                        setMisses((m) => m + 1);
                        return null;
                    }
                    return prev;
                });
            }, 1000);

            return () => clearTimeout(timeout);
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const handleClick = (row: number, col: number): void => {
        if (activeCell?.row === row && activeCell?.col === col) {
            setScore((s) => s + 1);
            setActiveCell(null);
        } else {
            setMisses((m) => m + 1);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-screen bg-white dark:bg-black">
            <div
                className={cn(
                    "absolute inset-0",
                    "[background-size:40px_40px]",
                    "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                    "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
                )}
            />

            <div className="z-10 grid grid-cols-10 grid-rows-10 gap-1">
                {[...Array(GRID_SIZE)].map((_, row) =>
                    [...Array(GRID_SIZE)].map((_, col) => {
                        const isActive = activeCell?.row === row && activeCell?.col === col;
                        return (
                            <div
                                key={`${row}-${col}`}
                                className={cn(
                                    "w-8 h-8 border border-neutral-300 dark:border-neutral-700",
                                    isActive ? "bg-green-500 hover:bg-green-400 cursor-pointer" : "bg-transparent"
                                )}
                                onClick={() => handleClick(row, col)}
                            />
                        );
                    })
                )}
            </div>

            <div className="z-10 mt-4 text-lg font-bold text-neutral-800 dark:text-neutral-200">
                Score: {score} | Misses: {misses}
            </div>
        </div>
    );
}