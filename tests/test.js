var async = require('async')
var test = require('tape')
var hyperarray = require('../index')
var level = require('levelup')
var memdown = require('memdown')
var SortedArray = require('sorted-array')
var between = require('bisecting-between')()

test('sorted entries', function (t) {
  var index = new SortedArray([], between.numbers.compare)

  index.insert('0')
  index.insert('-1.0')
  index.insert('1')
  index.insert('-1')
  index.insert('-1.01')

  t.deepEquals(index.array, ['-1', '-1.0', '-1.01', '0', '1'])
  t.end()
})

test('insert + get', function (t) {
  var db = level('test', { db: memdown })
  var array = hyperarray(db)

  async.series([
    function (cb) {
      array.insert('hello', function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'hello')
        t.equals(entry.id, '1')
        cb()
      })
    },

    function (cb) {
      array.insert('world', '1', null, function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'world')
        t.equals(entry.id, '2')
        cb()
      })
    },

    function (cb) {
      array.insert('why', null, '2', function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'why')
        t.equals(entry.id, '-1')
        cb()
      })
    },

    function (cb) {
      array.insert('there', '-1', '1', function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'there')
        t.equals(entry.id, '-1.0')
        cb()
      })
    },

    function (cb) {
      var expected = [
        { data: 'why', id: '-1' },
        { data: 'hello', id: '1' },
        { data: 'world', id: '2' }
      ]
      t.deepEquals(array.index.array, expected)
      cb()
    },

    function (err, results) {
      t.end()
    }
  ])
})
