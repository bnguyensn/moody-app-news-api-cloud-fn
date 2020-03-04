// This is a background cloud function. See important documentation here:
// https://cloud.google.com/functions/docs/writing/background#function_parameters
// https://cloud.google.com/functions/docs/env-var#accessing_environment_variables_at_runtime
// https://cloud.google.com/functions/docs/env-var#nodejs_6_nodejs_8_python_37_and_go_111
// https://cloud.google.com/functions/docs/monitoring/error-reporting

const fetch = require('node-fetch');
const app = require('./app');
const utils = require('./utils');

/**
 * The cloud function does these things:
 * 1. Execute the News API, getting the top articles for the provided topics
 * 2. Store News API results into Firebase
 */
exports.moody = async (e, context) => {
  const NEWS_API_HOST = process.env.NEWS_API_HOST;
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const FIRESTORE_COLLECTION_NAME = process.env.FIRESTORE_COLLECTION_NAME;

  const now = new Date(Date.now());
  const nowStr = utils.getDateStrFromDate(now);

  try {
    // ========== 1. Execute the News API ========== //

    // ----- Prepare the fetch requests ----- //

    const topics = [
      'stock-market',
      'premier-league',
      'brexit',
      'tech',
      'entertainment',
      'arts',
      'science',
      'pwc',
      'uk',
      'boris-johnson',
    ];

    const urls = topics.map(
      topic =>
        `${NEWS_API_HOST}/v2/everything?q=${encodeURIComponent(
          topic.replace('-', ' ')
        )}&from=${encodeURIComponent(
          nowStr
        )}&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    // ----- Fetch & parse fetch results ----- //

    const topicFetchResults = await Promise.all(urls.map(url => fetch(url)));

    const topicData = await Promise.all(
      topicFetchResults.map(topicResult => topicResult.json())
    );

    const topicArticles = topicData.map((topicD, topicIndex) => {
      if (topicD.status === 'ok') {
        console.log(
          `Topic ${topics[topicIndex]} received well. Total result = ${topicD.totalResults} Creating articles...`
        );

        const articles = topicD.articles;

        return articles.map(article => ({
          topic: topics[topicIndex],
          date: nowStr,
          articleTitle: article.title,
          articleDescription: article.description,
        }));
      }

      console.log(`Top ${topics[topicIndex]} wasn't received well.`);

      return null;
    });

    const articles = topicArticles
      .filter(topicArticlesArr => !!topicArticlesArr)
      .reduce((acc, cur) => {
        acc.push(...cur);
        return acc;
      }, []);

    // ========== 2. Store News API results into Firebase ========== //

    const db = app.db;

    await db.testConnection(db.db, FIRESTORE_COLLECTION_NAME);
    console.log('Successfully initialized the Firestore database connection');

    await Promise.all(
      articles.map(article =>
        db.addToFirestore(db.db, FIRESTORE_COLLECTION_NAME, {
          id: undefined,
          data: article,
        })
      )
    );

    return true;
  } catch (err) {
    console.error(err);
    console.error(new Error(err.stack));
    throw err;
  }
};
