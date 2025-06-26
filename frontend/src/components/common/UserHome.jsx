import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import TeacherHome from '../user/teacher/TeacherHome';
import AdminHome from '../admin/AdminHome';
import StudentHome from '../user/student/StudentHome';
// import axiosInstance from './AxiosInstance';

const UserHome = () => {
   const user = useContext(UserContext);
   let content;
   {
      switch (user.userData.type) {
         case "Teacher":
            content = <TeacherHome />
            break;
         case "Admin":
            content = <AdminHome />
            break;
         case "Student":
            content = <StudentHome />
            break;

         default:
            break;
      }
   }

   const isStudent = user.userData?.type === "Student";

   return (
      <div style={{ width: '100%', padding: isStudent ? '0' : '20px 40px', background: '#f8f9fb', minHeight: 'calc(100vh - 56px)' }}>
         {content}
      </div>
   );
};

export default UserHome;
