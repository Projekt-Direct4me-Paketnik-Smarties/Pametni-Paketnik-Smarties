import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../userContext.js';

function UserDashboard() {
    const { user } = useContext(UserContext);
    const [borrows, setBorrows] = useState([]);

    useEffect(() => {
        async function fetchMyBorrows() {
            const res = await fetch('http://localhost:5000/borrow', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setBorrows(data);
            }
        }
        if (user) fetchMyBorrows();
    }, [user]);

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <p style={styles.kicker}>Activity Log</p>
                <h1 style={styles.title}>Borrow History</h1>
                <p style={styles.subtitle}>
                    Track your library interactions. Here you can find a record of every book you've borrowed or returned.
                </p>
            </div>

            <div style={styles.content}>
                {borrows.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyText}>No activity recorded yet.</p>
                    </div>
                ) : (
                    <div style={styles.logList}>
                        {borrows.map(b => (
                            <div key={b._id} style={styles.logItem}>
                                <div style={styles.logDetails}>
                                    <div style={styles.logHeader}>
                                        <span style={b.action === 'borrow' ? styles.actionBorrow : styles.actionReturn}>
                                            {b.action === 'borrow' ? 'Borrowed' : 'Returned'}
                                        </span>
                                        <span style={styles.logDate}>
                                            {new Date(b.date).toLocaleDateString()} at {new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={styles.logBooks}>
                                        {b.books.map(book => book.title).join(', ')}
                                    </p>
                                </div>
                            </div>
                        ))}
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
    subtitle: { color: '#777168', fontSize: '16px', lineHeight: 1.8, maxWidth: '600px' },
    content: { marginTop: '20px' },
    emptyState: { padding: '40px', textAlign: 'center', border: '1px solid #e6e1d8', backgroundColor: '#faf9f6' },
    emptyText: { color: '#777168', fontStyle: 'italic' },
    logList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    logItem: { display: 'flex', gap: '20px', padding: '24px', border: '1px solid #e6e1d8', backgroundColor: '#fff', alignItems: 'center' },
    logIcon: { fontSize: '24px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf9f6', border: '1px solid #e6e1d8' },
    logDetails: { flex: 1 },
    logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    actionBorrow: { fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#9f3a2f', letterSpacing: '0.1em' },
    actionReturn: { fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#2f7a48', letterSpacing: '0.1em' },
    logDate: { fontSize: '12px', color: '#8a867d' },
    logBooks: { margin: 0, fontFamily: 'Georgia, serif', fontSize: '18px', color: '#171717' }
};

export default UserDashboard;