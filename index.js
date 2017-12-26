const crypto = require('crypto')
const stableStringify = require('json-stable-stringify')
const baseModels = require('@tradle/models').models
const buildResource = require('@tradle/build-resource')
const modelsPackModel = baseModels['tradle.ModelsPack']

const toModelsPack = (models) => {
  models = toSortedArray(models)
  const versionId = sha256(models)
  return buildResource({
    models: baseModels,
    model: modelsPackModel,
    resource: {
      models,
      versionId
    }
  })
  .toJSON()
}

const toSortedArray = (models) => {
  if (Array.isArray(models)) {
    return models
      .sort(compareAlphabetical)
      .map(id => models[id])
  }

  return Object.keys(models)
    .sort(compareAlphabetical)
    .map(id => models[id])
}

const compareAlphabetical = (a, b) => {
  if (a.id) a = a.id
  if (b.id) b = b.id
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

const getModelsVersionId = (models) => {
  return toModelsPack(models).versionId
}

const sha256 = (obj) => {
  return crypto.createHash('sha256')
    .update(stableStringify(obj))
    .digest('hex')
    .slice(0, 8)
}

exports.versionId = getModelsVersionId
exports.pack = toModelsPack
