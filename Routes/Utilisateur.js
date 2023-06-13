import express from "express";


const routerUser = express.Router();


routerUser.put("/api/user/addUserA", async (req, res) => {
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


routerUser.put("/api/user/addUserR", async (req, res) => {
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

export default routerUser;