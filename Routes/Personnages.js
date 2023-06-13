import express from "express";
import dbJoueur from "../firebase.js";
import jwt from "jsonwebtoken";
import {jwtSecret,jwtExpiration} from "../config.js";
const routerPers = express.Router();

routerPers.put('/pushPerso/', (req, res) => {
    //const id = req.params.id;
    const personnageData = req.body;

    dbJoueur.push(personnageData, (error) => {
        if (error) {
            res.status(500).json({ message: 'Erreur lors de l\'enregistrement du personnage' });
        } else {
            res.status(200).json({ message: 'Personnage enregistrer avec succée' });
        }
    });
});

routerPers.put('/api/data/:id', (req, res) => {
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

routerPers.put("/search/id/", async (req, res) => {
    const persoData = [];

    try {
        const idToken = req.headers['authorization'];
        //const key = req.headers['myKey'];
        //console.log(idToken);
        jwt.verify(idToken, jwtSecret, async (err, decodedToken) => {
            if (err) {
                // Le token est invalide ou a expiré
                res.status(401).json({ message: 'Unauthorized' });
            } else {
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

routerPers.get("/search/pseudo/:pseudo", async (req, res) => {
    const pseudo = req.params.pseudo;
    const persoData = [];

    try {
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
            res.status(200).json({ message: 'Personnage trouver avec ce Pseudo!' });
            //res.json(jsonString);
        } else {
            res.status(404).json({ message: 'Aucune donnée trouvée pour ce Pseudo.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
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