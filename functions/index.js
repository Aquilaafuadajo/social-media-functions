const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require('./util/fbauth');

const {getAllScreams, postOneScream} = require('./handlers/screams');
const {signUp, login, uploadImage} = require('./handlers/users');

// Scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// users routes
app.post('/signup', signUp)
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage)

exports.api = functions.region('us-central1').https.onRequest(app)