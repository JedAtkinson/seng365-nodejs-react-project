import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as filmImages from "../models/film.image.server.model";
import fs from "mz/fs";
import {findUserIdByToken} from "../models/user.server.model";
import * as films from "../models/film.server.model";

const VALID_IMAGE_TYPES = ['jpeg', 'jpg', 'png', 'gif'];

const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        Logger.http(`GET user id: ${req.params.id} image`);
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(404).send("Not found. No film found with id");
            return;
        }
        const id = req.params.id;
        const result = await filmImages.getOne(parseInt(id, 10));
        if (result.length !== 0 && result[0].image_filename !== null) {
            const contentType = result[0].image_filename.split('.')[1];
            if (!VALID_IMAGE_TYPES.includes(contentType)) throw new Error("Invalid filename");
            const content = await fs.readFileSync('storage/images/' + result[0].image_filename);
            res.setHeader("Content-Type", "image/"+contentType);
            res.status(200).send(content);
        } else {
            res.statusMessage = "Not found. No film found with id, or film has no image";
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
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(404).send("Not Found. No film found with id");
            return;
        }
        const id = req.params.id;
        const token = req.header('X-Authorization');
        const authUserId = token != null ? await findUserIdByToken(token) : null;

        if (authUserId === null) { // Check if user is logged in with valid token
            res.statusMessage = 'Unauthorized';
            res.status(401).send();
            return;
        }
        const film = await films.getOne(parseInt(req.params.id, 10));
        if (film.length === 0) { // Check film with id exists
            res.statusMessage = "Not Found. No film found with id";
            res.status(404).send();
            return;
        } if ((film[0] as any).directorId !== authUserId) { // Check authUser is the director of the film
            res.statusMessage = "Forbidden. Only the director of a film can change the hero image";
            res.status(403).send();
            return;
        }
        const contentType = req.header('Content-Type') ? req.header('Content-Type').split("/")[1] : null;
        if (!VALID_IMAGE_TYPES.includes(contentType)) {
            res.statusMessage = "Bad Request. Invalid file type";
            res.status(400).send();
            return;
        }
        const filename = `film_${id}.${contentType}`;
        await fs.writeFile(`storage/images/${filename}`, req.body, 'binary');
        await filmImages.insert(parseInt(id, 10), filename);
        if ((film[0] as any).image_filename !== null) {
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

export {getImage, setImage};