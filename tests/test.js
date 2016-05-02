var test = require('tape')
var hyperarray = require('../index')
var hyperlog = require('hyperlog')
var level = require('levelup')
var memdown = require('memdown')

test('insert + get', function (t) {
  t.plan(12)

  var db = level('test', { db: memdown })
  var log = hyperlog(db)
  var array = hyperarray(log)

  array.insert('hello', function (err, entry) {
    t.equals(err, null)
    t.equals(entry.data, 'hello')
    t.equals(entry.id, '1')

    array.insert('world', entry.id, null, function (err, entry) {
      t.equals(err, null)
      t.equals(entry.data, 'world')
      t.equals(entry.id, '2')

      array.insert('why', null, entry.id, function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'why')
        t.equals(entry.id, '-1')

        array.insert('there', '-1', '1', function (err, entry) {
          t.equals(err, null)
          t.equals(entry.data, 'there')
          t.equals(entry.id, '-1.0')
        })
      })
    })
  })
})
