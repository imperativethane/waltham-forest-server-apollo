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
    leagueResults: [LeagueResult!]!
    cupResults: [CupResult!]!
  }

  input TeamInput {
    name: String!
  }
`;
