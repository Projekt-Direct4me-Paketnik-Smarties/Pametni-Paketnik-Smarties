import { useContext, useState } from 'react';
import { UserContext } from '../userContext.js';

function UserPanel() {
    const { user, setUserContext } = useContext(UserContext);
    const [status, setStatus] = useState('');

    async function handleLogout() {
        try {
            const res = await fetch('http://localhost:5000/users/logout', {
                method: 'GET',
                credentials: 'include',
            });

            if (res.ok) {
                localStorage.removeItem('user');
                setUserContext(null);
                setStatus('Uspešno si se odjavil.');
            } else {
                setStatus('Odjava ni uspela.');
            }
        } catch (err) {
            setStatus('Napaka pri povezavi s strežnikom.');
        }
    }

    if (!user) {
        return (
            <div style={styles.card}>
                <h2 style={styles.title}>Profile</h2>
                <p style={styles.text}>Nisi prijavljen.</p>
            </div>
        );
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>Profile</h2>

            <div style={styles.infoBox}>
                <p style={styles.label}>Username</p>
                <p style={styles.value}>{user.username}</p>
            </div>

            <div style={styles.infoBox}>
                <p style={styles.label}>Email</p>
                <p style={styles.value}>{user.email}</p>
            </div>

            <button style={styles.button} onClick={handleLogout}>
                Logout
            </button>

            {status && <p style={styles.status}>{status}</p>}
        </div>
    );
}

const styles = {
    card: {
        maxWidth: '520px',
        margin: '0 auto',
        padding: '24px',
        borderRadius: '18px',
        border: '1px solid #e8e8e8',
        backgroundColor: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    },
    title: {
        margin: '0 0 20px',
        fontSize: '26px',
        color: '#222',
        textAlign: 'center',
    },
    infoBox: {
        padding: '14px 16px',
        borderRadius: '12px',
        backgroundColor: '#f7f7f7',
        marginBottom: '12px',
        border: '1px solid #eeeeee',
    },
    label: {
        margin: '0 0 4px',
        fontSize: '13px',
        color: '#777',
        fontWeight: 600,
    },
    value: {
        margin: 0,
        fontSize: '16px',
        color: '#222',
        fontWeight: 700,
    },
    text: {
        color: '#555',
        textAlign: 'center',
    },
    button: {
        marginTop: '14px',
        width: '100%',
        padding: '11px 16px',
        borderRadius: '12px',
        border: '1px solid #ddd',
        backgroundColor: '#222',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '14px',
    },
    status: {
        marginTop: '12px',
        padding: '10px',
        borderRadius: '10px',
        backgroundColor: '#f5f5f5',
        color: '#333',
        textAlign: 'center',
        fontSize: '14px',
    },
};

export default UserPanel;