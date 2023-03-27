import {getPool} from '../../config/db';
import Logger from '../../config/logger';
import {ResultSetHeader} from 'mysql2';
import bcrypt from 'bcrypt';
import {uid} from 'rand-token';

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

const findUserIdByToken = async (token: string): Promise<number> => {
    const conn = await getPool().getConnection();
    const query = `select id from user where auth_token = '${token}'`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result[0].id;
}

const removeToken = async (token: string): Promise<ResultSetHeader> => {
    Logger.info(`Removing token from database`);
    const conn = await getPool().getConnection();
    const query = `update user set auth_token = null where auth_token = '${token}'`;
    const [ result ] = await conn.query( query );
    await conn.release();
    return result;
}

const getOne = async (id: number): Promise<User[]> => {
    Logger.info(`Getting user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = `select email, first_name, last_name from user where id = ${id}`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const alter = async (id: number, userData: any): Promise<ResultSetHeader[]> => {
    Logger.info(`Updating user ${id} in the database`);
    const fieldToDB: {[key: string]: string} = {"email": "email", "firstName": "first_name", "lastName": "last_name", "password": "password"};
    if (userData.hasOwnProperty("password")) // Hash password if present
        userData.password = bcrypt.hashSync(userData.password, 10);
    let query = 'update user set ';
    for (const field in userData) {
        if (field in fieldToDB)
            query += `${fieldToDB[field]} = '${userData[field]}' ` ;
    }
    query += `where id = ${id}`;
    const conn = await getPool().getConnection();
    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}

const verifyUser = async (id: number, password: string): Promise<boolean> => {
    Logger.info(`Checking password matches database`);
    const conn = await getPool().getConnection();
    const query = `select password from user where id = ${id}`;
    const [ result ] = await conn.query(query);
    await conn.release();
    return result.length !== 0 && bcrypt.compareSync(password, result[0].password);
}

export { insert, generateToken, findUserIdByToken, removeToken, getOne, alter, verifyUser }