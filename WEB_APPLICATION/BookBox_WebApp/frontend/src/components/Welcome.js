import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../userContext.js';

function Welcome() {
    const { user } = useContext(UserContext);

    return (
        <section style={styles.wrapper}>
            <div style={styles.hero}>
                <p style={styles.kicker}>BookBox library</p>

                <h1 style={styles.title}>
                    {user ? `Welcome, ${user.username}.` : 'Welcome to BookBox.'}
                </h1>

                <p style={styles.subtitle}>
                    Discover books, manage reservations and use smart packet boxes for simple book pickup and returns.
                </p>

                <div style={styles.actions}>
                    <Link to="/browse" style={styles.primaryLink}>
                        Browse books
                    </Link>
                </div>
            </div>

            <div style={styles.mapPlaceholder}>
                <p style={styles.kickerSmall}>Interactive Map</p>
                <h2 style={styles.featureTitle}>Find Nearby Boxes</h2>
                <div style={styles.mapCanvas}>
                    <p style={styles.mapText}>TODO: Map goes here.</p>
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.featureCard}>
                    <p style={styles.featureNumber}>01</p>
                    <h2 style={styles.featureTitle}>Browse books</h2>
                    <p style={styles.featureText}>
                        Explore the available collection and find books by title, author or genre.
                    </p>
                </div>

                <div style={styles.featureCard}>
                    <p style={styles.featureNumber}>02</p>
                    <h2 style={styles.featureTitle}>Reserve online</h2>
                    <p style={styles.featureText}>
                        Reserve books through the web app and pick them up later.
                    </p>
                </div>

                <div style={styles.featureCard}>
                    <p style={styles.featureNumber}>03</p>
                    <h2 style={styles.featureTitle}>Use packet boxes</h2>
                    <p style={styles.featureText}>
                        Pick up and return books using nearby smart packet boxes.
                    </p>
                </div>
            </div>
        </section>
    );
}

const styles = {
    wrapper: {
        width: '100%',
    },

    hero: {
        minHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBottom: '42px',
        marginBottom: '38px',
        borderBottom: '1px solid #e6e1d8',
    },

    kicker: {
        margin: '0 0 16px',
        color: '#b88a5a',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
    },

    title: {
        margin: 0,
        maxWidth: '760px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 'clamp(48px, 7vw, 86px)',
        lineHeight: 0.92,
        fontWeight: 400,
        color: '#171717',
        letterSpacing: '-0.06em',
    },

    subtitle: {
        margin: '24px 0 0',
        maxWidth: '580px',
        color: '#777168',
        fontSize: '16px',
        lineHeight: 1.8,
    },

    actions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        marginTop: '34px',
    },

    primaryLink: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 22px',
        border: '1px solid #171717',
        backgroundColor: '#171717',
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
    },

    secondaryLink: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 22px',
        border: '1px solid #cfc7ba',
        backgroundColor: '#ffffff',
        color: '#171717',
        textDecoration: 'none',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
    },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '26px',
    },

    mapPlaceholder: {
        padding: '40px',
        backgroundColor: '#faf9f6',
        border: '1px solid #e6e1d8',
        marginBottom: '38px',
    },

    mapCanvas: {
        marginTop: '20px',
        height: '300px',
        backgroundColor: '#efede8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed #cfc7ba',
    },

    mapText: {
        color: '#8a867d',
        fontSize: '14px',
        fontStyle: 'italic',
    },

    featureCard: {
        minHeight: '220px',
        padding: '28px',
        border: '1px solid #e6e1d8',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
    },

    featureNumber: {
        margin: '0 0 24px',
        color: '#b88a5a',
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.18em',
    },

    featureTitle: {
        margin: 0,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '30px',
        lineHeight: 1.05,
        fontWeight: 400,
        color: '#171717',
        letterSpacing: '-0.035em',
    },

    featureText: {
        margin: '16px 0 0',
        color: '#777168',
        fontSize: '14px',
        lineHeight: 1.7,
    },
};

export default Welcome;