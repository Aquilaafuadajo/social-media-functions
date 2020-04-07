const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require('./util/fbauth');

const {getAllScreams, postOneScream} = require('./handlers/screams')
const {signUp, login} = require('./handlers/users');

// Scream routes
app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream);

// users routes

app.post('/signup', signUp)
app.post('/login', login);

exports.api = functions.region('us-central1').https.onRequest(app)