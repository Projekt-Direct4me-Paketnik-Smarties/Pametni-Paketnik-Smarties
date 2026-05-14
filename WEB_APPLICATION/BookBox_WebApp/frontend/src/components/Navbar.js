import { useContext } from 'react';
import { UserContext } from '../userContext.js';

function Navbar() {
    const { user } = useContext(UserContext);

    return (
        <nav style={styles.nav}>
            <span style={styles.logo}>myapp</span>
            <span style={styles.userInfo}>
                {user ? `logged in as ${user.username}` : 'not logged in'}
            </span>
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
    logo: {
        fontWeight: 600,
        fontSize: '18px',
    },
    userInfo: {
        fontSize: '14px',
        color: '#666',
    },
};

export default Navbar;