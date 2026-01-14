import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import Subjects from './components/Subjects';
import Tags from './components/Tags';
import Attachments from './components/Attachments';
import SharedNote from './components/SharedNote';
import StudyGroups from './components/StudyGroups';
import './App.css';

function ProtectedRoute({ element }) {
  const { user, loading } = useAuth() || {};

  if (loading) return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Loading...</div>;

  return user ? element : <Navigate to="/login" replace />;
}

function Navbar() {
  const { user, logout } = useAuth() || {};

  if (!user) return null;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="app-nav">
      <Link to="/">Notes</Link>
      <Link to="/subjects">Subjects</Link>
      <Link to="/tags">Tags</Link>
      <Link to="/attachments">Attachments</Link>
      <Link to="/study-groups">Study Groups</Link>
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span>{user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/share/:token" element={<SharedNote />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute element={<NotesList />} />} />
      <Route path="/notes/new" element={<ProtectedRoute element={<NoteEditor />} />} />
      <Route path="/notes/:id" element={<ProtectedRoute element={<NoteEditor />} />} />
      <Route path="/subjects" element={<ProtectedRoute element={<Subjects />} />} />
      <Route path="/tags" element={<ProtectedRoute element={<Tags />} />} />
      <Route path="/attachments" element={<ProtectedRoute element={<Attachments />} />} />
      <Route path="/study-groups" element={<ProtectedRoute element={<StudyGroups />} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="app-main">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
