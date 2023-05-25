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

app.get("/", async (req, res) => {
  
  res.send("<p>Coucou</p>");
    
});

app.put("/api/user/connexionUser", async (req, res) => {
  const infoConnexion = req.body;
  console.log(infoConnexion);
  
  auth.signInWithEmailAndPassword(infoConnexion.email, infoConnexion.password)
    .then((userCredential) => {
      // Connexion réussie, récupérer l'utilisateur connecté
      const user = userCredential.user;
      console.log('Utilisateur connecté ' );
      const userSend = auth.currentUser;
      res.status(200).json({ message: userSend.uid });
      console.log(userSend.uid)
    })
    .catch((error) => {
      // Erreur lors de la connexion, gérer l'erreur
      console.error('Erreur de connexion :', error);
    });
    
});

app.put("/api/user/addUserA", async (req, res) => {
  const infoUser = req.body;
  console.log(infoUser)
  
  auth.fetchSignInMethodsForEmail(infoUser.email)
    .then((signInMethods) => {
      if (signInMethods.length > 0) {
        // L'adresse e-mail est déjà associée à un compte utilisateur existant
        res.status(409).json({ message: 'Cet utilisateur existe déjà.' });
        console.log('Cet utilisateur existe déjà.')
      } else {
        //L'adresse e-mail est disponible, créer un nouvel utilisateur
        auth.createUserWithEmailAndPassword(infoUser.email, infoUser.password)
          .then((userCredential) => {
            // Utilisez les données de userCredential ou effectuez d'autres opérations
            res.status(200).json({ message: 'Utilisateur créé avec succès.' });
            console.log('Utilisateur créé avec succès.')
            //ajouter les donnée de l'utilisateur dans la BDD
            
          })
          .catch((error) => {
            res.status(500).json({ message: "Une erreur s'est produite lors de la création de l'utilisateur." });
            console.log("Une erreur s'est produite lors de la création de l'utilisateur.")
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Une erreur s'est produite lors de la vérification de l'adresse e-mail." });
      console.log("Une erreur s'est produite lors de la vérification de l'adresse e-mail.")
    });
});
app.put("/api/user/addUserR", async (req, res) => {
  let infoUser = req.body;
  for (const info in infoUser) {
    infoUser[info] = encryptData(infoUser[info]);
  }
  dbUser.push(infoUser)
    .then(response =>{
      
      res.status(200).json({ message: 'Données ajoutées avec succès.' });
    })
    .catch(error =>{
      res.status(500).json({ message: "Une erreur s\'est produite lors de la création de l'utilisateur." });
      console.log("Une erreur s'est produite lors de la création de l'utilisateur.")
    })
  
});

app.get("/api/data", async (req, res) => {
  //obtenir les données une seule fois
  dbJoueur.once('value')
    .then(snapshot => {
      const data = snapshot.val();

      const jsonString = JSON.stringify(data);
      //let l_cryData = encryptData(jsonString)
      // console.log(l_crpKey);
      res.json(jsonString);

      //res.send("<p>"+jsonString+"</p>");
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error retrieving data');
    });
});
app.get("/api/data/:id", async (req, res) => {
  //obtenir les données une seule fois
  const id = req.params.id;

  dbJoueur.child(id).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      const jsonString = JSON.stringify(data);
      //let l_cryData = encryptData(jsonString)
      // console.log(l_crpKey);
      res.json(jsonString);

      //res.send(data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error retrieving data');
    });
});

app.put('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  dbJoueur.child(id).set(updatedData, (error) => {
    if (error) {
      res.status(500).json({ message: 'An error occurred while updating data.' });
    } else {
      res.status(200).json({ message: 'Data updated successfully.' });
    }
  });
});

app.put('/api/data/', (req, res) => {
  //const id = req.params.id;
  const updatedData = req.body;
  dbJoueur.push(updatedData, (error) => {
    if (error) {
      res.status(500).json({ message: 'An error occurred while updating data.' });
    } else {
      res.status(200).json({ message: 'Data updated successfully.' });
    }
  })

});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});