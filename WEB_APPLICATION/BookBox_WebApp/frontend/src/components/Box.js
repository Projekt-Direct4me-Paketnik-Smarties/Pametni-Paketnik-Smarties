import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BASE = 'http://localhost:5000/box';
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

        map.fitBounds(L.latLngBounds(points), { padding: [48, 48] });
    }, [boxes, map]);

    return null;
}
import { useState } from 'react';
import { apiFetch } from '../apiFetch.js';

function PacketBox() {
    const [name, setName] = useState('');
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [boxId, setBoxId] = useState('');
    const [status, setStatus] = useState('');
    const [boxes, setBoxes] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const mapCenter = useMemo(() => {
        const firstBox = boxes.find((box) => Array.isArray(box.location?.coordinates) && box.location.coordinates.length === 2);

        if (!firstBox) return DEFAULT_CENTER;

        return [
            Number(firstBox.location.coordinates[1]),
            Number(firstBox.location.coordinates[0]),
        ];
    }, [boxes]);

    const markerBoxes = useMemo(
        () =>
            boxes.filter(
                (box) => Array.isArray(box.location?.coordinates) && box.location.coordinates.length === 2
            ),
        [boxes]
    );

    async function loadBoxes() {
        const res = await fetch(`${BASE}/`, { credentials: 'include' });
        const data = await res.json();

        if (res.ok) {
            setBoxes(data);
            setStatus(data.length ? 'Packet boxes loaded.' : 'No packet boxes yet. Click the map to add one.');

            if (!boxId && data[0]) {
                setBoxId(data[0]._id);
            }
        } else {
            setStatus(data.message || 'List failed.');
        }
    }

    useEffect(() => {
        let ignore = false;

        const syncBoxes = async () => {
            const res = await fetch(`${BASE}/`, { credentials: 'include' });
            const data = await res.json();

            if (ignore) return;

            if (res.ok) {
                setBoxes(data);
                setStatus(data.length ? 'Packet boxes loaded.' : 'No packet boxes yet. Click the map to add one.');
            } else {
                setStatus(data.message || 'List failed.');
            }
        };

        syncBoxes();

        return () => {
            ignore = true;
        };
    }, []);

    function openCreateOverlay(nextCoordinates) {
        setName('');
        setLongitude(nextCoordinates.longitude);
        setLatitude(nextCoordinates.latitude);
        setIsCreateOpen(true);
        setStatus(`Picked ${nextCoordinates.latitude}, ${nextCoordinates.longitude}.`);
    }

    async function handleCreate(e) {
        e.preventDefault();

        const res = await apiFetch(`/box/`, {
            method:'POST',
            body: JSON.stringify({ name, longitude, latitude }),
        });

        const data = await res.json();

        if (res.ok) {
            setStatus('Packet box created successfully.');
            setIsCreateOpen(false);
            setName('');
            setLongitude('');
            setLatitude('');
            setBoxId(data._id || '');
            await loadBoxes();
        } else {
            setStatus(data.message || 'Create failed.');
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();

        if (!boxId) return setStatus('Box ID is required for update.');

        const res = await apiFetch(`/box/${boxId}`, {
            method: 'PUT',
            body: JSON.stringify({ name, longitude, latitude }),
        });

        const data = await res.json();

        if (res.ok) {
            setStatus('Packet box updated successfully.');
            await loadBoxes();
        } else {
            setStatus(data.message || 'Update failed.');
        }
    }

    async function handleDelete() {
        if (!boxId) return setStatus('Box ID is required for delete.');

        const res = await apiFetch(`/box/${boxId}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setStatus('Packet box deleted successfully.');
            setBoxId('');
            setName('');
            setLongitude('');
            setLatitude('');
            await loadBoxes();
        } else {
            const data = await res.json();
            setStatus(data.message || 'Delete failed.');
        }
    }

    async function handleShow() {
        if (!boxId) return setStatus('Box ID is required for show.');

        const res = await apiFetch(`/box/${boxId}`);
        const data = await res.json();

        if (res.ok) {
            setName(data.name || '');
            setLongitude(data.location?.coordinates?.[0] ?? '');
            setLatitude(data.location?.coordinates?.[1] ?? '');
            setStatus('Packet box loaded.');
        } else {
            setStatus(data.message || 'Show failed.');
        }
    }

    async function handleAddBooks() {
        if (!boxId) return setStatus('Box ID is required for adding books.');
        if (!bookIds) return setStatus('Enter at least one book ID.');

        const parsed = bookIds
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        const res = await fetch(`${BASE}/books/${boxId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ books: parsed }),
        });

        const data = await res.json();

        if (res.ok) {
            setStatus('Books added to packet box.');
        } else {
            setStatus(data.message || 'Add books failed.');
        }
    }

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <div>
                    <p style={styles.kicker}>Administration</p>
                    <h1 style={styles.title}>Manage Boxes</h1>
                    <p style={styles.subtitle}>
                        Click anywhere on the map to stage a new packet box. Existing boxes stay visible as markers and can still be edited from the side panel.
                    </p>
                </div>

                <div style={styles.heroStats}>
                    <div style={styles.statCard}>
                        <span style={styles.statLabel}>Visible boxes</span>
                        <strong style={styles.statValue}>{markerBoxes.length}</strong>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statLabel}>Create mode</span>
                        <strong style={styles.statValue}>{isCreateOpen ? 'Open' : 'Closed'}</strong>
                    </div>
                </div>
            </div>

            <div style={styles.mapLayout}>
                <div style={styles.mapCard}>
                    <div style={styles.mapHeader}>
                        <div>
                            <p style={styles.kickerSmall}>Map</p>
                            <h2 style={styles.cardTitle}>Box locations</h2>
                        </div>

                        <button style={styles.outlineButton} onClick={() => setIsCreateOpen(true)}>
                            Add box manually
                        </button>
                    </div>

                    <div style={styles.mapFrame}>
                        <MapContainer center={mapCenter} zoom={13} style={styles.map} scrollWheelZoom>
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickHandler onPickLocation={openCreateOverlay} />
                            <FitBounds boxes={markerBoxes} />

                            {markerBoxes.map((box) => {
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

                    <p style={styles.mapHint}>
                        Tip: click any point on the map to prefill longitude and latitude in the create overlay.
                    </p>
                </div>

                <div style={styles.sideColumn}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div>
                                <p style={styles.kickerSmall}>Box details</p>
                                <h2 style={styles.cardTitle}>Edit selected box</h2>
                            </div>

                            <button style={styles.outlineButton} onClick={loadBoxes}>
                                Refresh
                            </button>
                        </div>

                        <div style={styles.formGrid}>
                            <div style={styles.field}>
                                <label style={styles.label}>Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Box Maribor Center"
                                />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Longitude</label>
                                <input
                                    type="text"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    placeholder="15.6467"
                                />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Latitude</label>
                                <input
                                    type="text"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    placeholder="46.5547"
                                />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Box ID</label>
                                <input
                                    type="text"
                                    value={boxId}
                                    onChange={(e) => setBoxId(e.target.value)}
                                    placeholder="Paste packet box ID"
                                />
                            </div>
                        </div>

                        <div style={styles.actions}>
                            <button onClick={handleCreate}>Create</button>
                            <button style={styles.outlineButton} onClick={handleUpdate}>
                                Update
                            </button>
                            <button style={styles.dangerButton} onClick={handleDelete}>
                                Delete
                            </button>
                        </div>

                        <div style={styles.actions}>
                            <button style={styles.outlineButton} onClick={handleShow}>
                                Load box by ID
                            </button>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <p style={styles.kickerSmall}>Books</p>
                        <h2 style={styles.cardTitle}>Assign books</h2>

                        <div style={styles.field}>
                            <label style={styles.label}>Book IDs</label>
                            <input
                                type="text"
                                value={bookIds}
                                onChange={(e) => setBookIds(e.target.value)}
                                placeholder="id1, id2, id3"
                            />
                        </div>

                        <div style={styles.actions}>
                            <button onClick={handleAddBooks}>Add books</button>
                        </div>
                    </div>
                </div>
            </div>

            {status && <p style={styles.status}>{status}</p>}

            {boxes.length > 0 && (
                <div style={styles.listSection}>
                    <div style={styles.listHeader}>
                        <p style={styles.kickerSmall}>Overview</p>
                        <h2 style={styles.cardTitle}>All packet boxes</h2>
                    </div>

                    <div style={styles.boxGrid}>
                        {boxes.map((box) => (
                            <article key={box._id} style={styles.boxCard}>
                                <div style={styles.boxTop}>
                                    <span style={styles.boxIcon}>□</span>
                                    <span style={styles.bookCount}>
                                        {box.books?.length || 0} books
                                    </span>
                                </div>

                                <h3 style={styles.boxName}>{box.name || 'Unnamed box'}</h3>
                                <p style={styles.boxId}>ID: {box._id}</p>

                                {box.location?.coordinates?.length === 2 && (
                                    <p style={styles.coordinates}>
                                        {Number(box.location.coordinates[1]).toFixed(6)}, {Number(box.location.coordinates[0]).toFixed(6)}
                                    </p>
                                )}

                                <button
                                    style={styles.selectButton}
                                    onClick={() => {
                                        setBoxId(box._id);
                                        setName(box.name || '');
                                        setLongitude(box.location?.coordinates?.[0] ?? '');
                                        setLatitude(box.location?.coordinates?.[1] ?? '');
                                    }}
                                >
                                    Select
                                </button>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {isCreateOpen && (
                <div style={styles.modalBackdrop} onClick={() => setIsCreateOpen(false)}>
                    <div style={styles.modalCard} onClick={(event) => event.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div>
                                <p style={styles.kickerSmall}>Create box</p>
                                <h2 style={styles.cardTitle}>New packet box</h2>
                            </div>

                            <button style={styles.outlineButton} onClick={() => setIsCreateOpen(false)}>
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div style={styles.formGrid}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Box Maribor Center"
                                    />
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Longitude</label>
                                    <input
                                        type="text"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="15.6467"
                                    />
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Latitude</label>
                                    <input
                                        type="text"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="46.5547"
                                    />
                                </div>
                            </div>

                            <div style={styles.actions}>
                                <button type="submit">Create box</button>
                                <button type="button" style={styles.outlineButton} onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

const styles = {
    wrapper: {
        width: '100%',
    },

    hero: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '28px',
        paddingBottom: '28px',
        marginBottom: '28px',
        borderBottom: '1px solid #e6e1d8',
    },

    heroStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(130px, 1fr))',
        gap: '14px',
        alignSelf: 'flex-start',
    },

    statCard: {
        minWidth: '140px',
        padding: '16px',
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
    },

    statLabel: {
        display: 'block',
        marginBottom: '8px',
        color: '#8a867d',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
    },

    statValue: {
        fontSize: '26px',
        color: '#171717',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontWeight: 400,
        letterSpacing: '-0.04em',
    },

    kicker: {
        margin: '0 0 14px',
        color: '#b88a5a',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
    },

    title: {
        margin: 0,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 'clamp(42px, 6vw, 70px)',
        lineHeight: 0.95,
        fontWeight: 400,
        color: '#171717',
        letterSpacing: '-0.05em',
    },

    subtitle: {
        margin: '20px 0 0',
        maxWidth: '660px',
        color: '#777168',
        fontSize: '15px',
        lineHeight: 1.8,
    },

    mapLayout: {
        display: 'grid',
        gridTemplateColumns: '1.3fr 0.7fr',
        gap: '28px',
        alignItems: 'start',
    },

    mapCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e6e1d8',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
        padding: '24px',
    },

    mapHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '18px',
        marginBottom: '18px',
    },

    mapFrame: {
        position: 'relative',
        border: '1px solid #e6e1d8',
        overflow: 'hidden',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #f7f2ea 0%, #ece4d7 100%)',
    },

    map: {
        width: '100%',
        height: '560px',
    },

    mapHint: {
        margin: '16px 0 0',
        color: '#6f6a62',
        fontSize: '13px',
        lineHeight: 1.6,
    },

    sideColumn: {
        display: 'grid',
        gap: '28px',
    },

    card: {
        backgroundColor: '#ffffff',
        border: '1px solid #e6e1d8',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
        padding: '28px',
    },

    cardHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '18px',
        marginBottom: '26px',
    },

    modalHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '18px',
        marginBottom: '26px',
    },

    kickerSmall: {
        margin: '0 0 10px',
        color: '#b88a5a',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
    },

    cardTitle: {
        margin: 0,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '31px',
        lineHeight: 1.05,
        fontWeight: 400,
        color: '#171717',
        letterSpacing: '-0.035em',
    },

    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '18px',
    },

    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '9px',
    },

    label: {
        color: '#6f6a62',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
    },

    actions: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginTop: '24px',
    },

    outlineButton: {
        backgroundColor: '#ffffff',
        color: '#202020',
        border: '1px solid #cfc7ba',
    },

    dangerButton: {
        backgroundColor: '#ffffff',
        color: '#b42318',
        border: '1px solid #e7b4ad',
    },

    status: {
        margin: '0 0 28px',
        padding: '14px 16px',
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
        color: '#6f6a62',
        fontSize: '13px',
        lineHeight: 1.6,
        textAlign: 'center',
    },

    listSection: {
        marginTop: '36px',
    },

    listHeader: {
        marginBottom: '22px',
    },

    boxGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '26px',
    },

    boxCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e6e1d8',
        padding: '24px',
        boxShadow: '0 12px 34px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    },

    boxTop: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
    },

    boxIcon: {
        width: '38px',
        height: '38px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e6e1d8',
        color: '#b88a5a',
        fontSize: '19px',
    },

    bookCount: {
        color: '#8a867d',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
    },

    boxName: {
        margin: 0,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '26px',
        lineHeight: 1.05,
        fontWeight: 400,
        color: '#171717',
        letterSpacing: '-0.035em',
    },

    boxId: {
        margin: '14px 0 0',
        color: '#8a867d',
        fontSize: '12px',
        lineHeight: 1.6,
        wordBreak: 'break-all',
    },

    coordinates: {
        margin: '10px 0 0',
        color: '#6f6a62',
        fontSize: '13px',
        fontWeight: 700,
    },

    selectButton: {
        marginTop: '22px',
        width: '100%',
    },

    modalBackdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 17, 17, 0.58)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 5000,
    },

    modalCard: {
        width: 'min(760px, 100%)',
        backgroundColor: '#ffffff',
        border: '1px solid #e6e1d8',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.32)',
        padding: '30px',
    },
};

export default PacketBox;