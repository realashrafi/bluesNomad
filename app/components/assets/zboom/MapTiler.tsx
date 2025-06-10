/* eslint-disable */
'use client';
import React, { useEffect, useRef, useState } from "react";
import { Map as MapTilerMap, Marker as MapTilerMarker, Popup } from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { createRoot } from "react-dom/client";

interface Marker {
    id: string;
    lat: number;
    lng: number;
    Serial?: number;
    popupContent?: React.ReactNode;
    pitch?: number;
    icon?: React.ReactNode;
}

interface MapTilerProps {
    center?: [number, number];
    zoom?: number;
    markers?: Marker[];
    focusMarkerId?: string;
    progressMarkerId?: string;
    onMarkerClick?: (markerId: string) => void;
    className?: string;
    defaultPitch?: number;
}

const MapTiler: React.FC<MapTilerProps> = ({
                                               center = [51.409915, 35.757545],
                                               zoom = 14,
                                               markers = [],
                                               focusMarkerId,
                                               progressMarkerId,
                                               onMarkerClick,
                                               className,
                                               defaultPitch = 45,
                                           }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapTilerMap | null>(null);
    const markersLayerRef = useRef<MapTilerMarker[]>([]);
    const routeMarkerRef = useRef<MapTilerMarker | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // مقداردهی اولیه نقشه
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
        const map = new MapTilerMap({
            container: mapRef.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
            center: center,
            zoom: zoom,
            attributionControl: false,
            navigationControl: false,
            geolocateControl: false,
        });

        mapInstanceRef.current = map;

        map.on("load", () => {
            setMapLoaded(true);
        });

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            setMapLoaded(false);
        };
    }, []);

    // تابع برای دریافت مسیر از MapTiler Directions API
    const fetchRoute = async (coordinates: [number, number][]): Promise<[number, number][]> => {
        if (coordinates.length < 2) {
            console.warn("Not enough coordinates for route:", coordinates);
            return coordinates;
        }

        const apiKey = '5b3ce3597851110001cf6248b17010e342e14b40b464eaa18e81001c';
        const body = {
            coordinates: coordinates.map((coord) => [coord[0], coord[1]]),
            profile: 'driving-car',
            format: 'geojson',
        };

        try {
            const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`OpenRouteService failed: HTTP ${response.status} - ${errorText}`);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            if (data.features && data.features[0] && data.features[0].geometry) {
                return data.features[0].geometry.coordinates;
            } else {
                return coordinates;
            }
        } catch (error) {
            return coordinates;
        }
    };

    // مدیریت مارکرها
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded) return;

        // پاک کردن مارکرهای قبلی
        markersLayerRef.current.forEach((marker) => marker.remove());
        markersLayerRef.current = [];

        markers.forEach((marker) => {
            const iconElement = document.createElement("div");

            if (marker.icon) {
                createRoot(iconElement).render(marker.icon);
            } else {
                iconElement.innerHTML = `
                    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#E74C3C"/>
                        <text x="12" y="15" font-size="10" fill="#fff" text-anchor="middle">${marker.Serial || marker.id}</text>
                    </svg>
                `;
            }

            const mapMarker = new MapTilerMarker({
                element: iconElement,
                anchor: "bottom",
            })
                .setLngLat([marker.lng, marker.lat])
                .addTo(map);

            markersLayerRef.current.push(mapMarker);

            mapMarker.getElement().addEventListener("click", () => {
                onMarkerClick?.(marker.id);
            });

            if (marker.popupContent) {
                const popupContainer = document.createElement("div");
                createRoot(popupContainer).render(marker.popupContent);
                const popup = new Popup({ offset: 25 }).setDOMContent(popupContainer);
                mapMarker.setPopup(popup);
            }
        });

        return () => {
            markersLayerRef.current.forEach((marker) => marker.remove());
            markersLayerRef.current = [];
        };
    }, [markers, onMarkerClick, mapLoaded]);

    // رسم مسیرها (پیش‌فرض و پیشرفت)
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded) return;

        if (map.getLayer("default-path")) map.removeLayer("default-path");
        if (map.getSource("default-path")) map.removeSource("default-path");
        if (map.getLayer("progress-path")) map.removeLayer("progress-path");
        if (map.getSource("progress-path")) map.removeSource("progress-path");

        const sortedMarkers = [...markers].sort((a, b) => (a.Serial || 0) - (b.Serial || 0));

        if (sortedMarkers.length > 1) {
            const defaultPathCoordinates = sortedMarkers.map((marker) => [marker.lng, marker.lat]);
            //@ts-expect-error
            fetchRoute(defaultPathCoordinates).then((routeCoords) => {
                if (!mapInstanceRef.current) return;

                if (!mapInstanceRef.current.getSource("default-path")) {
                    mapInstanceRef.current.addSource("default-path", {
                        type: "geojson",
                        //@ts-expect-error
                        data: {
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: routeCoords,
                            },
                        },
                    });

                    mapInstanceRef.current.addLayer({
                        id: "default-path",
                        type: "line",
                        source: "default-path",
                        paint: {
                            "line-color": "#001121",
                            "line-width": 10,
                            "line-opacity": 0.2,
                        },
                    });
                }
            });
        }

        if (progressMarkerId) {
            const progressMarkerIndex = sortedMarkers.findIndex((m) => m.id === progressMarkerId);
            if (progressMarkerIndex >= 0) {
                const progressPathCoordinates = sortedMarkers
                    .slice(0, progressMarkerIndex + 1)
                    .map((marker) => [marker.lng, marker.lat]);

                if (progressPathCoordinates.length > 1) {
                    //@ts-expect-error
                    fetchRoute(progressPathCoordinates).then((routeCoords) => {
                        if (!mapInstanceRef.current) return;

                        if (!mapInstanceRef.current.getSource("progress-path")) {
                            mapInstanceRef.current.addSource("progress-path", {
                                type: "geojson",
                                //@ts-expect-error
                                data: {
                                    type: "Feature",
                                    geometry: {
                                        type: "LineString",
                                        coordinates: routeCoords,
                                    },
                                },
                            });

                            mapInstanceRef.current.addLayer({
                                id: "progress-path",
                                type: "line",
                                source: "progress-path",
                                paint: {
                                    "line-color": "#7ad032",
                                    "line-width": 10,
                                    "line-opacity": 1,
                                },
                            });
                        }
                    });
                }
            }
        }

        return () => {
            if (map.getLayer("default-path")) map.removeLayer("default-path");
            if (map.getSource("default-path")) map.removeSource("default-path");
            if (map.getLayer("progress-path")) map.removeLayer("progress-path");
            if (map.getSource("progress-path")) map.removeSource("progress-path");
        };
    }, [markers, progressMarkerId, mapLoaded]);

    // فوکوس روی مارکر با حرکت در امتداد مسیر و نمایش آیکون متحرک
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded || !focusMarkerId) return;

        const sortedMarkers = [...markers].sort((a, b) => (a.Serial || 0) - (b.Serial || 0));
        const targetMarker = markers.find((m) => m.id === focusMarkerId);
        if (!targetMarker) return;

        // متغیر برای لغو انیمیشن
        let isCancelled = false;

        // تعریف animationFrameId در سطح useEffect
        let animationFrameId: number | null = null;

        // بستن تمام پاپ‌آپ‌های باز
        markersLayerRef.current.forEach((marker) => {
            if (marker.getPopup()) {
                marker.getPopup().remove();
            }
        });

        // پیدا کردن مارکر قبلی یا نقطه شروع
        const targetIndex = sortedMarkers.findIndex((m) => m.id === focusMarkerId);
        const startMarker = targetIndex > 0 ? sortedMarkers[targetIndex - 1] : sortedMarkers[0];
        const fallbackStartCoords = startMarker ? [startMarker.lng, startMarker.lat] : center;

        // تعیین نقطه شروع: اگر مارکر متحرک وجود دارد، از موقعیت فعلی آن استفاده کن
        let startCoords: [number, number];
        if (routeMarkerRef.current) {
            const currentLngLat = routeMarkerRef.current.getLngLat();
            startCoords = [currentLngLat.lng, currentLngLat.lat];
        } else {
            //@ts-expect-error
            startCoords = fallbackStartCoords;
        }

        // تابع مشترک برای شروع انیمیشن
        const startAnimation = (coords: [number, number][]) => {
            if (!mapInstanceRef.current || isCancelled) return;

            // اگر مارکر متحرک وجود ندارد، یک آیکون جدید ایجاد کن
            if (!routeMarkerRef.current) {
                const routeIconElement = document.createElement("div");
                routeIconElement.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#7ad032" />
                    <circle cx="12" cy="12" r="5" fill="#ffffff" />
                </svg>
            `;
                const routeMarker = new MapTilerMarker({
                    element: routeIconElement,
                    anchor: "center",
                }).setLngLat([coords[0][0], coords[0][1]]).addTo(map);
                routeMarkerRef.current = routeMarker;
            }

            const totalDuration = 10000; // مدت زمان کل انیمیشن (3 ثانیه)
            let startTime: number | null = null;

            // تابع درون‌یابی خطی برای مختصات
            const lerp = (start: number, end: number, t: number) => {
                return start + (end - start) * t;
            };

            // تابع easing برای حرکت نرم‌تر (ease-in-out)
            const easeInOutQuad = (t: number) => {
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            };

            // تابع انیمیشن
            const animateAlongRoute = (timestamp: number) => {
                if (!mapInstanceRef.current || !routeMarkerRef.current || isCancelled) return;

                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / totalDuration, 1); // پیشرفت از 0 تا 1
                const easedProgress = easeInOutQuad(progress); // اعمال easing

                // محاسبه موقعیت فعلی در مسیر
                const totalSteps = coords.length - 1;
                const currentStep = Math.min(Math.floor(easedProgress * totalSteps), totalSteps - 1);
                const stepProgress = easedProgress * totalSteps - currentStep;
                const startCoord = coords[currentStep];
                const endCoord = coords[currentStep + 1] || startCoord;

                // درون‌یابی مختصات
                const currentLng = lerp(startCoord[0], endCoord[0], stepProgress);
                const currentLat = lerp(startCoord[1], endCoord[1], stepProgress);

                // حرکت دوربین
                mapInstanceRef.current.setCenter([currentLng, currentLat]);
                mapInstanceRef.current.setZoom(17);
                mapInstanceRef.current.setPitch(targetMarker.pitch ?? defaultPitch);

                // حرکت مارکر
                routeMarkerRef.current.setLngLat([currentLng, currentLat]);

                // ادامه انیمیشن تا پایان
                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animateAlongRoute);
                } else {
                    mapInstanceRef.current.flyTo({
                        center: [targetMarker.lng, targetMarker.lat],
                        zoom: zoom,
                        pitch: targetMarker.pitch ?? defaultPitch,
                        duration: 1000,
                        essential: true,
                    });

                    // نمایش پاپ‌آپ
                    const marker = markersLayerRef.current.find((m) => {
                        const lngLat = m.getLngLat();
                        return (
                            Math.abs(lngLat.lng - targetMarker.lng) < 0.0001 &&
                            Math.abs(lngLat.lat - targetMarker.lat) < 0.0001
                        );
                    });
                    if (marker && marker.getPopup()) {
                        marker.togglePopup();
                    }

                    // حذف آیکون متحرک
                    if (routeMarkerRef.current) {
                        routeMarkerRef.current.remove();
                        routeMarkerRef.current = null;
                    }
                }
            };

            // شروع انیمیشن
            animationFrameId = requestAnimationFrame(animateAlongRoute);
        };

        // دریافت مسیر

        fetchRoute([startCoords, [targetMarker.lng, targetMarker.lat]])
            .then((routeCoords) => {
                if (!mapInstanceRef.current || isCancelled) return;
                // در صورت موفقیت، از مختصات مسیر استفاده کن
                const coords = routeCoords.length > 1 ? routeCoords : [startCoords, [targetMarker.lng, targetMarker.lat]];
                //@ts-expect-error
                startAnimation(coords);
            })
            .catch((error) => {
                console.error("Failed to fetch route:", error);
                // در صورت خطا، از مختصات اولیه استفاده کن
                if (!mapInstanceRef.current || isCancelled) return;
                const coords = [startCoords, [targetMarker.lng, targetMarker.lat]];
                //@ts-expect-error
                startAnimation(coords);
            });

        // تمیزکاری
        return () => {
            isCancelled = true;
            if (routeMarkerRef.current) {
                routeMarkerRef.current.remove();
                routeMarkerRef.current = null;
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            markersLayerRef.current.forEach((marker) => {
                if (marker.getPopup()) {
                    marker.getPopup().remove();
                }
            });
        };
    }, [focusMarkerId, markers, mapLoaded, defaultPitch]);

    // پاکسازی مارکر متحرک هنگام اتمام
    useEffect(() => {
        return () => {
            if (routeMarkerRef.current) {
                routeMarkerRef.current.remove();
                routeMarkerRef.current = null;
            }
        };
    }, []);

    return <div ref={mapRef} className={className} />;
};

export default MapTiler;