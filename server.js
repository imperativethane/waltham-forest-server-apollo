const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');

const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
require('dotenv/config');

const typeDefs = require('./src/graphql/typeDefs');
const resolvers = require('./src/graphql/resolvers');

const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(bodyParser.json());
    app.use(cors());
    app.use(morgan('dev'));

    app.disable('x-powered-by');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      playground: true,
    });

    server.applyMiddleware({ app });

    app.listen({ port: PORT }, () =>
      console.log(`http://localhost:${PORT}${server.graphqlPath}`)
    );

    app.use(errorhandler());
  } catch (e) {
    console.error(e);
  }
})();
