const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    honours(playerId: ID!): [Honour!]!
  }

  extend type Mutation {
    createHonour(playerId: ID!, honourInput: HonourInput): Honour!
    deleteHonour(honourId: ID!): Honour!
  }

  type Honour {
    _id: ID!
    honour: String!
    season: String!
    player: Player!
  }

  input HonourInput {
    honour: String!
    season: String!
  }
`;
