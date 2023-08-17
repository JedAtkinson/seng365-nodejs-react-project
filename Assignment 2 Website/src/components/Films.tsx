import FilmList from "./FilmList";
import {useSearchParams} from "react-router-dom";
import React from "react";
import FilmsSearch from "./FilmsSearch";
import NavBar from "./NavBar";

const Films = () => {
    const params = useSearchParams()[0];
    return (
        <div>
            <h1>Films</h1>
            < NavBar />
            < FilmsSearch />
            < FilmList paramsString={params.toString()} />
        </div>
    )
}

export default Films;