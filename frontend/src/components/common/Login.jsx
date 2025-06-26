import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import axiosInstance from './AxiosInstance';
import { UserContext } from '../../App';

const Login = ({ onClose }) => {
   const { setUserLoggedIn, setUserData } = useContext(UserContext);
   const [data, setData] = useState({
      email: "",
      password: "",
   })

   const navigate = useNavigate();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setData({ ...data, [name]: value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!data?.email || !data?.password) {
         return alert("Please fill all fields");
      }
      try {
         const res = await axiosInstance.post('/api/user/login', data);
         console.log("Login response:", res.data);
         if (res.data.success) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.userData));
            if (setUserData) setUserData(res.data.userData);
            if (setUserLoggedIn) setUserLoggedIn(true);
            if (res.data.userData.type === 'Teacher') {
               navigate('/teacher');
            } else if (res.data.userData.type === 'Admin') {
               navigate('/admin');
            } else {
               navigate('/dashboard');
            }
         } else {
            alert(res.data.message);
         }
      } catch (err) {
         console.error("Login error:", err);
         if (err.response && err.response.status === 401) {
            alert("User doesn't exist");
         } else {
            alert("Login failed. Please try again.");
         }
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
            <Typography component="h1" variant="h5">Sign In</Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
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
               <Box mt={2}>
                  <Button
                     type="submit"
                     variant="contained"
                     sx={{ mt: 3, mb: 2 }}
                     style={{ width: '200px' }}
                  >
                     Sign In
                  </Button>
               </Box>
               <Grid container>
                  <Grid item>
                     Don't have an account?{' '}
                     <span style={{ color: "blue", cursor: "pointer" }} onClick={onClose}>
                        Sign Up
                     </span>
                  </Grid>
               </Grid>
            </Box>
         </Box>
      </div>
   )
}

export default Login;
