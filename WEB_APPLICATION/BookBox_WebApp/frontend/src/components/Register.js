import { useState } from 'react';

function Register() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');

    async function handleRegister(e) {
        e.preventDefault();
        const res = await fetch('http://localhost:5000/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
        });
        const data = await res.json();
        if (res.ok) {
            setStatus('registration successful');
        } else {
            setStatus(data.message);
        }
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>register</h2>
            <form onSubmit={handleRegister}>
                <div style={styles.field}>
                    <label style={styles.label}>email</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                        style={styles.input}
                    />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        style={styles.input}
                    />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>register</button>
            </form>
            {status && <p style={styles.status}>{status}</p>}
        </div>
    );
}

const styles = {
    card: {
        padding: '1.5rem',
    },
    title: {
        fontSize: '15px',
        fontWeight: 500,
        marginBottom: '1rem',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '12px',
    },
    label: {
        fontSize: '12px',
        color: '#666',
    },
    input: {
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        width: '100%',
    },
    button: {
        width: '100%',
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        fontSize: '14px',
        marginTop: '4px',
    },
    status: {
        fontSize: '13px',
        color: '#666',
        marginTop: '8px',
    },
};

export default Register;