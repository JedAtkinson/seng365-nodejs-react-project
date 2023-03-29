import {getPool} from '../../config/db';
import Logger from '../../config/logger';
import {ResultSetHeader} from 'mysql2';

const getAll = async (filmQuery: FilmsQuery): Promise<Film[]> => {
    Logger.info(`Getting all films from the database`);
    let query = `select film.id as filmId, film.title as title, film.genre_id as genreId, film.director_id as directorId,
    user.first_name as directorFirstName, user.last_name as directorLastName, film.release_date as releaseDate,
    film.age_rating as ageRating, case when film_review.rating is null then 0 else film_review.rating end as rating
    from film left outer join user on film.director_id = user.id left outer join (select film_id, user_id, round(avg(CONVERT(rating, float)), 2) as rating from film_review group by film_id) as film_review on film_review.film_id = film.id where true`;
    if (filmQuery.q) query += ` and (film.description like '%${filmQuery.q}%' or film.title like '%${filmQuery.q}%')`;
    if (filmQuery.genreIds) query += ` and film.genre_id in (${filmQuery.genreIds})`;
    if (filmQuery.ageRatings) query += ` and film.age_rating in ('${filmQuery.ageRatings.join(',').split(',').join("', '")}')`
    if (filmQuery.directorId) query += ` and film.director_id = ${filmQuery.directorId}`;
    if (filmQuery.reviewerId) query += ` and film_review.user_id = ${filmQuery.reviewerId}`;
    query += ` order by`;
    if (filmQuery.sortBy) {
        const sortVals: {[key: string]: string} = {'ALPHABETICAL_ASC': 'film.title asc', 'ALPHABETICAL_DESC': 'film.title desc', 'RELEASED_ASC': 'film.release_date asc', 'RELEASED_DESC': 'film.release_date desc', 'RATING_ASC': 'film_review.rating asc', 'RATING_DESC': 'film_review.rating desc'};
        query += ` ${sortVals[filmQuery.sortBy]},`;
    }
    query += ` film.release_date asc`;
    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const getOne = async (id: number): Promise<ResultSetHeader[]> => {
    Logger.info(`Getting file ${id} from database`);
    const query = `select film.id as filmId, film.title as title, film.description, film.genre_id as genreId,
    film.director_id as directorId, user.first_name as directorFirstName, user.last_name as directorLastName, film.release_date as releaseDate,
    film.age_rating as ageRating, film.runtime, case when film_review.rating is null then 0 else film_review.rating end as rating, case when film_review.numRatings is null then 0 else film_review.numRatings end as numReviews
    from film left outer join user on film.director_id = user.id left outer join
     (select film_id, user_id, count(*) as numRatings, round(avg(CONVERT(rating, float)), 2) as rating from film_review group by film_id) as film_review on film_review.film_id = film.id
     where film.id = ${id}`;

    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const insert = async (data: any): Promise<ResultSetHeader> => {
    Logger.info("Getting all genres from database");
    const conn = await getPool().getConnection();
    const query = `insert into film (title, description, release_date, runtime, director_id, genre_id, age_rating) values
                    ('${data.title}', '${data.description}', '${data.releaseDate}', ${data.runtime}, ${data.directorId}, ${data.genreId}, '${data.ageRating}')`;
    Logger.info(query);
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const getAllGenres = async (): Promise<{"id": string, "name": string}[]> => {
    Logger.info("Getting all genres from database");
    const conn = await getPool().getConnection();
    const query = `select id, name from genre`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

export { getAll, getOne, insert, getAllGenres }