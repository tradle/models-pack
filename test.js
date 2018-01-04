const test = require('tape')
const baseModels = require('@tradle/models').models
const ModelsPack = require('./')

test('basic', (t) => {
  const pack = ModelsPack.pack({ models: baseModels })
  t.same(pack, ModelsPack.pack({ models: baseModels }))

  const customPack = ModelsPack.pack({
    models: [
      {
        id: 'com.example.A',
        type: 'tradle.Model',
        title: 'A',
        properties: {
          a: {
            type: 'string'
          }
        }
      },
      {
        id: 'com.example.B',
        type: 'tradle.Model',
        title: 'B',
        properties: {
          b: {
            type: 'string'
          }
        }
      }
    ]
  })

  t.equal(ModelsPack.getNamespace(customPack), 'com.example')
  t.equal(ModelsPack.getDomain(customPack), 'example.com')
  t.doesNotThrow(() => ModelsPack.validate(customPack))
  customPack.models.push({
    id: 'tradle.reservednamespace.A',
    type: 'tradle.Model',
    title: 'A',
    properties: {}
  })

  t.throws(() => ModelsPack.validate(customPack), /reserved/i)
  t.end()
})
