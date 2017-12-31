const test = require('tape')
const baseModels = require('@tradle/models').models
const ModelsPack = require('./')

test('basic', (t) => {
  const pack = ModelsPack.pack(baseModels)
  t.same(pack, ModelsPack.pack(baseModels))

  const customPack = ModelsPack.pack([
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
  ])

  t.equal(ModelsPack.getNamespace(customPack), 'com.example')
  t.equal(ModelsPack.getDomain(customPack), 'example.com')
  t.doesNotThrow(() => ModelsPack.validate(customPack))
  t.end()
})
