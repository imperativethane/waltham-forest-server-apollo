const Award = require('../../models/Awards');

const { checkPlayer, runInTransaction, transformData } = require('./merge');

module.exports = {
  Query: {
    awards: async (root, { playerId }) => {
      await checkPlayer(playerId);
      const awards = await Award.find({ player: playerId });
      return awards.map((award) => {
        return transformData(award);
      });
    },
  },
  Mutation: {
    createAward: async (root, { playerId, awardInput }) => {
      const player = await checkPlayer(playerId);

      const award = new Award({
        award: awardInput.award,
        season: awardInput.season,
        player: playerId,
      });

      let createdAward;
      await runInTransaction(async (session) => {
        const saveAward = await award.save({ session });

        player.awards.push(award);
        await player.save({ session });

        createdAward = transformData(saveAward);
      });
      return createdAward;
    },
    deleteAward: async (root, { awardId }) => {
      const deleteAward = await Award.findById(awardId);
      if (!deleteAward) {
        throw new Error('Award does not exist on the database');
      }
      const player = await checkPlayer(deleteAward.player);

      let deletedAward;
      await runInTransaction(async (session) => {
        await Award.deleteOne({ _id: awardId }, { session });

        const awardIndex = player.awards.indexOf(awardId);
        player.awards.splice(awardIndex, 1);
        await player.save({ session });

        deletedAward = transformData(deleteAward);
      });
      return deletedAward;
    },
  },
};
