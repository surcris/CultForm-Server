import express from "express";
import cors from "cors";
import {auth,admin,dbUser} from "./firebase.js";
import dbJoueur from "./firebase.js";
import CryptoJS from 'crypto-js';
import dotenv from "dotenv";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


function encryptData(data) {
  const key = process.env.APP_KEY;
  return CryptoJS.AES.encrypt(data, key).toString();
}
function decrypt(data) {
  const key = process.env.APP_KEY;
  const bytes = CryptoJS.AES.decrypt(data, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

app.get("/", async (req, res) => {
  
  res.send("<p>Coucou</p>");
    
});


app.put("/api/user/connexionUser", async (req, res) => {
  const infoConnexion = req.body;
  //console.log(infoConnexion);

  auth.signInWithEmailAndPassword(infoConnexion.email, infoConnexion.password)
    .then((userCredential) => {
      // Connexion réussie, récupérer l'utilisateur connecté
      const user = userCredential.user;
      console.log('Utilisateur connecté ' );
      const userSend = auth.currentUser;
      res.status(200).json({ message: encryptData(userSend.uid)  });
      //console.log(userCredential)
    })
    .catch((error) => {
      // Erreur lors de la connexion, gérer l'erreur
      console.error('Erreur de connexion :', error);
    });
    
});


app.put("/api/user/addUserA", async (req, res) => {
  const infoUser = req.body;
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


app.put("/api/user/addUserR", async (req, res) => {
  let infoUser = req.body;
  
  for (const info in infoUser) {
    infoUser[info] = encryptData(infoUser[info]);
  }
  infoUser.password = null;
  infoUser.passWc = null;
  dbUser.push(infoUser)
    .then(response =>{
      
      res.status(200).json({ message: 'Données ajoutées avec succès.' });
    })
    .catch(error =>{
      res.status(500).json({ message: "Une erreur s\'est produite lors de la création de l'utilisateur." });
      console.log("Une erreur s'est produite lors de la création de l'utilisateur.")
    })
  
});

app.put("/api/user/deconnexion", async (req, res) => {
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

app.get("/api/data", async (req, res) => {
  //obtenir les données une seule fois
  dbJoueur.once('value')
    .then(snapshot => {
      const data = snapshot.val();

      const jsonString = JSON.stringify(data);
      //let l_cryData = encryptData(jsonString)
      //console.log(jsonString);
      res.json(jsonString);

      //res.send("<p>"+jsonString+"</p>");
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error retrieving data');
    });
});
app.get("/api/perso/:id", async (req, res) => {
  //obtenir les données une seule fois
  const id = req.params.id;
  const persoData = [];
  dbJoueur.once('value')
    .then(snapshot => {
      const data = snapshot.val();
      //console.log(data);
      if (data) {
        if (Array.isArray(data)) {
          // Parcourir les données pour trouver la correspondance avec idUser
          data.forEach(item => {
            if (item.idUser === id) {
              // console.log('Tableau');
              // console.log(item.idUser);
            }
          });
        } else if (typeof data === 'object') {
          // Parcourir les propriétés de l'objet pour trouver la correspondance avec idUser
          for (const key in data) {
            if (data.hasOwnProperty(key) && data[key].idUser === id) {
              // console.log('Objet');
              // console.log(data[key].idUser);
              persoData.push(data[key])
            }
          }
        }
      }

      const jsonString = JSON.stringify(persoData);
      //let l_cryData = encryptData(jsonString)
      //console.log(persoData);
      res.json(jsonString);

      //res.send(data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error retrieving data');
    });
});

app.put('/api/data/', (req, res) => {
  //const id = req.params.id;
  const personnageData = req.body;

  dbJoueur.push(personnageData, (error) => {
    if (error) {
      res.status(500).json({ message: 'Erreur lors de l\'enregistrement des données' });
    } else {
      res.status(200).json({ message: 'Données enregistrer avec succée' });
    }
  });
});

app.put('/api/data/:id', (req, res) => {
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

app.listen(3081, () => {
  console.log("Server running on port 3081");
});