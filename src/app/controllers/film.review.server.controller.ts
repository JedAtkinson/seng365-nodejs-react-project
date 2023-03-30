import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as reviews from "../models/film.review.server.model";
import * as schemas from '../resources/schemas.json';
import {validateSchema} from "./validator";
import {findUserIdByToken} from "../models/user.server.model";
import * as films from "../models/film.server.model";


const getReviews = async (req: Request, res: Response): Promise<void> => {
    try{
        const result = await reviews.getOne(parseInt(req.params.id, 10));
        res.statusMessage = "OK";
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const addReview = async (req: Request, res: Response): Promise<void> => {
    const validation = await validateSchema(schemas.film_review_post, req.body);
    if (validation !== true) {
        res.statusMessage = `Bad Request. Invalid information`;
        res.status(400).send();
        return;
    }
    try{
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
        } if ((film[0] as any).directorId === authUserId) { // Check authUser is the director of the film
            res.statusMessage = "Forbidden. Cannot review your own film";
            res.status(403).send();
            return;
        } if (Date.parse((film[0] as any).releaseDate) > Date.now()) { // Check if film hasn't been released yet
            res.statusMessage = "Forbidden. cannot post a review on a film that has not yet released";
            res.status(403).send();
            return;
        }
        await reviews.insert(parseInt(req.params.id, 10), authUserId, req.body);
        res.statusMessage = "Created";
        res.status(201).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}



export {getReviews, addReview}