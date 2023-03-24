import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';
import { uid } from 'rand-token';

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

const generateToken = async (userLogin: any): Promise<{"userId": number, "token": string}> => {
    Logger.info(`Generating new login token token`);
    const conn = await getPool().getConnection();
    const [ user ] = await conn.query(`select * from user where email = '${userLogin.email}'`);
    if (user.length === 0 || !bcrypt.compareSync(userLogin.password, user[0].password)) {
        await conn.release();
        return null;
    }
    const token = uid(12)
    const query = `update user set auth_token = '${token}' where id = ${user[0].id}`;
    await conn.query( query );
    await conn.release();
    return {"userId": user[0].id, "token": token};
}

export { insert, generateToken }