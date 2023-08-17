type Film = {
    /**
     * Film id as defined by the database
     */
    filmId: number,
    /**
     * Title as entered when created
     */
    title: string,
    /**
     * Genre id as entered when created
     */
    genreId: number,
    /**
     * Age rating as entered when created
     */
    ageRating: string,
    /**
     * DirectorId as entered when created
     */
    directorId: number,
    /**
     * Directors first name as entered when created
     */
    directorFirstName: string,
    /**
     * Directors last name as entered when created
     */
    directorLastName: string,
    /**
     * Average rating calculated by database
     */
    rating: number,
    /**
     * Release date as entered when created
     */
    releaseDate: string
    /**
     * description as entered when created
     */
    description: string,
    /**
     * runtime as entered when created
     */
    runtime: number,
    /**
     * number of review as calculated by db
     */
    numReviews: number,
}