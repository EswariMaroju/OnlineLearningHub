import React, { useState, useContext } from 'react';
import TeacherHome from './TeacherHome';
import AddCourse from './AddCourse';
import Students from './Students';
import Settings from './Settings';
import ContactUs from './ContactUs';
import { UserContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import AllCourses from '../../common/AllCourses';
import Modal from 'react-bootstrap/Modal';

const TeacherDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const { userData, setUserLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();

  // New state for profile dropdown and change password modal
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // New: Track if AllCourses should be shown in main area
  const [showAllCourses, setShowAllCourses] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('showLoginModal', 'true');
    if (setUserLoggedIn) setUserLoggedIn(false);
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
  };

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'addcourses', label: 'Add Courses' },
    { key: 'students', label: 'Students' },
    { key: 'settings', label: 'Settings' },
    { key: 'contactus', label: 'Contact Us' },
    { key: 'logout', label: 'Logout' },
  ];

  return (
    <div className="teacher-bg">
      {/* Top Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 32px',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px' }}>Teacher Dashboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="/" style={{ textDecoration: 'none', color: '#222', fontWeight: 500 }}>Home</a>
          <span style={{ textDecoration: 'none', color: '#222', fontWeight: 500, cursor: 'pointer' }} onClick={() => { setShowAllCourses(true); setActiveMenu('allcourses'); }}>Courses</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <div
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#6c757d', cursor: 'pointer' }}
              onClick={() => setShowProfileDropdown((prev) => !prev)}
            >
              {userData?.name ? userData.name[0].toUpperCase() : 'U'}
            </div>
            {showProfileDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  background: '#fff',
                  boxShadow: '0 2px 8px #0002',
                  borderRadius: 8,
                  minWidth: 160,
                  zIndex: 100,
                  padding: '12px 0'
                }}
              >
                <div style={{ padding: '8px 16px', fontWeight: 500 }}>{userData?.name || 'User'}</div>
                <div
                  style={{
                    padding: '8px 16px',
                    color: '#1976d2',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onClick={() => { setShowChangePasswordModal(true); setShowProfileDropdown(false); }}
                >
                  <span role="img" aria-label="password">🔒</span> Change Password
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    color: '#d32f2f',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onClick={handleLogout}
                >
                  <span role="img" aria-label="logout">🔓</span> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <nav style={{
          width: '220px',
          background: 'rgba(255,255,255,0.85)',
          padding: '32px 0 0 0',
          borderRight: '1px solid #e5e7eb',
          minHeight: '100%',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item) => (
              <li
                key={item.key}
                onClick={() => {
                  if (item.key === 'logout') {
                    handleLogout();
                  } else if (item.key === 'settings') {
                    setShowChangePasswordModal(true);
                  } else {
                    setActiveMenu(item.key);
                    setShowAllCourses(false);
                  }
                }}
                style={{
                  padding: '12px 32px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  background: activeMenu === item.key ? '#e0e7ff' : 'transparent',
                  borderRadius: '0 20px 20px 0',
                  fontWeight: activeMenu === item.key ? '600' : '500',
                  color: activeMenu === item.key ? '#3730a3' : '#222',
                  transition: 'background 0.2s',
                  userSelect: 'none',
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
        {/* Content Area */}
        <main style={{ flexGrow: 1, padding: '40px 48px', background: 'transparent' }}>
          {showAllCourses ? (
            <AllCourses />
          ) : (
            <>
              {activeMenu === 'dashboard' && <TeacherHome />}
              {activeMenu === 'addcourses' && <AddCourse />}
              {activeMenu === 'students' && <Students />}
              {activeMenu === 'settings' && <Settings />}
              {activeMenu === 'contactus' && <ContactUs />}
            </>
          )}
        </main>
      </div>
      {/* Change Password Modal */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Settings />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
