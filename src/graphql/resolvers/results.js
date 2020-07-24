const results = require('../../models/Results');
const Appearance = require('../../models/Appearances');

const Results = results.results;
const LeagueResult = results.leagueResult;
const CupResult = results.cupResult;

const {
  runInTransaction,
  checkTeam,
  transformLeagueResultData,
  checkLeagueResult,
  transformCupResultData,
  checkCupResult,
} = require('./merge');

module.exports = {
  Result: {
    __resolveType(obj) {
      if (obj.awayTeam) {
        return 'LeagueResult';
      }

      if (obj.opponent) {
        return 'CupResult';
      }

      return null;
    },
  },
  Query: {
    results: async () => {
      const searchedResults = await Results.find();
      return searchedResults.map((result) => {
        if (result.awayTeam) {
          return transformLeagueResultData(result);
        }
        return transformCupResultData(result);
      });
    },
    leagueResults: async () => {
      const leagueResults = await LeagueResult.find();
      return leagueResults.map((leagueResult) => {
        return transformLeagueResultData(leagueResult);
      });
    },
  },
  Mutation: {
    createLeagueResult: async (root, { leagueResultInput }) => {
      if (leagueResultInput.homeTeam === leagueResultInput.awayTeam) {
        throw new Error('Please select two seperate teams.');
      }

      const homeTeam = await checkTeam(leagueResultInput.homeTeam);
      const awayTeam = await checkTeam(leagueResultInput.awayTeam);

      const result = new LeagueResult({
        homeTeam: leagueResultInput.homeTeam,
        homeScore: leagueResultInput.homeScore,
        awayTeam: leagueResultInput.awayTeam,
        awayScore: leagueResultInput.awayScore,
        date: new Date(leagueResultInput.date),
      });

      let createdResult;
      await runInTransaction(async (session) => {
        const saveResult = await result.save({ session });

        homeTeam.gamesPlayed += 1;
        awayTeam.gamesPlayed += 1;

        if (leagueResultInput.homeScore > leagueResultInput.awayScore) {
          homeTeam.gamesWon += 1;
          homeTeam.points += 3;
          awayTeam.gamesLost += 1;
        } else if (
          leagueResultInput.homeScore === leagueResultInput.awayScore
        ) {
          homeTeam.gamesDraw += 1;
          homeTeam.points += 1;
          awayTeam.gamesDraw += 1;
          awayTeam.points += 1;
        } else {
          homeTeam.gamesLost += 1;
          awayTeam.gamesWon += 1;
          awayTeam.points += 3;
        }

        homeTeam.goalsScored += leagueResultInput.homeScore;
        homeTeam.goalsAgainst += leagueResultInput.awayScore;
        homeTeam.goalDifference +=
          leagueResultInput.homeScore - leagueResultInput.awayScore;
        awayTeam.goalsScored += leagueResultInput.awayScore;
        awayTeam.goalsAgainst += leagueResultInput.homeScore;
        awayTeam.goalDifference +=
          leagueResultInput.awayScore - leagueResultInput.homeScore;

        homeTeam.leagueResults.push(result);
        await homeTeam.save({ session });

        awayTeam.leagueResults.push(result);
        await awayTeam.save({ session });

        createdResult = transformLeagueResultData(saveResult);
      });
      return createdResult;
    },
    deleteLeagueResult: async (root, { resultId }) => {
      const leagueResult = await checkLeagueResult(resultId);
      const homeTeam = await checkTeam(leagueResult.homeTeam);
      const awayTeam = await checkTeam(leagueResult.awayTeam);
      const { appearances } = leagueResult;

      let deletedResult;
      await runInTransaction(async (session) => {
        await LeagueResult.findByIdAndDelete(resultId, { session });
        await Appearance.updateMany(
          { _id: { $in: appearances } },
          { leagueResult: null },
          { session }
        );

        homeTeam.gamesPlayed -= 1;
        awayTeam.gamesPlayed -= 1;

        if (leagueResult.homeScore > leagueResult.awayScore) {
          homeTeam.gamesWon -= 1;
          homeTeam.points -= 3;
          awayTeam.gamesLost -= 1;
        } else if (leagueResult.homeScore === leagueResult.awayScore) {
          homeTeam.gamesDraw -= 1;
          homeTeam.points -= 1;
          awayTeam.gamesDraw -= 1;
          awayTeam.points -= 1;
        } else {
          homeTeam.gamesLost -= 1;
          awayTeam.gamesWon -= 1;
          awayTeam.points -= 3;
        }

        homeTeam.goalsScored -= leagueResult.homeScore;
        homeTeam.goalsAgainst -= leagueResult.awayScore;
        homeTeam.goalDifference -=
          leagueResult.homeScore - leagueResult.awayScore;
        awayTeam.goalsScored -= leagueResult.awayScore;
        awayTeam.goalsAgainst -= leagueResult.homeScore;
        awayTeam.goalDifference -=
          leagueResult.awayScore - leagueResult.homeScore;

        const homeTeamIndex = homeTeam.leagueResults.indexOf(leagueResult._id);
        homeTeam.leagueResults.splice(homeTeamIndex, 1);
        await homeTeam.save({ session });

        const awayTeamIndex = awayTeam.leagueResults.indexOf(leagueResult._id);
        awayTeam.leagueResults.splice(awayTeamIndex, 1);
        await awayTeam.save({ session });

        deletedResult = transformLeagueResultData(leagueResult);
      });
      return deletedResult;
    },
    createCupResult: async (root, { cupResultInput }) => {
      const walthamForest = await checkTeam('5ee34d1bc2ac4d68d4fb9a58');

      const result = new CupResult({
        opponent: cupResultInput.opponent,
        homeTeam: cupResultInput.homeTeam,
        walthamForestScore: cupResultInput.walthamForestScore,
        opponentScore: cupResultInput.opponentScore,
        awayScore: cupResultInput.awayScore,
        competition: cupResultInput.competition,
        date: new Date(cupResultInput.date),
      });

      let createdResult;
      await runInTransaction(async (session) => {
        const saveResult = await result.save({ session });

        walthamForest.cupResults.push(result);
        await walthamForest.save({ session });

        createdResult = transformCupResultData(saveResult);
      });
      return createdResult;
    },
    deleteCupResult: async (root, { resultId }) => {
      const cupResult = await checkCupResult(resultId);
      const walthamForest = await checkTeam('5ee34d1bc2ac4d68d4fb9a58');
      const { appearances } = cupResult;

      let deletedResult;
      await runInTransaction(async (session) => {
        await CupResult.findByIdAndDelete(resultId, { session });
        await Appearance.updateMany(
          { _id: { $in: appearances } },
          { cupResult: null },
          { session }
        );

        const walthamForestIndex = walthamForest.cupResults.indexOf(
          cupResult._id
        );
        walthamForest.cupResults.splice(walthamForestIndex, 1);
        await walthamForest.save({ session });

        deletedResult = transformCupResultData(cupResult);
      });
      return deletedResult;
    },
  },
};
