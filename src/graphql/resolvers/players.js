const Player = require('../../models/Player');
const appearancesModel = require('../../models/Appearances');
const resultsModel = require('../../models/Results');
const Honours = require('../../models/Honours');
const Awards = require('../../models/Awards');

const Appearance = appearancesModel.appearance;
const LeagueResult = resultsModel.leagueResult;

const {
  transformPlayerData,
  runInTransaction,
  checkPlayer,
} = require('./merge');

module.exports = {
  Query: {
    players: async () => {
      const players = await Player.find();
      return players.map((player) => {
        return transformPlayerData(player);
      });
    },
  },
  Mutation: {
    createPlayer: async (root, { playerInput }) => {
      const player = new Player({
        firstName: playerInput.firstName,
        surname: playerInput.surname,
        position: playerInput.position,
      });

      if (playerInput.phoneNumber && playerInput.phoneNumber.trim() !== '') {
        player.phoneNumber = playerInput.phoneNumber;
      }

      if (playerInput.email && playerInput.email.trim() !== '') {
        player.email = playerInput.email;
      }

      if (playerInput.addressOne && playerInput.addressOne.trim() !== '') {
        player.addressOne = playerInput.addressOne;
      }

      if (playerInput.addressTwo && playerInput.addressTwo.trim() !== '') {
        player.addressTwo = playerInput.addressTwo;
      }

      if (playerInput.postcode && playerInput.postcode.trim() !== '') {
        player.postcode = playerInput.postcode;
      }

      if (playerInput.information && playerInput.information.trim() !== '') {
        player.information = playerInput.information;
      }
      const savePlayer = await player.save();

      return transformPlayerData(savePlayer);
    },
    deletePlayer: async (root, { playerId }) => {
      const deletePlayer = await checkPlayer(playerId);
      const { appearances } = deletePlayer;

      let deletedPlayer;
      await runInTransaction(async (session) => {
        await Player.deleteOne({ _id: playerId }, { session });

        await Appearance.find({ _id: { $in: appearances } }, null, {
          session,
        })
          .cursor()
          .eachAsync(async (appearance) => {
            const leagueResult = await LeagueResult.findById(
              appearance.leagueResult
            );

            const appearanceIndex = leagueResult.appearances.indexOf(
              appearance._id
            );
            leagueResult.appearances.splice(appearanceIndex, 1);
            await leagueResult.save();
          });

        await Appearance.deleteMany(
          { _id: { $in: deletePlayer.appearances } },
          { session }
        );
        await Honours.deleteMany(
          { _id: { $in: deletePlayer.honours } },
          { session }
        );
        await Awards.deleteMany(
          { _id: { $in: deletePlayer.awards } },
          { session }
        );

        deletedPlayer = transformPlayerData(deletePlayer);
      });
      return deletedPlayer;
    },
    updatePlayer: async (root, { playerId, playerInput }) => {
      const updatePlayer = await Player.findOneAndUpdate(
        { _id: playerId },
        {
          firstName: playerInput.firstName,
          surname: playerInput.surname,
          phoneNumber: playerInput.phoneNumber,
          email: playerInput.email,
          addressOne: playerInput.addressOne,
          addressTwo: playerInput.addressTwo,
          postcode: playerInput.postcode,
          position: playerInput.position,
          photo: playerInput.photo,
          information: playerInput.information,
          active: true,
        },
        {
          new: true,
          omitUndefined: true,
          useFindAndModify: false,
        }
      );
      return transformPlayerData(updatePlayer);
    },
    createEmergencyContact: async (
      root,
      { playerId, emergencyContactInput }
    ) => {
      const player = await checkPlayer(playerId);

      player.emergencyContact.firstName = emergencyContactInput.firstName;
      player.emergencyContact.surname = emergencyContactInput.surname;
      player.emergencyContact.phoneNumber = emergencyContactInput.phoneNumber;
      player.emergencyContact.relationship = emergencyContactInput.relationship;

      const saveEmergencyContact = await player.save();

      const createdEmergencyContact = transformPlayerData(saveEmergencyContact);

      return createdEmergencyContact;
    },
    deleteEmergencyContact: async (root, { playerId }) => {
      const player = await checkPlayer(playerId);

      player.emergencyContact.firstName = null;
      player.emergencyContact.surname = null;
      player.emergencyContact.relationship = null;
      player.emergencyContact.phoneNumber = null;

      const saveEmergencyContact = await player.save();

      const deletedEmergencyContact = transformPlayerData(saveEmergencyContact);

      return deletedEmergencyContact;
    },
    updateEmergencyContact: async (
      root,
      { emergencyContactInput, playerId }
    ) => {
      const player = await checkPlayer(playerId);

      player.emergencyContact.firstName = emergencyContactInput.firstName;
      player.emergencyContact.surname = emergencyContactInput.surname;
      player.emergencyContact.phoneNumber = emergencyContactInput.phoneNumber;
      player.emergencyContact.relationship = emergencyContactInput.relationship;

      const saveEmergencyContact = await player.save();

      const updatedEmergencyContact = transformPlayerData(saveEmergencyContact);

      return updatedEmergencyContact;
    },
  },
};
