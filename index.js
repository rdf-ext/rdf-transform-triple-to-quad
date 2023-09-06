import rdf from '@rdfjs/data-model'
import { Transform } from 'readable-stream'

class TripleToQuadTransform extends Transform {
  constructor (graph, options) {
    super()

    options = options || {}

    this._writableState.objectMode = true
    this._readableState.objectMode = true

    this.factory = options.factory || rdf
    this.graph = graph || this.factory.defaultGraph()

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
}

export default TripleToQuadTransform
