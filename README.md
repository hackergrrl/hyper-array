# hyper-array

> ordered list of values over a [hyperlog][] with random-access

## background

### hyperlog

A [hyperlog][] is a log data structure with some useful properties:

1. it can only be appended to
2. any non-append modifications can be easily detected using [merkle links][]
TODO ^^^
3. multiple independent hyperlogs can *merge*, forming causal links to each
   other
4. you can append to a log locally, even if remote logs are changing elsewhere

These properties make hyperlogs very useful in distributed programs, especially
where the provider of data is not necessarily trusted.

### hyperarray

*hyperarray* models a hyperlog as an array: an ordered list of
randomly-accessible values. It does it this by storing all array operations
(insertions and deletions) and maintaining an index of all of the current
elements, in order.

To do this in a distributed fashion, entries are given IDs like `AB.1E.7` or
`810.24` instead of zero-indexed values like a normal array. This lets
elements in the array be ordered, but relative to each other. This would be
problematic with zero-indexed arrays, since an element at position `4` would
move to position `5` if an element were inserted before it -- with relative
indices this cannot happen.

## example

```js
var hyperarray = require('hyperarray')
var memdb = require('memdb')

// create a new array, backed by a levelup instance
var array = hyperarray(memdb())

array.insert('world', function (err, elem) {
  array.insert('hello', null, elem.id, function (err, elem) {
    print()
  })
})

function print () {
  var stream = array.createReadStream()

  stream.on('data', function (elem) {
    console.log(elem)
  })
}
```

outputs

```
{ id: '1', value: 'hello' }
{ id: '2', value: 'world' }
```

## api

```js
var hyperarray = require('hyperarray')
```

### var array = hyperarray()

Returns a new hyperarray instance.

### array.insert(value, [before], [after], [cb=function (err, entry) {}])

Inserts `value` into the array, between IDs `before` and `after`. If either are
null-valued, they'll be considered to be at the front or back of the array,
respectively.

For example, `insert('foo', '1', '3', cb)` will likely produce some ID between
'1' and '3'. This *may* be '2', but not necessarily -- it only guarantees that
it is a value that sorts between `before` and `after`. This property means that
an infinite number of IDs can be inserted between any pair IDs.

Once insertion is complete, `cb` is called with `err` and `entry`.

`entry` has the form `{ id: id, value: value }`.

### array.get(id, [cb=function (err, entry) {}])

Retrieves an element from the local array by its `id`. `cb` is called with `err`
and `entry`.

### array.createReadStream()

Produces a readable object stream that outputs the entries in the array, in
order, from beginning to end.

## install

With [npm](https://npmjs.org/) installed, run

```
$ npm install hyper-array
```

## license

ISC

[hyperlog]: https://github.com/mafintosh/hyperlog
[merkle links]: https://en.wikipedia.org/wiki/Merkle_tree

