import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Dashboard />
    </>
  );
}

export default App;
