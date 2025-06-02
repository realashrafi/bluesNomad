'use client'
import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, PanInfo } from "framer-motion";

interface BottomSheetProps {
    children: React.ReactNode;
    minHeight?: number;
    maxHeight?: number;
    midHeight?: number;
    snapPoints?: number[];
    initialHeight?: number;
}

interface BottomSheetHandle {
    setHeight: (height: number) => void; // Method to set height externally
}

const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
    (
        {
            children,
            minHeight = 100,
            midHeight = 350,
            maxHeight = 450,
            snapPoints = [100, 350, 450],
            initialHeight,
        },
        ref
    ) => {
        // Validate initialHeight, default to minHeight if not provided or invalid
        const validInitialHeight = initialHeight
            ? Math.max(minHeight, Math.min(maxHeight, initialHeight))
            : minHeight;

        const [currentHeight, setCurrentHeight] = useState<number>(validInitialHeight);
        const [isDragging, setIsDragging] = useState(false);
        const sheetRef = useRef<HTMLDivElement>(null);
        const dragHandleRef = useRef<HTMLDivElement>(null);

        // Dynamic snap points (merge default and props)
        const allSnapPoints = Array.from(new Set([minHeight, midHeight, maxHeight, ...snapPoints])).sort(
            (a, b) => a - b
        );

        // Find closest snap point
        const findClosestSnapPoint = (height: number): number => {
            return allSnapPoints.reduce((prev, curr) =>
                Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev
            );
        };

        // Expose setHeight method to parent via ref
        useImperativeHandle(ref, () => ({
            setHeight: (height: number) => {
                const validHeight = Math.max(minHeight, Math.min(maxHeight, height));
                const closestSnap = findClosestSnapPoint(validHeight);
                setCurrentHeight(closestSnap);
            },
        }));

        const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            const windowHeight = window.innerHeight;
            const newHeight = Math.min(
                Math.max(windowHeight - info.point.y, minHeight - 50),
                maxHeight + 50
            );
            setCurrentHeight(newHeight);
        };

        const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            setIsDragging(false);
            const windowHeight = window.innerHeight;
            const newHeight = windowHeight - info.point.y;
            const closestSnap = findClosestSnapPoint(newHeight);
            setCurrentHeight(closestSnap);
        };

        const handleDragStart = () => {
            setIsDragging(true);
        };

        return (
            <motion.div
                className="fixed inset-x-0 bottom-0 flex flex-col justify-end z-40 pointer-events-none px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* Bottom Sheet */}
                <motion.div
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.1}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    dragListener={false}
                    className="w-full shadow rounded-t-[30px] pointer-events-auto"
                    style={{
                        backgroundColor: '#ffffff',
                        height: `${currentHeight}px`,
                        touchAction: "none",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* Drag Handle */}
                    <motion.div
                        ref={dragHandleRef}
                        drag="y"
                        dragElastic={0.1}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        className="flex w-full items-center justify-center p-2 cursor-grab"
                    >
                        <div className="w-24 h-1 my-2 bg-gray-500 rounded-lg"></div>
                    </motion.div>

                    <div
                        ref={sheetRef}
                        className="p-4 overflow-y-auto max-h-[70vh]"
                        style={{ pointerEvents: isDragging ? "none" : "auto" }}
                    >
                        {children}
                    </div>
                </motion.div>
            </motion.div>
        );
    }
);

BottomSheet.displayName = "BottomSheet";

export default BottomSheet;