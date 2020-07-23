const mongoose = require('mongoose');

const { Schema } = mongoose;

const baseOptions = {
  discriminatorKey: 'resultType',
  collection: 'results',
};

const resultsSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    appearances: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Appearance',
      },
    ],
  },
  baseOptions
);

const leagueResultSchema = new Schema(
  {
    homeTeam: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    homeScore: {
      type: Number,
      required: true,
    },
    awayTeam: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    awayScore: {
      type: Number,
      required: true,
    },
  },
  { collection: 'results' }
);

const cupResultSchema = new Schema(
  {
    opponent: {
      type: String,
      required: true,
    },
    homeTeam: {
      type: Boolean,
      required: true,
    },
    walthamForestScore: {
      type: Number,
      required: true,
    },
    opponentScore: {
      type: Number,
      required: true,
    },
    competition: {
      type: String,
      required: true,
    },
  },
  { collection: 'results' }
);

const Results = mongoose.model('Results', resultsSchema);

Results.discriminator('LeagueResult', leagueResultSchema);
Results.discriminator('CupResult', cupResultSchema);

exports.leagueResult = mongoose.model('LeagueResult');
exports.cupResult = mongoose.model('CupResult');
