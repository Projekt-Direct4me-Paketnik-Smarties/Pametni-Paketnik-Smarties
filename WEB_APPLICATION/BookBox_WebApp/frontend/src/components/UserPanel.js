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
            <section style={styles.wrapper}>
                <div style={styles.hero}>
                    <p style={styles.kicker}>Account</p>
                    <h1 style={styles.title}>Profile</h1>
                    <p style={styles.subtitle}>
                        Za ogled profila se moraš najprej prijaviti.
                    </p>
                </div>

                <div style={styles.card}>
                    <p style={styles.emptyTitle}>Nisi prijavljen.</p>
                    <p style={styles.emptyText}>
                        Prijavi se, da vidiš svoje podatke in upravljaš svoj račun.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <p style={styles.kicker}>Account</p>
                <h1 style={styles.title}>Profile</h1>
                <p style={styles.subtitle}>
                    Pregled osnovnih informacij tvojega uporabniškega računa.
                </p>
            </div>

            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div>
                        <p style={styles.kickerSmall}>User details</p>
                        <h2 style={styles.cardTitle}>Account information</h2>
                    </div>

                    <div style={styles.avatar}>
                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                </div>

                <div style={styles.infoGrid}>
                    <div style={styles.infoBox}>
                        <p style={styles.label}>Username</p>
                        <p style={styles.value}>{user.username}</p>
                    </div>

                    <div style={styles.infoBox}>
                        <p style={styles.label}>Email</p>
                        <p style={styles.value}>{user.email}</p>
                    </div>
                </div>

                <div style={styles.actions}>
                    <button style={styles.dangerButton} onClick={handleLogout}>
                        Logout
                    </button>
                </div>

                {status && <p style={styles.status}>{status}</p>}
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
        maxWidth: '560px',
        color: '#777168',
        fontSize: '15px',
        lineHeight: 1.8,
    },

    card: {
        maxWidth: '720px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        border: '1px solid #e6e1d8',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
        padding: '32px',
    },

    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '18px',
        marginBottom: '28px',
        paddingBottom: '24px',
        borderBottom: '1px solid #e6e1d8',
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

    avatar: {
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
        color: '#b88a5a',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '30px',
        fontWeight: 400,
    },

    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '18px',
    },

    infoBox: {
        padding: '22px',
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
    },

    label: {
        margin: '0 0 10px',
        color: '#6f6a62',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
    },

    value: {
        margin: 0,
        color: '#171717',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '25px',
        lineHeight: 1.1,
        fontWeight: 400,
        wordBreak: 'break-word',
    },

    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '26px',
    },

    dangerButton: {
        backgroundColor: '#ffffff',
        color: '#b42318',
        border: '1px solid #e7b4ad',
    },

    status: {
        margin: '22px 0 0',
        padding: '14px 16px',
        border: '1px solid #e6e1d8',
        backgroundColor: '#faf9f6',
        color: '#6f6a62',
        fontSize: '13px',
        lineHeight: 1.6,
        textAlign: 'center',
    },

    emptyTitle: {
        margin: 0,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '31px',
        color: '#171717',
        textAlign: 'center',
    },

    emptyText: {
        margin: '12px 0 0',
        color: '#777168',
        fontSize: '14px',
        lineHeight: 1.7,
        textAlign: 'center',
    },
};

export default UserPanel;