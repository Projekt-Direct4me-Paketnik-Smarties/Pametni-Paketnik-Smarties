import { useState } from 'react';

const BASE = 'http://localhost:5000/books';

function Books() {
    const [title, setTitle] = useState('');
    const [glossary, setGlossary] = useState('');
    const [genre, setGenre] = useState('');
    const [author, setAuthor] = useState('');
    const [image, setImage] = useState(null);
    const [bookId, setBookId] = useState('');
    const [status, setStatus] = useState('');
    const [photo, setPhoto] = useState([]);

    function buildFormData() {
        const fd = new FormData();
        fd.append('title', title);
        fd.append('glossary', glossary);
        fd.append('genre', genre);
        fd.append('author', author);
        if (image) fd.append('image', image);
        return fd;
    }

    async function handleCreate(e) {
        e.preventDefault();
        const res = await fetch(`${BASE}/`, {
            method: 'POST',
            credentials: 'include',
            body: buildFormData(),
        });
        const data = await res.json();
        if (res.ok) {
            setStatus('book created');
            console.log('created:', data);
        } else {
            setStatus(data.message || 'create failed');
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        if (!bookId) return setStatus('book id required for update');
        const res = await fetch(`${BASE}/${bookId}`, {
            method: 'PUT',
            credentials: 'include',
            body: buildFormData(),
        });
        const data = await res.json();
        if (res.ok) {
            setStatus('book updated');
            console.log('updated:', data);
        } else {
            setStatus(data.message || 'update failed');
        }
    }

    async function handleDelete() {
        if (!bookId) return setStatus('book id required for delete');
        const res = await fetch(`${BASE}/${bookId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (res.ok) {
            setStatus('book deleted');
            setBookId('');
        } else {
            const data = await res.json();
            setStatus(data.message || 'delete failed');
        }
    }

    async function handleList() {
        const res = await fetch(`${BASE}/`, { credentials: 'include' });
        const data = await res.json();
        console.log('list:', data);
        setPhoto(data[0]);
        setBookId(data[0]._id)
        setStatus('list logged to console');
    }

    async function handleShow() {
        if (!bookId) return setStatus('book id required for show');
        const res = await fetch(`${BASE}/${bookId}`, { credentials: 'include' });
        const data = await res.json();
        console.log('show:', data);
        setPhoto(data)
        setBookId(data._id)
        console.log(photo.path)
        console.log(photo)
        setStatus('show logged to console');
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>books</h2>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>book fields</h3>
                <div style={styles.grid}>
                    <div style={styles.field}>
                        <label style={styles.label}>title</label>
                        <input style={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title" />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>author</label>
                        <input style={styles.input} type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="author" />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>genre</label>
                        <input style={styles.input} type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="genre" />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>glossary</label>
                        <input style={styles.input} type="text" value={glossary} onChange={(e) => setGlossary(e.target.value)} placeholder="glossary" />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>cover image (optional)</label>
                        <input style={styles.input} type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                    </div>
                </div>
                <div style={styles.actions}>
                    <button style={styles.button} onClick={handleCreate}>create</button>
                    <button style={styles.button} onClick={handleUpdate}>update</button>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>book id</h3>
                <div style={styles.field}>
                    <input style={styles.input} type="text" value={bookId} onChange={(e) => setBookId(e.target.value)} placeholder="book id" />
                </div>
                <div style={styles.actions}>
                    <button style={styles.button} onClick={handleShow}>show</button>
                    <button style={{ ...styles.button, ...styles.danger }} onClick={handleDelete}>delete</button>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>list</h3>
                <button style={styles.button} onClick={handleList}>list all books</button>
            </div>

            {status && <p style={styles.status}>{status}</p>}

            <div>
                <img src={"http://localhost:5000"+photo.path} alt={title}></img>
            </div>
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

export default Books;