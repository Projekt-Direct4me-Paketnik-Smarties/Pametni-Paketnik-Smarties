import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from './userContext.js';
import Navbar from './components/Navbar.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import UserPanel from './components/UserPanel.js';
import Book from './components/Book.js';
import './App.css';

function App() {
    const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);

    const updateUserData = (userInfo) => {
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
    };

    return (
        <BrowserRouter>
            <UserContext.Provider value={{ user, setUserContext: updateUserData }}>
                <Navbar />
                <div style={styles.main}>
                    <UserPanel />
                    <div style={styles.grid}>
                        <Login />
                        <Register />
                    </div>
                    <Book />
                </div>
                <Routes>
                </Routes>
            </UserContext.Provider>
        </BrowserRouter>
    );
}

const styles = {
    main: {
        maxWidth: '860px',
        margin: '0 auto',
        padding: '2rem 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: "#fdfdfd"
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
};

export default App;