import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";

import "./App.css";
import Home from "./components/common/Home";
import Dashboard from "./components/common/Dashboard";
import CourseContent from "./components/user/student/CourseContent";
import TeacherDashboard from "./components/user/teacher/TeacherDashboard";
import AdminHome from "./components/admin/AdminHome";

export const UserContext = createContext();

function App() {
  const date = new Date().getFullYear();
  const [userData, setUserData] = useState();
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const getData = async () => {
    try {
      const user = await JSON.parse(localStorage.getItem("user"));
      if (user && user !== undefined) {
        setUserData(user);
        setUserLoggedIn(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, userLoggedIn, setUserLoggedIn, setUserData }}>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            {userLoggedIn && userData ? (
              <>
                {userData.type?.toLowerCase() === 'teacher' && (
                  <Route path="/teacher/*" element={<TeacherDashboard />} />
                )}
                {userData.type?.toLowerCase() === 'admin' && (
                  <Route path="/admin" element={<AdminHome />} />
                )}
                {(userData.type?.toLowerCase() === 'student') && (
                  <Route path="/dashboard" element={<Dashboard />} />
                )}
                <Route path="/courseSection/:courseId/:courseTitle" element={<CourseContent />} />
                <Route path="*" element={
                  <Navigate to={
                    userData.type?.toLowerCase() === 'teacher'
                      ? '/teacher'
                      : userData.type?.toLowerCase() === 'admin'
                        ? '/admin'
                        : '/dashboard'
                  } replace />
                } />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
          </Routes>
        </div>
        <footer className="bg-light text-center text-lg-start">
          <div className="text-center p-3">
            © {date} Copyright: Study App
          </div>
        </footer>
      </div>
    </UserContext.Provider>
  );
}

export default App;


