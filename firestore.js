const admin = require('firebase-admin');
const Firestore = require('@google-cloud/firestore');
const functions = require('firebase-functions');

/**
 * Firestore database initialization follows this documentation:
 * https://firebase.google.com/docs/firestore/quickstart#initialize
 */
exports.initializeDb = () => {
  try {
    if (process.env.IS_OWN_SERVER === 'true') {
      // We're running the app in our own Node.js environment. This is mainly
      // used when we're testing the application out.

      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });

      return admin.firestore();
    } else {
      // We assume that the app is being run as a GCP cloud function.

      admin.initializeApp(functions.config().firebase);

      return admin.firestore();
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Add some data to our Firestore database
 */
exports.addToFirestore = async (db, collectionName, { id, data }) => {
  try {
    if (!data) return null;

    // Inject creation timestamp
    data.createdAt = Firestore.Timestamp.now();

    console.log(`addToFirestore: trying to add ${JSON.stringify(data)}`);

    if (!id) return db.collection(collectionName).add(data);

    return db
      .collection(collectionName)
      .doc(id)
      .set(data);
  } catch (err) {
    throw err;
  }
};
