import express from "express";
import cors from "cors";
import {auth,dbUser} from "./firebase.js";
import dbJoueur from "./firebase.js";
import fireAd from "./firebaseAdmin.js";
import CryptoJS from 'crypto-js';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {jwtSecret,jwtExpiration} from "./config.js";

// import routerAuth from "./Routes/Authentification.js";
// import routerPers from "./Routes/Personnages.js";
// import routerUser from "./Routes/Utilisateur.js";

dotenv.config();

const app = express();
app.enable('trust proxy');
app.use(express.json());

// const allowlist = ['https://cutlform.netlify.app/', 'https://calm-florentine-8d2e31.netlify.app/']
app.use(cors({
    origin: ['https://cutlform.netlify.app/', 'https://calm-florentine-8d2e31.netlify.app/']
}
));

app.use(cors({
    origin: ['https://cutlform.netlify.app/', 'https://calm-florentine-8d2e31.netlify.app/']
}
));

app.get("/", async (req, res) => {
  
  res.send("<p>Coucou</p>");
    
});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.use('/auth',routerAuth);
// app.use('/perso',routerPers);
// app.use('/users',routerUser);

///////////////////////////////////////////////////
function encryptData(data) {
  const key = process.env.APP_KEY;
  return CryptoJS.AES.encrypt(data, key).toString();
}
function decrypt(data) {
  const key = process.env.APP_KEY;
  const bytes = CryptoJS.AES.decrypt(data, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

///////////////////////////////////////////////////
app.put("/auth/connectServ", async (req, res) => {
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

app.put("/auth/deconnexion", async (req, res) => {
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

app.put("/auth/connexionUser",cors(), async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
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

///////////////////////////////////////////////////
app.put('/perso/pushPerso/', (req, res) => {
  //const id = req.params.id;
  try {
      const personnageData = req.body;
      const idToken = req.headers['authorization'];
      jwt.verify(idToken, jwtSecret, async (err, decodedToken) => {
          if (err) {
              // Le token est invalide ou a expiré
              console.log("Unauthorized pushPerso");
              res.status(401).json({ message: 'Unauthorized' });
          } else {
              console.log("Authorisation pour créer un personnage");
              dbJoueur.push(personnageData, (error) => {
                  if (error) {
                      res.status(500).json({ message: 'Erreur lors de l\'enregistrement du personnage' });
                  } else {
                      console.log("Personnage enregistrer avec succée");
                      res.status(200).json({ message: 'Personnage enregistrer avec succée' });
                  }
              });
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving data');
  }
});

app.put('/perso/api/data/:id', (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  dbJoueur.child(id).push(updatedData, (error) => {
      if (error) {
          res.status(500).json({ message: 'An error occurred while updating data.' });
      } else {
          res.status(200).json({ message: 'Data updated successfully.' });
      }
  })

});

app.put("/perso/search/id/", async (req, res) => {
  const persoData = [];

  try {
      const idToken = req.headers['authorization'];
      //const key = req.headers['myKey'];
      //console.log(idToken);
      jwt.verify(idToken, jwtSecret, async (err, decodedToken) => {
          if (err) {
              // Le token est invalide ou a expiré
              console.log("Unauthorized search ID");
              res.status(401).json({ message: 'Unauthorized' });
          } else {
              console.log("Authorisation pour rechercher des personnage avec un ID");
              //console.log(decodedToken);
              const uid = decodedToken.uid;
              const snapshot = await dbJoueur.once('value');
              const data = snapshot.val();

              if (data) {
                  if (Array.isArray(data)) {
                      data.forEach(item => {
                          if (item.idUser === uid) {
                              persoData.push(item);
                          }
                      });
                  } else if (typeof data === 'object') {
                      for (const key in data) {
                          if (data.hasOwnProperty(key) && data[key].idUser === uid) {
                              persoData.push(data[key]);
                          }
                      }
                  }
              }

              if (persoData.length > 0) {
                  const jsonString = JSON.stringify(persoData);
                  res.status(200).json({ message: jsonString });
              } else {
                  res.status(404).json({ message: 'Aucune donnée trouvée pour cet ID utilisateur.' });
              }
             
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving data');
  }
});

app.put("/perso/search/pseudo/", async (req, res) => {
  const pseudo = req.headers['pseudo'];
  const persoData = [];
  //console.log(pseudo)
  try {
      const idToken = req.headers['authorization'];
      jwt.verify(idToken, jwtSecret, async (err, decodedToken) => {
          if (err) {
              // Le token est invalide ou a expiré
              console.log("Unauthorized search pseudo");
              res.status(401).json({ message: 'Unauthorized' });
          } else {
              console.log("Authorisation pour rechercher un personnage avec un pseudo");
              const snapshot = await dbJoueur.once('value');
              const data = snapshot.val();

              if (data) {
                  if (Array.isArray(data)) {
                      data.forEach(item => {
                          if (item.pseudo === pseudo) {
                              persoData.push(item);
                          }
                      });
                  } else if (typeof data === 'object') {
                      for (const key in data) {
                          if (data.hasOwnProperty(key) && data[key].pseudo === pseudo) {
                              persoData.push(data[key]);
                          }
                      }
                  }
              }

              if (persoData.length > 0) {
                  const jsonString = JSON.stringify(persoData);
                  console.log("Personnage trouver avec ce Pseudo!");
                  res.status(200).json({ message: 'Personnage trouver avec ce Pseudo!' });
                  //res.json(jsonString);
              } else {
                  console.log("Personnage trouver avec ce Pseudo!");
                  res.status(404).json({ message: 'Aucune donnée trouvée pour ce Pseudo.' });
              }
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving data');
  }
});

///////////////////////////////////////////////////

app.put("/users/api/user/addUserA", async (req, res) => {
  const infoUser = req.body;
  //console.log(infoUser)
  try {
      const signInMethods = await auth.fetchSignInMethodsForEmail(infoUser.email);

      if (signInMethods.length > 0) {
          res.status(409).json({ message: 'Cet utilisateur existe déjà.' });
          console.log('Cet utilisateur existe déjà.');
          return;
      }

      const userCredential = await auth.createUserWithEmailAndPassword(infoUser.email, infoUser.password);

      await auth.currentUser.sendEmailVerification();

      res.status(200).json({ message: 'Utilisateur créé avec succès.', uid: userCredential.user.uid });
      console.log('Utilisateur créé avec succès.');
      console.log("E-mail de confirmation envoyé !");
  } catch (error) {
      res.status(500).json({ message: "Une erreur s'est produite lors de la création de l'utilisateur." });
      console.error(error);
  }
});


app.put("/users/api/user/addUserR", async (req, res) => {
  let infoUser = req.body;

  for (const info in infoUser) {
      infoUser[info] = encryptData(infoUser[info]);
  }
  infoUser.password = null;
  infoUser.passWc = null;
  dbUser.push(infoUser)
      .then(response => {

          res.status(200).json({ message: 'Données ajoutées avec succès.' });
      })
      .catch(error => {
          res.status(500).json({ message: "Une erreur s\'est produite lors de la création de l'utilisateur." });
          console.log("Une erreur s'est produite lors de la création de l'utilisateur.")
      })

});

app.listen(3081, () => {
  console.log("Server running on port 3081");
});