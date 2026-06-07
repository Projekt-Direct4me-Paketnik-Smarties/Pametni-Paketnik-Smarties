import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../apiFetch.js';

const ACTION_LABELS = {
    borrow: 'Borrowed',
    return: 'Returned',
    donate: 'Donated',
    reposes: 'Repossessed',
};

const ACTION_STYLES = {
    borrow: { color: '#9f3a2f' },
    return: { color: '#2f7a48' },
    donate: { color: '#2f6a7a' },
    reposes: { color: '#8a6d1d' },
};

function AdminBoxHistory() {
    const [borrows, setBorrows] = useState([]);
    const [status, setStatus] = useState('');
    const [boxFilter, setBoxFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        async function fetchAll() {
            const res = await apiFetch('/borrow/all');
            if (res.ok) {
                const data = await res.json();
                setBorrows(data);
            } else {
                const err = await res.json();
                setStatus(err.message || 'Failed to load box history.');
            }
        }
        fetchAll();
    }, []);

    const boxOptions = useMemo(() => {
        const seen = new Map();
        for (const b of borrows) {
            if (!b.packetBox) continue;
            if (!seen.has(b.packetBox)) {
                seen.set(b.packetBox, b.packetBoxName || b.packetBox);
            }
        }
        return Array.from(seen.entries());
    }, [borrows]);

    const visibleBorrows = useMemo(() => {
        let list = borrows;
        if (boxFilter !== 'all') {
            list = list.filter(b => b.packetBox === boxFilter);
        }
        list = [...list].sort((a, b) => {
            const diff = new Date(a.date) - new Date(b.date);
            return sortOrder === 'newest' ? -diff : diff;
        });
        return list;
    }, [borrows, boxFilter, sortOrder]);

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <p style={styles.kicker}>Admin · Activity Log</p>
                <h1 style={styles.title}>Box History</h1>
                <p style={styles.subtitle}>
                    Every time a box is opened — borrowing, returning, donating or repossessing books — shows up here.
                </p>
            </div>

            <div style={styles.controls}>
                <div style={styles.field}>
                    <label style={styles.label}>Box</label>
                    <select
                        style={styles.select}
                        value={boxFilter}
                        onChange={(e) => setBoxFilter(e.target.value)}
                    >
                        <option value="all">All boxes</option>
                        {boxOptions.map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Order</label>
                    <select
                        style={styles.select}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </div>
            </div>

            {status && <p style={styles.status}>{status}</p>}

            <div style={styles.content}>
                {visibleBorrows.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyText}>No activity recorded yet.</p>
                    </div>
                ) : (
                    <div style={styles.logList}>
                        {visibleBorrows.map(b => (
                            <div key={b._id} style={styles.logItem}>
                                <div style={styles.logDetails}>
                                    <div style={styles.logHeader}>
                                        <span style={{ ...styles.actionLabel, ...(ACTION_STYLES[b.action] || {}) }}>
                                            {ACTION_LABELS[b.action] || b.action}
                                        </span>
                                        <span style={styles.logDate}>
                                            {new Date(b.date).toLocaleDateString()} at {new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={styles.logBox}>
                                        {b.packetBoxName || b.packetBox || 'Unknown box'}
                                        {b.packetBoxAddress && <span style={styles.logAddress}> — {b.packetBoxAddress}</span>}
                                    </p>
                                    <p style={styles.logUser}>
                                        {b.user?.username || 'Unknown user'}
                                    </p>
                                    <p style={styles.logBooks}>
                                        {b.books?.map(book => book.title).join(', ') || 'No books listed'}
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
    controls: { display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px' },
    label: { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a867d' },
    select: { padding: '10px 12px', border: '1px solid #e6e1d8', borderRadius: '4px', fontSize: '14px', backgroundColor: '#fff' },
    status: { color: '#b42318', fontSize: '13px', marginBottom: '16px' },
    content: { marginTop: '20px' },
    emptyState: { padding: '40px', textAlign: 'center', border: '1px solid #e6e1d8', backgroundColor: '#faf9f6' },
    emptyText: { color: '#777168', fontStyle: 'italic' },
    logList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    logItem: { display: 'flex', gap: '20px', padding: '24px', border: '1px solid #e6e1d8', backgroundColor: '#fff', alignItems: 'center' },
    logDetails: { flex: 1 },
    logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    actionLabel: { fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' },
    logDate: { fontSize: '12px', color: '#8a867d' },
    logBox: { margin: '0 0 4px', fontFamily: 'Georgia, serif', fontSize: '18px', color: '#171717' },
    logAddress: { fontFamily: 'inherit', fontSize: '13px', color: '#777168' },
    logUser: { margin: '0 0 4px', fontSize: '13px', color: '#8a867d' },
    logBooks: { margin: 0, fontSize: '13px', color: '#3b3b3b' },
};

export default AdminBoxHistory;
