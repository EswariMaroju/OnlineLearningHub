import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Accordion, Modal, Tabs, Tab } from 'react-bootstrap';
import axiosInstance from '../../common/AxiosInstance';
import ReactPlayer from 'react-player';
import { UserContext } from '../../../App';
import NavBar from '../../common/NavBar';
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const CourseContent = () => {
   const user = useContext(UserContext)
   const navigate = useNavigate();

   const { courseId, courseTitle: paramCourseTitle } = useParams(); // Extract courseId and rename courseTitle from URL
   const [courseContent, setCourseContent] = useState([]);
   const [currentVideo, setCurrentVideo] = useState(null);
   const [playingSectionIndex, setPlayingSectionIndex] = useState(-1);
   const [completedSections, setCompletedSections] = useState([]);
   const [completedModule, setCompletedModule] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [certificate, setCertificate] = useState(null)
   const [justCompleted, setJustCompleted] = useState(null);
   const [courseInfo, setCourseInfo] = useState({});
   // Extract sectionIds from completedModule
   const completedModuleIds = completedModule.map((item) => item.sectionId);
   // State for open section in Accordion
   const [openSectionIndex, setOpenSectionIndex] = useState(0);

   // Find the index of the first incomplete section
   const completedSectionIds = new Set(completedModule.map(item => item.sectionId));
   const totalSections = courseContent.length;
   const completedCount = completedSectionIds.size;
   const progress = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
   let resumeSectionIndex = 0;
   for (let i = 0; i < courseContent.length; i++) {
     if (!completedSectionIds.has(courseContent[i]._id)) {
       resumeSectionIndex = i;
       break;
     }
     if (i === courseContent.length - 1) {
       resumeSectionIndex = i;
     }
   }

   // Update openSectionIndex when courseContent or completedModule changes
   useEffect(() => {
     setOpenSectionIndex(resumeSectionIndex);
   }, [courseContent, completedModule]);

   const downloadPdfDocument = (rootElementId) => {
      const input = document.getElementById(rootElementId);
      html2canvas(input).then((canvas) => {
         const imgData = canvas.toDataURL('image/png');
         const pdf = new jsPDF();
         pdf.addImage(imgData, 'JPEG', 0, 0);
         pdf.save('download-certificate.pdf');
      });
   };


   const getCourseContent = async () => {
      try {
         const res = await axiosInstance.get(`/api/user/coursecontent/${courseId}`, {
            headers: {
               "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
         });
         if (res.data.success) {
            setCourseContent(res.data.courseContent);
            setCourseInfo(res.data.courseInfo || {});
            setCompletedModule(res.data.completeModule)
            setCertificate(res.data.certficateData.updatedAt)
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      getCourseContent();
   }, [courseId]);

   const playVideo = (videoPath, index) => {
      setCurrentVideo(videoPath);
      setPlayingSectionIndex(index);
   };

   const completeModule = async (sectionId) => {
      console.log('completeModule called with sectionId:', sectionId);
      console.log('completedModule.length:', completedModule.length, 'courseContent.length:', courseContent.length);
      
      if (completedModule.length < courseContent.length) {
         console.log('Section not already completed, proceeding...');
         // Mark the current section as completed
         if (!completedSections.includes(sectionId)) {
            console.log('Marking section as completed...');
            setCompletedSections([...completedSections, sectionId]);
            setJustCompleted(sectionId);

            // Send a request to the server to update the user's progress
            try {
               console.log('Sending API request...');
               const res = await axiosInstance.post(`api/user/completemodule`, {
                  courseId,
                  sectionId: sectionId
               }, {
                  headers: {
                     Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
               });
               console.log('API response:', res.data);
               if (res.data.success) {
                  console.log('Success! Updating local state...');
                  // Update the completedModule state immediately
                  setCompletedModule(prev => [...prev, { sectionId: sectionId }]);
                  
                  // Handle success if needed
                  setTimeout(() => {
                     setJustCompleted(null);
                     // Refresh course content to ensure everything is in sync
                     getCourseContent();
                  }, 1200);
               }
            } catch (error) {
               console.error('Error completing module:', error);
               // Revert the local state if API call fails
               setCompletedSections(prev => prev.filter(id => id !== sectionId));
               setJustCompleted(null);
            }
         } else {
            console.log('Section already completed');
         }
      } else {
         console.log('All sections completed, showing certificate modal');
         // Show the modal
         setShowModal(true);
      }
   };

   // Example placeholders for banner, instructor, and progress
   const courseImageUrl = courseContent[0]?.bannerUrl;
   const instructorName = courseContent[0]?.C_educator || 'Instructor';
   const instructorImage = '/default-instructor.png'; // Replace with real image if available
   const courseTitle = courseContent[0]?.C_title || paramCourseTitle;
   const isCourseCompleted = completedModule.length === courseContent.length && courseContent.length > 0;


   return (
      <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
         {/* Home Button */}
         <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '18px 32px 0 32px' }}>
            <button
               className="btn btn-outline-primary"
               style={{ fontWeight: 600, borderRadius: 8, minWidth: 100 }}
               onClick={() => navigate('/dashboard')}
            >
               Home
            </button>
         </div>
         {/* Card Full Width (no banner) */}
         <div className="course-detail-container" style={{ maxWidth: '100%', margin: '24px 0 0 0', background: '#fff', borderRadius: 0, boxShadow: '0 2px 12px #0001', overflow: 'hidden' }}>
            {/* Header */}
            <div className="course-header" style={{ padding: '32px 32px 16px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
               <h1 style={{ fontWeight: 700, fontSize: 32, margin: 0 }}>{courseInfo.C_title || courseTitle}</h1>
               {courseInfo.C_description && (
                  <div style={{
                     background: '#f1f5f9',
                     borderRadius: 8,
                     padding: '16px 20px',
                     marginTop: 12,
                     color: '#222',
                     fontSize: 17,
                     fontWeight: 400,
                     boxShadow: '0 1px 4px #0001',
                     maxWidth: 700,
                  }}>
                     <b>Course Description:</b> {courseInfo.C_description}
                  </div>
               )}
               <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <button
                    className="btn btn-primary"
                    style={{ fontWeight: 600, fontSize: 18, borderRadius: 8 }}
                    onClick={() => setOpenSectionIndex(resumeSectionIndex)}
                  >
                    Resume Course
                  </button>
                  <span style={{ color: '#666', fontWeight: 500 }}>{progress}% COMPLETED</span>
               </div>
            </div>
            {/* Tabs */}
            <div style={{ padding: '0 32px' }}>
               <Tabs defaultActiveKey="overview" id="course-tabs" className="mb-3">
                  <Tab eventKey="overview" title="Overview">
                     {/* Overview content here */}
                  </Tab>
                  <Tab eventKey="discussions" title="Discussions">
                     {/* Discussions content here */}
                  </Tab>
                  <Tab eventKey="resources" title="Resources">
                     {/* Resources content here */}
                  </Tab>
                  <Tab eventKey="certificate" title="Certificate">
                     {isCourseCompleted ? (
                        <div style={{ padding: 32 }}>
                           {showModal ? (
         <Modal
            size="lg"
            show={showModal}
            onHide={() => setShowModal(false)}
            dialogClassName="modal-90w"
            aria-labelledby="example-custom-modal-styling-title"
         >
            <Modal.Header closeButton>
               <Modal.Title id="example-custom-modal-styling-title">
                  🎉 Completion Certificate
               </Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fb', borderRadius: 20 }}>
                  <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px #0001', padding: 40, width: 600, maxWidth: '100%', position: 'relative', textAlign: 'center', fontFamily: 'serif' }}>
                     {/* Top border waves (approximate with CSS) */}
                     <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 30, background: 'linear-gradient(90deg, #1a284d 0%, #f8f9fb 100%)', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
                     <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30, background: 'linear-gradient(270deg, #1a284d 0%, #f8f9fb 100%)', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} />
                     <div style={{ position: 'relative', zIndex: 2, padding: '20px 0 0 0' }}>
                        <div style={{ color: '#1a284d', fontWeight: 700, fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>LEARN HUB</div>
                        <div style={{ fontFamily: 'cursive', fontSize: 32, color: '#1a284d', fontWeight: 600, marginBottom: 0 }}>Certificate</div>
                        <div style={{ color: '#444', fontSize: 16, letterSpacing: 1, marginBottom: 18 }}>OF COMPLETION</div>
                        <div style={{ background: '#bfa046', color: '#fff', fontWeight: 600, borderRadius: 8, display: 'inline-block', padding: '6px 24px', fontSize: 16, marginBottom: 18 }}>PROUDLY PRESENTED TO</div>
                        <div style={{ fontWeight: 700, fontSize: 32, letterSpacing: 2, margin: '12px 0' }}>{user.userData.name}</div>
                        <div style={{ color: '#222', fontSize: 18, marginBottom: 8 }}>for successfully completing the course</div>
                        <div style={{ fontWeight: 700, fontSize: 28, color: '#1a284d', marginBottom: 8 }}>{courseTitle}</div>
                        <div style={{ color: '#222', fontSize: 16, marginBottom: 8 }}>on this day: <b>{new Date(certificate).toLocaleDateString()}</b></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                           <div style={{ borderTop: '2px solid #1a284d', width: 180, textAlign: 'center', color: '#1a284d', fontWeight: 500, fontSize: 14, paddingTop: 4 }}>
                              {courseContent[0]?.C_educator || ''}<br />Instructor Name
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ background: '#bfa046', color: '#fff', borderRadius: '50%', width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, border: '4px solid #1a284d', marginBottom: 4 }}>
                                 Best<br />AWARD
                              </div>
                           </div>
                           <div style={{ borderTop: '2px solid #1a284d', width: 180, textAlign: 'center', color: '#1a284d', fontWeight: 500, fontSize: 14, paddingTop: 4 }}>
                              LEARN HUB
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                  <Button onClick={() => downloadPdfDocument('certificate-download')} variant="contained" color="success" style={{ fontWeight: 600, fontSize: 16, borderRadius: 8 }}>
                     Download Certificate
                  </Button>
               </div>
               {/* Hidden printable/downloadable certificate for PDF */}
               <div id='certificate-download' style={{
                  position: 'absolute',
                  left: '-9999px',
                  top: 0,
                  width: 600,
                  background: '#fff',
                  borderRadius: 20,
                  boxShadow: '0 2px 12px #0001',
                  padding: 40,
                  maxWidth: '100%',
                  zIndex: -1
               }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 30, background: 'linear-gradient(90deg, #1a284d 0%, #f8f9fb 100%)', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30, background: 'linear-gradient(270deg, #1a284d 0%, #f8f9fb 100%)', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} />
                  <div style={{ position: 'relative', zIndex: 2, padding: '20px 0 0 0' }}>
                     <div style={{ color: '#1a284d', fontWeight: 700, fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>LEARN HUB</div>
                     <div style={{ fontFamily: 'cursive', fontSize: 32, color: '#1a284d', fontWeight: 600, marginBottom: 0 }}>Certificate</div>
                     <div style={{ color: '#444', fontSize: 16, letterSpacing: 1, marginBottom: 18 }}>OF COMPLETION</div>
                     <div style={{ background: '#bfa046', color: '#fff', fontWeight: 600, borderRadius: 8, display: 'inline-block', padding: '6px 24px', fontSize: 16, marginBottom: 18 }}>PROUDLY PRESENTED TO</div>
                     <div style={{ fontWeight: 700, fontSize: 32, letterSpacing: 2, margin: '12px 0' }}>{user.userData.name}</div>
                     <div style={{ color: '#222', fontSize: 18, marginBottom: 8 }}>for successfully completing the course</div>
                     <div style={{ fontWeight: 700, fontSize: 28, color: '#1a284d', marginBottom: 8 }}>{courseTitle}</div>
                     <div style={{ color: '#222', fontSize: 16, marginBottom: 8 }}>on this day: <b>{new Date(certificate).toLocaleDateString()}</b></div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                        <div style={{ borderTop: '2px solid #1a284d', width: 180, textAlign: 'center', color: '#1a284d', fontWeight: 500, fontSize: 14, paddingTop: 4 }}>
                           {courseContent[0]?.C_educator || ''}<br />Instructor Name
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                           <div style={{ background: '#bfa046', color: '#fff', borderRadius: '50%', width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, border: '4px solid #1a284d', marginBottom: 4 }}>
                              Best<br />AWARD
                           </div>
                        </div>
                        <div style={{ borderTop: '2px solid #1a284d', width: 180, textAlign: 'center', color: '#1a284d', fontWeight: 500, fontSize: 14, paddingTop: 4 }}>
                           LEARN HUB
                        </div>
                     </div>
                  </div>
               </div>
            </Modal.Body>
         </Modal>
                           ) : (
                              <Button className='my-2' onClick={() => setShowModal(true)} variant="contained" color="primary" style={{ fontWeight: 600, fontSize: 16, borderRadius: 8 }}>
                                 Download Certificate
                              </Button>
                           )}
                        </div>
                     ) : (
                        <div style={{ padding: 32, color: '#e11d48', fontWeight: 600, fontSize: 18 }}>
                           Complete the course to download your certificate.
                        </div>
                     )}
                  </Tab>
               </Tabs>
            </div>
            {/* Course Content Card */}
            <div className="course-content-card" style={{ background: '#f8fafc', borderRadius: 12, margin: '0 32px 32px 32px', padding: 24, boxShadow: '0 1px 4px #0001' }}>
               <div className="course-content-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>Course Content</h2>
                  <div className="instructor-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <img src={instructorImage} alt="Instructor" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                     <div style={{ fontWeight: 500, color: '#222', fontSize: 15 }}>{instructorName}<br /><span style={{ color: '#888', fontWeight: 400, fontSize: 13 }}>Instructor</span></div>
                  </div>
               </div>
               <div>
                  <Accordion activeKey={openSectionIndex.toString()} onSelect={k => setOpenSectionIndex(Number(k))} flush>
                     {courseContent.map((section, index) => {
                        const sectionId = index;
                        const isSectionCompleted = completedModuleIds.includes(sectionId) || completedSections.includes(sectionId);
                        return (
                           <Accordion.Item key={index} eventKey={index.toString()}>
                              <Accordion.Header>
                                 <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {isSectionCompleted ? (
                                       <CheckCircleIcon style={{ color: '#22c55e' }} />
                                    ) : (
                                       <RadioButtonUncheckedIcon style={{ color: '#bdbdbd' }} />
                                    )}
                                    {section.S_title}
                                 </span>
                              </Accordion.Header>
                              <Accordion.Body>
                                 {section.S_description && (
                                    <div style={{
                                       background: '#e0f2fe',
                                       borderRadius: 6,
                                       padding: '10px 14px',
                                       marginBottom: 12,
                                       color: '#155e75',
                                       fontWeight: 500,
                                       fontSize: 16,
                                       boxShadow: '0 1px 2px #0001',
                                       maxWidth: 600,
                                    }}>
                                       <b>Section Description:</b> {section.S_description}
                                    </div>
                                 )}
                                 {Array.isArray(section.S_content) && section.S_content.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                       {section.S_content.map((file, fileIdx) => {
                                          const fileUrl = `http://localhost:8000${file.path}`;
                                          const isVideo = file.filename.match(/\.(mp4|webm|ogg)$/i);
                                          return (
                                             <div key={fileIdx} style={{ marginBottom: 8 }}>
                                                {isVideo ? (
                                                   <Button color='success' className='mx-2' variant="text" size="small" onClick={() => playVideo(fileUrl, index)}>
                                                      Play Video {fileIdx + 1}
                                                   </Button>
                                                ) : (
                                                   <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                      <img src={fileUrl} alt={`Section content ${fileIdx + 1}`} style={{ maxWidth: 200, maxHeight: 120, borderRadius: 8, marginRight: 8 }} />
                                                   </a>
                                                )}
                                             </div>
                                          );
                                       })}
                                    </div>
                                 )}
                                 {!isSectionCompleted && !completedSections.includes(index) && (
                                    <div style={{ marginTop: 16 }}>
                                       <Button
                                          variant='success'
                                          size='sm'
                                          onClick={() => {
                                             console.log('Button clicked for section:', index);
                                             completeModule(index);
                                          }}
                                          disabled={justCompleted === index}
                                          style={{ marginLeft: 8, minWidth: 160, position: 'relative', fontWeight: 600 }}
                                       >
                                          {justCompleted === index ? (
                                             <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 700 }}>
                                                <CheckCircleIcon style={{ color: '#22c55e', fontSize: 22 }} /> Completed!
                                             </span>
                                          ) : (
                                             'Mark as Completed'
                                          )}
                                       </Button>
                                    </div>
                                 )}
                              </Accordion.Body>
                           </Accordion.Item>
                        );
                     })}
                  </Accordion>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CourseContent;

