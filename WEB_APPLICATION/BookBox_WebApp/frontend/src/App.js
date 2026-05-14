import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from './userContext.js';
import Navbar from './components/Navbar.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import UserPanel from './components/UserPanel.js';
import Book from './components/Book.js';
import Box from './components/Box.js';
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
                    <Routes>
                        <Route path="/" element={<Book />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<UserPanel />} />
                    </Routes>
                </div>

            </UserContext.Provider>
        </BrowserRouter>
    );
}

const styles = {
    main: {
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '32px 24px',
        minHeight: 'calc(100vh - 72px)',
        boxSizing: 'border-box',
    },
};

export default App;