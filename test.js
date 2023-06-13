routerAuth.put("/connectServ", async (req, res) => {
    const infoConnexion = req.body;
      try {
        //verifie l'entête
        const authorizationHeader = req.headers['authorization'];
        const clientSendIP = req.query.ip;
        const receivedIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  
        // Récupérer l'adresse IP sans la partie de port
        const formattedclientSendIP = clientSendIP.split(':')[0];
  
        //Commence après le dernier (:)
        const startIndex = receivedIP.lastIndexOf(":") + 1;
        //extraire startIndex de tout la chaine de charactère
        const ipAddressWithoutPrefix = receivedIP.substring(startIndex);
        const formattedReceivedIP = ipAddressWithoutPrefix;
  
        //console.log('Adresse IP du client (paramètres) :', formattedClientIP);
        //console.log('Adresse IP de réception du message :', formattedReceivedIP);
  
        
  
        
        if (formattedclientSendIP === formattedReceivedIP) {
          console.log('Les adresses IP correspondent');
          if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
          }
          //initialise avec la valeur de l'entête qui est le token
          const idToken = authorizationHeader.split('Bearer ')[1];
          const decryptToReceive = util.decrypt(idToken)
          const decodedToReceive = JSON.parse(decryptToReceive);
          //console.log(decodedToReceive)
  
          //verifie le token
          //const decodedToken = jwt.verify(idToken, jwtSecret);
          //initialise avec uid contenu dant le token 
  
          const uid = decodedToReceive.uid;
          authe.createCustomToken(uid)
          .then((customToken) => {
            //console.log(customToken);
            //res.status(200).json({ message: token });
          })
          //verifyIdToken() a utiliser que avec les token créer avec auth.currentUser.getIdToken(true)
          //const decodedToken = await admin.auth().verifyIdToken(idToken, { algorithms: ['RS256'] });
    
          //Vérifie si il y a un utilisateur a ce uid
          const userRecord = await admin.auth().getUser(uid);
          if (userRecord) {
            console.log('L\'utilisateur existe :', userRecord.toJSON().uid);
          
            const payload = { uid: decodedToReceive.uid,ip:formattedReceivedIP}; // Créez un objet payload avec la propriété "uid"
            const options = { expiresIn: '1m' }; // Créez un objet payload avec la propriété "uid"
            //génére un token
            const token = jwt.sign(payload, jwtSecret, options);
            console.log(token);
            authe.createCustomToken(uid)
            if (token) return res.status(200).json({ message: token });
            
            
          }
          
  
          // const sendAuthor = {uid:uid,sendIP:formattedReceivedIP}
          // const cryptSend = util.encryptData(JSON.stringify(sendAuthor))
  
          // return res.status(200).json({ message: cryptSend });
        } else {
          console.log('Les adresses IP ne correspondent pas');
          return res.status(404).json({ message: 'Les adresses IP ne correspondent pas' });
          
        }
  
  
      } catch (error) {
  
        if (error.code === 'auth/user-not-found') {
          console.log('L\'utilisateur n\'existe pas');
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        } else {
          console.error('Une erreur s\'est produite lors de la vérification de l\'utilisateur :', error);
          return res.status(500).json({ message: 'Erreur lors de la vérification de l\'utilisateur' });
        }
  
      }
  
  });