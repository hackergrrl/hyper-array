var between = require('bisecting-between')()
var hyperlog = require('hyperlog')
var SortedArray = require('sorted-array')
var through = require('through2')

function Hyperarray (db) {
  if (!(this instanceof Hyperarray)) return new Hyperarray(db)

  this.index = new SortedArray([], between.numbers.compare)

  // map of id to entry
  this.entries = {}

  this.log = hyperlog(db)

  // maintain in-memory index
  var self = this
  this.log.on('add', function (node) {
    var entry = JSON.parse(node.value)
    self.index.insert(entry.id)
    self.entries[entry.id] = entry
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
    value: elem,
    id: between(before || between.lo, after || between.hi)
  }

  var self = this
  this.log.append(JSON.stringify(entry), function (err, node) {
    if (err) return cb(err)
    cb(null, entry)
  })
}

Hyperarray.prototype.get = function (at, cb) {
  var self = this
  process.nextTick(function () {
    cb(null, self.entries[at])
  })
}

Hyperarray.prototype.createReadStream = function (opts) {
  return this.log.createReadStream(opts)
    .pipe(through.obj(function (chunk, enc, cb) {
      this.push(JSON.parse(chunk.value))
      cb()
    }))
}

module.exports = Hyperarray
