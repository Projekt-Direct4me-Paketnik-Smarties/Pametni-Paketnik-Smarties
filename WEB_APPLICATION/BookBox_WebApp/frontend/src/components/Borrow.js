import { useState } from 'react';
import { apiFetch } from '../apiFetch.js';

function Borrow() {
    const [bookIds, setBookIds] = useState('');
    const [boxId, setBoxId] = useState('');
    const [borrowId, setBorrowId] = useState('');
    const [status, setStatus] = useState('');

    async function handleBorrow() {
        if (!bookIds) return setStatus('enter at least one book id');
        if (!boxId) return setStatus('box id required');
        const parsed = bookIds.split(',').map(s => s.trim()).filter(Boolean);
        const res = await apiFetch('/borrow/', {
            method: 'POST',
            body: JSON.stringify({ books: parsed, packetBox: boxId }),
        });
        const data = await res.json();
        if (res.ok) {
            setStatus('borrow created');
            console.log('borrow:', data);
        } else {
            setStatus(data.message || 'borrow failed');
        }
    }

    async function handleReturn() {
        if (!bookIds) return setStatus('enter at least one book id');
        if (!boxId) return setStatus('box id required');
        const parsed = bookIds.split(',').map(s => s.trim()).filter(Boolean);
        const res = await apiFetch('/borrow/return', {
            method: 'POST',
            body: JSON.stringify({ books: parsed, packetBox: boxId }),
        });
        const data = await res.json();
        if (res.ok) {
            setStatus('books returned');
            console.log('return:', data);
        } else {
            setStatus(data.message || 'return failed');
        }
    }

    async function handleList() {
        const res = await apiFetch(`/borrow`);
        const data = await res.json();
        console.log('list (mine):', data);
        setStatus('list logged to console');
    }

    async function handleListAll() {
        const res = await apiFetch(`/borrow/all`);
        const data = await res.json();
        console.log('list (all):', data);
        setStatus('all borrows logged to console');
    }

    async function handleShow() {
        if (!borrowId) return setStatus('borrow id required for show');
        const res = await apiFetch(`/borrow/${borrowId}`);
        const data = await res.json();
        console.log('show:', data);
        setStatus('show logged to console');
    }

    async function handleDelete() {
        if (!borrowId) return setStatus('borrow id required for delete');
        const res = await apiFetch(`/borrow/${borrowId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (res.ok) {
            setStatus('borrow deleted');
            setBorrowId('');
        } else {
            const data = await res.json();
            setStatus(data.message || 'delete failed');
        }
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>borrows</h2>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>borrow / return books</h3>
                <div style={styles.field}>
                    <label style={styles.label}>book ids (comma separated)</label>
                    <input style={styles.input} type="text" value={bookIds} onChange={(e) => setBookIds(e.target.value)} placeholder="id1, id2, id3" />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>box id</label>
                    <input style={styles.input} type="text" value={boxId} onChange={(e) => setBoxId(e.target.value)} placeholder="box id" />
                </div>
                <div style={styles.actions}>
                    <button style={styles.button} onClick={handleBorrow}>borrow</button>
                    <button style={styles.button} onClick={handleReturn}>return</button>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>borrow id</h3>
                <div style={styles.field}>
                    <input style={styles.input} type="text" value={borrowId} onChange={(e) => setBorrowId(e.target.value)} placeholder="borrow id" />
                </div>
                <div style={styles.actions}>
                    <button style={styles.button} onClick={handleShow}>show</button>
                    <button style={{ ...styles.button, ...styles.danger }} onClick={handleDelete}>delete</button>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>list</h3>
                <div style={styles.actions}>
                    <button style={styles.button} onClick={handleList}>my borrows</button>
                    <button style={styles.button} onClick={handleListAll}>all borrows (admin)</button>
                </div>
            </div>

            {status && <p style={styles.status}>{status}</p>}
        </div>
    );
}

const styles = {
    card: {
        background: '#fff',
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
        color: '#666',
        marginBottom: '10px',
        fontWeight: 400,
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '10px',
    },
    label: {
        fontSize: '12px',
        color: '#666',
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
        marginTop: '4px',
    },
    button: {
        padding: '7px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '13px',
    },
    danger: {
        color: '#c0392b',
        borderColor: '#f5c6c6',
    },
    status: {
        fontSize: '13px',
        color: '#666',
        marginTop: '8px',
    },
};

export default Borrow;