import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from './userContext.js';
import Navbar from './components/Navbar.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import UserPanel from './components/UserPanel.js';
import Book from './components/Book.js';
import Box from './components/Box.js';
import Welcome from './components/Welcome.js';
import Borrow from './components/Borrow.js';
import './App.css';

function App() {
    const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);

    const updateUserData = (userInfo) => {
        if (userInfo) {
            localStorage.setItem('user', JSON.stringify(userInfo.user));
            localStorage.setItem('accessToken', userInfo.accessToken);
            localStorage.setItem('refreshToken', userInfo.refreshToken);
            setUser(userInfo.user);
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    return (
        <BrowserRouter>
            <UserContext.Provider value={{ user, setUserContext: updateUserData }}>
                <div className="page-shell">
                    <Navbar />

                    <main style={styles.main}>
                        <Routes>
                            <Route path="/" element={<Welcome />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/profile" element={<UserPanel />} />
                            <Route path="/box" element={<Box />} />
                            <Route path="/books" element={<Book />} />
                            <Route path="borrow" element={<Borrow />}/>
                        </Routes>
                    </main>
                </div>
            </UserContext.Provider>
        </BrowserRouter>
    );
}

const styles = {
    main: {
        width: '100%',
        maxWidth: '1060px',
        margin: '0 auto',
        padding: '56px',
        minHeight: 'calc(100vh - 96px)',
        boxSizing: 'border-box',
    },
};

export default App;