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
    //const [photo, setPhoto] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

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

        if(res.ok) {
            setBooks(data);
            setStatus('books loaded');
        } else {
            setStatus(data.message || 'list failed');
        }

        /*
        setPhoto(data[0]);
        setBookId(data[0]._id)
        setStatus('list logged to console');
        */
    }

    async function handleShow() {
        if (!bookId) return setStatus('book id required for show');

        const res = await fetch(`${BASE}/${bookId}`, { credentials: 'include' });
        const data = await res.json();

        if(res.ok) {
            cconsole.log('show:', data);
            setTitle(data.title || '');
            setAuthor(data.author || '');
            setGenre(data.genre || '');
            setGlossary(data.glossary || '');
            setStatus('book loaded');
        } else {
            setStatus(data.message || 'show failed');
        }
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
            
            //better books list display
            {status && <p style={styles.status}>{status}</p>}

            <div style={styles.booksGrid}>
                {books.map((book) => (
                    <div key={book._id} style={styles.bookCard}>
                        <img
                            src={`http://localhost:5000${book.path}`}
                            alt={book.title}
                            style={styles.bookImage}
                        />
                        <div style={styles.bookContent}>
                            <h4 style={styles.bookTitle}>{book.title}</h4>
                            <p style={styles.bookAuthor}>{book.author}</p>
                            <p style={styles.bookGenre}>{book.genre}</p>
                            <span style={styles.bookStatus}>{book.status}</span>
                        </div>

                        <button style={styles.smallButton} onClick={() => {setBookId(book._id); setTitle(book.title || '');
                            setAuthor(book.authot || ''); setGenre(book.genre || ''); setGlossary(book.glossary || '');}}> select </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    card: {
        border: '1px solid #e8e8e8',
        borderRadius: '18px',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
    },

    title: {
        fontSize: '22px',
        fontWeight: 700,
        marginBottom: '1.5rem',
        color: '#222',
        textTransform: 'capitalize',
    },

    section: {
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #f0f0f0',
    },

    sectionTitle: {
        fontSize: '14px',
        marginBottom: '12px',
        fontWeight: 600,
        color: '#444',
        textTransform: 'capitalize',
    },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '12px',
    },

    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },

    label: {
        fontSize: '13px',
        fontWeight: 500,
        color: '#555',
        textTransform: 'capitalize',
    },

    input: {
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid #dcdcdc',
        fontSize: '14px',
        width: '100%',
        outline: 'none',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        color: '#222',
    },

    actions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '12px',
    },

    button: {
        padding: '9px 16px',
        borderRadius: '10px',
        border: '1px solid #d6d6d6',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: '0.2s',
        color: '#222',
    },

    danger: {
        color: '#c0392b',
        borderColor: '#f0b8b8',
        backgroundColor: '#fff7f7',
        fontWeight: 700,
    },

    status: {
        fontSize: '14px',
        marginTop: '10px',
        marginBottom: '14px',
        padding: '10px 12px',
        borderRadius: '10px',
        backgroundColor: '#f6f7fb',
        color: '#444',
        border: '1px solid #ececec',
    },

    booksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '18px',
        marginTop: '18px',
    },

    bookCard: {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #eeeeee',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.07)',
    },

    bookImage: {
        width: '100%',
        height: '240px',
        objectFit: 'cover',
        backgroundColor: '#f3f3f3',
    },

    bookContent: {
        padding: '14px',
        flex: 1,
    },

    bookTitle: {
        margin: 0,
        fontSize: '17px',
        fontWeight: 700,
        color: '#222',
        lineHeight: 1.3,
    },

    bookAuthor: {
        margin: '7px 0 0',
        fontSize: '14px',
        color: '#666',
    },

    bookGenre: {
        margin: '5px 0 0',
        fontSize: '13px',
        color: '#888',
    },

    bookStatus: {
        display: 'inline-block',
        marginTop: '10px',
        padding: '5px 10px',
        borderRadius: '999px',
        backgroundColor: '#eef6ee',
        color: '#2e7d32',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'capitalize',
    },

    smallButton: {
        margin: '0 14px 14px',
        padding: '9px 12px',
        borderRadius: '10px',
        border: '1px solid #dddddd',
        backgroundColor: '#fafafa',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
    },
};

export default Books;