const Team = require('../../models/Teams');
const results = require('../../models/Results');

const LeagueResult = results.leagueResult;

const { transformTeamData, checkTeam, runInTransaction } = require('./merge');

module.exports = {
  Query: {
    teams: async () => {
      const teams = await Team.find();
      return teams.map((team) => {
        return transformTeamData(team);
      });
    },
  },
  Mutation: {
    createTeam: async (root, { teamInput }) => {
      const checkedTeam = await Team.findOne({ name: teamInput.name });
      if (checkedTeam) {
        throw new Error('This team already exists.');
      }

      const createTeam = new Team({
        name: teamInput.name,
      });

      const saveTeam = await createTeam.save();
      const createdTeam = {
        ...saveTeam._doc,
      };
      return createdTeam;
    },
    deleteTeam: async (root, { teamId }) => {
      if (teamId === '5ee34d1bc2ac4d68d4fb9a58') {
        throw new Error('Cannot delete Waltham Forest Utd from the database');
      }

      const deleteTeam = await Team.findById(teamId);
      if (!deleteTeam) {
        throw new Error('Team does not exist on the database');
      }

      const { leagueResults } = deleteTeam;

      let deletedTeam;
      await runInTransaction(async (session) => {
        await LeagueResult.find({ _id: { $in: leagueResults } }, null, {
          session,
        })
          .cursor()
          .eachAsync(async (leagueResult) => {
            if (leagueResult.homeTeam === deleteTeam) {
              const awayTeam = await checkTeam(leagueResult.awayTeam);

              awayTeam.gamesPlayed -= 1;

              if (leagueResult.homeScore > leagueResult.awayScore) {
                awayTeam.gamesLost -= 1;
              } else if (leagueResult.homeScore === leagueResult.awayScore) {
                awayTeam.gamesDraw -= 1;
                awayTeam.points -= 1;
              } else {
                awayTeam.gamesWon -= 1;
                awayTeam.points -= 3;
              }

              awayTeam.goalsScored -= leagueResult.awayScore;
              awayTeam.goalsAgainst -= leagueResult.homeScore;
              awayTeam.goalDifference -=
                leagueResult.awayScore - leagueResult.homeScore;

              const awayTeamIndex = awayTeam.leagueResults.indexOf(
                leagueResult._id
              );
              awayTeam.leagueResults.splice(awayTeamIndex, 1);

              await awayTeam.save();
              await LeagueResult.findByIdAndDelete(leagueResult._id);
            } else {
              const homeTeam = await checkTeam(leagueResult.homeTeam);

              homeTeam.gamesPlayed -= 1;

              if (leagueResult.homeScore > leagueResult.awayScore) {
                homeTeam.gamesWon -= 1;
                homeTeam.points -= 3;
              } else if (leagueResult.homeScore === leagueResult.awayScore) {
                homeTeam.gamesDraw -= 1;
                homeTeam.points -= 1;
              } else {
                homeTeam.gamesLost -= 1;
              }

              homeTeam.goalsScored -= leagueResult.homeScore;
              homeTeam.goalsAgainst -= leagueResult.awayScore;
              homeTeam.goalDifference -=
                leagueResult.homeScore - leagueResult.awayScore;

              const homeTeamIndex = homeTeam.leagueResults.indexOf(
                leagueResult._id
              );
              homeTeam.leagueResults.splice(homeTeamIndex, 1);

              await homeTeam.save();
              await LeagueResult.findByIdAndDelete(leagueResult._id);
            }
          });
        await Team.deleteOne({ _id: deleteTeam }, { session });
        deletedTeam = transformTeamData(deleteTeam);
      });
      return deletedTeam;
    },
  },
};
