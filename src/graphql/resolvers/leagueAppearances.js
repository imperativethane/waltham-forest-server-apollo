const appearance = require('../../models/Appearances');
const LeagueAppearance = appearance.leagueAppearance;
const results = require('../../models/Results');
const LeagueResults = results.leagueResult;


const { checkPlayer, checkLeagueResult, runInTransaction, transformAppearanceData, checkAppearance } = require('./merge');

module.exports = {
    playerAppearances: async ({playerId}) => {
        try {
            await checkPlayer(playerId);
            const playerAppearances = await LeagueAppearance.find({player: playerId});
            return playerAppearances.map(appearance => {
                return transformAppearanceData(appearance)
            })
        } catch (err) {
            throw err;
        };
    },
    resultAppearances: async ({leagueResultId}) => {
        try {
            await checkLeagueResult(leagueResultId);
            const resultAppearances = await LeagueAppearance.find({leagueResult: leagueResultId});
            return resultAppearances.map(appearance => {
                return transformAppearanceData(appearance)
            })
        } catch (err) {
            throw err;
        };
    },
    createAppearance: async ({appearanceInput}) => {
        const player = await checkPlayer(appearanceInput.player);
        const leagueResult = await checkLeagueResult(appearanceInput.leagueResult);

        const appearance = new LeagueAppearance({
            player: appearanceInput.player,
            resultId: appearanceInput.resultId,
            starter: appearanceInput.starter,
            substitute: appearanceInput.substitute,
            goalsScored: appearanceInput.goalsScored,
            assists: appearanceInput.assists,
            yellowCard: appearanceInput.yellowCard,
            redCard: appearanceInput.redCard,
            penaltyScored: appearanceInput.penaltyScored,
            penaltyMissed: appearanceInput.penaltyMissed,
            penaltyConceded: appearanceInput.penaltyConceded,
            manOfTheMatch: appearanceInput.manOfTheMatch
        });

        let savedAppearance
        try {
            await runInTransaction(async session => {
                const saveAppearance = await appearance.save({session: session});

                player.appearances.push(appearance);
                await player.save({session: session});

                leagueResult.appearances.push(appearance);
                await leagueResult.save({session: session});

                savedAppearance = transformAppearanceData(saveAppearance);
            });
            return savedAppearance;
        } catch (err) {
            throw err;
        }
    }, 
    updateAppearance: async ({appearanceId, appearanceInput}) => {
        try {
            const updateAppearance = await LeagueAppearance.findByIdAndUpdate(appearanceId, {
                starter: appearanceInput.starter || false,
                substitute: appearanceInput.substitute || false,
                goalsScored: appearanceInput.goalsScored || 0,
                assists: appearanceInput.assists || 0, 
                yellowCard: appearanceInput.yellowCard || false,
                redCard: appearanceInput.redCard || false,
                penaltyScored: appearanceInput.penaltyScored || 0,
                penaltyMissed: appearanceInput.penaltyMissed || 0,
                penaltyConceded: appearanceInput.penaltyConceded || 0,
                manOfTheMatch: appearanceInput.manOfTheMatch || false
            }, {
                new: true,
                useFindAndModify: false
            });
            return transformAppearanceData(updateAppearance);
        } catch (err) {
            throw err;
        };
    },
    deleteAppearance: async ({appearanceId}) => {
        const appearance = await checkAppearance(appearanceId);
        const player = await checkPlayer(appearance.player);
        const leagueResult = await LeagueResults.findById(appearance.leagueResult);

        let deletedAppearance;
        try {
            await runInTransaction(async session => {
                await LeagueAppearance.findByIdAndDelete(appearanceId, {session: session});
                
                const playerIndex = player.appearances.indexOf(appearance._id);
                player.appearances.splice(playerIndex, 1);
                await player.save({session: session});

                if (leagueResult) {
                    const leagueResultIndex = leagueResult.appearances.indexOf(appearance._id);
                    leagueResult.appearances.splice(leagueResultIndex, 1);
                    await leagueResult.save({session: session});
                }

                deletedAppearance = transformAppearanceData(appearance);
            })
            return deletedAppearance;
        } catch (err) {
            throw err;
        }
    }
};