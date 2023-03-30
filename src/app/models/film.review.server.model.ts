import {getPool} from '../../config/db';
import Logger from '../../config/logger';
import {ResultSetHeader} from 'mysql2';

const getOne = async (id: number): Promise<ResultSetHeader[]> => {
    Logger.info(`Getting reviews for film id: ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = `select film_review.user_id as reviewerId, film_review.rating, film_review.review,
        user.first_name as reviewerFirstName, user.last_name as reviewerLastName, film_review.timestamp
        from film_review left outer join user on film_review.user_id = user.id where film_id = ${id}
         order by film_review.timestamp desc`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const insert = async (filmId: number, userId: number, data: any): Promise<ResultSetHeader[]> => {
    Logger.info(`Adding new review to the database`);
    const conn = await getPool().getConnection();
    const query = `insert into film_review (film_id, user_id, rating, review)
            values (${filmId}, ${userId}, ${data.rating}, '${data.review}')`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

export { getOne, insert }