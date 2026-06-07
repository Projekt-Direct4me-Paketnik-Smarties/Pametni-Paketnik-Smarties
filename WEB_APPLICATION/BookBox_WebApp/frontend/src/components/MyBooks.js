import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../userContext.js';
import { apiFetch } from '../apiFetch.js';

const RETURN_HOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function MyBooks() {
    const { user } = useContext(UserContext);
    const [books, setBooks] = useState([]);
    const [status, setStatus] = useState('');

    async function fetchMyBooks() {
        const res = await apiFetch('/books/myBook/');
        if (res.ok) {
            const data = await res.json();
            setBooks(data);
        } else {
            setBooks([]);
        }
    }

    useEffect(() => {
        if (user) fetchMyBooks();
    }, [user]);

    function pendingReturnUntil(book) {
        if (!book.returnRequestedAt) return null;
        const expires = new Date(book.returnRequestedAt).getTime() + RETURN_HOLD_MS;
        return expires > Date.now() ? new Date(expires) : null;
    }

    async function handleRequestReturn(bookId) {
        setStatus('');
        const res = await apiFetch(`/books/${bookId}/request-return`, { method: 'POST' });
        if (res.ok) {
            setStatus('Return requested. This book will stay in the box and stay hidden from other users for 3 days.');
            fetchMyBooks();
        } else {
            const err = await res.json();
            setStatus(err.message || 'Could not request return.');
        }
    }

    const statusStyles = {
        owned: styles.badgeOwned,
        available: styles.badgeAvailable,
        borrowed: styles.badgeBorrowed,
    };

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <p style={styles.kicker}>Collection</p>
                <h1 style={styles.title}>My Books</h1>
                <p style={styles.subtitle}>
                    Every book you've added to BookBox, along with where it currently is. If one of your books is sitting
                    in a packet box and you'd like it kept there for yourself, request its return — it will be hidden
                    from other users for 3 days so you have time to pick it up.
                </p>
            </div>

            {status && <p style={styles.status}>{status}</p>}

            <div style={styles.content}>
                {books.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyText}>You haven't added any books yet.</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {books.map(book => {
                            const pendingUntil = pendingReturnUntil(book);
                            const canRequestReturn = book.status === 'available' && !pendingUntil;

                            return (
                                <div key={book._id} style={styles.card}>
                                    <div style={styles.imageWrap}>
                                        <img src={`http://localhost:5000${book.path}`} alt={book.title} style={styles.image} />
                                    </div>
                                    <div style={styles.cardContent}>
                                        <h3 style={styles.bookTitle}>{book.title}</h3>
                                        <p style={styles.author}>{book.author}</p>
                                        <span style={{ ...styles.badge, ...(statusStyles[book.status] || {}) }}>
                                            {book.status}
                                        </span>

                                        {pendingUntil && (
                                            <p style={styles.pendingNote}>
                                                Return requested — hidden from other users until{' '}
                                                {pendingUntil.toLocaleDateString()} {pendingUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}

                                        {canRequestReturn && (
                                            <button style={styles.requestButton} onClick={() => handleRequestReturn(book._id)}>
                                                Request Return
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

const styles = {
    wrapper: { width: '100%' },
    hero: { paddingBottom: '38px', marginBottom: '34px', borderBottom: '1px solid #e6e1d8' },
    kicker: { color: '#b88a5a', fontSize: '11px', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 14px' },
    title: { fontFamily: 'Georgia, serif', fontSize: '48px', margin: '10px 0 20px', letterSpacing: '-0.05em' },
    subtitle: { color: '#777168', fontSize: '16px', lineHeight: 1.8, maxWidth: '660px' },
    status: { marginBottom: '20px', fontSize: '13px', color: '#b88a5a', fontWeight: 700 },
    content: { marginTop: '20px' },
    emptyState: { padding: '40px', textAlign: 'center', border: '1px solid #e6e1d8', backgroundColor: '#faf9f6' },
    emptyText: { color: '#777168', fontStyle: 'italic' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' },
    card: { border: '1px solid #e6e1d8', backgroundColor: '#fff' },
    imageWrap: { height: '260px', overflow: 'hidden', background: '#efede8' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    cardContent: { padding: '16px' },
    bookTitle: { fontFamily: 'Georgia, serif', fontSize: '20px', margin: '0 0 4px' },
    author: { color: '#777168', fontSize: '14px', margin: '0 0 12px' },
    badge: {
        display: 'inline-block',
        padding: '4px 10px',
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
        color: '#6f6a62',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
    },
    badgeOwned: { borderColor: '#e6e1d8', backgroundColor: '#faf9f6', color: '#6f6a62' },
    badgeAvailable: { borderColor: '#bdd7c4', backgroundColor: '#f4fbf6', color: '#2f7a48' },
    badgeBorrowed: { borderColor: '#d9c2bd', backgroundColor: '#fff7f5', color: '#9f3a2f' },
    pendingNote: { marginTop: '12px', fontSize: '12px', color: '#a06a00', lineHeight: 1.6 },
    requestButton: {
        marginTop: '14px',
        padding: '10px 16px',
        background: '#171717',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 900,
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
    },
};

export default MyBooks;
