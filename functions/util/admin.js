const admin = require('firebase-admin');
//const serviceAccount = require('../../../sm.json')
// {
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://social-media-a01e2.firebaseio.com"
// }

admin.initializeApp();

const db = admin.firestore();

module.exports = {admin, db}