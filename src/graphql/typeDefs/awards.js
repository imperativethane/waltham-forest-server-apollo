const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    awards(playerId: ID!): [Award!]!
  }

  extend type Mutation {
    createAward(playerId: ID!, awardInput: AwardInput): Award!
    deleteAward(awardId: ID!): Award!
  }

  type Award {
    _id: ID!
    award: String!
    season: String!
    player: Player!
  }

  input AwardInput {
    award: String!
    season: String!
  }
`;
