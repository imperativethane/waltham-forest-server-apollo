const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    teams: [Team!]!
  }

  extend type Mutation {
    createTeam(teamInput: TeamInput): Team!
    deleteTeam(teamId: ID!): Team!
  }

  type Team {
    _id: ID!
    name: String!
    gamesPlayed: Int!
    gamesWon: Int!
    gamesDraw: Int!
    gamesLost: Int!
    goalsScored: Int!
    goalsAgainst: Int!
    goalDifference: Int!
    points: Int!
    results: [LeagueResult!]
  }

  input TeamInput {
    name: String!
  }
`;
