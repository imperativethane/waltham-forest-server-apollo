const results = require('../../models/Results');
const CupResult = results.cupResult;
const Appearance = require('../../models/Appearances');

const { runInTransaction, checkTeam, transformCupResultData, checkLeagueResult } = require('./merge');

module.exports = {
    cupResults: async () => {
        try {
            const cupResults = await CupResult.find();
            return cupResults.map(cupResult => {
                return transformCupResultData(cupResult);
            });
        } catch (err) {
            throw err;
        };
    },
    createCupResult: async ({cupResultInput}) => {
        const walthamForest = await checkTeam("5ee34d1bc2ac4d68d4fb9a58");

        const result = new CupResult({
            opponent: cupResultInput.opponent,
            homeTEam: cupResultInput.homeTeam,
            walthamForestScore: cupResultInput.walthamForestScore,
            awayScore: cupResultInput.awayScore,
            competition: cupResultInput.competition,
            date: new Date(cupResultInput.date)
        });

        let createdResult;
        try {
            await runInTransaction(async session => {
                const saveResult = await result.save({session: session});

                walthamForest.cupResults.push(result);
                await walthamForest.save({session: session});

                createdResult = transformCupResultData(saveResult);
            });
            return createdResult;
        } catch (err) {
            throw err;
        };
    },
    deleteCupResult: async ({resultId}) => {
        const cupResult = await checkCupResult(resultId);
        const walthamForest = await checkTeam("5ee34d1bc2ac4d68d4fb9a58");
        const appearances = cupResult.appearances;
        
        let deletedResult;
        try {
            await runInTransaction(async session => {
                await CupResult.findByIdAndDelete(resultId);
                await Appearance.updateMany(
                    {_id: {$in: appearances}}, 
                    {cupResult: null}, 
                    {session: session}
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
                };

                homeTeam.goalsScored -= leagueResult.homeScore;
                homeTeam.goalsAgainst -= leagueResult.awayScore;
                homeTeam.goalDifference -= (leagueResult.homeScore - leagueResult.awayScore);
                awayTeam.goalsScored -= leagueResult.awayScore;
                awayTeam.goalsAgainst -= leagueResult.homeScore;
                awayTeam.goalDifference -= (leagueResult.awayScore - leagueResult.homeScore);

                const homeTeamIndex = homeTeam.leagueResults.indexOf(leagueResult._id);
                homeTeam.leagueResults.splice(homeTeamIndex, 1);
                await homeTeam.save({session: session});

                const awayTeamIndex = awayTeam.leagueResults.indexOf(leagueResult._id);
                awayTeam.leagueResults.splice(awayTeamIndex, 1);
                await awayTeam.save({session: session});

                deletedResult = transformResultData(leagueResult);
            })
            return deletedResult;
        } catch (err) {
            throw err;
        }
    }
};

