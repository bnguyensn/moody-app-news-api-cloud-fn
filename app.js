const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { Firestore } = require('@google-cloud/firestore');

/**
 * Application initialization follows this documentation:
 * https://firebase.google.com/docs/firestore/quickstart#initialize
 */
const initialize = () => {
  try {
    if (process.env.IS_OWN_SERVER === 'true') {
      // We're running the app in our own Node.js environment. This is mainly
      // used when we're testing the application out.

      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      // We assume that the app is being run as a GCP cloud function.

      admin.initializeApp(functions.config().firebase);
    }
  } catch (err) {
    throw err;
  }
};

initialize();
console.log('Successfully initialized application');

exports.db = {
  db: admin.firestore(),

  /**
   * Test Firestore connection
   */
  testConnection: async (db, collectionName) => {
    try {
      const querySnapshot = await db
        .collection(collectionName)
        .limit(1)
        .get();

      const docs = querySnapshot.docs;

      console.log(
        `Test db connection: found 1 document at: ${docs[0].ref.path}`
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Add data to our Firestore database
   */
  addToFirestore: async (db, collectionName, { id, data }) => {
    try {
      if (!data) return null;

      // Inject creation timestamp
      data.createdAt = Firestore.Timestamp.now();

      console.log(
        `addToFirestore: trying to add article within topic ${data.topic} with title ${data.articleTitle}`
      );

      if (!id) return db.collection(collectionName).add(data);

      return db
        .collection(collectionName)
        .doc(id)
        .set(data);
    } catch (err) {
      throw err;
    }
  },
};
