import express from "express";
import jwt from "jsonwebtoken";
import {jwtSecret,jwtExpiration} from "../config.js";
import {auth,dbUser} from "../firebase.js";
import authe from "../firebaseAdmin.js";
import {fireAd,admin} from "../firebaseAdmin.js";
import CryptoJS from 'crypto-js';
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
  
  // Verifie si les données reçu conresponde a un User
  if (auth.currentUser) {
    try {
      
      const userSend = auth.currentUser;
      //console.log(userSend.uid);
      if (userSend.uid === decryptToReceive) {
        // Générer un token d'authentification avec l'uid du User d'une durée de validité de 5 secondes
        const token = jwt.sign({ uid: userSend.uid }, jwtSecret, { expiresIn: '5s' });

        res.status(200).json({ message: token });
        //console.log("Token envoyer")
      }
      
      
      
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

  // const clientIPReceivedIP = req.connection.remoteAddress;

  //Commence après le dernier (:)
  // const startIndex = clientIPReceivedIP.lastIndexOf(":") + 1;
  //extraire startIndex de tout la chaine de charactère
  // const ipAddressWithoutPrefix = clientIPReceivedIP.substring(startIndex);
  // const clientIP = ipAddressWithoutPrefix;
  try {
    const infoConnexion = req.body;
    const em = decrypt(infoConnexion.email)
    const ps = decrypt(infoConnexion.password)

    const aut = await auth.signInWithEmailAndPassword(em, ps)
    const userSend = auth.currentUser;
    console.log('Utilisateur connecté');
    res.status(200).json({ message: encryptData(userSend.uid) });
  } catch (error) {
    console.error('Erreur de connexion :', error);
    if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      // L'adresse e-mail ou le mot de passe est invalide
      res.status(400).send({ message: "Erreur d'identifiant." });
      console.log("Erreur d'identifiant.");
    } else {
      // Autres erreurs
      console.log('Erreur inattendue:', error.message);
      res.status(500).send({ message: 'Erreur inattendue.' });
    }
  }


});

routerAuth.put("/inscripUser", async (req, res) => {
  try {
    const infoUser = req.body;
    const pseudo = decrypt(infoUser.pseudo)
    const email = decrypt(infoUser.email)
    const password = decrypt(infoUser.password)

    // Vérifiez si l'utilisateur existe déjà
    try {
      const userRecord = await authe.getUserByEmail(email);
      // console.log(`Utilisateur existant: ${userRecord.uid}`);
      console.log(`Utilisateur existant`);
      res.status(400).send({ message: 'Utilisateur existant' });
    } catch (error) {
      console.log('Aucun compte à cette adresse email, création en cours...');

      // Créez un nouvel utilisateur
      const userRecord = await authe.createUser({
        email: email,
        password: password,
        displayName: pseudo
      });
      console.error('Utilisateur créer avec succée:');
      // res.status(201).send({ message: 'Utilisateur créer avec succée' });

      // Connectez l'utilisateur créé
      try {
        // Connecter l'utilisateur après création
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('Utilisateur connecté');
        const userSend = auth.currentUser;

        return res.status(200).json({ message: encryptData(userSend.uid) });
      } catch (signInError) {
        console.error('Erreur lors de la connexion :', signInError);
        return res.status(500).send({ message: 'Erreur lors de la connexion', error: signInError.message });
      }
    }

    // res.status(201).send({ message: 'User created successfully', user: userRecord });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    res.status(500).send({ message: 'Erreur lors de la création', error: error.message });
  }
});


routerAuth.put('/resetmdp',async (req, res) => {

  //confirmPasswordReset(code :  string ,  newPassword :  string)

  try {
    const infoUser = req.body;
    const email = decrypt(infoUser.email)
    console.log(infoUser)
    const rez = await auth.sendPasswordResetEmail(infoUser.email)

    return res.status(200).json({ message: "Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail." });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error('Aucun compte à cette adresse email :', error);
      return res.status(400).send({ message: 'Aucun compte à cette adresse email', error: error.message });
    } else {
      console.error('Erreur inattendue :', error);
      return res.status(500).send({ message: 'Erreur inattendue', error: error.message });
    }
  }
})

export default routerAuth;