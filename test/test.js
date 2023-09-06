/* global describe, it */

import assert from 'assert'
import rdf from 'rdf-ext'
import Readable from 'readable-stream'
import TripleToQuadTransform from '../index.js'

function expectError (p) {
  return new Promise((resolve, reject) => {
    Promise.resolve().then(() => {
      return p()
    }).then(() => {
      reject(new Error('no error thrown'))
    }).catch(() => {
      resolve()
    })
  })
}

describe('rdf-source-triple-to-quad', () => {
  it('should implement a Readable and Writable interface', () => {
    let tripleToQuad = new TripleToQuadTransform(rdf.namedNode('http://example.org/graph'))

    assert(tripleToQuad.readable)
    assert(tripleToQuad.writable)
  })

  it('should forward errors', () => {
    class ErrorStream extends Readable {
      _read () {
        this.emit('error', new Error('test'))
      }
    }

    let errorStream = new ErrorStream()

    let tripleToQuad = new TripleToQuadTransform(rdf.namedNode('http://example.org/graph-patched'))

    return expectError(() => {
      return rdf.dataset().import(errorStream.pipe(tripleToQuad))
    })
  })

  it('should patch graph of the quads', () => {
    let sourceDataset = rdf.dataset([
      rdf.quad(
        rdf.namedNode('http://example.org/subject'),
        rdf.namedNode('http://example.org/predicate'),
        rdf.literal('object'),
        rdf.namedNode('http://example.org/graph')
      )
    ])

    let expectedDataset = rdf.dataset([
      rdf.quad(
        rdf.namedNode('http://example.org/subject'),
        rdf.namedNode('http://example.org/predicate'),
        rdf.literal('object'),
        rdf.namedNode('http://example.org/graph-patched')
      )
    ])

    let tripleToQuad = new TripleToQuadTransform(rdf.namedNode('http://example.org/graph-patched'))

    return rdf.dataset().import(sourceDataset.toStream().pipe(tripleToQuad)).then((actualDataset) => {
      assert(expectedDataset.equals(actualDataset))
    })
  })
})
