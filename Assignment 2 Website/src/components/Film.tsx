import React from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Alert,
    AlertTitle,
    Avatar,
    Box, Card, CardHeader, CircularProgress, Divider, Rating,
    Typography
} from "@mui/material";
import ReviewList from "./ReviewList";
import FilmList from "./FilmList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {getGenres} from "../store";

const Film = () => {
    const {id} = useParams();
    const [film, setFilm] = React.useState<Film>()

    const [loading, setLoading] = React.useState(true);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    React.useEffect(() => {
        const getFilm = () => {
            setLoading(true)
            axios.get('http://localhost:4941/api/v1/films/'+id)
                .then((response) => {
                    setLoading(false)
                    setErrorFlag(false)
                    setErrorMessage("")
                    setFilm(response.data)
                }, (error) => {
                    setLoading(false)
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getFilm()
    }, [setFilm, id])
    return (
        <div>
            {film == null && !loading ? <Typography variant="overline" fontSize={30} color="red">Film not found</Typography> :
            film != null && !loading ?
                <div>
                <Card sx={{p:5}}>
                    <Typography variant={'h2'} sx={{mb: 3}}>{film.title}</Typography>
                    <Box
                    component="img"
                    sx={{width: '50%', float: "left"}}
                    alt={film.title+' Hero Image'}
                    src={'http://localhost:4941/api/v1/films/'+film.filmId+'/image'}
                    />
                    <Box sx={{width:'50%', float: "right"}}>
                        <Typography variant={'h5'}>Description</Typography>
                        <Typography variant={'subtitle1'}>{film.description}</Typography>
                        <Divider sx={{my:1}} />
                        <Typography variant={'h5'}>Director</Typography>
                        <Card sx={{display: 'inline-block'}}>
                            <CardHeader
                                avatar={<Avatar src={'http://localhost:4941/api/v1/users/'+film.directorId+'/image'} />}
                                title={film.directorFirstName+" "+film.directorLastName}
                            />
                        </Card>
                        <Divider sx={{my:1}} />
                        <Typography variant={'h5'}>Genre</Typography>
                        <Typography variant={'subtitle1'}>{Object.fromEntries(getGenres().map(x => [x.genreId, x.name]))[film.genreId]}</Typography>

                        <Divider sx={{my:1}} />
                        <Typography variant={'h5'}>Age Rating</Typography>
                        <Typography variant={'subtitle1'}>{film.ageRating}</Typography>

                        <Divider sx={{my:1}} />
                        <Typography variant={'h5'}>Release Date</Typography>
                        <Typography variant={'subtitle1'}>{new Date(film.releaseDate).toLocaleString()}</Typography>

                        <Divider sx={{my:1}} />
                        <Typography variant={'h5'}>Rating</Typography>
                        <Rating precision={0.5} value={film.rating/2} readOnly max={5} />

                        <Divider sx={{my:1}} />
                        <Typography variant={'h5'}>Number of Reviews</Typography>
                        <Typography variant={'subtitle1'}>{film.numReviews}</Typography>

                        <Divider sx={{my:1}} />
                        <Typography variant={'h5'}>Run Time</Typography>
                        <Typography variant={'subtitle1'}>{film.runtime} minutes</Typography>
                    </Box>
                </Card>
                    <ReviewList filmId={film.filmId} directorId={film.directorId}/>
                    <Accordion elevation={5}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant={"h4"}>Similar Films</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant={"h5"}>Same Genre</Typography>
                            <FilmList paramsString={'genreIds='+film.genreId} excludeFilmId={film.filmId}/>
                            <Typography variant={"h5"} sx={{mt: 2}}>Same Director</Typography>
                            <FilmList paramsString={'directorId='+film.directorId} excludeFilmId={film.filmId}/>
                        </AccordionDetails>
                    </Accordion>
            </div>
            : <CircularProgress />}
            {errorFlag?
                <Alert severity = "error">
                    <AlertTitle> Error </AlertTitle>
                    { errorMessage }
                </Alert>: ""}
        </div>
    )
}

export default Film;