import React from "react";
import axios from "axios";
import FilmListObject from "./FilmListObject";
import {Alert, AlertTitle, TablePagination, Paper, Typography, CircularProgress} from "@mui/material";

const FilmList = (props: {paramsString: string, excludeFilmId?: number}) => {
    const [films, setFilms] = React.useState<Array<Film>>([]);

    const [totalFilmsCount, setTotalFilmsCount] = React.useState(0);
    const [page, setPage] = React.useState(0);
    const [filmsPerPage, setFilmsPerPage] = React.useState(6);

    const [loading, setLoading] = React.useState(true);

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    React.useEffect(() => {
        const getFilms = () => {
            setLoading(true)
            const paginationString = '&startIndex='+(page*filmsPerPage)+'&count='+filmsPerPage
            axios.get('http://localhost:4941/api/v1/films?'+props.paramsString+paginationString)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setFilms(response.data.films)
                    setTotalFilmsCount(response.data.count)
                    setLoading(false)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getFilms()
    }, [setFilms, setLoading, props, page, filmsPerPage])

    const handleChangeFilmsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setPage(Math.ceil(page*filmsPerPage/parseInt(event.target.value, 10)))
        setFilmsPerPage(parseInt(event.target.value, 10));
    };

    const film_rows = () => films.map((film: Film) => film.filmId !== props.excludeFilmId ? <FilmListObject key={ film.filmId + film.title } film={film} /> : '')

    return (
        <Paper>
            <div style={{ display: "inline-block", maxWidth: "90%", minWidth: "320" }}>
                {errorFlag?
                    <Alert severity = "error">
                        <AlertTitle> Error </AlertTitle>
                    { errorMessage }
                    </Alert>: ""}

                { !loading && totalFilmsCount > 0 && film_rows() }

                {loading ? <CircularProgress /> :
                    totalFilmsCount <= 0 ? <Typography variant="overline" fontSize={30} color="red">No Films found</Typography> :
                <TablePagination
                    component="div"
                    count={totalFilmsCount}
                    labelDisplayedRows={({from, to, count}) => `page: ${page+1}/${Math.ceil(totalFilmsCount/filmsPerPage)} | ${from}–${to} of ${count}`}
                    page={page}
                    onPageChange={(event, newPage) => {setPage(newPage); window.scrollTo(0, 0);}}
                    rowsPerPageOptions={[5,6,7,8,9,10]}
                    labelRowsPerPage="Films per page:"
                    rowsPerPage={filmsPerPage}
                    onRowsPerPageChange={handleChangeFilmsPerPage}
                    showFirstButton showLastButton
                />
                }
            </div>
        </Paper>
    )
}

export default FilmList