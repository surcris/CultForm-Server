import express from "express";
import dbJoueur from "../firebase.js";
import jwt from "jsonwebtoken";
import {jwtSecret,jwtExpiration} from "../config.js";
const routerPers = express.Router();


routerPers.put('/addPerso/', (req, res) => {
    //const id = req.params.id;
    try {
        const personnageData = req.body;
        const idToken = req.headers['authorization'];
        // Verification du token
        jwt.verify(idToken, jwtSecret, async (err, decodedToken) => {
            if (err) {
                // Le token est invalide ou a expiré
                console.log("Token invalide");
                res.status(401).json({ message: 'Token invalide' });
            } else {
                // Le token est valide
                console.log("Autorisation de créer un personnage");
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
        res.status(500).send('Erreur lors de la réception des données');
    }
});

routerPers.put('/updateData/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    dbJoueur.child(id).push(updatedData, (error) => {
        if (error) {
            res.status(500).json({ message: 'Erreur lors de la réception des données' });
        } else {
            res.status(200).json({ message: 'Données reçue avec succées' });
        }
    })

});

routerPers.put("/searchDataId/", async (req, res) => {
    const persoData = [];

    try {
        const idToken = req.headers['authorization'];
        // Verification du token
        jwt.verify(idToken, jwtSecret, async (err, decodedToken) => {
            if (err) {
                // Le token est invalide ou a expiré
                console.log("Token invalide");
                res.status(401).json({ message: 'Token invalide' });
            } else {
                // Le token est valide 
                console.log("Autorisation pour rechercher des personnage avec un ID");
                //console.log(decodedToken);
                const uid = decodedToken.uid;
                const snapshot = await dbJoueur.once('value');
                const data = snapshot.val();


                if (data) {
                    // si data est un tableau ou un objet 
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
        res.status(500).send('Erreur lors de la réception des données');
    }
});

routerPers.put("/searchPersoPseudo/", async (req, res) => {
    const pseudo = req.headers['pseudo'];
    const persoData = [];
    //console.log(pseudo)
    try {
        const idToken = req.headers['authorization'];
        // Verification du token
        jwt.verify(idToken, jwtSecret, async (err, decodedToken) => {
            if (err) {
                // Le token est invalide ou a expiré
                console.log("Token invalide");
                res.status(401).json({ message: 'Token invalide' });
            } else {
                // Le token est valide 
                console.log("Autorisation pour rechercher un personnage avec un pseudo");
                const snapshot = await dbJoueur.once('value');
                const data = snapshot.val();

                if (data) {
                    // si data est un tableau ou un objet 
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
        res.status(500).send('Erreur lors de la réception des données');
    }
});
// app.get("/api/data", async (req, res) => {
//     //obtenir les données une seule fois
//     dbJoueur.once('value')
//         .then(snapshot => {
//             const data = snapshot.val();

//             const jsonString = JSON.stringify(data);
//             //let l_cryData = encryptData(jsonString)
//             //console.log(jsonString);
//             res.json(jsonString);

//             //res.send("<p>"+jsonString+"</p>");
//         })
//         .catch(error => {
//             console.error(error);
//             res.status(500).send('Error retrieving data');
//         });
// });

export default routerPers;