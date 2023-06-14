import express from "express";
import jwt from "jsonwebtoken";
import {jwtSecret,jwtExpiration} from "../config.js";
import {auth,dbUser} from "../firebase.js";
import authe from "../firebaseAdmin.js";
import {fireAd,admin} from "../firebaseAdmin.js";

const routerAuth = express.Router();


const publicKey = process.env.APP_PUBLIC_OPEN;

function encryptData(data) {
  const key = process.env.APP_KEY;
  return CryptoJS.AES.encrypt(data, key).toString();
}
function decrypt(data) {
  const key = process.env.APP_KEY;
  const bytes = CryptoJS.AES.decrypt(data, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}


routerAuth.put("/connectServ", async (req, res) => {
  //const infoConnexion = req.body;
  const authorizationHeader = req.headers['authorization'];
  const decryptToReceive = decrypt(authorizationHeader);
  
  //console.log(decryptToReceive);
  
  if (auth.currentUser) {
    try {
      
      const userSend = auth.currentUser;
      //console.log(userSend.uid);
      if (userSend.uid === decryptToReceive) {
        const token = jwt.sign({ uid: userSend.uid }, jwtSecret, { expiresIn: '5s' });

        res.status(200).json({ message: token });
        //console.log("Token envoyer")
      }
      
      // Générer un token d'authentification avec une durée de validité de 5 secondes
      
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la récupération de l\'UID de l\'utilisateur :', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'UID de l\'utilisateur' });
    }
  } else {
    console.log('Aucun utilisateur connecté');
    res.status(401).json({ message: 'Aucun utilisateur connecté' });
  }
});

routerAuth.put("/deconnexion", async (req, res) => {
    auth.signOut()
        .then((response) => {
            // Déconnexion réussie
            res.status(200).json({ message: 'Déconnexion avec succées' });
            console.log('Utilisateur déconnecté');
        })
        .catch((error) => {
            // Gestion des erreurs de déconnexion
            res.status(500).json({ message: "Une erreur s\'est produite lors de la déconnexion." });
            console.error('Erreur lors de la déconnexion', error);
        });

});

routerAuth.put("/connexionUser", async (req, res) => {
  const infoConnexion = req.body;
  const clientIPReceivedIP = req.connection.remoteAddress;

  //Commence après le dernier (:)
  const startIndex = clientIPReceivedIP.lastIndexOf(":") + 1;
  //extraire startIndex de tout la chaine de charactère
  const ipAddressWithoutPrefix = clientIPReceivedIP.substring(startIndex);
  const clientIP = ipAddressWithoutPrefix;
  

  auth.signInWithEmailAndPassword(infoConnexion.email, infoConnexion.password)
    .then((userCredential) => {
      // Connexion réussie, récupérer l'utilisateur connecté
      const user = userCredential.user;
      console.log('Utilisateur connecté ' );
      const userSend = auth.currentUser;
      const clientInfo = {uip:userSend.uid,ip:clientIP}

      res.status(200).json({ message: encryptData(userSend.uid)  });
      //console.log(userCredential)
    })
    .catch((error) => {
      // Erreur lors de la connexion, gérer l'erreur
      console.error('Erreur de connexion :', error);
    });

});

export default routerAuth;