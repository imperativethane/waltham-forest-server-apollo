const Appearance = require('../../models/Appearances');
const results = require('../../models/Results');

const Result = results.results;

const {
  checkPlayer,
  checkLeagueResult,
  runInTransaction,
  transformAppearanceData,
  checkAppearance,
  checkResult,
} = require('./merge');

module.exports = {
  Query: {
    playerAppearances: async (root, { playerId }) => {
      await checkPlayer(playerId);
      const playerAppearances = await Appearance.find({ player: playerId });
      return playerAppearances.map((appearance) => {
        return transformAppearanceData(appearance);
      });
    },
    resultAppearances: async (root, { leagueResultId }) => {
      await checkLeagueResult(leagueResultId);
      const resultAppearances = await Appearance.find({
        leagueResult: leagueResultId,
      });
      return resultAppearances.map((appearance) => {
        return transformAppearanceData(appearance);
      });
    },
  },
  Mutation: {
    createAppearance: async (root, { appearanceInput }) => {
      const player = await checkPlayer(appearanceInput.player);
      const checkedResult = await checkResult(appearanceInput.result);
      console.log(player, checkedResult);

      const appearance = new Appearance({
        player: appearanceInput.player,
        result: appearanceInput.result,
        starter: appearanceInput.starter,
        substitute: appearanceInput.substitute,
        goalsScored: appearanceInput.goalsScored,
        assists: appearanceInput.assists,
        yellowCard: appearanceInput.yellowCard,
        redCard: appearanceInput.redCard,
        penaltyScored: appearanceInput.penaltyScored,
        penaltyMissed: appearanceInput.penaltyMissed,
        penaltyConceded: appearanceInput.penaltyConceded,
        manOfTheMatch: appearanceInput.manOfTheMatch,
      });

      let savedAppearance;
      await runInTransaction(async (session) => {
        const saveAppearance = await appearance.save({ session });
        console.log(saveAppearance);

        player.appearances.push(appearance);
        await player.save({ session });

        checkedResult.appearances.push(appearance);
        await checkedResult.save({ session });

        savedAppearance = transformAppearanceData(saveAppearance);
        console.log(savedAppearance);
      });
      return savedAppearance;
    },
    updateAppearance: async (root, { appearanceId, appearanceInput }) => {
      const updateAppearance = await Appearance.findByIdAndUpdate(
        appearanceId,
        {
          starter: appearanceInput.starter || false,
          substitute: appearanceInput.substitute || false,
          goalsScored: appearanceInput.goalsScored || 0,
          assists: appearanceInput.assists || 0,
          yellowCard: appearanceInput.yellowCard || false,
          redCard: appearanceInput.redCard || false,
          penaltyScored: appearanceInput.penaltyScored || 0,
          penaltyMissed: appearanceInput.penaltyMissed || 0,
          penaltyConceded: appearanceInput.penaltyConceded || 0,
          manOfTheMatch: appearanceInput.manOfTheMatch || false,
        },
        {
          new: true,
          useFindAndModify: false,
        }
      );
      return transformAppearanceData(updateAppearance);
    },
    deleteAppearance: async (root, { appearanceId }) => {
      console.log(appearanceId);
      const appearance = await checkAppearance(appearanceId);
      const player = await checkPlayer(appearance.player);
      const leagueResult = await Result.findById(appearance.resultId);

      let deletedAppearance;
      await runInTransaction(async (session) => {
        await Appearance.findByIdAndDelete(appearanceId, {
          session,
        });

        const playerIndex = player.appearances.indexOf(appearance._id);
        player.appearances.splice(playerIndex, 1);
        await player.save({ session });

        if (leagueResult) {
          const leagueResultIndex = leagueResult.appearances.indexOf(
            appearance._id
          );
          leagueResult.appearances.splice(leagueResultIndex, 1);
          await leagueResult.save({ session });
        }

        deletedAppearance = transformAppearanceData(appearance);
      });
      return deletedAppearance;
    },
  },
};
