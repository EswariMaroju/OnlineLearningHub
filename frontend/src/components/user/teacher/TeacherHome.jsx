import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import axiosInstance from '../../common/AxiosInstance';

const TeacherHome = () => {
   const [allCourses, setAllCourses] = useState([]);
   const [showEditModal, setShowEditModal] = useState(false);
   const [editCourse, setEditCourse] = useState(null);
   const [newFiles, setNewFiles] = useState({}); // {sectionIdx: [File, ...]}

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

   const handleEditClick = (course) => {
      setEditCourse({ ...course });
      setNewFiles({});
   };

   const handleEditChange = (e) => {
      const { name, value } = e.target;
      setEditCourse((prev) => ({ ...prev, [name]: value }));
   };

   const handleCategoryChange = (e) => {
      setEditCourse((prev) => ({ ...prev, C_categories: e.target.value }));
   };

   // Append new files to the section's S_content and show immediately
   const handleAddFiles = (sectionIdx, e) => {
      const files = Array.from(e.target.files);
      setEditCourse((prev) => {
         const updatedSections = prev.sections.map((section, idx) => {
            if (idx !== sectionIdx) return section;
            return {
               ...section,
               S_content: [...(section.S_content || []), ...files],
            };
         });
         return { ...prev, sections: updatedSections };
      });
      setNewFiles((prev) => ({
         ...prev,
         [sectionIdx]: [...(prev[sectionIdx] || []), ...files],
      }));
   };

   const handleRemoveOldFile = (sectionIdx, fileIdx) => {
      setEditCourse((prev) => {
         const updatedSections = prev.sections.map((section, idx) => {
            if (idx !== sectionIdx) return section;
            return {
               ...section,
               S_content: section.S_content.filter((_, i) => i !== fileIdx),
            };
         });
         return { ...prev, sections: updatedSections };
      });
      setNewFiles((prev) => {
         const updated = { ...prev };
         if (updated[sectionIdx]) {
            updated[sectionIdx] = updated[sectionIdx].filter((_, i) => i !== fileIdx);
         }
         return updated;
      });
   };

   const handleEditSave = async () => {
      if (!editCourse) return;
      console.log('Saving course. Sections and files:', editCourse.sections);
      const formData = new FormData();
      formData.append('C_title', editCourse.C_title);
      formData.append('C_categories', editCourse.C_categories);
      formData.append('courseId', editCourse._id);
      editCourse.sections.forEach((section, sectionIdx) => {
         formData.append(`S_title`, section.S_title);
         formData.append(`S_description`, section.S_description);
         if (Array.isArray(section.S_content)) {
            section.S_content.forEach((file, fileIdx) => {
               if (file.filename && file.path) {
                  formData.append(`existing_S_content_${sectionIdx}[]`, JSON.stringify(file));
               }
               // If it's a File object (new), add to FormData as new_S_content
               if (file instanceof File) {
                  formData.append(`new_S_content_${sectionIdx}[]`, file);
               }
            });
         }
      });
      try {
         const res = await axiosInstance.post('/api/user/editcourse', formData, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
               'Content-Type': 'multipart/form-data',
            },
         });
         if (res.data.success) {
            alert('Course updated successfully!');
            setEditCourse(null);
            setNewFiles({});
            getAllCoursesUser();
         } else {
            alert('Failed to update course: ' + (res.data.message || 'Unknown error'));
         }
      } catch (error) {
         console.error('Error updating course:', error);
         
         // Provide more detailed error messages
         if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error';
            alert(`Error updating course: ${errorMessage}`);
         } else if (error.request) {
            // Network error
            alert('Network error: Unable to connect to server. Please check your internet connection.');
         } else {
            // Other error
            alert('An error occurred while updating the course: ' + error.message);
         }
      }
   };

   const handleRemoveCourse = async () => {
      if (!editCourse) return;
      const confirmation = window.confirm('Are you sure you want to delete this course?');
      if (!confirmation) return;
      try {
         const res = await axiosInstance.delete(`api/user/deletecourse/${editCourse._id}`, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
         });
         if (res.data.success) {
            alert(res.data.message);
            setEditCourse(null);
            getAllCoursesUser();
         } else {
            alert('Failed to delete the course');
         }
      } catch (error) {
         console.error('Error deleting course:', error);
         alert('An error occurred while deleting the course');
      }
   };

   const handleEditPanelClose = () => {
      setEditCourse(null);
      setNewFiles({});
   };

   return (
      <Container className='teacher-home-container' style={{ maxWidth: '1200px', display: 'flex', flexDirection: 'row' }}>
         <div style={{ flex: 1 }}>
            <h2 style={{ margin: '30px 0 20px 0', fontWeight: 600 }}>My Courses</h2>
            {allCourses?.length > 0 ? (
               <Row xs={1} sm={2} md={3} lg={3} className="g-4">
                  {allCourses.map((course) => (
                     <Col key={course._id}>
                        <Card className='course-card' style={{ minHeight: '300px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                           <div style={{ background: '#e9ecef', height: '120px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9l9 6 9-6"></path></svg>
                           </div>
                           <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px' }}>
                              <div>
                                 <Card.Title style={{ fontWeight: 600, fontSize: '1.1rem' }}>{course.C_title}</Card.Title>
                                 <div style={{ color: '#6c757d', fontSize: '0.95rem', margin: '8px 0' }}>{course.C_categories}</div>
                                 <div style={{ color: '#212529', fontWeight: 500, fontSize: '0.95rem' }}>{course.enrolled} enrolled</div>
                              </div>
                              <Button variant='outline-primary' style={{ marginTop: '16px', borderRadius: '8px' }} onClick={() => handleEditClick(course)}>Edit</Button>
                           </Card.Body>
                        </Card>
                     </Col>
                  ))}
               </Row>
            ) : (
               <div style={{ color: '#888', marginTop: '40px', textAlign: 'center' }}>No courses found!!</div>
            )}
         </div>
         {/* Edit Panel */}
         {editCourse && (
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', marginLeft: 32, padding: 24, minWidth: 400 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>Edit Course</h4>
                  <Button variant="outline-secondary" size="sm" onClick={handleEditPanelClose}>Close</Button>
               </div>
               <Form>
                  <Form.Group className="mb-3">
                     <Form.Label>Course Title</Form.Label>
                     <Form.Control
                        name="C_title"
                        value={editCourse.C_title}
                        onChange={handleEditChange}
                        type="text"
                     />
                  </Form.Group>
                  <Form.Group className="mb-3">
                     <Form.Label>Category</Form.Label>
                     <Form.Select value={editCourse.C_categories} onChange={handleCategoryChange}>
                        <option>IT & Software</option>
                        <option>Finance & Accounting</option>
                        <option>Personal Development</option>
                     </Form.Select>
                  </Form.Group>
                  {editCourse.sections && editCourse.sections.map((section, sectionIdx) => (
                     <div key={sectionIdx} style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>Section: {section.S_title}</div>
                        <div style={{ marginLeft: 12 }}>
                           {section.S_content && section.S_content.length > 0 && (
                              <div style={{ marginTop: 8, marginBottom: 8 }}>
                                 <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Selected Files:</div>
                                 <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    background: '#f8fafc',
                                    borderRadius: 8,
                                    boxShadow: '0 1px 4px #0001',
                                    maxWidth: 420,
                                 }}>
                                    {section.S_content.map((file, idx) => {
                                       const isImage = (file.name || file.filename || '').match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
                                       const isVideo = (file.name || file.filename || '').match(/\.(mp4|webm|ogg|mov|avi)$/i);
                                       const displayName = (file.name || file.filename || '').length > 32
                                          ? (file.name || file.filename || '').slice(0, 16) + '...' + (file.name || file.filename || '').slice(-12)
                                          : (file.name || file.filename || '');
                                       return (
                                          <li key={idx} style={{
                                             display: 'flex', alignItems: 'center', padding: '6px 10px', borderBottom: idx !== section.S_content.length - 1 ? '1px solid #e5e7eb' : 'none',
                                             fontSize: 14,
                                          }}>
                                             <span style={{ marginRight: 8, fontSize: 18 }}>
                                                {isImage ? '🖼️' : isVideo ? '🎬' : '📄'}
                                             </span>
                                             <span style={{ flex: 1, color: '#222' }}>{displayName}</span>
                                             <button
                                                type="button"
                                                onClick={() => handleRemoveOldFile(sectionIdx, idx)}
                                                style={{
                                                   marginLeft: 8,
                                                   color: '#e11d48',
                                                   border: 'none',
                                                   background: 'none',
                                                   cursor: 'pointer',
                                                   fontWeight: 500,
                                                   transition: 'color 0.2s',
                                                }}
                                                onMouseOver={e => (e.target.style.color = '#be123c')}
                                                onMouseOut={e => (e.target.style.color = '#e11d48')}
                                             >
                                                Remove
                                             </button>
                                          </li>
                                       );
                                    })}
                                 </ul>
                              </div>
                           )}
                           <Form.Group>
                              <Form.Label style={{ fontWeight: 400 }}>Add Video/Image</Form.Label>
                              <Form.Control type="file" multiple onChange={(e) => handleAddFiles(sectionIdx, e)} />
                           </Form.Group>
                        </div>
                     </div>
                  ))}
               </Form>
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                  <Button variant="secondary" onClick={handleEditPanelClose}>Cancel</Button>
                  <Button variant="danger" onClick={handleRemoveCourse}>Remove</Button>
                  <Button variant="primary" onClick={handleEditSave}>Save</Button>
               </div>
            </div>
         )}
      </Container>
   );
};

export default TeacherHome;
