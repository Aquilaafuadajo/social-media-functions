const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config = {
  apiKey: "AIzaSyBTyLPU0TUHi3tu3RhQN_CSGV5x2-ImpBg",
  authDomain: "social-media-a01e2.firebaseapp.com",
  databaseURL: "https://social-media-a01e2.firebaseio.com",
  projectId: "social-media-a01e2",
  storageBucket: "social-media-a01e2.appspot.com",
  messagingSenderId: "281866326761",
  appId: "1:281866326761:web:7ba74286f625e4bb199678",
  measurementId: "G-8RGXFHQRCT"
};

const firebase = require('firebase');
firebase.initializeApp(config)

const db = admin.firestore();

app.get('/screams', (req, res) => {
  db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          ...doc.data()
        })
      })
      return res.json(screams);
    })
    .catch(err => console.error(err))
})

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   response.send("Hello from Firebase!");
// });

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body, 
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db
    .collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({message: `document ${doc.id} created sucessfully`});
    })
    .catch(err => {
      res.status(500).json({error: 'something went wrong'});
      console.error(err);
    })
});

// Signup route 
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  }

  // TODO: validate data
  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if(doc.exists) {
        return res.status(400).json({handle: 'this handle already exist'})
      }else {
        return firebase.auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({token})
    })

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      .then(data => {
        return res.status(200).json({message: `user ${data.user.uid} signed up successfully`})
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code})
      })
})



exports.api = functions.https.onRequest(app)