var between = require('bisecting-between')()

function Hyperarray (log) {
  if (!(this instanceof Hyperarray)) return new Hyperarray(log)

  this.log = log
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
