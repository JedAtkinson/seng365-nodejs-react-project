import React from "react";
import {
    Avatar,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    List, ListItem, ListItemAvatar, ListItemText,
    Rating,
    Typography
} from "@mui/material";
import {getGenres} from "../store";
interface IFilmProps {
    film: Film
}

const FilmListObject = (props: IFilmProps) => {
    const [film] = React.useState < Film > (props.film)

    return (
        <Card sx={{ display: "inline-block", my: 3, mx: 2, width: 540}} raised>
            <CardActionArea sx={{ display: "flex" }} href={"/film/" + film.filmId}>
                <CardMedia
                    component="img"
                    sx={{ width: 250, height: 'auto' }}
                    image={'http://localhost:4941/api/v1/films/'+film.filmId+'/image'}
                    alt={film.title + "action image"}
                />
                <CardContent>
                    <Typography component="div" variant="h5">
                        {film.title}
                    </Typography>

                    <List dense sx={{m:-1}}>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar src={'http://localhost:4941/api/v1/users/'+film.directorId+'/image'} />
                            </ListItemAvatar>
                            <ListItemText primary="Director" secondary={film.directorFirstName+" "+film.directorLastName} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={"Age Rating: "+film.ageRating} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={"Release Date: "+new Date(film.releaseDate).toDateString()} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary={"Genre: "+Object.fromEntries(getGenres().map(x => [x.genreId, x.name]))[film.genreId]} />
                        </ListItem>
                        <ListItem>
                        <Rating precision={0.5} value={film.rating/2} readOnly max={5} />
                        </ListItem>
                    </List>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}
export default FilmListObject;