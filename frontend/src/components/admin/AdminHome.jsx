import React, { useEffect, useState } from 'react';
import { FaTachometerAlt, FaBook, FaUserGraduate, FaUserTie, FaCog } from 'react-icons/fa';
import axiosInstance from '../common/AxiosInstance';
import Settings from '../user/teacher/Settings';

function formatDate(dateString) {
   const date = new Date(dateString);
   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: <FaTachometerAlt /> },
  { label: 'Courses', icon: <FaBook /> },
  { label: 'Students', icon: <FaUserGraduate /> },
  { label: 'Instructors', icon: <FaUserTie /> },
  { label: 'Settings', icon: <FaCog /> },
  { label: 'Logout', icon: <FaCog style={{transform: 'rotate(90deg)'}} /> },
];

const AdminHome = () => {
   const [users, setUsers] = useState([]);
   const [courses, setCourses] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activeSection, setActiveSection] = useState('Dashboard');
   const [enrollments, setEnrollments] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true);
         setError(null);
         try {
            const token = localStorage.getItem('token');
            const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
               axiosInstance.get('/api/admin/getallusers', {
                  headers: { Authorization: `Bearer ${token}` },
               }),
               axiosInstance.get('/api/admin/getallcourses', {
                  headers: { Authorization: `Bearer ${token}` },
               }),
               axiosInstance.get('/api/admin/enrollments', {
                  headers: { Authorization: `Bearer ${token}` },
               }),
            ]);
            setUsers(usersRes.data.data || []);
            setCourses(coursesRes.data.data || []);
            setEnrollments(enrollmentsRes.data.data || []);
         } catch (err) {
            setError('Failed to fetch data.');
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   // Calculate stats
   const numStudents = users.filter(u => u.type?.toLowerCase() === 'student').length;
   const numInstructors = users.filter(u => u.type?.toLowerCase() === 'teacher').length;
   const numCourses = courses.length;
   const enrollmentsToday = 0;

   // Recent signups: sort by createdAt descending, take 3
   const recentSignups = [...users]
      .filter(u => u.type?.toLowerCase() === 'student')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(u => ({ name: u.name, date: formatDate(u.createdAt) }));

   const stats = [
      { label: 'Students', value: numStudents },
      { label: 'Instructors', value: numInstructors },
      { label: 'Courses', value: numCourses },
      { label: 'Enrollments Today', value: enrollmentsToday },
   ];

   // Helper: get courses for a student
   const getStudentCourses = (studentId) => {
      const enrolled = enrollments.filter(e => e.userId === studentId);
      return enrolled.map(e => {
        const course = courses.find(c => c._id === e.courseId);
        return course ? course.C_title : null;
      }).filter(Boolean);
   };

   // Helper: get courses for a teacher
   const getTeacherCourses = (teacherId) => {
      return courses.filter(c => c.userId === teacherId).map(c => c.C_title);
   };

   // Section renderers
   const renderDashboard = () => (
      <>
         {/* Stat Cards */}
         <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            {stats.map((stat) => (
               <div key={stat.label} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 180, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ color: '#666', fontWeight: 500 }}>{stat.label}</div>
               </div>
            ))}
         </div>
         {/* Charts Row */}
         <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            {/* Enrollment Statistics (Placeholder Line Chart) */}
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
               <div style={{ fontWeight: 600, marginBottom: 12 }}>Enrollment Statistics</div>
               <svg width="100%" height="100" viewBox="0 0 300 100">
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points="0,80 40,60 80,70 120,40 160,60 200,50 240,80 280,30 300,80" />
                  <text x="10" y="95" fontSize="12">S</text>
                  <text x="50" y="95" fontSize="12">M</text>
                  <text x="90" y="95" fontSize="12">T</text>
                  <text x="130" y="95" fontSize="12">W</text>
                  <text x="170" y="95" fontSize="12">T</text>
                  <text x="210" y="95" fontSize="12">F</text>
                  <text x="250" y="95" fontSize="12">S</text>
                  <text x="290" y="95" fontSize="12">S</text>
               </svg>
            </div>
            {/* Course Statistics (Placeholder Donut Chart) */}
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, textAlign: 'center' }}>
               <div style={{ fontWeight: 600, marginBottom: 12 }}>Course Statistics</div>
               <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="#e0e7ff" />
                  <path d="M60,60 L60,10 A50,50 0 1,1 18.2,81.8 Z" fill="#3b82f6" />
                  <circle cx="60" cy="60" r="35" fill="#fff" />
                  <text x="60" y="68" textAnchor="middle" fontSize="28" fontWeight="700" fill="#3b82f6">65%</text>
               </svg>
               <div style={{ marginTop: 16, textAlign: 'left', marginLeft: 24 }}>
                  <div style={{ color: '#3b82f6', fontWeight: 600 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 8 }}></span>Published</div>
                  <div style={{ color: '#60a5fa', fontWeight: 600 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#60a5fa', borderRadius: '50%', marginRight: 8 }}></span>Pending Review</div>
                  <div style={{ color: '#a5b4fc', fontWeight: 600 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#a5b4fc', borderRadius: '50%', marginRight: 8 }}></span>Draft</div>
               </div>
            </div>
         </div>
         {/* Recent Signups Table */}
         <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Recent Signups</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                     <th style={{ textAlign: 'left', padding: 8, color: '#666', fontWeight: 600 }}>Student</th>
                     <th style={{ textAlign: 'left', padding: 8, color: '#666', fontWeight: 600 }}>Date</th>
                  </tr>
               </thead>
               <tbody>
                  {recentSignups.length === 0 ? (
                     <tr><td colSpan={2}>No recent signups</td></tr>
                  ) : recentSignups.map((signup, idx) => (
                     <tr key={idx} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td style={{ padding: 8 }}>{signup.name}</td>
                        <td style={{ padding: 8 }}>{signup.date}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </>
   );

   const renderCourses = () => (
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
         <h2 style={{ marginBottom: 24 }}>All Courses</h2>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
               <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Educator</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Price</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
               </tr>
            </thead>
            <tbody>
               {courses.length === 0 ? (
                  <tr><td colSpan={5}>No courses found</td></tr>
               ) : courses.map((course) => (
                  <tr key={course._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                     <td style={{ padding: 8 }}>{course.C_title}</td>
                     <td style={{ padding: 8 }}>{course.C_educator}</td>
                     <td style={{ padding: 8 }}>{course.C_categories}</td>
                     <td style={{ padding: 8 }}>{course.C_price}</td>
                     <td style={{ padding: 8 }}>{course.status}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );

   const renderStudents = () => {
      const students = users.filter(u => u.type?.toLowerCase() === 'student');
      return (
         <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
            <h2 style={{ marginBottom: 24 }}>All Students</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                     <th style={{ textAlign: 'left', padding: 8 }}>Username</th>
                     <th style={{ textAlign: 'left', padding: 8 }}>Registered Courses</th>
                  </tr>
               </thead>
               <tbody>
                  {students.length === 0 ? (
                     <tr><td colSpan={2}>No students found</td></tr>
                  ) : students.map((student) => (
                     <tr key={student._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td style={{ padding: 8 }}>{student.name}</td>
                        <td style={{ padding: 8 }}>{getStudentCourses(student._id).join(', ') || 'None'}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderInstructors = () => {
      const instructors = users.filter(u => u.type?.toLowerCase() === 'teacher');
      return (
         <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
            <h2 style={{ marginBottom: 24 }}>All Instructors</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                     <th style={{ textAlign: 'left', padding: 8 }}>Username</th>
                     <th style={{ textAlign: 'left', padding: 8 }}>Courses Added</th>
                  </tr>
               </thead>
               <tbody>
                  {instructors.length === 0 ? (
                     <tr><td colSpan={2}>No instructors found</td></tr>
                  ) : instructors.map((instructor) => (
                     <tr key={instructor._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td style={{ padding: 8 }}>{instructor.name}</td>
                        <td style={{ padding: 8 }}>{getTeacherCourses(instructor._id).join(', ') || 'None'}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      );
   };

   const renderSettings = () => (
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, maxWidth: 500 }}>
         <Settings />
      </div>
   );

   const handleLogout = () => {
      localStorage.clear();
      localStorage.setItem('showLoginModal', 'true');
      window.location.href = '/';
   };

   let mainContent;
   if (activeSection === 'Dashboard') mainContent = renderDashboard();
   else if (activeSection === 'Courses') mainContent = renderCourses();
   else if (activeSection === 'Students') mainContent = renderStudents();
   else if (activeSection === 'Instructors') mainContent = renderInstructors();
   else if (activeSection === 'Settings') mainContent = renderSettings();

   return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb' }}>
         {/* Sidebar */}
         <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', padding: '32px 0', gap: 8 }}>
            {SIDEBAR_ITEMS.map(item => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={activeSection === item.label}
                onClick={item.label === 'Logout' ? handleLogout : () => setActiveSection(item.label)}
              />
            ))}
         </aside>
         {/* Main Content */}
         <main style={{ flexGrow: 1, padding: '40px 48px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: 32 }}>Admin Dashboard</h2>
            {loading ? (
               <div>Loading...</div>
            ) : error ? (
               <div style={{ color: 'red' }}>{error}</div>
            ) : (
               mainContent
            )}
         </main>
      </div>
   );
};

function SidebarItem({ icon, label, active, onClick }) {
   return (
      <div style={{
         display: 'flex', alignItems: 'center', gap: 16, padding: '12px 32px',
         background: active ? '#f1f5f9' : 'transparent',
         color: active ? '#222' : '#666',
         fontWeight: active ? 700 : 500,
         borderRadius: 8,
         cursor: 'pointer',
         marginBottom: 8
      }} onClick={onClick}>
         <span style={{ fontSize: 20 }}>{icon}</span>
         <span>{label}</span>
      </div>
   );
}

export default AdminHome;
