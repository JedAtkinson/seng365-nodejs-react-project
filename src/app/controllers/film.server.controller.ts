import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as films from "../models/film.server.model";
import * as schemas from '../resources/schemas.json';
import {validateSchema} from './validator';
import {release} from "os";
import {findUserIdByToken} from "../models/user.server.model";


const viewAll = async (req: Request, res: Response): Promise<void> => {
    let validation = await validateSchema(schemas.film_search, req.query);
    if (req.query.genreIds && validation === true) {
        const genreIds = Array.isArray(req.query.genreIds) ? req.query.genreIds : [req.query.genreIds];
        const validGenreIds: string[] = (await films.getAllGenres()).map(a => a.id.toString());
        validation = genreIds.every(val => validGenreIds.includes(val as string)) ? validation : false;
    }
    if (validation !== true) {
        res.statusMessage = "Bad Request";
        res.status(400).send();
        return;
    }
    try{
        const result = await films.getAll(req.query as unknown as FilmsQuery);
        const startIndex = (req.query.startIndex) ? Number(req.query.startIndex) : 0;
        const count = (req.query.count) ? Number(req.query.count) : result.length - startIndex;
        res.statusMessage = "OK";
        res.status(200).send({"films": result.slice(startIndex, startIndex + count), "count": result.length});
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getOne = async (req: Request, res: Response): Promise<void> => {
    try{
        const result = await films.getOne(parseInt(req.params.id, 10));
        if (result.length !== 0) {
            res.statusMessage = "OK";
            res.status(200).send(result[0]);
        } else {
            res.statusMessage = "Not Found. No film with id";
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

const addOne = async (req: Request, res: Response): Promise<void> => {
    const validation = await validateSchema(schemas.film_post, req.body);
    const validGenreIds = (await films.getAllGenres()).map(a => a.id);
    if (validation !== true || !validGenreIds.includes(req.body.genreId)) {
        res.statusMessage = "Bad Request";
        res.status(400).send();
        return;
    }
    try{
        const token = req.header('X-Authorization');
        const authUserId = token != null ? await findUserIdByToken(token) : null;
        if (authUserId === null) {
            res.statusMessage = "Unauthorized";
            res.status(401).send();
            return;
        }
        req.body.directorId = authUserId;
        if (req.body.releaseDate && Date.parse(req.body.releaseDate) < Date.now()) {
            res.statusMessage = "Forbidden. Cannot release a film in the past";
            res.status(403).send();
            return;
        }
        if (!req.body.ageRating) req.body.ageRating = 'TBC';
        if (!req.body.runtime) req.body.runtime = null;

        const result = await films.insert(req.body);
        res.statusMessage = "Created";
        res.status(201).send({ "filmId": result.insertId });
        return;
    } catch (err) {
        if (err.message === `Duplicate entry '${req.body.title}' for key 'title'`) {
            res.statusMessage = "Forbidden. Film title is not unique";
            res.status(403).send();
        } else {
            Logger.error(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
        return;
    }
}

const editOne = async (req: Request, res: Response): Promise<void> => {
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

const deleteOne = async (req: Request, res: Response): Promise<void> => {
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

const getGenres = async (req: Request, res: Response): Promise<void> => {
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

export {viewAll, getOne, addOne, editOne, deleteOne, getGenres};