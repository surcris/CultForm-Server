import dotenv from "dotenv";

dotenv.config();

const payload = {
    // autres données du payload
    exp: Math.floor(Date.now() / 1000) + (5 * 60) // expiration dans 5 minutes
};
const jwtSecret = process.env.APP_J_K;
const jwtExpiration = Math.floor(Date.now() / 1000) + (5 * 60);

const jwtExp= {jwtSecret,jwtExpiration}
export default jwtExp;
export {jwtSecret,jwtExpiration}