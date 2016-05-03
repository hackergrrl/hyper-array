var async = require('async')
var test = require('tape')
var hyperarray = require('../index')
var level = require('levelup')
var memdb = require('memdb')
var SortedArray = require('sorted-array')
var between = require('bisecting-between')()

test('insert + get', function (t) {
  var array = hyperarray(memdb())

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
