const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    players: [Player!]!
    playerEmergencyContact(playerId: ID!): EmergencyContact!
  }

  extend type Mutation {
    createPlayer(playerInput: PlayerInput): Player
    deletePlayer(playerId: ID!): Player!
    updatePlayer(playerId: ID!, playerInput: PlayerUpdate): Player!
    createEmergencyContact(
      playerId: ID!
      emergencyContactInput: EmergencyContactInput
    ): Player!
    deleteEmergencyContact(playerId: ID!): Player!
    updateEmergencyContact(
      playerId: ID!
      emergencyContactInput: EmergencyContactUpdate
    ): Player!
  }

  type Player {
    _id: ID!
    firstName: String!
    surname: String!
    phoneNumber: String
    email: String
    addressOne: String
    addressTwo: String
    postcode: String
    position: String!
    active: Boolean!
    photo: String
    information: String
    emergencyContact: EmergencyContact
    honours: [Honour!]
    awards: [Award!]
    appearances: [Appearance]
  }

  type EmergencyContact {
    firstName: String
    surname: String
    phoneNumber: String
    relationship: String
  }

  input PlayerInput {
    firstName: String!
    surname: String!
    phoneNumber: String
    email: String
    addressOne: String
    addressTwo: String
    postcode: String
    position: String!
    photo: String
    information: String
  }

  input PlayerUpdate {
    firstName: String
    surname: String
    phoneNumber: String
    email: String
    addressOne: String
    addressTwo: String
    postcode: String
    position: String
    photo: String
    information: String
  }

  input EmergencyContactInput {
    firstName: String
    surname: String
    phoneNumber: String
    relationship: String
  }

  input EmergencyContactUpdate {
    firstName: String
    surname: String
    phoneNumber: String
    relationship: String
  }
`;
