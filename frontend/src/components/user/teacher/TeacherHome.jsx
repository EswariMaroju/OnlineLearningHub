import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../common/AxiosInstance';

const TeacherHome = () => {
   const [allCourses, setAllCourses] = useState([]);

   const getAllCoursesUser = async () => {
      try {
         const res = await axiosInstance.get(`api/user/getallcoursesteacher`, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
         });
         if (res.data.success) {
            setAllCourses(res.data.data);
         }
      } catch (error) {
         console.log('An error occurred:', error);
      }
   };

   useEffect(() => {
      getAllCoursesUser();
   }, []);

   const toggleDescription = (courseId) => {
      setAllCourses((prevCourses) =>
         prevCourses.map((course) =>
            course._id === courseId
               ? { ...course, showFullDescription: !course.showFullDescription }
               : course
         )
      );
   };

   const deleteCourse = async (courseId) => {
      const confirmation = confirm('Are you sure you want to delete')
      if (!confirmation) {
         return;
      }
      try {
         const res = await axiosInstance.delete(`api/user/deletecourse/${courseId}`, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
         })
         if (res.data.success) {
            alert(res.data.message)
            getAllCoursesUser()
         } else {
            alert("Failed to delete the course")
         }
      } catch (error) {
         console.log('An error occurred:', error);
      }
   }

   return (
      <Container className='teacher-home-container' style={{ maxWidth: '1200px' }}>
         <h2 style={{ margin: '30px 0 20px 0', fontWeight: 600 }}>My Courses</h2>
         {allCourses?.length > 0 ? (
            <Row xs={1} sm={2} md={3} lg={3} className="g-4">
               {allCourses.map((course) => (
                  <Col key={course._id}>
                     <Card className='course-card' style={{ minHeight: '300px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ background: '#e9ecef', height: '120px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           {/* Placeholder image/icon */}
                           <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9l9 6 9-6"></path></svg>
                        </div>
                        <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px' }}>
                           <div>
                              <Card.Title style={{ fontWeight: 600, fontSize: '1.1rem' }}>{course.C_title}</Card.Title>
                              <div style={{ color: '#6c757d', fontSize: '0.95rem', margin: '8px 0' }}>{course.C_categories}</div>
                              <div style={{ color: '#212529', fontWeight: 500, fontSize: '0.95rem' }}>{course.enrolled} enrolled</div>
                           </div>
                           <Button variant='outline-primary' style={{ marginTop: '16px', borderRadius: '8px' }}>Edit</Button>
                        </Card.Body>
                     </Card>
                  </Col>
               ))}
            </Row>
         ) : (
            <div style={{ color: '#888', marginTop: '40px', textAlign: 'center' }}>No courses found!!</div>
         )}
      </Container>
   );
};

export default TeacherHome;
