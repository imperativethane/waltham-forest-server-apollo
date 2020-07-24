const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    playerAppearances(playerId: ID!): [Appearance!]!
    resultAppearances(resultId: ID!): [Appearance!]!
  }

  extend type Mutation {
    createAppearance(appearanceInput: AppearanceInput): Appearance!
    updateAppearance(
      appearanceId: ID!
      appearanceInput: AppearanceUpdate
    ): Appearance!
    deleteAppearance(appearanceId: ID!): Appearance!
  }

  type Appearance {
    _id: ID!
    result: Result!
    player: Player!
    starter: Boolean!
    substitute: Boolean!
    goalsScored: Int!
    assists: Int!
    yellowCard: Boolean!
    redCard: Boolean!
    penaltyScored: Int!
    penaltyMissed: Int!
    penaltyConceded: Int!
    manOfTheMatch: Boolean!
  }

  input AppearanceInput {
    result: ID!
    player: ID!
    starter: Boolean
    substitute: Boolean
    goalsScored: Int
    assists: Int
    yellowCard: Boolean
    redCard: Boolean
    penaltyScored: Int
    penaltyMissed: Int
    penaltyConceded: Int
    manOfTheMatch: Boolean
  }

  input AppearanceUpdate {
    starter: Boolean
    substitute: Boolean
    goalsScored: Int
    assists: Int
    yellowCard: Boolean
    redCard: Boolean
    penaltyScored: Int
    penaltyMissed: Int
    penaltyConceded: Int
    manOfTheMatch: Boolean
  }
`;
