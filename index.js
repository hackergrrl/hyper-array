var between = require('bisecting-between')()
var indexer = require('hyperlog-index')
var hyperlog = require('hyperlog')
var SortedArray = require('sorted-array')

function Hyperarray (db) {
  if (!(this instanceof Hyperarray)) return new Hyperarray(db)

  this.index = new SortedArray([], function (a, b) {
    return between.numbers.compare(a.id, b.id)
  })

  // map of id to entry
  // this.

  this.log = hyperlog(db)

  var self = this
  var dex = indexer({
    log: this.log,
    db: this.idb,
    map: function (row, next) {
      var entry = JSON.parse(row.value)
      // console.log('row', row)
      // console.log('entry', entry)
      self.index.insert(entry)
      // console.log('array', self.index.array)
      next()
    }
  })
}

Hyperarray.prototype.insert = function (elem, before, after, cb) {
  if (typeof before === 'function') {
    cb = before
    before = between.lo
    after = between.hi
  } else if (typeof before === 'function') {
    cb = before
    after = between.hi
  }

  var entry = {
    data: elem,
    id: between(before || between.lo, after || between.hi)
  }

  this.log.append(JSON.stringify(entry), function (err, node) {
    if (err) return cb(err)

    cb(null, entry)
  })
}

Hyperarray.prototype.get = function (at, cb) {
  // log.get(
}

module.exports = Hyperarray
