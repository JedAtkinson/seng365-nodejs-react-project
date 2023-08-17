import {
    Alert,
    AppBar, Avatar, Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Input,
    Snackbar,
    TextField, Toolbar
} from "@mui/material";
import React, {ChangeEvent} from "react";
import {getUser, removeUser, setUser} from "../store";
import axios from "axios";

const NavBar = () => {
    const [openLoginDialog, setOpenLoginDialog] = React.useState(false)
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')

    const [openRegisterDialog, setOpenRegisterDialog] = React.useState(false)
    const [registerFirstName, setRegisterFirstName] = React.useState('')
    const [registerLastName, setRegisterLastName] = React.useState('')
    const [registerEmail, setRegisterEmail] = React.useState('')
    const [registerPassword, setRegisterPassword] = React.useState('')
    const [image, setImage] = React.useState<File|null>(null)

    const [loadingImage, setLoadingImage] = React.useState(false)

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState({severity: '', message: ''})
    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };


    const handleLoginDialogClose = () => {
        setEmail('')
        setPassword('')
        setOpenLoginDialog(false)
        setErrorFlag(false)
        setErrorMessage('')
    }

    const handleRegisterDialogClose = () => {
        setRegisterFirstName('')
        setRegisterLastName('')
        setRegisterEmail('')
        setRegisterPassword('')
        setOpenRegisterDialog(false)
    }

    const login = async (email: string, password: string) => {
        await axios.post('http://localhost:4941/api/v1/users/login', {'email': email, 'password': password})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUser(response.data)
                handleLoginDialogClose()
                setSnackMessage({severity: 'success', message: 'Successfully Logged in'})
                setSnackOpen(true)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const logout = ()=> {
        axios.post('http://localhost:4941/api/v1/users/logout', null,
            {headers:{'X-Authorization': getUser()?.token}})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSnackMessage({severity: 'success', message: 'Successfully Logged out'})
                setSnackOpen(true)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
                setSnackMessage({severity: 'error', message: errorMessage})
                setSnackOpen(true)
            })
        removeUser()
    }

    const register = async () => {
        axios.post('http://localhost:4941/api/v1/users/register',
            {
                "email": registerEmail,
                "firstName": registerFirstName,
                "lastName": registerLastName,
                "password": registerPassword
            })
            .then(async (response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSnackMessage({severity: 'success', message: 'Successfully Registered'})
                // Login user
                await login(registerEmail, registerPassword)
                if (image) putUserImage(response.data.userId)
                else {
                    handleRegisterDialogClose()
                    setSnackOpen(true)
                }
            }, (error) => {
                setErrorMessage(error.response.statusText)
                setSnackMessage({severity: 'error', message: errorMessage})
                setSnackOpen(true)
            })
    }

    const readImageFile = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const fileList = (event.target as HTMLInputElement).files
        setImage(fileList ? fileList.item(0) : null)
    }

    const putUserImage = (userId: number) => {
        setLoadingImage(true)
        const reader = new FileReader();
        if (image) reader.readAsArrayBuffer(image)
        reader.onload = (e) => {
            if (e.target) {
                axios.put('http://localhost:4941/api/v1/users/' + userId + '/image', e.target.result,
                    {headers:{
                            'X-Authorization': getUser()?.token,
                            'Content-Type': image?.type}})
                    .then((response) => {
                        setErrorFlag(false)
                        setErrorMessage("")
                        setSnackMessage(snackMessage => ({...snackMessage, message: snackMessage.message + ' And Image added'}))
                        setSnackOpen(true)
                        handleRegisterDialogClose()
                        setLoadingImage(false)
                    }, (error) => {
                        setErrorFlag(true)
                        setErrorMessage(error.response.statusText)
                        setLoadingImage(false)
                    })
            }
        }
    }

    return (
        <div>
        <AppBar position='static' color='inherit' elevation={5} sx={{my:5}}>
            <Toolbar>
                {getUser() ?
                    <Box sx={{width: '30%'}}>
                        <Box sx={{width: 'auto', float:'left', my: 1, px: 1}}>
                            {!loadingImage ? <Avatar src={'http://localhost:4941/api/v1/users/'+getUser()?.userId+'/image'} /> : 'loading'}
                        </Box>
                        <Box sx={{textAlign: 'left', my: 1.5}}>
                            <Button color="inherit" onClick={logout}>Logout</Button>
                            <Button color="inherit" href='/myProfile'>View Profile</Button>
                            <Button color="inherit" href='/myFilms'>My Films</Button>
                        </Box>
                    </Box>
                    :
                    <Box sx={{width: '30%', textAlign: 'left'}}>
                        <Button color="inherit" onClick={() => setOpenLoginDialog(true)}>Login</Button>
                        <Button color="inherit" onClick={() => setOpenRegisterDialog(true)}>Register</Button>
                    </Box>
                }
                <Box sx={{width: '40%'}}>
                    <Button color='inherit' href='/films'>All Films</Button>
                    <Button color='inherit' href='/'>Home</Button>
                </Box>
            </Toolbar>
        </AppBar>

        <Dialog open={openLoginDialog} onClose={handleLoginDialogClose}>
            <DialogTitle>Login</DialogTitle>
            <DialogContent>
                {errorFlag ? <Alert severity="error">{errorMessage}</Alert> : ''}
                <TextField fullWidth sx={{my: 1}} value={email} label='Email'
                           onChange={(event) => setEmail(event.target.value)} />
                <TextField fullWidth sx={{my: 1}} value={password} type='password' label='Password'
                           onChange={(event) => setPassword(event.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleLoginDialogClose}>Close</Button>
                <Button variant="contained" color="success" onClick={() => login(email, password)}>Login</Button>
            </DialogActions>
        </Dialog>

    <Dialog open={openRegisterDialog} onClose={handleRegisterDialogClose}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
            {errorFlag ? <Alert severity="error">{errorMessage}</Alert> : ''}
            <TextField fullWidth sx={{my:1}} value={registerFirstName} label='First Name'
                       onChange={(event) => setRegisterFirstName(event.target.value)} />
            <TextField fullWidth sx={{my:1}} value={registerLastName} label='Last Name'
                       onChange={(event) => setRegisterLastName(event.target.value)} />
            <TextField fullWidth sx={{my:1}} value={registerEmail} label='Email'
                       onChange={(event) => setRegisterEmail(event.target.value)} />
            <TextField fullWidth sx={{my:1}} value={registerPassword} type='password' label='Password'
                       onChange={(event) => setRegisterPassword(event.target.value)} />
            Profile Image: <Input fullWidth inputProps={{type: 'file', accept:'image/png, image/jpeg, image/gif'}}
                                  onChange={readImageFile} />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleRegisterDialogClose}>Close</Button>
            <Button variant="contained" color="success" onClick={register}>Register</Button>
        </DialogActions>
    </Dialog>

    <Snackbar
        autoHideDuration={6000}
        open={snackOpen}
        onClose={handleSnackClose}
        key={snackMessage.message}
    >
        <Alert onClose={handleSnackClose} severity={snackMessage.severity === 'success' ? 'success' : 'error'} sx={{
            width: '100%'
        }}>
            {snackMessage.message}
        </Alert>
    </Snackbar>
        </div>
    )
}

export default NavBar