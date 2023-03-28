import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as usersImage from '../models/user.image.server.model';
import fs from 'mz/fs';
import {findUserIdByToken} from "../models/user.server.model";

const VALID_IMAGE_TYPES = ['jpeg', 'jpg', 'png', 'gif'];

const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.http(`GET single user id: ${req.params.id}`);
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(404).send("Not Found. No user with specified ID");
            return;
        }
        const id = req.params.id;
        const result = await usersImage.getOne(parseInt(id, 10));
        if (result.length !== 0 && result[0].image_filename !== null) {
            const contentType = result[0].image_filename.split('.')[1];
            if (!VALID_IMAGE_TYPES.includes(contentType)) throw new Error("Invalid filename");
            const content = await fs.readFileSync('storage/images/' + result[0].image_filename);
            Logger.info(content);
            res.setHeader("Content-Type", "image/"+contentType);
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

        if (authUserId === null) { // Check if user is logged in with valid token
            res.statusMessage = 'Unauthorized';
            res.status(401).send();
            return;
        }
        if (authUserId !== parseInt(id, 10)) { // Check user is trying to change own image
            res.statusMessage = 'Forbidden. Can not change another user\'s profile photo';
            res.status(403).send();
            return;
        }

        const contentType = req.header('Content-Type').split("/")[1];
        if (!VALID_IMAGE_TYPES.includes(contentType)) {
            res.statusMessage = "Bad Request. Invalid image supplied (possibly incorrect file type)";
            res.status(400).send();
            return;
        }
        const filename = `user_${id}.${contentType}`;
        const fileExists = (fs.existsSync(`storage/images/${filename}`));
        Logger.info(req.body);
        await fs.writeFile(`storage/images/${filename}`, req.body, 'binary');
        await usersImage.insert(parseInt(id, 10), filename);
        if (fileExists) {
            res.statusMessage = "OK. Image updated";
            res.status(200).send();
        } else {
            res.statusMessage = "Created. New image created";
            res.status(201).send();
        }
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
        const id = req.params.id;
        const token = req.header('X-Authorization');
        const authUserId = token != null ? await findUserIdByToken(token) : null;
        if (authUserId === null) { // Check if user is logged in with valid token
            res.statusMessage = 'Unauthorized';
            res.status(401).send();
            return;
        }
        if (authUserId !== parseInt(id, 10)) { // Check user is trying to change own image
            res.statusMessage = 'Forbidden. Can not change another user\'s profile photo';
            res.status(403).send();
            return;
        }
        const fileName = await usersImage.getOne(parseInt(id, 10));
        if (fileName.length === 0 || fileName[0].image_filename === null) {
            res.statusMessage = "Not Found. No such user with ID given";
            res.status(404);
            return;
        }
        await usersImage.remove(parseInt(id, 10));
        await fs.unlink(`storage/images/${fileName[0].image_filename}`);
        res.statusMessage = "OK";
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage, deleteImage}