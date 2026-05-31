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
        <section style={{ padding: '20px' }}>
            <h1 style={{ fontFamily: 'Georgia, serif' }}>My Books</h1>
            <p>Here you can track the books you have in circulation and your borrowing history.</p>
            
            <div style={{ marginTop: '20px' }}>
                {borrows.length === 0 ? (
                    <p>Trenutno nimaš izposojenih knjig.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {borrows.map(b => (
                            <li key={b._id} style={{ 
                                padding: '15px', 
                                border: '1px solid #e6e1d8', 
                                marginBottom: '10px',
                                backgroundColor: '#fff'
                            }}>
                                <strong>Datum:</strong> {new Date(b.date).toLocaleDateString()}<br/>
                                <strong>Knjige:</strong> {b.books.map(book => book.title).join(', ')}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default UserDashboard;