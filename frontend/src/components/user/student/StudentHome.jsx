import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, ProgressBar, Card, Button } from 'react-bootstrap';
import { UserContext } from '../../../App';
import AllCourses from '../../common/AllCourses';
import EnrolledCourses from './EnrolledCourses';
import Settings from '../../user/teacher/Settings';
import ContactUs from '../../user/teacher/ContactUs';
import axiosInstance from '../../common/AxiosInstance';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import BrushIcon from '@mui/icons-material/Brush';
import studentBg from "../../../assets/Images/student-login-bg.jpg";
// import Settings and ContactUs when ready

const menuItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'mycourses', label: 'My Courses' },
  { key: 'settings', label: 'Settings' },
  { key: 'contactus', label: 'Contact Us' },
  { key: 'logout', label: 'Logout' },
];

const StudentHome = () => {
  const { userData, setUserLoggedIn } = useContext(UserContext);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res = await axiosInstance.get('api/user/getallcourses', {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (res.data.success) {
          setEnrolledCourses((res.data.data || []).filter(course => course && course.C_title));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchEnrolledCourses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('showLoginModal', 'true');
    if (setUserLoggedIn) setUserLoggedIn(false);
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    try {
      const res = await axiosInstance.post('/api/user/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.data.success) {
        setMessage('Password changed successfully!');
      } else {
        setMessage(res.data.message || 'Failed to change password');
      }
    } catch (err) {
      setMessage('Error changing password');
    }
  };

  console.log("userData:", userData);
  console.log('Entered old password:', oldPassword);
  console.log('User password (hashed):', userData?.password);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        padding: 0
      }}
    >
      {/* Blurred Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${studentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(2px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 32px',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px' }}>Learning Hub</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="/" style={{ textDecoration: 'none', color: '#222', fontWeight: 500 }}>Home</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    color: '#6c757d',
                    cursor: 'pointer'
                  }}
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
        </div>
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
          {/* Sidebar */}
          <nav style={{
            width: '220px',
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
                    } else {
                      setActiveMenu(item.key);
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
          <main
            style={{
              flexGrow: 1,
              padding: '40px 48px',
              width: '100%',
              minHeight: '100vh',
            }}
          >
            {activeMenu === 'dashboard' && (
              <div>
                <h2 style={{ fontWeight: 600, marginBottom: 24 }}>Browse Courses</h2>
                <AllCourses cardGrid />
              </div>
            )}
            {activeMenu === 'mycourses' && (
              <div>
                <h2 style={{ fontWeight: 600, marginBottom: 24 }}>My Courses</h2>
                <Row xs={1} sm={2} md={3} lg={3} className="g-4">
                  {enrolledCourses && enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course, idx) => (
                      <Col key={course._id}>
                        <div style={{
                          background: '#fff',
                          borderRadius: 16,
                          boxShadow: '0 2px 8px #0001',
                          padding: 24,
                          minHeight: 200,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          transition: 'box-shadow 0.2s',
                          cursor: 'pointer'
                        }}>
                          <div style={{ marginBottom: 16 }}>
                            {course.C_categories?.toLowerCase().includes('data') ? <SchoolIcon style={{ fontSize: 48, color: '#bfc9d9' }} /> :
                             course.C_categories?.toLowerCase().includes('web') ? <CodeIcon style={{ fontSize: 48, color: '#bfc9d9' }} /> :
                             <BrushIcon style={{ fontSize: 48, color: '#bfc9d9' }} />}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{course.C_title}</div>
                          <div style={{ width: '100%', marginBottom: 8 }}>
                            <ProgressBar now={course.progress || 0} style={{ height: 8, borderRadius: 8 }} />
                          </div>
                          <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 8 }}>{(course.progress || 0) < 100 ? 'In Progress' : 'Completed'}</div>
                          <Link to={`/courseSection/${course._id}/${course.C_title}`}><Button size='sm' variant='outline-primary'>Go To</Button></Link>
                        </div>
                      </Col>
                    ))
                  ) : (
                    <div style={{ color: '#888', marginLeft: 16 }}>No enrolled courses yet.</div>
                  )}
                </Row>
              </div>
            )}
            {activeMenu === 'settings' && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                width: '100%',
              }}>
                <form
                  onSubmit={handleChangePassword}
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    padding: '32px 24px',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #0001',
                    minWidth: 320,
                    maxWidth: 400,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Change Password</h3>
                  <div>
                    <label>Old Password</label>
                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
                  </div>
                  <div>
                    <label>New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
                  </div>
                  <div>
                    <label>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
                  </div>
                  <button type="submit" style={{ padding: 10, fontWeight: 600, background: '#3730a3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Change Password</button>
                  {message && <div style={{ color: message.includes('success') ? 'green' : 'red', textAlign: 'center' }}>{message}</div>}
                </form>
              </div>
            )}
            {activeMenu === 'contactus' && <ContactUs />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
