import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [46.5547, 15.6467];

const createBoxIcon = (count) =>
    L.divIcon({
        className: '',
        html: `
            <div style="
                width: 34px;
                height: 34px;
                border-radius: 999px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #171717;
                color: #f6d8b8;
                border: 2px solid #f2c18f;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.24);
                font-size: 16px;
                position: relative;
            ">
                <span>□</span>
                <span style="
                    position: absolute;
                    right: -6px;
                    top: -6px;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 4px;
                    border-radius: 999px;
                    background: #b88a5a;
                    color: #fff;
                    font-size: 10px;
                    line-height: 18px;
                    text-align: center;
                    font-weight: 800;
                ">${count}</span>
            </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -30],
    });

function MapClickHandler({ onPickLocation }) {
    useMapEvents({
        click(event) {
            if (!onPickLocation) return;

            onPickLocation({
                longitude: event.latlng.lng.toFixed(6),
                latitude: event.latlng.lat.toFixed(6),
            });
        },
    });

    return null;
}

function FitBounds({ boxes }) {
    const map = useMap();

    useEffect(() => {
        const points = boxes
            .map((box) => box.location?.coordinates)
            .filter((coordinates) => Array.isArray(coordinates) && coordinates.length === 2)
            .map(([longitude, latitude]) => [Number(latitude), Number(longitude)]);

        if (!points.length) return;

        if (points.length === 1) {
            map.setView(points[0], 13);
            return;
        }

        map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }, [boxes, map]);

    return null;
}

function BoxMap({ boxes = [], height = 320, center, zoom = 13, onPickLocation, scrollWheelZoom = true }) {
    const visibleBoxes = useMemo(
        () => boxes.filter((box) => Array.isArray(box.location?.coordinates) && box.location.coordinates.length === 2),
        [boxes]
    );

    const initialCenter = useMemo(() => {
        if (center) return center;

        const firstBox = visibleBoxes[0];

        if (!firstBox) return DEFAULT_CENTER;

        return [
            Number(firstBox.location.coordinates[1]),
            Number(firstBox.location.coordinates[0]),
        ];
    }, [center, visibleBoxes]);

    return (
        <div style={{ height, width: '100%' }}>
            <MapContainer center={initialCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={scrollWheelZoom}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds boxes={visibleBoxes} />
                <MapClickHandler onPickLocation={onPickLocation} />

                {visibleBoxes.map((box) => {
                    const [lng, lat] = box.location.coordinates;
                    const count = box.books?.length || 0;

                    return (
                        <Marker
                            key={box._id}
                            position={[Number(lat), Number(lng)]}
                            icon={createBoxIcon(count)}
                        >
                            <Popup>
                                <strong>{box.name || 'Unnamed box'}</strong>
                                <div>{Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}</div>
                                <div>{count} books</div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

export default BoxMap;