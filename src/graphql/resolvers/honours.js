const Honour = require('../../models/Honours');

const { checkPlayer, runInTransaction, transformData } = require('./merge');

module.exports = {
  Query: {
    honours: async (root, { playerId }) => {
      await checkPlayer(playerId);
      const honours = await Honour.find({ player: playerId });
      return honours.map((honour) => {
        return transformData(honour);
      });
    },
  },
  Mutation: {
    createHonour: async (root, { playerId, honourInput }) => {
      const player = await checkPlayer(playerId);

      const honour = new Honour({
        honour: honourInput.honour,
        season: honourInput.season,
        player: playerId,
      });

      let createdHonour;
      await runInTransaction(async (session) => {
        const saveHonour = await honour.save({ session });

        player.honours.push(honour);
        await player.save({ session });

        createdHonour = transformData(saveHonour);
      });
      return createdHonour;
    },
    deleteHonour: async (root, { honourId }) => {
      const deleteHonour = await Honour.findById(honourId);
      if (!deleteHonour) {
        throw new Error('Honour does not exist on the database');
      }

      const player = await checkPlayer(deleteHonour.player);

      let deletedHonour;
      await runInTransaction(async (session) => {
        await Honour.deleteOne({ _id: honourId }, { session });

        const honourIndex = player.honours.indexOf(honourId);
        player.honours.splice(honourIndex, 1);
        player.save({ session });

        deletedHonour = transformData(deleteHonour);
      });
      return deletedHonour;
    },
  },
};
