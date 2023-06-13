
import admin from "firebase-admin"
//import serviceAccount from "./serviceAccountKey.json"
import {getAuth} from "firebase-admin/auth"
import dotenv from "dotenv";

dotenv.config();
//let serviceAccount = import('./serviceAccountKey.json');


const app = admin.initializeApp({
  credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PK.replace(/\n/gm, "\n"),
  }),
  databaseURL: process.env.DATABASE_URL
  
});

const fireAd = admin.database();

const authen = getAuth(app);
//console.log(auth)

export default authen;

export {fireAd,admin}