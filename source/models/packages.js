const mongoose = require('mongoose')
const Schema = mongoose.Schema

const packageSchema = new mongoose.Schema({
  name: {
    type: Schema.Types.String,
    unique: true,
    required: true,
  },
  author: {
    type: Schema.Types.String,
    required: true,
  },
  versions: [
    {
      version: {
        type: Schema.Types.String,
        required: true,
      },
      tarball: {
        type: Schema.Types.String,
        required: true,
      },
    },
  ],
  dependencies: Schema.Types.Mixed,
})

module.exports = mongoose.model('Package', packageSchema)
