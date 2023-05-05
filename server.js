import express from "express";

import dbJoueur from "./firebase.js";
// import CryptoJS from 'crypto-js';
import dotenv from "dotenv";


dotenv.config();

const app = express();
app.use(express.json());



// function encryptData(data) {
//   const key = process.env.APP_KEY;
//   return CryptoJS.AES.encrypt(data, key).toString();
// }

app.get("/api/data", async (req, res) => {
  //obtenir les données une seule fois
  dbJoueur.once('value')
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