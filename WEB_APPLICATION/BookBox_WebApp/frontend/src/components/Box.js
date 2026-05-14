import { useState } from 'react';

const BASE = 'http://localhost:5000/box';

function PacketBox() {
    const [name, setName] = useState('');
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [boxId, setBoxId] = useState('');
    const [bookIds, setBookIds] = useState('');
    const [status, setStatus] = useState('');
    const [boxes, setBoxes] = useState([]);

    async function handleCreate(e) {
        e.preventDefault();

        const res = await fetch(`${BASE}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, longitude, latitude }),
        });

        const data = await res.json();

        if (res.ok) {
            setStatus('Packet box created successfully.');
            console.log('created:', data);
        } else {
            setStatus(data.message || 'Create failed.');
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();

        if (!boxId) return setStatus('Box ID is required for update.');

        const res = await fetch(`${BASE}/${boxId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, longitude, latitude }),
        });

        const data = await res.json();

        if (res.ok) {
            setStatus('Packet box updated successfully.');
            console.log('updated:', data);
        } else {
            setStatus(data.message || 'Update failed.');
        }
    }

    async function handleDelete() {
        if (!boxId) return setStatus('Box ID is required for delete.');

        const res = await fetch(`${BASE}/${boxId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (res.ok) {
            setStatus('Packet box deleted successfully.');
            setBoxId('');
            setName('');
            setLongitude('');
            setLatitude('');
        } else {
            const data = await res.json();
            setStatus(data.message || 'Delete failed.');
        }
    }

    async function handleList() {
        const res = await fetch(`${BASE}/`, { credentials: 'include' });
        const data = await res.json();

        if (res.ok) {
            setBoxes(data);

            if (data[0]) {
                setBoxId(data[0]._id);
            }

            setStatus('Packet boxes loaded.');
            console.log('list:', data);
        } else {
            setStatus(data.message || 'List failed.');
        }
    }

    async function handleShow() {
        if (!boxId) return setStatus('Box ID is required for show.');

        const res = await fetch(`${BASE}/${boxId}`, { credentials: 'include' });
        const data = await res.json();

        if (res.ok) {
            setName(data.name || '');
            setLongitude(data.location?.coordinates?.[0] || '');
            setLatitude(data.location?.coordinates?.[1] || '');
            setStatus('Packet box loaded.');
            console.log('show:', data);
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
            console.log('addBooks result:', data);
        } else {
            setStatus(data.message || 'Add books failed.');
        }
    }

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <p style={styles.kicker}>Administration</p>
                <h1 style={styles.title}>Packet Boxes</h1>
                <p style={styles.subtitle}>
                    Create, edit and manage library packet boxes used for book pickup and returns.
                </p>
            </div>

            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div>
                        <p style={styles.kickerSmall}>Box details</p>
                        <h2 style={styles.cardTitle}>Location information</h2>
                    </div>

                    <button style={styles.outlineButton} onClick={handleList}>
                        List boxes
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
                </div>

                <div style={styles.actions}>
                    <button onClick={handleCreate}>Create</button>
                    <button style={styles.outlineButton} onClick={handleUpdate}>
                        Update
                    </button>
                </div>
            </div>

            <div style={styles.twoColumns}>
                <div style={styles.card}>
                    <p style={styles.kickerSmall}>Search</p>
                    <h2 style={styles.cardTitle}>Find box</h2>

                    <div style={styles.field}>
                        <label style={styles.label}>Box ID</label>
                        <input
                            type="text"
                            value={boxId}
                            onChange={(e) => setBoxId(e.target.value)}
                            placeholder="Paste packet box ID"
                        />
                    </div>

                    <div style={styles.actions}>
                        <button style={styles.outlineButton} onClick={handleShow}>
                            Show
                        </button>
                        <button style={styles.dangerButton} onClick={handleDelete}>
                            Delete
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

                                <h3 style={styles.boxName}>
                                    {box.name || 'Unnamed box'}
                                </h3>

                                <p style={styles.boxId}>ID: {box._id}</p>

                                {box.location?.coordinates?.length === 2 && (
                                    <p style={styles.coordinates}>
                                        {box.location.coordinates[1]}, {box.location.coordinates[0]}
                                    </p>
                                )}

                                <button
                                    style={styles.selectButton}
                                    onClick={() => {
                                        setBoxId(box._id);
                                        setName(box.name || '');
                                        setLongitude(box.location?.coordinates?.[0] || '');
                                        setLatitude(box.location?.coordinates?.[1] || '');
                                    }}
                                >
                                    Select
                                </button>
                            </article>
                        ))}
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
        paddingBottom: '38px',
        marginBottom: '34px',
        borderBottom: '1px solid #e6e1d8',
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
        maxWidth: '560px',
        color: '#777168',
        fontSize: '15px',
        lineHeight: 1.8,
    },

    card: {
        backgroundColor: '#ffffff',
        border: '1px solid #e6e1d8',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
        padding: '32px',
        marginBottom: '28px',
    },

    cardHeader: {
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
        gap: '22px',
    },

    twoColumns: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '28px',
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
};

export default PacketBox;