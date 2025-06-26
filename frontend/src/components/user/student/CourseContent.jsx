import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Accordion, Modal } from 'react-bootstrap';
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

   const { courseId, courseTitle } = useParams(); // Extract courseId from URL
   const [courseContent, setCourseContent] = useState([]);
   const [currentVideo, setCurrentVideo] = useState(null);
   const [playingSectionIndex, setPlayingSectionIndex] = useState(-1);
   const [completedSections, setCompletedSections] = useState([]);
   const [completedModule, setCompletedModule] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [certificate, setCertificate] = useState(null)
   // Extract sectionIds from completedModule
   const completedModuleIds = completedModule.map((item) => item.sectionId);

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
            console.log(res.data.completeModule)
            setCompletedModule(res.data.completeModule)
            // setCompletedModule(res.data.completeModule[0]?.progress);
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
      if (completedModule.length < courseContent.length) {
         // Mark the current section as completed
         if (playingSectionIndex !== -1 && !completedSections.includes(playingSectionIndex)) {
            setCompletedSections([...completedSections, playingSectionIndex]);

            // Send a request to the server to update the user's progress
            try {
               const res = await axiosInstance.post(`api/user/completemodule`, {
                  courseId,
                  sectionId: sectionId
               }, {
                  headers: {
                     Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
               });
               if (res.data.success) {
                  // Handle success if needed
                  alert(res.data.message);
                  getCourseContent()
               }
            } catch (error) {
               console.log(error);
            }
         }
      } else {
         // Show the modal
         setShowModal(true);
      }
   };

   return (
      <>
         <NavBar />
         <h1 className='my-3 text-center'>Welcome to the course: {courseTitle}</h1>

         <div className='course-content' style={{ display: 'flex', gap: 32 }}>
            <div className="course-section" style={{ flex: 1 }}>
               <Accordion defaultActiveKey="0" flush>
                  {courseContent.map((section, index) => {
                     const sectionId = index;
                     const isSectionCompleted = completedModuleIds.includes(sectionId);
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
                              {section.S_description}
                              {section.S_content && (
                                 <>
                                    <Button color='success' className='mx-2' variant="text" size="small" onClick={() => playVideo(`http://localhost:8000${section.S_content.path}`, index)}>
                                       Play Video
                                    </Button>
                                    {!isSectionCompleted && !completedSections.includes(index) && (
                                       <Button
                                          variant='success'
                                          size='sm'
                                          onClick={() => completeModule(sectionId)}
                                          disabled={playingSectionIndex !== index}
                                          style={{ marginLeft: 8 }}
                                       >
                                          Mark as Completed
                                       </Button>
                                    )}
                                 </>
                              )}
                           </Accordion.Body>
                        </Accordion.Item>
                     );
                  })}
                  {completedModule.length === courseContent.length && (
                     <Button className='my-2' onClick={() => setShowModal(true)} variant="contained" color="primary" style={{ fontWeight: 600, fontSize: 16, borderRadius: 8 }}>
                        Download Certificate
                     </Button>
                  )}
               </Accordion>
            </div>
            <div className="course-video w-50">
               {currentVideo && (
                  <ReactPlayer
                     url={currentVideo}
                     width='100%'
                     height='100%'
                     controls
                  />
               )}
            </div>
         </div>
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
               <div id='certificate-download' style={{ display: 'none', background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px #0001', padding: 40, width: 600, maxWidth: '100%', position: 'relative', textAlign: 'center', fontFamily: 'serif' }}>
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
      </>
   );
};

export default CourseContent;

