import { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from './userContext.js';
import Navbar from './components/Navbar.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import UserPanel from './components/UserPanel.js';
import Book from './components/Book.js';
import Box from './components/Box.js';
import Welcome from './components/Welcome.js';
import Borrow from './components/Borrow.js';
import BrowseBooks from './components/BrowseBooks.js';
import './App.css';
import UserDashboard from './components/UserDashboard.js';
import AdminBoxHistory from './components/AdminBoxHistory.js';

function AdminRoute({ children }) {
    const { user } = useContext(UserContext);
    if (!user) return <Navigate to="/login" replace />;
    if (!user.isAdmin) return <Navigate to="/" replace />;
    return children;
}

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
                            <Route path="/browse" element={<BrowseBooks />} />
                            <Route path="/borrow" element={<Borrow />} />
                            <Route path="/dashboard" element={<UserDashboard />} />

                            {/* Admin-only routes */}
                            <Route path="/box" element={<AdminRoute><Box /></AdminRoute>} />
                            <Route path="/books" element={<AdminRoute><Book /></AdminRoute>} />
                            <Route path="/box-history" element={<AdminRoute><AdminBoxHistory /></AdminRoute>} />
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