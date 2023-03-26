import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as users from '../models/user.server.model';
import * as schemas from '../resources/schemas.json';
import {validateSchema, validateEmail, validatePassword, validateUserUpdate, validateNewUser} from './validator';
import {findUserIdByToken} from "../models/user.server.model";

const register = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST registering new user`);
    const validation = await validateNewUser(req.body)
    if (validation !== true) {
        res.statusMessage = `Bad Request. Invalid information`;
        res.status(400).send();
        return;
    }
    try{
        const result = await users.insert(req.body);
        res.status( 201 ).send({"userId": result.insertId} );
        return;
    } catch (err) {
        if (err.message === `Duplicate entry '${req.body.email}' for key 'unique_key'`) {
            res.statusMessage = "Forbidden. Email already in use";
            res.status(403).send();
        } else {
            Logger.error(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
        return;
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST logging in user`);
    const validation = await validateSchema(
        schemas.user_login,
        req.body)
    if (validation !== true) {
        res.statusMessage = `Bad Request. Invalid information`;
        res.status(400).send();
        return;
    }
    try{
        const result = await users.generateToken(req.body);
        if (result === null) {
            res.statusMessage = "Not Authorised. Incorrect email/password";
            res.status(401).send();
        } else {
            res.status(200).send(result);
        }
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const logout = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST logging out user`);
    try{
        const token = req.header('X-Authorization');
        const result = await users.removeToken(token);
        if (result.affectedRows === 0) {
            res.statusMessage = 'Unauthorized. Cannot log out if you are not authenticated';
            res.status(401).send();
        } else {
            res.status(200).send();
        }
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET single user id: ${req.params.id}`);
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Not Found. No user with specified ID");
        return;
    }
    try{
        const id = req.params.id;
        const token = req.header('X-Authorization');
        const authUserId = token != null ? await findUserIdByToken(token) : null;

        const result = await users.getOne(parseInt(id, 10));
        if (result.length === 0) {
            res.status(404).send("Not Found. No user with specified ID");
        } else {
            if (authUserId === parseInt(id, 10))
                res.status(200).send({"email": result[0].email, "firstName": result[0].first_name, "lastName": result[0].last_name});
            else
                res.status(200).send({"firstName": result[0].first_name, "lastName": result[0].last_name});
        }
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const update = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET single user id: ${req.params.id}`);
    if (isNaN(parseInt(req.params.id, 10))) {
        res.status(404).send("Not Found. No user with specified ID");
        return;
    }
    const validation = await validateUserUpdate(req.body)
    if (validation !== true) {
        res.statusMessage = `Bad Request. Invalid information`;
        res.status(400).send();
        return;
    }
    try{
        const id = req.params.id;
        const token = req.header('X-Authorization');
        const authUserId = token != null ? await findUserIdByToken(token) : null;
        if (authUserId === null) {
            res.status(401).send("Unauthorized or Invalid currentPassword");
            return;
        } if (authUserId !== parseInt(id, 10)) {
            res.status(403).send("Forbidden. This is not your account");
            return;
        }
        const result = await users.alter(parseInt(id, 10), req.body)
        if (result.length !== 0) {
            res.status(200).send("OK");
        } else {
            res.status(404).send("Not Found");
        }
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}