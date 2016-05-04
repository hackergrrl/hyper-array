var async = require('async')
var test = require('tape')
var hyperarray = require('../index')
var level = require('levelup')
var memdb = require('memdb')
var SortedArray = require('sorted-array')
var between = require('bisecting-between')()
var through = require('through')

test('insert', function (t) {
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
      array.insert('there, ', '-1', '1', function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'there, ')
        t.equals(entry.id, '-1.0')
        cb()
      })
    },

    function (cb) {
      var expected = [ '-1', '-1.0', '1', '2' ]
      t.deepEquals(array.index.array, expected)
      cb()
    },

    function (err, results) {
      t.end()
    }
  ])
})

test('get', function (t) {
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
      array.insert('oh!', null, '1', function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'oh!')
        t.equals(entry.id, '-1')
        cb()
      })
    },

    function (cb) {
      array.get('1', function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'hello')
        t.equals(entry.id, '1')
        cb()
      })
    },

    function (cb) {
      array.get('-1', function (err, entry) {
        t.equals(err, null)
        t.equals(entry.data, 'oh!')
        t.equals(entry.id, '-1')
        cb()
      })
    },

    function (err, results) {
      t.end()
    }
  ])
})

test('many entries', function (t) {
  t.plan(5)

  var array = hyperarray(memdb())

  insert(0, 25)

  function insert (times, max) {
    if (times >= max) {
      t.ok(true)
      return check22()
    }

    var before = (!times ? null : ''+times)
    array.insert('entry #' + (times+1), before, null, function (err, entry) {
      if (err) {
        t.fail('unexpected err:', err)
      }
      times++
      insert(times, max)
    })
  }

  function check22 () {
    array.get('22', function (err, entry) {
      t.equals(err, null)
      t.equals(entry.data, 'entry #22')
      t.equals(entry.id, '22')

      checkReadStream()
    })
  }

  function checkReadStream () {
    var num = 1
    array.createReadStream().pipe(through(function (chunk, enc, cb) {
      num++
      if (num === 25) {
        t.ok(true)
      }
    }))
  }
})
