'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';



const Timeline: React.FC<any> = ({ events, onEventClick, defaultSelectedId }) => {
    const [selectedEvent, setSelectedEvent] = useState<number | null>(defaultSelectedId || null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // تنظیم ایونت پیش‌فرض هنگام لود کامپوننت
    useEffect(() => {
        if (defaultSelectedId && events.some((event:any) => event.id === defaultSelectedId)) {
            scrollToEvent(defaultSelectedId);
        }
    }, [defaultSelectedId, events]);

    const scrollToEvent = (id: number) => {
        setSelectedEvent(id);
        const element = document.getElementById(`event-${id}`);
        if (element && timelineRef.current) {
            const offset = element.offsetLeft - timelineRef.current.offsetWidth / 2 + element.offsetWidth / 2;
            timelineRef.current.scrollTo({ left: offset, behavior: 'smooth' });
        }
    };

    const handleButtonClick = (event:any) => {
        scrollToEvent(event.id);
        if (onEventClick) {
            onEventClick(event);
        }
    };

    return (
        <div className="w-full mx-auto">
            {/* Numbered Buttons */}
            <div className="flex justify-center flex-wrap gap-2 mb-6">
                {events.map((event:any) => (
                    <motion.button
                        key={event.id}
                        onClick={() => handleButtonClick(event)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedEvent === event.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-blue-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {event.id}
                    </motion.button>
                ))}
            </div>

            {/* Timeline */}
            <div
                ref={timelineRef}
                className="relative flex overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
                <div className="flex space-x-8 py-4">
                    {events.map((event:any) => (
                        <motion.div
                            key={event.id}
                            id={`event-${event.id}`}
                            className="flex-none w-64 snap-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Dot */}
                            <div className="flex justify-center overflow-hidden">
                                <div
                                    className={`w-4 h-4 rounded-full ${
                                        selectedEvent === event.id ? 'bg-blue-600' : 'bg-gray-400'
                                    }`}
                                />
                            </div>
                            {/* Line */}
                            <div className={`h-8 w-0.5 mx-auto ${selectedEvent === event.id ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            {/* Content */}
                            <div className={`bg-white text-gray-500 p-4 rounded-lg  border border-gray-200 ${selectedEvent === event.id ? 'border-blue-600 shadow-md shadow-blue-500 border-2 border-opacity-80 scale-95' : 'border-gray-200 border shadow'}`}>
                                <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                                <p className="text-sm text-gray-500">{event.date}</p>
                                {event.description}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline;