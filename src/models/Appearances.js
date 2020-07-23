const mongoose = require('mongoose');

const { Schema } = mongoose;

const baseOptions = {
  discriminatorKey: 'appearanceType',
  collection: 'Appearance',
};

const appearanceSchema = new Schema(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    starter: {
      type: Boolean,
      default: false,
    },
    substitute: {
      type: Boolean,
      default: false,
    },
    goalsScored: {
      type: Number,
      default: 0,
    },
    assists: {
      type: Number,
      default: 0,
    },
    yellowCard: {
      type: Boolean,
      default: false,
    },
    redCard: {
      type: Boolean,
      default: false,
    },
    penaltyScored: {
      type: Number,
      default: 0,
    },
    penaltyMissed: {
      type: Number,
      default: 0,
    },
    penaltyConceded: {
      type: Number,
      default: 0,
    },
    manOfTheMatch: {
      type: Boolean,
      default: false,
    },
  },
  baseOptions
);

const leagueAppearanceSchema = new Schema(
  {
    resultId: {
      type: Schema.Types.ObjectId,
      ref: 'LeagueResults',
    },
  },
  { collection: 'Appearance' }
);

const cupAppearanceSchema = new Schema(
  {
    resultId: {
      type: Schema.Types.ObjectId,
      ref: 'CupResults',
    },
  },
  { collection: 'Appearance' }
);

const Appearance = mongoose.model('Appearance', appearanceSchema);
Appearance.discriminator('LeagueAppearance', leagueAppearanceSchema);
Appearance.discriminator('CupAppearance', cupAppearanceSchema);

exports.appearance = mongoose.model('Appearance');
exports.leagueAppearance = mongoose.model('LeagueAppearance');
exports.cupAppearance = mongoose.model('CupAppearance');
