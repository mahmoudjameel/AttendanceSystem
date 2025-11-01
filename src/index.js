import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AttendanceSystem from './AttendanceSystem';
import StudentRegistration from './components/StudentRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
const pathname = window.location.pathname || '/';

root.render(
  <React.StrictMode>
    {pathname === '/register' ? <StudentRegistration /> : <AttendanceSystem />}
  </React.StrictMode>
);
