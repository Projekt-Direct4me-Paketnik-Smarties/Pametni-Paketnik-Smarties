import { useContext } from 'react';
import { UserContext } from '../userContext.js';
import { Link } from 'react-router-dom';

function Navbar() {
    const { user } = useContext(UserContext);

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>myapp</Link>

            <div style={styles.links}>
                <Link to="/" style={styles.link}>Books</Link>

                {user ? (
                    <>
                        <Link to="/profile" style={styles.link}>Profile</Link>
                        <span style={styles.userInfo}>logged in as {user.username}</span>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#fff',
    },
    userInfo: {
        fontSize: '14px',
        color: '#666',
    },
    logo: {
    fontWeight: 600,
    fontSize: '18px',
    color: '#222',
    textDecoration: 'none',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    link: {
        fontSize: '14px',
        color: '#333',
        textDecoration: 'none',
        fontWeight: 500,
    },
};

export default Navbar;