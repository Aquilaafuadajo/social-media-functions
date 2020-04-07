const admin = require('firebase-admin');
const serviceAccount = require('../../../sm.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-media-a01e2.firebaseio.com"
});

const db = admin.firestore();

module.exports = {admin, db}