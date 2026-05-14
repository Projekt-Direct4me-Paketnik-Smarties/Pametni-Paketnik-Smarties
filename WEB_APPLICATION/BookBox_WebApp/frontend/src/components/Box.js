import { useState } from 'react';

const BASE = 'http://localhost:5000/box';

function PacketBox() {
    const [name, setName] = useState('');
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [boxId, setBoxId] = useState('');
    const [bookIds, setBookIds] = useState('');
    const [status, setStatus] = useState('');

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
            setStatus('box created');
            console.log('created:', data);
        } else {
            setStatus(data.message || 'create failed');
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        if (!boxId) return setStatus('box id required for update');
        const res = await fetch(`${BASE}/${boxId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, longitude, latitude }),
        });
        const data = await res.json();
        if (res.ok) {
            setStatus('box updated');
            console.log('updated:', data);
        } else {
            setStatus(data.message || 'update failed');
        }
    }

    async function handleDelete() {
        if (!boxId) return setStatus('box id required for delete');
        const res = await fetch(`${BASE}/${boxId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (res.ok) {
            setStatus('box deleted');
            setBoxId('');
        } else {
            const data = await res.json();
            setStatus(data.message || 'delete failed');
        }
    }

    async function handleList() {
        const res = await fetch(`${BASE}/`, { credentials: 'include' });
        const data = await res.json();
        if(data[0]!==undefined){
            setBoxId(data[0]._id)
            console.log(data[0]._id)
            console.log('list:', data);
        }
        setStatus('list logged to console');
    }

    async function handleShow() {
        if (!boxId) return setStatus('box id required for show');
        const res = await fetch(`${BASE}/${boxId}`, { credentials: 'include' });
        const data = await res.json();
        console.log('show:', data);
        setStatus('show logged to console');
    }

    async function handleAddBooks() {
        if (!boxId) return setStatus('box id required for adding books');
        if (!bookIds) return setStatus('enter at least one book id');

        const parsed = bookIds.split(',').map(s => s.trim()).filter(Boolean);

        const res = await fetch(`${BASE}/books/${boxId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ books: parsed }),
        });
        const data = await res.json();
        if (res.ok) {
            setStatus('books added');
            console.log('addBooks result:', data);
        } else {
            setStatus(data.message || 'add books failed');
        }
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>packet boxes</h2>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>box fields</h3>
                <div style={styles.grid}>
                    <div style={styles.field}>
                        <label style={styles.label}>name</label>
                        <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>longitude</label>
                        <input style={styles.input} type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="longitude" />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>latitude</label>
                        <input style={styles.input} type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="latitude" />
                    </div>
                </div>
                <div style={styles.actions}>
                    <button style={styles.button} onClick={handleCreate}>create</button>
                    <button style={styles.button} onClick={handleUpdate}>update</button>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>box id</h3>
                <div style={styles.field}>
                    <input style={styles.input} type="text" value={boxId} onChange={(e) => setBoxId(e.target.value)} placeholder="box id" />
                </div>
                <div style={styles.actions}>
                    <button style={styles.button} onClick={handleShow}>show</button>
                    <button style={{ ...styles.button, ...styles.danger }} onClick={handleDelete}>delete</button>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>add books to box</h3>
                <div style={styles.field}>
                    <label style={styles.label}>book ids (comma separated)</label>
                    <input style={styles.input} type="text" value={bookIds} onChange={(e) => setBookIds(e.target.value)} placeholder="id1, id2, id3" />
                </div>
                <div style={styles.actions}>
                    <button style={styles.button} onClick={handleAddBooks}>add books</button>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>list</h3>
                <button style={styles.button} onClick={handleList}>list all boxes</button>
            </div>

            {status && <p style={styles.status}>{status}</p>}
        </div>
    );
}

const styles = {
    card: {
        
        border: '1px solid #eee',
        borderRadius: '12px',
        padding: '1.5rem',
    },
    title: {
        fontSize: '15px',
        fontWeight: 500,
        marginBottom: '1.25rem',
    },
    section: {
        marginBottom: '1.25rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid #f0f0f0',
    },
    sectionTitle: {
        fontSize: '12px',
        marginBottom: '10px',
        fontWeight: 400,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '10px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '12px',
    },
    input: {
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        width: '100%',
    },
    actions: {
        display: 'flex',
        gap: '8px',
        marginTop: '8px',
    },
    button: {
        padding: '7px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        fontSize: '13px',
    },
    danger: {
        color: '#c0392b',
        borderColor: '#f5c6c6',
        fontWeight: 900,
    },
    status: {
        fontSize: '13px',
        marginTop: '8px',
    },
};

export default PacketBox;