import {getPool} from '../../config/db';
import Logger from '../../config/logger';
import {ResultSetHeader} from 'mysql2';

const getOne = async (id: number): Promise<{"image_filename": string}[]> => {
    Logger.info(`Getting user ${id} profile image from database`);
    const conn = await getPool().getConnection();
    const query = `select image_filename from film where id = ${id}`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const insert = async (id: number, filename: string): Promise<ResultSetHeader[]> => {
    Logger.info(`Adding hero image to database`);
    const conn = await getPool().getConnection();
    const query = `update film set image_filename = '${filename}' where id = ${id}`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

export { getOne, insert }