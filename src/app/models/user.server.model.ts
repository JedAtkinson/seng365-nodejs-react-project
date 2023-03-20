import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const insert = async (userData: any): Promise<ResultSetHeader> => {
    Logger.info(`Adding new user to database`);
    const conn = await getPool().getConnection();
    const query = 'insert into lab2_users (email, firstName, lastName, password) values ( ? )';
    const [ result ] = await conn.query( query, [userData.email, userData.firstName, userData.lastName, userData.email.password] );
    await conn.release();
    return result;
}

export { insert }