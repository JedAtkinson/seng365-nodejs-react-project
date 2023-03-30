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
    if (filmQuery.sortBy) {
        const sortVals: {[key: string]: string} = {'ALPHABETICAL_ASC': 'film.title asc', 'ALPHABETICAL_DESC': 'film.title desc', 'RELEASED_ASC': 'film.release_date asc', 'RELEASED_DESC': 'film.release_date desc', 'RATING_ASC': 'film_review.rating asc', 'RATING_DESC': 'film_review.rating desc'};
        query += ` order by ${sortVals[filmQuery.sortBy]}, film.id asc`;
    } else {
        query += ` order by film.release_date asc`;
    }
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
    Logger.info("Inserting film into database");
    const conn = await getPool().getConnection();
    const query = `insert into film (title, description, release_date, runtime, director_id, genre_id, age_rating) values
                    ('${data.title}', '${data.description}', '${data.releaseDate}', ${data.runtime}, ${data.directorId}, ${data.genreId}, '${data.ageRating}')`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const update = async (id: number, data: any): Promise<ResultSetHeader> => {
    Logger.info(`Updating film ${id} in database`);
    const fieldToDB: {[key: string]: string} = {"title": "title", "description": "description", "releaseDate": "release_date", "genreId": "genre_id", "runtime": "runtime", "ageRating":"age_rating"};
    const numberFields = ["genreId", "runtime"];
    let query = 'update film set ';
    for (const field in data) {
        if (field in fieldToDB)
            if (field in numberFields)
                query += `${fieldToDB[field]} = ${data[field]}, ` ;
            else
                query += `${fieldToDB[field]} = '${data[field]}', ` ;
    }
    if (query[query.length-2] === ',') query = query.slice(0, query.length-2);
    query += `where id = ${id}`;
    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const remove = async (id: number): Promise<ResultSetHeader> => {
    Logger.info(`Deleting film ${id} from database`);
    const conn = await getPool().getConnection();
    const query = `delete from film where id = ${id}`;
    const result = await conn.query(query);
    await conn.release();
    return result;
}

const getAllGenres = async (): Promise<{"genreId": string, "name": string}[]> => {
    Logger.info("Getting all genres from database");
    const conn = await getPool().getConnection();
    const query = `select id as genreId, name from genre`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

export { getAll, getOne, insert, update, remove, getAllGenres }