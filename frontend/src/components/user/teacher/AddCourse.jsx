import React, { useState, useContext, useEffect } from 'react';
import { Button, Form, Col, Row } from 'react-bootstrap';
import { UserContext } from '../../../App';
import axiosInstance from '../../common/AxiosInstance';

const AddCourse = ({ existingCourse }) => {
   const user = useContext(UserContext);
   
   console.log('AddCourse - User context:', user);
   console.log('AddCourse - User data:', user?.userData);
   
   const [addCourse, setAddCourse] = useState({
      userId: user?.userData?._id || '',
      C_educator: user?.userData?.name || '',
      C_title: '',
      C_categories: '',
      C_price: '',
      C_description: '',
      sections: [],
   });

   // Update userId when user data becomes available
   useEffect(() => {
      if (user?.userData?._id && !addCourse.userId) {
         setAddCourse(prev => ({
            ...prev,
            userId: user.userData._id,
            C_educator: user.userData.name || prev.C_educator
         }));
      }
   }, [user?.userData?._id, user?.userData?.name]);

   // Load existing course data into state for editing
   useEffect(() => {
      if (existingCourse) {
         setAddCourse({
            userId: existingCourse.userId || user?.userData?._id || '',
            C_educator: existingCourse.C_educator || user?.userData?.name || '',
            C_title: existingCourse.C_title || '',
            C_categories: existingCourse.C_categories || '',
            C_price: existingCourse.C_price || '',
            C_description: existingCourse.C_description || '',
            sections: existingCourse.sections
               ? existingCourse.sections.map(section => ({
                    ...section,
                    // Mark existing files with a flag to distinguish from new files
                    S_content: section.S_content.map(file => ({
                       ...file,
                       isExisting: true,
                    })),
                 }))
               : [],
         });
      }
   }, [existingCourse, user?.userData?._id, user?.userData?.name]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setAddCourse({ ...addCourse, [name]: value });
   };

   const handleCourseTypeChange = (e) => {
      setAddCourse({ ...addCourse, C_categories: e.target.value });
   };

   const addInputGroup = () => {
      setAddCourse({
         ...addCourse,
         sections: [
            ...addCourse.sections,
            {
               S_title: '',
               S_description: '',
               S_content: [],
            },
         ],
      });
   };

   const handleChangeSection = (index, e) => {
      const updatedSections = addCourse.sections.map((section, idx) => {
         if (idx !== index) return section;
         if (e.target.name.endsWith('S_content')) {
            const newFiles = Array.from(e.target.files).map(file => ({
               file,
               isExisting: false,
            }));
            // Merge new files with existing files without removing other sections' files
            return {
               ...section,
               S_content: [...(section.S_content || []), ...newFiles],
            };
         } else {
            return {
               ...section,
               [e.target.name]: e.target.value,
            };
         }
      });
      setAddCourse({ ...addCourse, sections: updatedSections });
   };

   const removeInputGroup = (index) => {
      const updatedSections = [...addCourse.sections];
      updatedSections.splice(index, 1);
      setAddCourse({
         ...addCourse,
         sections: updatedSections,
      });
   };

   const handleRemoveFile = (sectionIdx, fileIdx) => {
      setAddCourse((prev) => {
         const updatedSections = prev.sections.map((section, idx) => {
            if (idx !== sectionIdx) return section;
            return {
               ...section,
               S_content: section.S_content.filter((_, i) => i !== fileIdx),
            };
         });
         return { ...prev, sections: updatedSections };
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validate required fields
      if (!addCourse.userId) {
         alert("User ID is missing. Please refresh the page and try again.");
         return;
      }
      if (!addCourse.C_title || !addCourse.C_categories || !addCourse.C_description) {
         alert("Please fill in all required fields: Course Title, Category, and Description.");
         return;
      }
      if (!addCourse.sections || addCourse.sections.length === 0) {
         alert("Please add at least one section before submitting.");
         return;
      }
      
      // Validate sections
      for (let i = 0; i < addCourse.sections.length; i++) {
         const section = addCourse.sections[i];
         if (!section.S_title || !section.S_description) {
            alert(`Please fill in all fields for section ${i + 1}.`);
            return;
         }
      }
      
      console.log('Submitting course data:', addCourse);
      
      const formData = new FormData();

      // Determine if this is adding a new course or editing an existing one
      const isEditing = addCourse._id && existingCourse;
      
      // Append courseId only if editing
      if (isEditing) {
         formData.append('courseId', addCourse._id);
      }

      Object.keys(addCourse).forEach((key) => {
         if (key === 'sections') {
            addCourse[key].forEach((section, sectionIdx) => {
               formData.append(`S_title`, section.S_title);
               formData.append(`S_description`, section.S_description);
               if (Array.isArray(section.S_content)) {
                  section.S_content.forEach((fileObj) => {
                     if (isEditing && fileObj.isExisting) {
                        // Only send existing files when editing
                        formData.append(`existing_S_content_${sectionIdx}[]`, JSON.stringify(fileObj));
                     } else if (!fileObj.isExisting) {
                        // Always send new files
                        formData.append(`new_S_content_${sectionIdx}[]`, fileObj.file);
                     }
                  });
               }
            });
         } else if (key !== '_id') {
            formData.append(key, addCourse[key]);
         }
      });

      // Choose the correct endpoint based on whether we're adding or editing
      const endpoint = isEditing ? '/api/user/editcourse' : '/api/user/addcourse';
      const actionText = isEditing ? 'updating' : 'creating';
      
      console.log('Sending request to:', endpoint);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
         console.log(key, ':', value);
      }

      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      if (!token) {
         alert('No authentication token found. Please log in again.');
         // Redirect to login or refresh the page
         window.location.href = '/';
         return;
      }

      try {
         const res = await axiosInstance.post(endpoint, formData, {
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'multipart/form-data',
            },
         });

         if (res.status === 200 || res.status === 201) {
            if (res.data.success) {
               alert(res.data.message);
               // Optionally redirect or refresh the page
               window.location.reload();
            } else {
               alert(`Failed to ${actionText} course: ` + (res.data.message || 'Unknown error'));
            }
         } else {
            alert('Unexpected response status: ' + res.status);
         }
      } catch (error) {
         console.error('An error occurred:', error);
         
         // Provide more detailed error messages
         if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error';
            
            // Handle authentication errors specifically
            if (error.response.status === 401) {
               alert('Authentication failed. Please log in again.');
               localStorage.removeItem('token');
               localStorage.removeItem('user');
               window.location.href = '/';
               return;
            }
            
            alert(`Error ${actionText} course: ${errorMessage}`);
         } else if (error.request) {
            // Network error
            alert('Network error: Unable to connect to server. Please check your internet connection.');
         } else {
            // Other error
            alert(`An error occurred while ${actionText} the course: ` + error.message);
         }
      }
   };

   return (
      <div className=''>
         <Form className="mb-3" onSubmit={handleSubmit}>
            <Row className="mb-3">
               <Form.Group as={Col} controlId="formGridJobType">
                  <Form.Label>Course Type</Form.Label>
                  <Form.Select value={addCourse.C_categories} onChange={handleCourseTypeChange}>
                     <option>Select categories</option>
                     <option>IT & Software</option>
                     <option>Finance & Accounting</option>
                     <option>Personal Development</option>
                  </Form.Select>
               </Form.Group>
               <Form.Group as={Col} controlId="formGridTitle">
                  <Form.Label>Course Title</Form.Label>
                  <Form.Control name='C_title' value={addCourse.C_title} onChange={handleChange} type="text" placeholder="Enter Course Title" required />
               </Form.Group>
            </Row>

            <Row className="mb-3">
               <Form.Group as={Col} controlId="formGridTitle">
                  <Form.Label>Course Educator</Form.Label>
                  <Form.Control name='C_educator' value={addCourse.C_educator} onChange={handleChange} type="text" placeholder="Enter Course Educator" required />
               </Form.Group>
               <Form.Group as={Col} controlId="formGridTitle">
                  <Form.Label>Course Price(Rs.)</Form.Label>
                  <Form.Control name='C_price' value={addCourse.C_price} onChange={handleChange} type="text" placeholder="for free course, enter 0" required />
               </Form.Group>
               <Form.Group as={Col} className="mb-3" controlId="formGridAddress2">
                  <Form.Label>Course Description</Form.Label>
                  <Form.Control name='C_description' value={addCourse.C_description} onChange={handleChange} required as={"textarea"} placeholder="Enter Course description" />
               </Form.Group>
            </Row>

            <hr />

            {addCourse.sections.map((section, index) => (
               <div key={index} className="d-flex flex-column mb-4 border rounded-3 border-3 p-3 position-relative">
                  <Col xs={24} md={12} lg={8}>
                     <span style={{ cursor: 'pointer' }} className="position-absolute top-0 end-0 p-1" onClick={() => removeInputGroup(index)}>
                        ❌
                     </span>
                  </Col>
                  <Row className='mb-3'>
                     <Form.Group as={Col} controlId="formGridTitle">
                        <Form.Label>Section Title</Form.Label>
                        <Form.Control
                           name={`S_title`}
                           value={section.S_title}
                           onChange={(e) => handleChangeSection(index, e)}
                           type="text"
                           placeholder="Enter Section Title"
                           required
                        />
                     </Form.Group>
                     <Form.Group as={Col} controlId="formGridContent">
                        <Form.Label>Section Content (Video or Image)</Form.Label>
                     <Form.Control
                        name={`S_content_${index}[]`}
                        onChange={(e) => handleChangeSection(index, e)}
                        type="file"
                        accept="video/*,image/*"
                        multiple
                     />
                     </Form.Group>

                     <Form.Group className="mb-3" controlId="formGridAddress2">
                        <Form.Label>Section Description</Form.Label>
                        <Form.Control
                           name={`S_description`}
                           value={section.S_description}
                           onChange={(e) => handleChangeSection(index, e)}
                           as={"textarea"}
                           placeholder="Enter Section description"
                           required
                        />
                     </Form.Group>
                  </Row>
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
                           {section.S_content.map((fileObj, idx) => {
                              const file = fileObj.isExisting ? fileObj : fileObj.file;
                              const fileName = file.name || fileObj.name || fileObj.url || 'Unknown file';
                              const isImage = fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
                              const isVideo = fileName.match(/\.(mp4|webm|ogg|mov|avi)$/i);
                              const displayName = fileName.length > 32 ? fileName.slice(0, 16) + '...' + fileName.slice(-12) : fileName;
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
                                       onClick={() => handleRemoveFile(index, idx)}
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
               </div>
            ))}

            <Row className="mb-3">
               <Col xs={24} md={12} lg={8}>
                  <Button size='sm' variant='outline-secondary' onClick={addInputGroup}>
                     ➕Add Section
                  </Button>
               </Col>
            </Row>

            <Button variant="primary" type="submit">
               {existingCourse ? 'Update Course' : 'Create Course'}
            </Button>
         </Form>
      </div>
   );
};

export default AddCourse;
