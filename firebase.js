import firebase from "firebase/app/dist/index.cjs.js"

import 'firebase/database/dist/index.cjs.js';
import "firebase/auth/dist/index.cjs.js";
import dotenv from "dotenv";
dotenv.config();



const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: "game-e6fea",
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);
//const app = firebase.initializeApp(firebaseConfig);
const dbJoueur = firebase.database().ref('personnage');
const dbUser= firebase.database().ref('user');
const auth = firebase.auth();
//const getUser = firebase.getAuth();

export default dbJoueur;

export {auth,firebase,dbUser}