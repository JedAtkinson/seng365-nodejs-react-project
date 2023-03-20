import Ajv from 'ajv';
const ajv = new Ajv({removeAdditional: 'all', strict: false});

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

const validateEmail = async (email: string) => {
    const regex = new RegExp('[a-z0-9]+@[a-z0-9]\.[a-z0-9]')
    return regex.test(email);
}

const validatePassword = async (password: string) => {
    return password.length >= 6;
}

export {validateSchema, validateEmail, validatePassword}