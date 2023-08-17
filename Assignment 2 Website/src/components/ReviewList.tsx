import React from "react";
import axios from "axios";
import FilmReviewObject from "./FilmReviewObject";
import {
    Alert,
    AlertTitle,
    Typography,
    CircularProgress,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    TextField,
    Rating,
    Snackbar
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {getUser} from "../store";

const FilmList = (props: {filmId: number, directorId: number}) => {
    const [reviews, setReviews] = React.useState<Array<Review>>([]);
    const [loading, setLoading] = React.useState(true);

    const [openReviewDialog, setOpenReviewDialog] = React.useState(false);
    const [rating, setRating] = React.useState<number|null>(null)
    const [review, setReview] = React.useState('')

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState({severity: '', message: ''})
    React.useEffect(() => {
        const getReviews = () => {
            setLoading(true)
            axios.get('http://localhost:4941/api/v1/films/'+props.filmId+"/reviews")
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setReviews(response.data)
                    setLoading(false)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getReviews()
    }, [setReviews, setLoading, props.filmId])

    const handleReviewDialogClose = () => {
        setRating(null)
        setReview('')
        setOpenReviewDialog(false)
        setErrorFlag(false)
        setErrorMessage('')
    }

    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };

    const addReview = () => {
        console.log(getUser()?.token)
        axios.post('http://localhost:4941/api/v1/films/'+props.filmId+'/reviews',
            {"rating": rating ? rating*2 : null,
                "review": review},
            {headers:{'X-Authorization': getUser()?.token}})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage('')
                setSnackMessage({severity: 'success', message: 'Review successfully Added'})
                setSnackOpen(true)
                setOpenReviewDialog(false)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const review_rows = () => reviews.map((review: Review) => <FilmReviewObject review={review} />)

    return (
        <Accordion elevation={5} sx={{my: 4}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant={"h4"}>Reviews</Typography>
                </AccordionSummary>
            <AccordionDetails>
                {getUser() ?
                    getUser()?.userId !== props.directorId ?
                        !reviews.map((r) => r.reviewerId).includes(getUser()?.userId || 0) ?
                            <Button onClick={() => setOpenReviewDialog(true)}>Add Review</Button>
                            : 'You have already added a review'
                        : 'You can not review your own film'
                    : 'Login to add review'
                }

                {errorFlag?
                    <Alert severity = "error">
                        <AlertTitle> Error </AlertTitle>
                        { errorMessage }
                    </Alert>: ""}

                {loading ? <CircularProgress /> :
                review_rows()}
            </AccordionDetails>

            <Dialog open={openReviewDialog} onClose={handleReviewDialogClose}>
                <DialogTitle>Add Review</DialogTitle>
                <DialogContent>
                    {errorFlag ? <Alert severity="error">{errorMessage}</Alert> : ''}
                    <TextField fullWidth sx={{my: 1}} value={review} label='Review' multiline minRows={4} maxRows={6}
                               onChange={(event) => setReview(event.target.value)} />
                    <Rating precision={0.5} max={5} value={rating} onChange={(event, value) => setRating(value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReviewDialogClose}>Close</Button>
                    <Button variant="contained" color="success" onClick={addReview}>Add Review</Button>
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

        </Accordion>
    )
}

export default FilmList