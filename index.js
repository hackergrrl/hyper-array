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

  this.log.on('add', function (node) {
    var entry = JSON.parse(node.value)
    self.index.insert(entry)
  })

  var self = this
  this.dex = indexer({
    log: this.log,
    db: db,
    map: function (row, next) {
      var entry = JSON.parse(row.value)
      // console.log('row', row)
      // console.log('entry', entry)
      // self.index.insert(entry)
      console.log('index updated', entry.id)
      // console.log('array', self.index.array)
      next()
    }
  })

  this.dex.ready(function () { console.log('r') })
  // this.dex.on('_ready', function () { console.log('r') })
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

  var self = this
  self.dex.once('_ready', function () {
    console.log('rr')
    if (cb) cb(null, entry)
  })
  this.log.append(JSON.stringify(entry), function (err, node) {
    if (err) return cb(err)

    // self.dex.once('_ready', function () {
    //   console.log('rr')
    //   if (cb) cb(null, entry)
    // })
  })
}

Hyperarray.prototype.get = function (at, cb) {
  // log.get(
}

module.exports = Hyperarray
