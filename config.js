import dotenv from "dotenv";

dotenv.config();


const jwtSecret = process.env.APP_J_K;
const jwtExpiration = Math.floor(Date.now() / 1000) + (5 * 60);// expiration dans 5 minutes

// const jwtExp= {jwtSecret,jwtExpiration}
// export default jwtExp;
export {jwtSecret,jwtExpiration}