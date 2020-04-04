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

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if(email.match(regEx)) return true;
  else return false;
}

const isEmpty = (string) => {
  if(string.trim() === '') return true;
  else return false
}

// Signup route 
let token, userId
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  }

  // Errors 

  let errors = {};

  if(isEmpty(newUser.email)) {
    errors.email = 'Must not be empty'
  } else if(!isEmail(newUser.email)){
    errors.email = 'Must be a valid email address'
  }

  if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Password must match';
  if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

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
      userId = data.user.uid;
      return data.user.getIdToken(); //to get the user token after user has been created.
    })
    .then(idToken => {
      token = idToken
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({token});   
    }) 
    .catch(err => {
      console.error(err)
      if(err.code === "auth/email-already-in-use") {
        res.status(400).json({email: 'Email is already in use'})
      } else {
        return res.status(500).json({error: err.code})
      }
    })
})

// Login route

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  let errors = {};

  if(isEmpty(user.email)) errors.email = 'Must not be emty';
  if(isEmpty(user.password)) errors.password = 'Must not be empty';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({token})
    })
    .catch(err => {
      console.error(err);
      if(err.code === 'auth/wrong-password') {
        return res.status(403).json({general: 'Wrong credentials, please try again'})
      } else return res.status(500).json({error: err.code});
    });
});

exports.api = functions.https.onRequest(app)