import * as React from 'react';
import {useState, useEffect} from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LoginHeader from '../components/LoginHeader';
import { maxHeight } from '@mui/system';
import UrlConstants from '../constants/Urlconstants';
import HTTPService from '../constants/HTTPService';
import { getUserLocal, isLoggedInUserAdmin, isLoggedInUserBillingSupervisor, isLoggedInUserOfficeUser, isLoggedInUserGenerator, setNameLocal, setRoleLocal, setTokenLocal, setUserIdLocal } from '../constants/Common';
import { useNavigate } from 'react-router';
import ErrorToast from '../components/ErrorToast';
import SuccessToast from '../components/SuccessToast';
import { useParams } from 'react-router';
import Loader from '../components/Loader';
import LocalStorageConstants from '../constants/LocalStorageConstants';

const theme = createTheme();

export default function SignIn() {

    let {sessionexpired} = useParams()

    const [mobile, setMobile] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const [errorToastMessage, setErrorToastMessage] = useState(null)
    const [successToastMessage, setSuccessToastMessage] = useState(null)
    const [loader, setLoader] = useState(false)

  const handleSubmit = (event) => {
    
    event.preventDefault();
    setErrorToastMessage("")
    setLoader(true)
    const url = UrlConstants.base_url + UrlConstants.Login + "?mobilenumber=" + mobile + "&password=" + password;
    HTTPService("GET", url, '', false, false).then((res) => {
        if (res.data.jwt_token){
            setLoader(false)
            setTokenLocal(res.data.jwt_token)
            setUserIdLocal(res.data.user[0].userid)
            setRoleLocal(res.data.user[0].role)
            setNameLocal(res.data.user[0].name)
            let role = res.data.user[0].role
            if(role == LocalStorageConstants.ROLES.ADMIN || role == LocalStorageConstants.ROLES.OFFICE_USER){ 
              navigate("/users")
            }
            else if (role == LocalStorageConstants.ROLES.GENERATOR_USER){
              navigate("/bill")
            }
        }
        else{
            setLoader(false)
            setErrorToastMessage("Failed to Sign In. Invalid response from server")
        }
    }).catch((e) => {
        setLoader(false)
        setErrorToastMessage("Failed to Sign In. Please check username/password : " + e.response.status)
    });
  };
  
  useEffect(() => {
    if (getUserLocal()){
      if(isLoggedInUserAdmin() || isLoggedInUserOfficeUser()){ 
        navigate("/users/")
      }
      else if (isLoggedInUserGenerator())
      {
        navigate("/bill/")
      }
    }
    if(sessionexpired){
      setErrorToastMessage("Session Expired. Please login again")
    }
  }, [])
  
  return (
    <>
    {errorToastMessage ? <ErrorToast message={errorToastMessage} 
                                        toastOpen={errorToastMessage ? true : false}
                                        closeToast={() => {setErrorToastMessage(null)}}/> : <></>}
    {successToastMessage ? <SuccessToast message={successToastMessage}
                                            toastOpen={successToastMessage ? true : false}
                                            closeToast={() => {setSuccessToastMessage(null)}}/>: <></>}
    {loader ? <Loader /> : <></>}

    <ThemeProvider theme={theme}>
    <LoginHeader />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: 'primary'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="mobile"
              label="Mobile Number"
              name="mobile"
              autoComplete="mobile"
              autoFocus
              type="tel"
              // inputProps={{maxLength: 10}}
              value = {mobile}
              onChange = {(e) => {setMobile(e.target.value.trim())}}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value = {password}
              onChange = {(e) => {setPassword(e.target.value.trim())}}
            />
            {/* 
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
            <Button
              type="submit"
              fullWidth
              variant="outlined"
              color='primary'
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            {/* 
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
             */}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
    </>
  );
}