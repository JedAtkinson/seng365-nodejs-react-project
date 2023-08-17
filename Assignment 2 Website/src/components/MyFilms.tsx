import React, {ChangeEvent} from 'react'
import axios from "axios";
import {
    Alert,
    Avatar,
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, Input, InputLabel, Link, MenuItem,
    Paper, Select, Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, TextField
} from "@mui/material";
import {getAgeRatings, getGenres, getUser} from "../store";
import NavBar from "./NavBar";

const MyFilms = () => {
    const initialFilmState: FilmEdit = {ageRating: '', genreId: 0, title: '', runtime: 0, releaseDate: '', description: ''}

    const [usersFilms, setUsersFilms] = React.useState<Array<Film>>([])
    const [ratedFilms, setRatedFilms] = React.useState<Array<Film>>([])

    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
    const [openEditDialog, setOpenEditDialog] = React.useState(false)
    const [openAddDialog, setOpenAddDialog] = React.useState(false)
    const [film, setFilm] = React.useState<FilmEdit>(initialFilmState)
    const [filmId, setFilmId] = React.useState(0)
    const [image, setImage] = React.useState<File|null>(null)

    const [loadingImage, setLoadingImage] = React.useState(false)

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState({severity: '', message: ''})
    React.useEffect(() => {
        const getUsersFilms = () => {
            axios.get('http://localhost:4941/api/v1/films?directorId='+getUser()?.userId)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setUsersFilms(response.data.films)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
    getUsersFilms()
    }, [setUsersFilms, snackOpen])

    React.useEffect(() => {
        const getUsersRatedFilms = () => {
            axios.get('http://localhost:4941/api/v1/films?reviewerId='+getUser()?.userId)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setRatedFilms(response.data.films)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getUsersRatedFilms()
    }, [setRatedFilms])

    const handleFilmChange = (field: string, value: any) => {
        setFilm(film => ({...film, [field]: value}))
    }

    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };

    const handleDialogClose = () => {
        setOpenEditDialog(false)
        setOpenAddDialog(false)
        setFilm(initialFilmState)
        setFilmId(0)
        setImage(null)
    }

    const edit = () => {
        const data: FilmEdit = {}
        if (film.title) data.title = film.title
        if (film.description) data.description = film.description
        if (film.releaseDate) data.releaseDate = film.releaseDate.replace('T', ' ').replace('Z', '')+':00'
        if (film.genreId) data.genreId = film.genreId
        if (film.runtime) data.runtime = film.runtime
        if (film.ageRating) data.ageRating = film.ageRating
        axios.patch('http://localhost:4941/api/v1/films/'+filmId, data, {headers:{'X-Authorization': getUser()?.token}})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSnackMessage({severity: 'success', message: 'Film successfully Added'})
                if (image) putFilmImage(filmId)
                else {
                    handleDialogClose()
                    setSnackOpen(true)
                }
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const addFilm = () => {
        const data: FilmEdit = {
            "title": film.title,
            "description": film.description,
            "genreId": film.genreId
        }
        if (film.releaseDate) data["releaseDate"] = film.releaseDate.replace('T', ' ').replace('Z', '')+':00'
        if (film.runtime) data["runtime"] = film.runtime
        if (film.ageRating) data["ageRating"] = film.ageRating
        axios.post('http://localhost:4941/api/v1/films', data, {headers:{'X-Authorization': getUser()?.token}})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSnackMessage({severity: 'success', message: 'Film successfully Added'})
                if (image) putFilmImage(response.data.filmId)
                else {
                    handleDialogClose()
                    setSnackOpen(true)
                }
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const putFilmImage = (filmId: number) => {
        setLoadingImage(true)
        const reader = new FileReader();
        if (image) reader.readAsArrayBuffer(image)
        reader.onload = (e) => {
            if (e.target) {
                axios.put('http://localhost:4941/api/v1/films/' + filmId + '/image', e.target.result,
                    {headers:{
                        'X-Authorization': getUser()?.token,
                        'Content-Type': image?.type}})
                    .then((response) => {
                        setErrorFlag(false)
                        setErrorMessage("")
                        setSnackMessage(snackMessage => ({...snackMessage, message: snackMessage.message + ' And image added'}))
                        setSnackOpen(true)
                        handleDialogClose()
                        setLoadingImage(false)
                    }, (error) => {
                        setErrorFlag(true)
                        setErrorMessage(error.response.statusText)
                        setLoadingImage(false)
                    })
            }
        }
    }

    const readImageFile = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const fileList = (event.target as HTMLInputElement).files
        setImage(fileList ? fileList.item(0) : null)
    }

    const deleteFilm = () => {
        axios.delete('http://localhost:4941/api/v1/films/' + filmId, {headers:{'X-Authorization': getUser()?.token}})
            .then((response) => {
                setSnackMessage({severity: 'success', message: 'Film successfully Deleted'})
                setSnackOpen(true)
                setOpenDeleteDialog(false)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const filmTextFields = () => {
        return (
            <DialogContent>
                {errorFlag ? <Alert severity="error">{errorMessage}</Alert> : ''}
                <TextField fullWidth sx={{my: 1}} value={film.title} label='Title'
                           onChange={(event) => handleFilmChange('title', event.target.value)} />
                <TextField fullWidth multiline minRows={2} maxRows={3} sx={{my: 1}} value={film.description} label='Description'
                           onChange={(event) => handleFilmChange('description', event.target.value)} />
                <FormControl fullWidth sx={{my: 1}}>
                    <InputLabel id="genre-select-label">Genre</InputLabel>
                    <Select labelId="genre-select-label" value={film.genreId} label="Genre"
                        onChange={(event) => handleFilmChange('genreId', typeof event.target.value === 'number' ? event.target.value : 0)}>
                        <MenuItem value={0} key={0}><em>none</em></MenuItem>
                        {getGenres().map((g) => <MenuItem value={g.genreId} key={g.genreId}>{g.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{my: 1}}>
                    <InputLabel id="ageRating-select-label">Age Rating</InputLabel>
                    <Select labelId="ageRating-select-label" value={film.ageRating} label="Age Rating"
                            onChange={(event) => handleFilmChange('ageRating', event.target.value)}>
                        <MenuItem value='' key=''><em>none</em></MenuItem>
                        {getAgeRatings().map((ar) => <MenuItem value={ar} key={ar}>{ar}</MenuItem>)}
                    </Select>
                </FormControl>
                <br />
                Release Date: <Input value={film.releaseDate} fullWidth inputProps={{type: 'datetime-local'}}
                                     onChange={(event) => handleFilmChange('releaseDate', event.target.value)} />
                <br /><br />
                Run Time: <Input value={film.runtime} fullWidth inputProps={{type: 'number'}}
                                 onChange={(event) => handleFilmChange('runtime', parseInt(event.target.value, 10))} />
                <br /><br />
                Image: <Input fullWidth inputProps={{type: 'file', accept:'image/png, image/jpeg, image/gif'}}
                              onChange={readImageFile} />
            </DialogContent>
        )
    }

    return (
        <div>
            <h1>My Films</h1>

            < NavBar />

            <h2>My Directed Films</h2>

            <Button onClick={() => setOpenAddDialog(true)}>Add new Film</Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableCell>Title</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Genre</TableCell>
                        <TableCell>AgeRating</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Release Date</TableCell>
                        <TableCell>Options</TableCell>
                    </TableHead>
                    <TableBody>
                        {usersFilms.map((film) => (
                            <TableRow key={film.filmId}>
                                <TableCell><Link href={"/film/" + film.filmId}>{film.title}</Link></TableCell>
                                {!loadingImage ?
                                <TableCell>
                                    <Avatar src={'http://localhost:4941/api/v1/films/'+film.filmId+'/image'} />
                                </TableCell>
                                    : <TableCell>loading</TableCell>}
                                <TableCell>{Object.fromEntries(getGenres().map(x => [x.genreId, x.name]))[film.genreId]}</TableCell>
                                <TableCell>{film.ageRating}</TableCell>
                                <TableCell>{film.rating}/10</TableCell>
                                <TableCell>{new Date(film.releaseDate).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Button onClick={() => {setFilmId(film.filmId); setOpenEditDialog(true)}}>Edit</Button>
                                    <Button onClick={() => {setFilmId(film.filmId); setOpenDeleteDialog(true)}}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <h2>My Rated Films</h2>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableCell>Title</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Genre</TableCell>
                        <TableCell>AgeRating</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Release Date</TableCell>
                    </TableHead>
                    <TableBody>
                        {ratedFilms.map((film) => (
                            <TableRow key={film.filmId}>
                                <TableCell><Link href={"/film/" + film.filmId}>{film.title}</Link></TableCell>
                                <TableCell>
                                    <Avatar src={'http://localhost:4941/api/v1/films/'+film.filmId+'/image'} />
                                </TableCell>
                                <TableCell>{Object.fromEntries(getGenres().map(x => [x.genreId, x.name]))[film.genreId]}</TableCell>
                                <TableCell>{film.ageRating}</TableCell>
                                <TableCell>{film.rating}/10</TableCell>
                                <TableCell>{new Date(film.releaseDate).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openAddDialog} onClose={handleDialogClose}>
                <DialogTitle>Add Film</DialogTitle>
                {filmTextFields()}
                <DialogActions>
                    <Button onClick={handleDialogClose}>Close</Button>
                    <Button variant="contained" color="success" onClick={addFilm}>Add Film</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditDialog} onClose={handleDialogClose}>
                <DialogTitle>Edit</DialogTitle>
                {filmTextFields()}
                <DialogActions>
                    <Button onClick={handleDialogClose}>Close</Button>
                    <Button variant="contained" color="success" onClick={edit}>Edit</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={() => {setFilmId(0); setOpenDeleteDialog(false)}}>
                <DialogTitle>Delete</DialogTitle>
                <DialogContent>
                    {errorFlag ? <Alert severity="error">{errorMessage}</Alert> : ''}
                    Are you sure you want to delete this film?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {setFilmId(0); setOpenDeleteDialog(false)}}>Close</Button>
                    <Button variant="contained" color="error" onClick={deleteFilm}>Delete</Button>
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

export default MyFilms