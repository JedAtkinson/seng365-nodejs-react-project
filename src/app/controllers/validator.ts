import Ajv from 'ajv';
const ajv = new Ajv({removeAdditional: 'all', strict: false});
import * as schemas from '../resources/schemas.json';

const validateSchema = async (schema: object, data: any) => {
    try {
        const validator = ajv.compile(schema);
        const valid = await validator(data);
        if(!valid)
            return ajv.errorsText(validator.errors);
        return true;
    } catch (err) {
        return err.message;
    }
}

const validateEmail = (email: string) => {
    const regex = new RegExp('[a-z0-9]+@[a-z0-9]\.[a-z0-9]')
    return regex.test(email);
}

const validatePassword = (password: string) => {
    return password.length >= 6;
}

const validateNewUser = async (data: any) => {
    const validSchema = await validateSchema(schemas.user_register, data);
    if (validSchema !== true) {
        return validSchema;
    }
    const validEmail = data.hasOwnProperty("email") ? validateEmail(data.email) : true;
    const validPassword = data.hasOwnProperty("password") ? validatePassword(data.password) : true;
    return validEmail && validPassword;
}

const validateUserUpdate = async (data: any) => {
    const validSchema = await validateSchema(schemas.user_edit, data);
    if (validSchema !== true) {
        return validSchema;
    }
    const validEmail = data.hasOwnProperty("email") ? validateEmail(data.email) : true;
    const validPassword = data.hasOwnProperty("password") ? validatePassword(data.password) : true;
    return validEmail && validPassword;
}

export {validateSchema, validateEmail, validatePassword, validateNewUser, validateUserUpdate}