'use client';
import React, {useEffect, useRef, useState} from "react";
import {Map as MapTilerMap, Marker as MapTilerMarker, Popup} from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {createRoot} from "react-dom/client";

interface Marker {
    id: string;
    lat: number;
    lng: number;
    Serial?: number;
    popupContent?: React.ReactNode;
    pitch?: number; // زاویه عمودی (3D) برای فوکوس روی این مارکر (اختیاری)
}

interface MapTilerProps {
    center?: [number, number];
    zoom?: number;
    markers?: Marker[];
    focusMarkerId?: string;
    progressMarkerId?: string;
    onMarkerClick?: (markerId: string) => void;
    className?: string;
    defaultPitch?: number; // زاویه عمودی پیش‌فرض برای فوکوس
}

const MapTiler: React.FC<MapTilerProps> = ({
                                               center = [51.409915, 35.757545],
                                               zoom = 14,
                                               markers = [],
                                               focusMarkerId,
                                               progressMarkerId,
                                               onMarkerClick,
                                               className,
                                               defaultPitch = 0, // زاویه پیش‌فرض (بدون کج شدن)
                                           }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapTilerMap | null>(null);
    const markersLayerRef = useRef<MapTilerMarker[]>([]);
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
        });

        mapInstanceRef.current = map;

        // منتظر لود کامل نقشه
        map.on("load", () => {
            setMapLoaded(true);
        });

        // مدیریت خطاها
        // map.on("error", (e) => {
        //     console.error("MapTiler error:", e);
        // });

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
                console.log("Route fetched successfully:", data.features[0].geometry.coordinates.length, "points");
                return data.features[0].geometry.coordinates;
            } else {
                console.warn("No valid route in response:", JSON.stringify(data, null, 2));
                return coordinates; // فال‌بک به خط مستقیم
            }
        } catch (error) {
            console.error("Error fetching route:", error);
            console.log("Falling back to straight line for coordinates:", coordinates);
            return coordinates; // فال‌بک به خط مستقیم
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
            iconElement.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#E74C3C"/>
          <text x="12" y="15" font-size="10" fill="#fff" text-anchor="middle">${marker.Serial || marker.id}</text>
        </svg>
      `;

            const mapMarker = new MapTilerMarker({
                element: iconElement,
                anchor: "bottom",
            })
                .setLngLat([marker.lng, marker.lat])
                .addTo(map);

            markersLayerRef.current.push(mapMarker);

            // کلیک روی مارکر
            mapMarker.getElement().addEventListener("click", () => {
                onMarkerClick?.(marker.id);
            });

            // پاپ‌آپ
            if (marker.popupContent) {
                const popupContainer = document.createElement("div");
                createRoot(popupContainer).render(marker.popupContent);
                const popup = new Popup({offset: 25}).setDOMContent(popupContainer);
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

        // پاک کردن لایه‌های قبلی
        if (map.getLayer("default-path")) map.removeLayer("default-path");
        if (map.getSource("default-path")) map.removeSource("default-path");
        if (map.getLayer("progress-path")) map.removeLayer("progress-path");
        if (map.getSource("progress-path")) map.removeSource("progress-path");

        // مرتب‌سازی مارکرها بر اساس Serial
        const sortedMarkers = [...markers].sort((a, b) => (a.Serial || 0) - (b.Serial || 0));

        // مسیر پیش‌فرض (آبی)
        if (sortedMarkers.length > 1) {
            const defaultPathCoordinates = sortedMarkers.map((marker) => [marker.lng, marker.lat]);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
            fetchRoute(defaultPathCoordinates).then((routeCoords) => {
                if (!mapInstanceRef.current) return;

                mapInstanceRef.current.addSource("default-path", {
                    type: "geojson",
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
                        "line-color": "#001121", // آبی
                        "line-width": 10,
                        "line-opacity": 0.2,
                    },
                });
            });
        }

        // مسیر پیشرفت (سبز)
        if (progressMarkerId) {
            const progressMarkerIndex = sortedMarkers.findIndex((m) => m.id === progressMarkerId);
            if (progressMarkerIndex >= 0) {
                const progressPathCoordinates = sortedMarkers
                    .slice(0, progressMarkerIndex + 1)
                    .map((marker) => [marker.lng, marker.lat]);

                if (progressPathCoordinates.length > 1) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-expect-error
                    fetchRoute(progressPathCoordinates).then((routeCoords) => {
                        if (!mapInstanceRef.current) return;

                        mapInstanceRef.current.addSource("progress-path", {
                            type: "geojson",
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
                                "line-color": "#7ad032", // سبز
                                "line-width": 10,
                                "line-opacity": 1,
                            },
                        });
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

    // فوکوس روی مارکر بدون رندر مجدد
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !mapLoaded || !focusMarkerId) return;

        const targetMarker = markers.find((m) => m.id === focusMarkerId);
        if (targetMarker) {
            map.easeTo({
                center: [targetMarker.lng, targetMarker.lat],
                zoom: zoom,
                pitch: targetMarker.pitch ?? defaultPitch, // زاویه عمودی (3D)
                duration: 10000,
            });

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
        }
    }, [focusMarkerId, markers, zoom, mapLoaded, defaultPitch]);

    return <div ref={mapRef} className={className}/>;
};

export default MapTiler;