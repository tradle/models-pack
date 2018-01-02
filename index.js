const crypto = require('crypto')
const stableStringify = require('json-stable-stringify')
const { TYPE } = require('@tradle/constants')
const baseModels = require('@tradle/models').models
const buildResource = require('@tradle/build-resource')
const validateResource = require('@tradle/validate-resource')
const modelsPackModel = baseModels['tradle.ModelsPack']
const RESERVED_NAMESPACES = [
  'tradle.'
]

const isReservedNamespace = namespace => {
  return RESERVED_NAMESPACES.some(reserved => namespace.startsWith(reserved))
}

const toModelsPack = (models) => {
  models = toSortedArray(models)
  const versionId = sha256(models)
  return buildResource({
    models: baseModels,
    model: modelsPackModel,
    resource: {
      models,
      versionId,
      namespace: getNamespace(models[0])
    }
  })
  .toJSON()
}

const toSortedArray = (models) => {
  if (Array.isArray(models)) {
    return models.sort(compareAlphabetical)
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

const validateModelsPack = pack => {
  validateResource({
    models: baseModels,
    resource: pack
  })

  const { models } = pack
  let namespace
  for (const model of models) {
    const mNamespace = getNamespace(model.id)
    if (isReservedNamespace(mNamespace)) {
      throw new Error(`namespace ${mNamespace} is reserved`)
    }

    if (!namespace) {
      namespace = mNamespace
    }

    assert(
      mNamespace === namespace,
      'expected namespace to be the same for all models in the pack'
    )
  }
}

const getNamespace = obj => {
  if (typeof obj === 'string') {
    return obj.slice(0, obj.lastIndexOf('.'))
  }

  const id = obj[TYPE]
  if (id !== modelsPackModel.id) {
    return id ? getNamespace(id) : getNamespace(obj.id)
  }

  return getNamespace(obj.models[0].id)
}

const getDomain = obj => {
  return getNamespace(obj)
    .split('.')
    .reverse()
    .join('.')
}

const assert = (statement, message) => {
  if (!statement) throw new Error(message || 'assertion failed')
}

exports.versionId = getModelsVersionId
exports.pack = toModelsPack
exports.validate = validateModelsPack
exports.getDomain = getDomain
exports.getNamespace = getNamespace
exports.isReservedNamespace = isReservedNamespace
