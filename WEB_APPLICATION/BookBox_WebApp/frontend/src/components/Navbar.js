import { useContext } from 'react';
import { UserContext } from '../userContext.js';
import { Link } from 'react-router-dom';

function Navbar() {
    const { user } = useContext(UserContext);

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>BookBox</Link>

            <div style={styles.links}>
                <Link to="/" style={styles.link}>Books</Link>

                {user ? (
                    <>
                        <Link to="/profile" style={styles.link}>Profile</Link>
                        <span style={styles.userInfo}>Hello {user.username}!</span>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.link}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
    },
    logo: {
        fontWeight: 900,
        fontSize: '22px',
        color: '#111827',
        textDecoration: 'none',
        letterSpacing: '-0.5px',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
    },
    link: {
        fontSize: '15px',
        color: '#374151',
        textDecoration: 'none',
        fontWeight: 700,
    },
    userInfo: {
        fontSize: '14px',
        color: '#6b7280',
        padding: '8px 12px',
        borderRadius: '999px',
        backgroundColor: '#f3f4f6',
    },
};

export default Navbar;