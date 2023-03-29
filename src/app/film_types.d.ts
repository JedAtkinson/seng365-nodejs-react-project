type Film = {
    filmId: number,
    title: string,
    genreId: number,
    ageRating: string,
    directorId: number,
    directorFirstName: string,
    directorLastName: string,
    rating: number,
    releaseDate: string
}

type FilmsQuery = {
    start: number,
    count: number,
    q: string,
    genreIds: number[],
    ageRatings: string[],
    directorId: number,
    reviewerId: number,
    sortBy: string
}