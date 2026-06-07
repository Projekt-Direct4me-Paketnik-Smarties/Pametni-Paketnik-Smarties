import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../userContext.js';

const RETURN_HOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function isOnReturnHold(book) {
    if (!book.returnRequestedAt) return false;
    return Date.now() - new Date(book.returnRequestedAt).getTime() < RETURN_HOLD_MS;
}

function BrowseBooks() {
    const { user } = useContext(UserContext);
    const [books, setBooks] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [targetBoxId, setTargetBoxId] = useState('');
    const [mode, setMode] = useState('borrow'); // 'borrow' or 'return'
    const [status, setStatus] = useState('');

    useEffect(() => {
        async function fetchData() {
            const [bookRes, boxRes] = await Promise.all([
                fetch('http://localhost:5000/books', { credentials: 'include' }),
                fetch('http://localhost:5000/box')
            ]);
            if (bookRes.ok) {
                const bookData = await bookRes.json();
                setBooks(bookData);
            }
            if (boxRes.ok) {
                const boxData = await boxRes.json();
                setBoxes(boxData);
                if (boxData.length > 0) setTargetBoxId(boxData[0]._id);
            }
        }
        fetchData();
    }, []);

    const filteredBooks = books.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                             b.author.toLowerCase().includes(search.toLowerCase());

        if (mode === 'borrow') {
            return matchesSearch && b.status === 'available' && !isOnReturnHold(b);
        } else {
            // Return mode: Only show books currently borrowed by the logged-in user
            return matchesSearch && b.status === 'borrowed' && b.currentBorrower === user?.id;
        }
    });

    const getBoxName = (boxId) => {
        const box = boxes.find(bx => bx._id === boxId);
        return box ? box.name : 'Unknown Location';
    };

    const toggleSelection = (id) => {
        if (!user) return setStatus('Please login to select books.');
        setSelectedBooks(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    async function handleAction() {
        if (selectedBooks.length === 0) return setStatus('No books selected.');
        const endpoint = mode === 'borrow' ? 'http://localhost:5000/borrow/' : 'http://localhost:5000/borrow/return';
        
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ books: selectedBooks, packetBox: targetBoxId }),
        });

        if (res.ok) {
            setStatus(`Successfully ${mode}ed ${selectedBooks.length} book(s).`);
            setSelectedBooks([]);
            // Refresh data
            const bookRes = await fetch('http://localhost:5000/books', { credentials: 'include' });
            if (bookRes.ok) setBooks(await bookRes.json());
        } else {
            const err = await res.json();
            setStatus(err.message || 'Action failed.');
        }
    }

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <p style={styles.kicker}>Collection</p>
                <h1 style={styles.title}>Browse Books</h1>
                <div style={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="Search by title or author..." 
                        style={styles.searchBar}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {user && (
                <div style={styles.actionPanel}>
                    <div style={styles.panelHeader}>
                        <button 
                            style={mode === 'borrow' ? styles.activeTab : styles.tab} 
                            onClick={() => { setMode('borrow'); setSelectedBooks([]); }}
                        >
                            Borrow Books
                        </button>
                        <button 
                            style={mode === 'return' ? styles.activeTab : styles.tab} 
                            onClick={() => { setMode('return'); setSelectedBooks([]); }}
                        >
                            Return Books
                        </button>
                    </div>
                    
                    <div style={styles.controls}>
                        <div style={styles.field}>
                            <label style={styles.label}>Select Packet Box</label>
                            <select 
                                style={styles.select} 
                                value={targetBoxId} 
                                onChange={(e) => setTargetBoxId(e.target.value)}
                            >
                                {boxes.map(box => (
                                    <option key={box._id} value={box._id}>{box.name}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            style={selectedBooks.length > 0 ? styles.primaryButton : styles.disabledButton}
                            onClick={handleAction}
                            disabled={selectedBooks.length === 0}
                        >
                            Confirm {mode} ({selectedBooks.length})
                        </button>
                    </div>
                    {status && <p style={styles.status}>{status}</p>}
                </div>
            )}

            <div style={styles.grid}>
                {filteredBooks.length === 0 ? (
                    <p style={styles.emptyText}>No books found for this selection.</p>
                ) : (
                    filteredBooks.map(book => (
                        <div 
                            key={book._id} 
                            style={selectedBooks.includes(book._id) ? styles.selectedCard : styles.card}
                            onClick={() => toggleSelection(book._id)}
                        >
                            <div style={styles.imageWrap}>
                                <img src={`http://localhost:5000${book.path}`} alt={book.title} style={styles.image} />
                            </div>
                            <div style={styles.cardContent}>
                                <h3 style={styles.bookTitle}>{book.title}</h3>
                                <p style={styles.author}>{book.author}</p>
                                <div style={styles.locationTag}>
                                    {book.status === 'available' ? (
                                        <span>📍 {getBoxName(book.packetBox)}</span>
                                    ) : (
                                        <span>📖 Checked Out</span>
                                    )}
                                </div>
                            </div>
                            {selectedBooks.includes(book._id) && <div style={styles.badge}>Selected</div>}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

const styles = {
    wrapper: { width: '100%' },
    hero: {
        paddingBottom: '38px',
        marginBottom: '34px',
        borderBottom: '1px solid #e6e1d8',
    },
    kicker: { color: '#b88a5a', fontSize: '11px', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase' },
    title: { fontFamily: 'Georgia, serif', fontSize: '48px', margin: '10px 0 20px' },
    searchContainer: { display: 'flex', gap: '10px' },
    searchBar: { flex: 1, maxWidth: '400px', padding: '12px', border: '1px solid #e6e1d8', fontSize: '16px' },
    actionPanel: { backgroundColor: '#faf9f6', padding: '24px', border: '1px solid #e6e1d8', marginBottom: '30px' },
    panelHeader: { display: 'flex', gap: '10px', marginBottom: '20px' },
    tab: { padding: '8px 16px', background: 'white', border: '1px solid #e6e1d8', cursor: 'pointer', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' },
    activeTab: { padding: '8px 16px', background: '#171717', color: 'white', border: '1px solid #171717', cursor: 'pointer', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' },
    controls: { display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#b88a5a' },
    select: { padding: '10px', border: '1px solid #e6e1d8', minWidth: '200px' },
    primaryButton: { padding: '12px 24px', background: '#171717', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase' },
    disabledButton: { padding: '12px 24px', background: '#ccc', color: 'white', border: 'none', cursor: 'not-allowed', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase' },
    status: { marginTop: '15px', fontSize: '13px', color: '#b88a5a', fontWeight: 700 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' },
    card: { border: '1px solid #e6e1d8', backgroundColor: '#fff', cursor: 'pointer', position: 'relative' },
    selectedCard: { border: '2px solid #b88a5a', backgroundColor: '#fff', cursor: 'pointer', position: 'relative', transform: 'translateY(-2px)' },
    imageWrap: { height: '260px', overflow: 'hidden', background: '#efede8' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    cardContent: { padding: '16px' },
    bookTitle: { fontFamily: 'Georgia, serif', fontSize: '20px', margin: '0 0 4px' },
    author: { color: '#777168', fontSize: '14px' },
    locationTag: { marginTop: '12px', fontSize: '11px', fontWeight: 700, color: '#b88a5a' },
    badge: { position: 'absolute', top: '10px', right: '10px', background: '#b88a5a', color: 'white', padding: '4px 8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' },
    emptyText: { gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#777168' }
};

export default BrowseBooks;