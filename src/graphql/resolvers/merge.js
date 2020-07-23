const mongoose = require('mongoose');
const appearancesModel = require('../../models/Appearances');
const resultsModel = require('../../models/Results');
const Player = require('../../models/Player');
const Award = require('../../models/Awards');
const Honour = require('../../models/Honours');
const Team = require('../../models/Teams');

const Appearance = appearancesModel.appearance;
const LeagueResult = resultsModel.leagueResult;
const CupResult = resultsModel.leagueResult;

const { dateToString } = require('../../helpers/date');

const runInTransaction = async (mutations) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const value = await mutations(session);
    await session.commitTransaction();
    return value;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const checkPlayer = async (playerId) => {
  const checkedPlayer = await Player.findById(playerId);
  if (!checkedPlayer) {
    throw new Error('Player does not exist on the database');
  }
  return checkedPlayer;
};

const checkLeagueResult = async (leagueResultId) => {
  const checkedLeagueResult = await LeagueResult.findById(leagueResultId);
  if (!checkedLeagueResult) {
    throw new Error('This result does not exist in the database');
  }
  return checkedLeagueResult;
};

const checkCupResult = async (cupResultId) => {
  const checkedCupResult = await CupResult.findById(cupResultId);
  if (!checkedCupResult) {
    throw new Error('This result does not exist in the database');
  }
  return checkedCupResult;
};

const checkTeam = async (teamId) => {
  const checkedTeam = await Team.findById(teamId);
  if (!checkedTeam) {
    throw new Error('This team does not exist in the database');
  }
  return checkedTeam;
};

const checkAppearance = async (appearanceId) => {
  const appearance = await Appearance.findById(appearanceId);
  if (!appearance) {
    throw new Error('This appearance does not exist on the database.');
  }
  return appearance;
};

const transformAppearanceData = async (appearance) => {
  return {
    ...appearance._doc,
    leagueResult: checkLeagueResultsForNull(appearance._doc.leagueResult),
    player: player.bind(this, appearance._doc.player),
  };
};

const appearances = async (appearanceIds) => {
  const searchedAppearances = await Appearance.find({
    _id: { $in: appearanceIds },
  });
  return searchedAppearances.map((appearance) => {
    return transformAppearanceData(appearance);
  });
};

const leagueResults = async (leagueResultIds) => {
  const searchedLeagueResults = await LeagueResult.find({
    _id: { $in: leagueResultIds },
  });
  return searchedLeagueResults.map((searchedLeagueResult) => {
    return transformResultData(searchedLeagueResult);
  });
};

const transformCupResultData = async (cupResult) => {
  const transformedData = {
    ...cupResult._doc,
    date: dateToString(cupResult._doc.date),
    appearances: appearances.bind(this, cupResult._doc.appearances),
  };
  return transformedData;
};

const cupResults = async (cupResultIds) => {
  const searchedCupResults = await CupResult.find({
    _id: { $in: cupResultIds },
  });
  return searchedCupResults.map((cupResult) => {
    return transformCupResultData(cupResult);
  });
};

const transformTeamData = (team) => {
  return {
    ...team._doc,
    leagueResults: leagueResults.bind(this, team._doc.leagueResults),
    cupResults: cupResults.bind(this, team._doc.cupResults),
  };
};

const team = async (teamId) => {
  const searchedTeam = await Team.findById(teamId);
  return transformTeamData(searchedTeam);
};

const transformResultData = async (leagueResult) => {
  const transformedData = {
    ...leagueResult._doc,
    homeTeam: team.bind(this, leagueResult._doc.homeTeam),
    awayTeam: team.bind(this, leagueResult._doc.awayTeam),
    date: dateToString(leagueResult._doc.date),
    appearances: appearances.bind(this, leagueResult._doc.appearances),
  };
  return transformedData;
};

const leagueResult = async (leagueResultId) => {
  const searchedLeagueResult = await LeagueResult.findById(leagueResultId);
  return transformResultData(searchedLeagueResult);
};

const checkLeagueResultsForNull = (leagueResultData) => {
  if (leagueResultData === null) {
    return null;
  }
  return leagueResult.bind(this, leagueResultData);
};

const transformData = (result) => {
  return {
    ...result._doc,
    player: player.bind(this, result._doc.player),
  };
};

const awards = async (awardIds) => {
  const searchedAwards = await Award.find({ _id: { $in: awardIds } });
  return searchedAwards.map((award) => {
    return transformData(award);
  });
};

const honours = async (honourIds) => {
  const searchedHonours = await Honour.find({ _id: { $in: honourIds } });
  return searchedHonours.map((honour) => {
    return transformData(honour);
  });
};

const transformPlayerData = async (transformPlayer) => {
  return {
    ...transformPlayer._doc,
    awards: awards.bind(this, transformPlayer._doc.awards),
    honours: honours.bind(this, transformPlayer._doc.honours),
    appearances: appearances.bind(this, transformPlayer._doc.appearances),
  };
};

const player = async (playerId) => {
  const searchedPlayer = await Player.findById(playerId);
  return transformPlayerData(searchedPlayer);
};

exports.runInTransaction = runInTransaction;

exports.checkPlayer = checkPlayer;
exports.transformPlayerData = transformPlayerData;

exports.transformData = transformData;

exports.checkLeagueResult = checkLeagueResult;
exports.transformResultData = transformResultData;

exports.checkCupResult = checkCupResult;
exports.transformCupResultData = transformCupResultData;

exports.checkTeam = checkTeam;
exports.transformTeamData = transformTeamData;

exports.checkAppearance = checkAppearance;
exports.transformAppearanceData = transformAppearanceData;
