const rdf = require('rdf-data-model')
const FilterStream = require('rdf-filter-stream')
const Transform = require('readable-stream').Transform

class SourceTripleToQuad extends Transform {
  constructor (graph, options) {
    super()

    options = options || {}

    this._writableState.objectMode = true
    this._readableState.objectMode = true

    this.factory = options.factory || rdf
    this.graph = graph || rdf.defaultGraph()

    this.on('pipe', (input) => {
      input.on('error', (err) => {
        this.emit('error', err)
      })
    })
  }

  _transform (quad, encoding, done) {
    this.push(this.factory.quad(quad.subject, quad.predicate, quad.object, this.graph))

    done()
  }

  match (subject, predicate, object, graph) {
    return new FilterStream(this, subject, predicate, object, graph)
  }
}

module.exports = SourceTripleToQuad
