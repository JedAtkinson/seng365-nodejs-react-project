import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';

const insert = async (userData: any): Promise<ResultSetHeader> => {
    Logger.info(`Adding new user to database`);
    const passHash = bcrypt.hashSync(userData.password, 10);
    const conn = await getPool().getConnection();
    const values = `'${userData.email}', '${userData.firstName}', '${userData.lastName}', '${passHash}'`;
    const query = `insert into user (email, first_name, last_name, password) values (${values})`;
    const [ result ] = await conn.query( query );
    await conn.release();
    return result;
}

export { insert }