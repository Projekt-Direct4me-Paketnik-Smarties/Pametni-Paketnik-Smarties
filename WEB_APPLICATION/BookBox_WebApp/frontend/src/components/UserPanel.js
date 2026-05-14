import { useContext, useState } from 'react';
import { UserContext } from '../userContext.js';

function UserPanel() {
    const { user, setUserContext } = useContext(UserContext);
    const [status, setStatus] = useState('');

    async function handleLogout() {
        const res = await fetch('http://localhost:5000/users/logout', {
            credentials: 'include',
        });
        if (res.ok) {
            setUserContext(null);
        } else {
            setStatus('logout failed');
        }
    }

    async function handleDelete() {
        const res = await fetch(`http://localhost:5000/users/${user._id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (res.ok) {
            setUserContext(null);
        } else {
            const data = await res.json();
            setStatus(data.message);
        }
    }

    if (!user) return null;

    return (
        <div style={styles.panel}>
            <div style={styles.info}>
                <span style={styles.label}>logged in as</span><br></br>
                <strong style={styles.username}>{user.username}</strong>
            </div>
            <div style={styles.actions}>
                <button onClick={handleLogout} style={styles.button}>logout</button>
                <button onClick={handleDelete} style={{ ...styles.button, ...styles.danger }}>delete account</button>
            </div>
            {status && <p style={styles.status}>{status}</p>}
        </div>
    );
}

const styles = {
    panel: {
        border: '1px solid #eee',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize:"14px"
    },
    username: {
        fontSize: '15px',
        fontWeight: 500,
    },
    actions: {
        display: 'flex',
        gap: '8px',
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
        color: '#666',
        width: '100%',
    },
};

export default UserPanel;