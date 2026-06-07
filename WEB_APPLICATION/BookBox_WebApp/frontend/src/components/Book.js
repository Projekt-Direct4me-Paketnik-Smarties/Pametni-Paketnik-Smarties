import { useState } from 'react';
import { apiFetch, uploadImage } from '../apiFetch.js';

const IMAGE_BASE = 'http://localhost:5000';

function Books() {
    const [title, setTitle] = useState('');
    const [userId, setUserId] = useState('');
    const [glossary, setGlossary] = useState('');
    const [genre, setGenre] = useState('');
    const [author, setAuthor] = useState('');
    const [image, setImage] = useState(null);
    const [bookId, setBookId] = useState('');
    const [status, setStatus] = useState('');
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        handleList();
    }, []);

    function buildFormData() {
        const fd = new FormData();
        fd.append('title', title);
        fd.append('glossary', glossary);
        fd.append('genre', genre);
        fd.append('author', author);

        if (image) {
            fd.append('image', image);
        }

        return fd;
    }

    function clearForm() {
        setTitle('');
        setAuthor('');
        setGenre('');
        setGlossary('');
        setImage(null);
        setBookId('');
        setSelectedBook(null);
    }

    function fillForm(book) {
        setSelectedBook(book);
        setBookId(book._id);
        setTitle(book.title || '');
        setAuthor(book.author || '');
        setGenre(book.genre || '');
        setGlossary(book.glossary || '');
    }

    async function handleCreate(e) {
        e.preventDefault();
        console.log("HERE")
        try{
        const res = await uploadImage(`/books/`, {
            method: 'POST',
            body: buildFormData(),
        });
        let data = null;

        try {
            data = await res.json();
            console.log("pasing data")
        } catch {
            console.log("error parsing data")
            data = null;
        }

        if (res.ok) {
            setStatus('Book created successfully.');
            console.log('created:', data);
            await handleList();
        } else {
            console.log("result not ok")
            setStatus(data?.message || 'Create failed.');
        }
        
        } catch(error){
            console.log(error.message)
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();

        if (!bookId) {
            return setStatus('Book ID is required for update.');
        }

        const res = await uploadImage(`/books/${bookId}`, {
            method: 'PUT',
            body: buildFormData(),
        });

        let data = null;

        try {
            data = await res.json();
        } catch {
            data = null;
        }

        if (res.ok) {
            setStatus('Book updated successfully.');
            console.log('updated:', data);
            await handleList();
        } else {
            setStatus(data?.message || 'Update failed.');
        }
    }

    async function handleDelete() {
        if (!bookId) {
            return setStatus('Book ID is required for delete.');
        }

        const res = await apiFetch(`/books/${bookId}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setStatus('Book deleted successfully.');
            clearForm();
            await handleList();
        } else {
            let data = null;

            try {
                data = await res.json();
            } catch {
                data = null;
            }

            setStatus(data?.message || 'Delete failed.');
        }
    }

    async function handleList() {
        console.log("running handleList")
        const res = await apiFetch(`/books/`);
        console.log("got result")

        const data = await res.json();
        
        console.log("parsed data")
        if (res.ok) {
            setBooks(data);
            console.log('list:', data);
        } else {
            setStatus(data.message || 'List failed.');
        }
    }

    async function handleShow() {
        if (!bookId) {
            return setStatus('Book ID is required for show.');
        }

        const res = await apiFetch(`/books/${bookId}`);

        const data = await res.json();

        if (res.ok) {
            console.log('show:', data);
            fillForm(data);
            setStatus('Book loaded.');
        } else {
            setStatus(data.message || 'Show failed.');
        }
    }

    function getStatusStyle(bookStatus) {
        if (bookStatus === 'available') {
            return { ...styles.bookStatus, ...styles.available };
        }

        if (bookStatus === 'reserved') {
            return { ...styles.bookStatus, ...styles.reserved };
        }

        if (bookStatus === 'borrowed') {
            return { ...styles.bookStatus, ...styles.borrowed };
        }

        return styles.bookStatus;
    }
    
    async function handleMyBooks() {
        const res = await apiFetch(`/books/myBook/`);

        const data = await res.json();

        if (res.ok) {
            setBooks(data);
            setStatus('Books loaded.');
            console.log('list:', data);
        } else {
            setStatus(data.message || 'List failed.');
        }
    }

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <p style={styles.kicker}>Library administration</p>
                <h1 style={styles.title}>Books</h1>
                <p style={styles.subtitle}>
                    Add, edit and manage books in your library collection. Select a book from the list
                    to quickly update its information.
                </p>
            </div>

            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div>
                        <p style={styles.kickerSmall}>Book details</p>
                        <h2 style={styles.cardTitle}>Add or edit book</h2>
                    </div>

                    <button style={styles.outlineButton} onClick={handleList}>
                        List books
                    </button>
                </div>

                <div style={styles.formGrid}>
                    <div style={styles.field}>
                        <label style={styles.label}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Book title"
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Author</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Book author"
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Genre</label>
                        <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="Genre"
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Glossary</label>
                        <input
                            type="text"
                            value={glossary}
                            onChange={(e) => setGlossary(e.target.value)}
                            placeholder="Short description"
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Cover image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Book ID</label>
                        <input
                            type="text"
                            value={bookId}
                            onChange={(e) => setBookId(e.target.value)}
                            placeholder="Paste book ID"
                        />
                    </div>
                </div>

                <div style={styles.actions}>
                    <button onClick={handleCreate}>Create</button>
                    <button style={styles.outlineButton} onClick={handleUpdate}>
                        Update
                    </button>
                    <button style={styles.outlineButton} onClick={handleShow}>
                        Show
                    </button>
                    <button style={styles.dangerButton} onClick={handleDelete}>
                        Delete
                    </button>
                    <button style={styles.textButton} onClick={clearForm}>
                        Clear
                    </button>
                </div>
            </div>

            {selectedBook && (
                <div style={styles.selectedCard}>
                    <div>
                        <p style={styles.kickerSmall}>Selected book</p>
                        <h2 style={styles.selectedTitle}>{selectedBook.title}</h2>
                        <p style={styles.selectedMeta}>
                            {selectedBook.author} · {selectedBook.genre}
                        </p>
                    </div>

                    <span style={getStatusStyle(selectedBook.status)}>
                        {selectedBook.status}
                    </span>
                </div>
            )}

            {status && <p style={styles.status}>{status}</p>}

            <div style={styles.listHeader}>
                <div>
                    <p style={styles.kickerSmall}>Overview</p>
                    <h2 style={styles.cardTitle}>Book collection</h2>
                </div>

                {books.length > 0 && (
                    <p style={styles.countText}>
                        {books.length} {books.length === 1 ? 'book' : 'books'}
                    </p>
                )}
            </div>

            {books.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyTitle}>No books loaded yet.</p>
                    <p style={styles.emptyText}>
                        Click “List books” to display the current library collection.
                    </p>
                </div>
            ) : (
                <div style={styles.booksGrid}>
                    {books.map((book) => (
                        <article key={book._id} style={styles.bookCard}>
                            <div style={styles.imageWrap}>
                                <img
                                    src={`${IMAGE_BASE}${book.path}`}
                                    alt={book.title}
                                    style={styles.bookImage}
                                />
                            </div>

                            <div style={styles.bookContent}>
                                <p style={styles.bookGenre}>{book.genre || 'Unknown genre'}</p>
                                <h3 style={styles.bookTitle}>{book.title}</h3>
                                <p style={styles.bookAuthor}>{book.author || 'Unknown author'}</p>
                                <p style={styles.bookAuthor}>{book._id || 'Unknown id'}</p>

                                {book.glossary && (
                                    <p style={styles.bookGlossary}>{book.glossary}</p>
                                )}

                                <span style={getStatusStyle(book.status)}>
                                    {book.status || 'unknown'}
                                </span>
                            </div>

                            <button
                                style={styles.selectButton}
                                onClick={() => fillForm(book)}
                            >
                                Select
                            </button>
                        </article>
                    ))}
                </div>
            )}
            <input style={styles.input} type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="borrow id" />
            <div style={styles.actions}>
                <button style={styles.button} onClick={handleMyBooks}>myBooks</button>
            </div>
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
        maxWidth: '620px',
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

    textButton: {
        backgroundColor: 'transparent',
        color: '#777168',
        border: '1px solid transparent',
        boxShadow: 'none',
    },

    selectedCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '18px',
        padding: '22px 26px',
        marginBottom: '28px',
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
    },

    selectedTitle: {
        margin: 0,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '28px',
        lineHeight: 1.05,
        fontWeight: 400,
        color: '#171717',
    },

    selectedMeta: {
        margin: '8px 0 0',
        color: '#777168',
        fontSize: '13px',
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

    listHeader: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '18px',
        marginTop: '36px',
        marginBottom: '22px',
    },

    countText: {
        margin: 0,
        color: '#8a867d',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
    },

    emptyState: {
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
        padding: '34px',
        textAlign: 'center',
    },

    emptyTitle: {
        margin: 0,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '28px',
        color: '#171717',
    },

    emptyText: {
        margin: '10px 0 0',
        color: '#777168',
        fontSize: '14px',
    },

    booksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '28px',
    },

    bookCard: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid #e6e1d8',
        boxShadow: '0 12px 34px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    },

    imageWrap: {
        width: '100%',
        height: '310px',
        overflow: 'hidden',
        borderBottom: '1px solid #e6e1d8',
        backgroundColor: '#efede8',
    },

    bookImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },

    bookContent: {
        flex: 1,
        padding: '20px',
    },

    bookGenre: {
        margin: '0 0 12px',
        color: '#b88a5a',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
    },

    bookTitle: {
        margin: 0,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '27px',
        lineHeight: 1.05,
        fontWeight: 400,
        color: '#171717',
        letterSpacing: '-0.035em',
    },

    bookAuthor: {
        margin: '10px 0 0',
        color: '#777168',
        fontSize: '13px',
    },

    bookGlossary: {
        margin: '14px 0 0',
        color: '#6f6a62',
        fontSize: '13px',
        lineHeight: 1.6,
    },

    bookStatus: {
        display: 'inline-flex',
        alignItems: 'center',
        marginTop: '16px',
        padding: '6px 10px',
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
        color: '#6f6a62',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
    },

    available: {
        borderColor: '#bdd7c4',
        backgroundColor: '#f4fbf6',
        color: '#2f7a48',
    },

    reserved: {
        borderColor: '#ead39b',
        backgroundColor: '#fffaf0',
        color: '#a06a00',
    },

    borrowed: {
        borderColor: '#d9c2bd',
        backgroundColor: '#fff7f5',
        color: '#9f3a2f',
    },

    selectButton: {
        margin: '0 20px 20px',
        width: 'calc(100% - 40px)',
    },
};

export default Books;