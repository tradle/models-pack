const crypto = require('crypto')
const stableStringify = require('json-stable-stringify')
const { TYPE } = require('@tradle/constants')
const baseModels = require('@tradle/models').models
const Lens = require('@tradle/lens')
const validateResource = require('@tradle/validate-resource')
const modelsPackModel = baseModels['tradle.ModelsPack']
const RESERVED_NAMESPACES = [
  'tradle',
  'tradle.'
]

const isEmpty = obj => !obj || Object.keys(obj).length === 0

const isReservedNamespace = namespace => {
  return RESERVED_NAMESPACES.some(reserved => namespace.startsWith(reserved))
}

const toModelsPack = ({ models, lenses, namespace }) => {
  const pack = {
    [TYPE]: modelsPackModel.id
  }

  if (!isEmpty(models)) pack.models = toSortedArray(models)
  if (!isEmpty(lenses)) pack.lenses = toSortedArray(lenses)
  if (namespace) pack.namespace = namespace

  pack.versionId = sha256(pack)
  return pack
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

const getModelsVersionId = (opts) => toModelsPack(opts).versionId

const sha256 = obj => {
  return crypto.createHash('sha256')
    .update(stableStringify(obj))
    .digest('hex')
    .slice(0, 8)
}

const validateModelsPack = ({
  builtInModels=baseModels,
  modelsPack
}) => {
  validateResource({
    models: builtInModels,
    resource: modelsPack
  })

  const { models=[], lenses=[], namespace } = modelsPack
  for (const model of models) {
    const mNamespace = getNamespace(model.id)
    validateNamespace({
      expected: namespace,
      actual: mNamespace
    })
  }

  for (const lens of lenses) {
    validateNamespace({
      expected: namespace,
      actual: getNamespace(lens.id)
    })

    Lens.validate({
      models: builtInModels,
      lens
    })
  }
}

const validateNamespace = ({ expected, actual }) => {
  if (actual && isReservedNamespace(actual)) {
    throw new Error(`namespace ${actual} is reserved`)
  }

  if (expected) {
    assert(
      actual.startsWith(expected),
      `expected all models to have namespace ${expected}`
    )
  }
}

const getNamespace = obj => {
  if (typeof obj === 'string') {
    return obj.slice(0, obj.lastIndexOf('.'))
  }

  const id = obj[TYPE]
  if (id === modelsPackModel.id) {
    return obj.namespace || getNamespace(obj.models[0].id)
  }

  return id ? getNamespace(id) : getNamespace(obj.id)
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
