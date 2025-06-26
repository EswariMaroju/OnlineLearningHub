import React, { useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import axiosInstance from './AxiosInstance';
import Dropdown from 'react-bootstrap/Dropdown';

const Register = ({ onClose }) => {
   const [selectedOption, setSelectedOption] = useState('Select User');
   const [data, setData] = useState({
      name: "",
      email: "",
      password: "",
      type: "",
   })

   const handleSelect = (eventKey) => {
      setSelectedOption(eventKey);
      setData({ ...data, type: eventKey });
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setData({ ...data, [name]: value });
   };

   const handleSubmit = (e) => {
      e.preventDefault()
      if (!data?.name || !data?.email || !data?.password || !data?.type) return alert("Please fill all fields");
      else {
         axiosInstance.post('/api/user/register', data)
            .then((response) => {
               if (response.data.success) {
                  alert(response.data.message)
                  if (onClose) onClose();
               } else {
                  console.log(response.data.message)
               }
            })
            .catch((error) => {
               console.log("Error", error);
            });
      }
   };

   return (
      <div style={{ position: 'relative', minWidth: 350 }}>
         {onClose && (
            <Button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>X</Button>
         )}
         <Box
            sx={{
               marginTop: 8,
               marginBottom: 4,
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               padding: '10px',
               background: '#dddde8db',
               border: '1px solid lightblue',
               borderRadius: '5px',
               position: 'relative'
            }}
         >
            <Avatar sx={{ bgcolor: 'secondary.main' }} />
            <Typography component="h1" variant="h5">Register</Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
               <TextField
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  autoComplete="name"
                  autoFocus
               />
               <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
               />
               <TextField
                  margin="normal"
                  fullWidth
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
               />
               <Dropdown className='my-3'>
                  <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                     {selectedOption}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                     <Dropdown.Item onClick={() => handleSelect("Student")}>Student</Dropdown.Item>
                     <Dropdown.Item onClick={() => handleSelect("Teacher")}>Teacher</Dropdown.Item>
                  </Dropdown.Menu>
               </Dropdown>
               <Box mt={2}>
                  <Button
                     type="submit"
                     variant="contained"
                     sx={{ mt: 3, mb: 2 }}
                     style={{ width: '200px' }}
                  >
                     Sign Up
                  </Button>
               </Box>
               <Grid container>
                  <Grid item>
                     Already have an account?{' '}
                     <span style={{ color: "blue", cursor: "pointer" }} onClick={onClose}>
                        Sign In
                     </span>
                  </Grid>
               </Grid>
            </Box>
         </Box>
      </div>
   )
}

export default Register;


