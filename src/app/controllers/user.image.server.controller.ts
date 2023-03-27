import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as usersImage from '../models/user.image.server.model';
import fs from 'mz/fs';
import {findUserIdByToken} from "../models/user.server.model";

const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.http(`GET single user id: ${req.params.id}`);
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(404).send("Not Found. No user with specified ID");
            return;
        }
        const id = req.params.id;
        const result = await usersImage.getOne(parseInt(id, 10));
        if (result.length !== 0) {
            const content = fs.readFile(result[0].image_filename);
            res.status(200).send(content);
        } else {
            res.statusMessage = "Not Found. No user with specified ID, or user has no image";
            res.status(404).send();
        }

        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const setImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const id = req.params.id;
        const token = req.header('X-Authorization');
        const authUserId = token != null ? await findUserIdByToken(token) : null;
        if (authUserId === null) {
            res.statusMessage = 'Unauthorized';
            res.status(401).send();
            return;
        }
        if (authUserId !== parseInt(id, 10)) {
            res.statusMessage = 'Forbidden. Can not change another user\'s profile photo';
            res.status(403).send();
            return;
        }
        const contentType = req.header('Content-Type');
        // Add file
        const result = await usersImage.insert(parseInt(id, 10), req.body);
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


const deleteImage = async (req: Request, res: Response): Promise<void> => {
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

export {getImage, setImage, deleteImage}