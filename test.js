const test = require('tape')
const baseModels = require('@tradle/models').models
const ModelsPack = require('./')

test('basic', (t) => {
  const pack = ModelsPack.pack(baseModels)
  t.same(pack, ModelsPack.pack(baseModels))
  t.end()
})
