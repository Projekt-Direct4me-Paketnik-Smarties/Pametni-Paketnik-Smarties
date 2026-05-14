import { useContext } from 'react';
import { UserContext } from '../userContext.js';
import { Link } from 'react-router-dom';

function Navbar() {
    const { user } = useContext(UserContext);

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>BookBox</Link>


            <div style={styles.links}>
                <Link to="/" style={styles.link} className="nav-link">Books</Link>
                <Link to="/box" style={styles.link} className="nav-link">Box</Link>

                {user ? (
                    <>
                        <Link to="/profile" style={styles.link} className="nav-link">Profile</Link>
                        <span style={styles.userInfo}>Hello {user.username}!</span>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link} className="nav-link">Login</Link>
                        <Link to="/register" style={styles.link} className="nav-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        height: '74px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 56px',
        borderBottom: '1px solid #e6e1d8',
        backgroundColor: '#ffffff',
    },
    logo: {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontWeight: 700,
        fontSize: '22px',
        color: '#171717',
        textDecoration: 'none',
        letterSpacing: '-0.04em',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    link: {
        fontSize: '11px',
        color: '#3b3b3b',
        textDecoration: 'none',
        fontWeight: 800,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        padding: '8px 0',
        borderBottom: '1px solid transparent',
    },
    userInfo: {
        fontSize: '14px',
        color: '#f3f3f3',
        padding: '4px 8px',
        backgroundColor: '#ffd35c',
        borderRadius: '6px',
    },
};

export default Navbar;