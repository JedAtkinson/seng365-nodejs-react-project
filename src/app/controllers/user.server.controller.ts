import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as users from '../models/user.server.model';
import * as schemas from '../resources/schemas.json';
import {validateSchema, validateEmail, validatePassword} from './validator';

const register = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST registering new user`);
    const validation = await validateSchema(
        schemas.user_register,
        req.body)
    if (validation !== true || !validateEmail(req.body.email) || !validatePassword(req.body.password)) {
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
    try{
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    try{
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const update = async (req: Request, res: Response): Promise<void> => {
    try{
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}