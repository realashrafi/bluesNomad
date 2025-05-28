/* eslint-disable */
"use client";

import {GlowingEffect} from "@/app/components/assets/ui/GlowingEffect";
import {motion} from "framer-motion";

export function GlowingEffectView({items = []}:any) {
    return (
        <div className="flex flex-wrap gap-4 justify-center items-start xl:max-h-[34rem]">

            {
                //@ts-ignore
                items.map((item, index) => (
                    <GridItem
                        key={index}
                        //@ts-ignore
                        area={item.area}
                        //@ts-ignore
                        icon={item.icon}
                        //@ts-ignore
                        title={item.title}
                        //@ts-ignore
                        description={item.description}
                    />
                ))}
        </div>
    );
}

interface GridItemProps {
    area?: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({area, icon, title, description}: GridItemProps) => {

    const cardVariants = {
        hidden: {opacity: 0, scale: 0.8, y: 50},
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                delay: 0.1,
            },
        },
    };

    const hoverVariants = {
        hover: {
            scale: 1.05,
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)",
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
    };

    return (
        <motion.div
            className={`flex-1 min-w-[calc(100vw-50px)] lg:min-w-[450px] max-w-[400px] flex-grow list-none ${area}`}
            style={{flexBasis: "calc(33.333% - 1rem)"}}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <div className="relative w-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <motion.div
                    className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]"
                    variants={hoverVariants}
                >
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        {icon && (
                            <motion.div
                                className="w-fit rounded-lg border border-gray-600 p-2"
                                whileHover={{rotate: 10, scale: 1.1}}
                                transition={{duration: 0.2}}
                            >
                                {icon}
                            </motion.div>
                        )}
                        <div className="space-y-3">
                            {title && (
                                <motion.h3
                                    className="pt-0.5 font-sans text-xl font-semibold text-balance md:text-2xl text-white"
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{duration: 0.4, delay: 0.2}}
                                >
                                    {title}
                                </motion.h3>
                            )}
                            {description && (
                                <motion.h2
                                    className="font-sans text-sm md:text-base text-neutral-400"
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{duration: 0.4, delay: 0.3}}
                                >
                                    {description}
                                </motion.h2>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};