import express from "express";
import cors from "cors";
import {auth,dbUser} from "./firebase.js";
import dbJoueur from "./firebase.js";
import fireAd from "./firebaseAdmin.js";
import CryptoJS from 'crypto-js';
import dotenv from "dotenv";

import routerAuth from "./Routes/Authentification.js";
import routerPers from "./Routes/Personnages.js";
import routerUser from "./Routes/Utilisateur.js";

dotenv.config();

const app = express();
app.enable('trust proxy');
app.use(express.json());
app.use(cors());

app.use(cors({
    origin: ['https://cutlform.netlify.app/', 'https://calm-florentine-8d2e31.netlify.app/']
}
));

app.get("/", async (req, res) => {
  
  res.send("<p>Coucou</p>");
    
});

app.use('/auth',routerAuth);
app.use('/perso',routerPers);
app.use('/users',routerUser);


