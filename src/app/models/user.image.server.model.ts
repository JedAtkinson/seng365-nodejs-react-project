import {getPool} from '../../config/db';
import Logger from '../../config/logger';
import {ResultSetHeader} from 'mysql2';

const getOne = async (id: number): Promise<{"image_filename": string}[]> => {
    Logger.info(`Getting user ${id} profile image from database`);
    const conn = await getPool().getConnection();
    const query = `select image_filename from user where id = ${id}`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const insert = async (id: number, filename: string): Promise<ResultSetHeader[]> => {
    Logger.info(`Adding image to database`);
    const conn = await getPool().getConnection();
    const query = `update user set image_filename = '${filename}' where id = ${id}`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const remove = async (id: number): Promise<ResultSetHeader> => {
    Logger.info(`Deleting user ${id}'s image from the database`);
    const conn = await getPool().getConnection();
    const query = `update user set image_filename = null where id = ${id}`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

export { getOne, insert, remove }