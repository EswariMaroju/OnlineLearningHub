import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Container, Nav, Button, Navbar } from 'react-bootstrap';
import AllCourses from './AllCourses';
import Login from './Login';
import Register from './Register';
import { UserContext } from '../../App';

const Home = () => {
   const { userLoggedIn } = useContext(UserContext);
   const [showLogin, setShowLogin] = useState(false);
   const [showRegister, setShowRegister] = useState(false);

   useEffect(() => {
      if (localStorage.getItem('showLoginModal') === 'true') {
         console.log('Triggering login modal from localStorage flag');
         setShowLogin(true);
         localStorage.removeItem('showLoginModal');
      } else {
         console.log('No login modal flag in localStorage');
      }
   }, []);

   return (
      <>
         <Navbar expand="lg" className="bg-body-tertiary">
            <Container fluid>
               <Navbar.Brand><h2>Learning Hub</h2></Navbar.Brand>
               <Navbar.Toggle aria-controls="navbarScroll" />
               <Navbar.Collapse id="navbarScroll">
                  <Nav
                     className="me-auto my-2 my-lg-0"
                     style={{ maxHeight: '100px' }}
                     navbarScroll
                  >
                  </Nav>
                  <Nav>
                     <span style={{cursor:'pointer', marginRight:20}} onClick={() => setShowLogin(false)}>Home</span>
                     <span style={{cursor:'pointer', marginRight:20}} onClick={() => setShowLogin(true)}>Login</span>
                     <span style={{cursor:'pointer'}} onClick={() => setShowRegister(true)}>Register</span>
                  </Nav>
               </Navbar.Collapse>
            </Container>
         </Navbar>

         <div id='home-container' className='first-container home-bg'>
            <div className="content-home">
               <p>Small App, Big Dreams: <br /> Elevating Your Education</p>
               <Button variant='warning' className='m-2' size='md'>Explore Courses</Button>
            </div>
         </div>

         <Container className="second-container">
            <h2 className="text-center my-4">Trending Courses</h2>
            <AllCourses />
         </Container>

         {showLogin && (
            <div className="modal-overlay">
               <Login onClose={() => setShowLogin(false)} />
            </div>
         )}
         {showRegister && (
            <div className="modal-overlay">
               <Register onClose={() => setShowRegister(false)} />
            </div>
         )}
      </>
   )
}

export default Home


