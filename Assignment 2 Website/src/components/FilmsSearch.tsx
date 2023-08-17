import {
    IconButton, Box, TextField, InputAdornment,
    Autocomplete, Grid, Select,
    MenuItem, InputLabel, FormControl, Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import React from "react";
import {useNavigate} from "react-router-dom";
import {getAgeRatings, getGenres} from "../store";

const FilmsSearch = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = React.useState("")
    const [showSearchOps, setShowSearchOps] = React.useState(false);
    const [selectedGenres, setSelectedGenres] = React.useState<Array<{id: number, label: string}>>([]);
    const [selectedAgeRatings, setSelectedAgeRatings] = React.useState<Array<String>>([]);
    const [selectedOrdering, setSelectedOrdering] = React.useState("RELEASED_ASC");

    const search = () => {
        let searchString = '?sortBy='+selectedOrdering
        if (searchTerm) searchString += '&q='+searchTerm
        if (selectedGenres.length) searchString += selectedGenres.map((g) => '&genreIds='+g.id).join('')
        if (selectedAgeRatings.length) searchString += selectedAgeRatings.map((ar) => '&ageRatings='+ar).join('')

        navigate({
            pathname: '/films',
            search: searchString,
        });
    }

    return (
        <Box sx={{my: 5}}>
            <TextField id='filmSearch' label="Search Films" fullWidth value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       InputProps={{
                           endAdornment: (
                               <InputAdornment position="start">
                                   <IconButton onClick={() => setShowSearchOps(!showSearchOps)}>
                                       {showSearchOps ? <MenuOpenIcon /> : <MenuIcon />}
                                   </IconButton>
                                   <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                   <IconButton type="submit" aria-label="search" onClick={search}>
                                       <SearchIcon />
                                   </IconButton>
                               </InputAdornment>
                           ),
                       }}>
            </TextField>

            {showSearchOps &&
            <Grid container spacing={2} my={1} mb={3}>
                <Grid item xs={4}>
                    <Autocomplete multiple limitTags={3} size="small" options={getGenres().map((g) => ({id: g.genreId, label: g.name}))} value={selectedGenres}
                                  onChange={(event, genres) => {setSelectedGenres(genres)}}
                                  renderInput={(params) =>
                                      <TextField {...params} label="Genres" />} />
                </Grid>
                <Grid item xs={3}>
                    <Autocomplete multiple limitTags={3} size="small" options={getAgeRatings()} value={selectedAgeRatings}
                                  onChange={(event, ar) => {setSelectedAgeRatings(ar)}}
                                  renderInput={(params) =>
                                      <TextField {...params} label="Age Ratings" />} />
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel>Order By</InputLabel>
                        <Select sx={{textAlign:"left"}} label="Order by" fullWidth size="small" value={selectedOrdering}
                                onChange={(event) => setSelectedOrdering(event.target.value)}>
                            <MenuItem value={"ALPHABETICAL_ASC"}>Title asc</MenuItem>
                            <MenuItem value={"ALPHABETICAL_DESC"}>Title dsc</MenuItem>
                            <MenuItem value={"RELEASED_ASC"}>Release asc</MenuItem>
                            <MenuItem value={"RELEASED_DESC"}>Release dsc</MenuItem>
                            <MenuItem value={"RATING_ASC"}>Rating asc</MenuItem>
                            <MenuItem value={"RATING_DESC"}>Rating dsc</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            }
        </Box>
    )
}

export default FilmsSearch;