import React, {ChangeEvent} from "react";
import axios from "axios";
import {getUser} from "../store";
import {
    Alert,
    Avatar,
    Box, Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    Divider, Input, Snackbar,
    TextField,
    Typography
} from "@mui/material";
import NavBar from "./NavBar";

const MyProfile = () => {
    const [user, setUser] = React.useState<User>({email: '', firstName: '', lastName: ''})

    const [openEditDialog, setOpenEditDialog] = React.useState(false)
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [currentPassword, setCurrentPassword] = React.useState('')
    const [image, setImage] = React.useState<File|null>(null)

    const [loadingImage, setLoadingImage] = React.useState(false)

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState({severity: '', message: ''})

    React.useEffect(() => {
        const loadUser = () => {
            axios.get('http://localhost:4941/api/v1/users/'+getUser()?.userId,
                {headers:{'X-Authorization': getUser()?.token}})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage('')
                    setUser(response.data)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.response.statusText)
                })
        }
        loadUser()
    }, [setUser, snackOpen])

    const handleEditDialogClose = () => {
        setFirstName('')
        setLastName('')
        setNewPassword('')
        setCurrentPassword('')
        setOpenEditDialog(false)
    }

    const Edit = () => {
        const data: EditUser = {}
        if (email) data.email = email
        if (firstName) data.firstName = firstName
        if (lastName) data.lastName = lastName
        if (newPassword) {
            data.password = newPassword
            data.currentPassword = currentPassword
        }

        axios.patch('http://localhost:4941/api/v1/users/'+getUser()?.userId, data,
            {headers:{'X-Authorization': getUser()?.token}})
            .then((reponse) => {
                setErrorFlag(false)
                setErrorMessage('')
                setSnackMessage({severity: 'success', message: 'Profile successfully Updated'})
                if (image) putUserImage()
                else {
                    handleEditDialogClose()
                    setSnackOpen(true)
                }
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const deleteProfileImage = () => {
        setLoadingImage(true)
        axios.delete('http://localhost:4941/api/v1/users/'+getUser()?.userId+'/image', {headers:{'X-Authorization': getUser()?.token}})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage('')
                setSnackMessage({severity: 'success', message: 'Profile Image successfully Deleted'})
                setSnackOpen(true)
                setLoadingImage(false)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
                setSnackMessage({severity: 'error', message: error.response.statusText})
                setSnackOpen(true)
                setLoadingImage(false)
            })
    }

    const readImageFile = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const fileList = (event.target as HTMLInputElement).files
        setImage(fileList ? fileList.item(0) : null)
    }

    const putUserImage = () => {
        setLoadingImage(true)
        const reader = new FileReader();
        if (image) reader.readAsArrayBuffer(image)
        reader.onload = (e) => {
            if (e.target) {
                axios.put('http://localhost:4941/api/v1/users/' + getUser()?.userId + '/image', e.target.result,
                    {headers:{
                            'X-Authorization': getUser()?.token,
                            'Content-Type': image?.type}})
                    .then((response) => {
                        setErrorFlag(false)
                        setErrorMessage("")
                        setSnackMessage(snackMessage => ({...snackMessage, message: snackMessage.message + ' And Image added'}))
                        setSnackOpen(true)
                        handleEditDialogClose()
                        setLoadingImage(false)
                    }, (error) => {
                        setErrorFlag(true)
                        setErrorMessage(error.response.statusText)
                        setLoadingImage(false)
                    })
            }
        }
    }

    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };

    return (
        <div>
            {errorFlag ? <Alert severity="error">{errorMessage}</Alert> : ''}

            <h1>My Profile</h1>

            < NavBar />

            <h2>{user.firstName+' '+user.lastName}</h2>
            {!loadingImage ?
            <Box id='userImage' sx={{width: '50%', float: "left"}}>
                <Avatar variant="square" sx={{width: '100%', height: 'auto'}} src={'http://localhost:4941/api/v1/users/' + getUser()?.userId + '/image'} />
                {document.getElementsByClassName('MuiAvatar-fallback').length ? '' :
                    <Button variant='contained' color='error' onClick={deleteProfileImage}>Remove Profile Image</Button>}
            </Box>
                : 'loading'}
            <Box sx={{width:'50%', float: "right"}}>
                <Divider sx={{my:1}} />
                <Typography variant={'h5'}>Name</Typography>
                <Typography variant={'subtitle1'}>{user.firstName+' '+user.lastName}</Typography>
                <Divider sx={{my:1}} />
                <Typography variant={'h5'}>Email</Typography>
                <Typography variant={'subtitle1'}>{user.email}</Typography>
                <Divider sx={{my:1}} />
                <Button variant='contained' onClick={() => setOpenEditDialog(true)}>Edit Profile</Button>
            </Box>

            <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    {errorFlag ? <Alert severity="error">{errorMessage}</Alert> : ''}
                    <TextField fullWidth sx={{my:1}} value={firstName} label='First Name'
                               onChange={(event) => setFirstName(event.target.value)} />
                    <TextField fullWidth sx={{my:1}} value={lastName} label='Last Name'
                               onChange={(event) => setLastName(event.target.value)} />
                    <TextField fullWidth sx={{my:1}} value={email} label='Email'
                               onChange={(event) => setEmail(event.target.value)} />
                    <TextField fullWidth sx={{my:1}} value={newPassword} type='password' label='Password'
                               onChange={(event) => setNewPassword(event.target.value)} />
                    {newPassword && <TextField fullWidth sx={{my:1}} value={currentPassword} type='password' label='Current Password'
                                               onChange={(event) => setCurrentPassword(event.target.value)} />}
                    Profile Image: <Input fullWidth inputProps={{type: 'file', accept:'image/png, image/jpeg, image/gif'}}
                                  onChange={readImageFile} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose}>Close</Button>
                    <Button variant="contained" color="success" onClick={Edit}>Edit</Button>
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

export default MyProfile