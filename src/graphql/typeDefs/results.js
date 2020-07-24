const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    leagueResults: [LeagueResult!]!
    cupResults: [CupResult!]!
    results: [Result!]!
  }

  extend type Mutation {
    createLeagueResult(leagueResultInput: LeagueResultInput): LeagueResult!
    deleteLeagueResult(resultId: ID!): LeagueResult!
    createCupResult(cupResultInput: CupResultInput): CupResult!
    deleteCupResult(resultId: ID!): CupResult!
  }

  interface Result {
    _id: ID!
    date: String!
    appearances: [Appearance!]
  }

  type LeagueResult implements Result {
    _id: ID!
    homeTeam: Team!
    homeScore: Int!
    awayTeam: Team!
    awayScore: Int!
    date: String!
    appearances: [Appearance!]
  }

  type CupResult implements Result {
    _id: ID!
    opponent: String!
    homeTeam: Boolean!
    walthamForestScore: Int!
    opponentScore: Int!
    date: String!
    appearances: [Appearance!]
  }

  input LeagueResultInput {
    homeTeam: ID!
    homeScore: Int!
    awayTeam: ID!
    awayScore: Int!
    date: String!
  }

  input CupResultInput {
    opponent: String!
    homeTeam: Boolean!
    walthamForestScore: Int!
    opponentScore: Int!
    competition: String!
    date: String!
  }
`;
