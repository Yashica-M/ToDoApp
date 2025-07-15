import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import real components
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/LoginPage';
import AuthSuccess from './pages/AuthSuccess';
import AddTaskPage from './components/AddTaskPage';
import TestPage from './components/TestPage';

// Import styles
import './styles/login.css';
import './styles/dashboard.css';
import './styles/enhanced-form.css';
import './styles/enhanced-todo-item.css';
import './styles/enhanced-ui.css';
import './styles/pagination.css';
import './styles/utilities.css';
import './styles/additional.css';
import './styles/loading-indicator.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <TodoProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/success" element={<AuthSuccess />} />
                <Route 
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/add-task"
                  element={
                    <ProtectedRoute>
                      <AddTaskPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-task/:id"
                  element={
                    <ProtectedRoute>
                      <AddTaskPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/test" element={<TestPage />} />
              </Routes>
              <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </Router>
        </TodoProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;