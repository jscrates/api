const expect = require('chai').expect
const DependencyResolver = require('../source/services/dependency.service')

const resolver = new DependencyResolver()

resolver.add('@jscrates/math@1.0.0')
resolver.add('@jscrates/math@2.0.0')

resolver.add('@jscrates/math-primitives@1.0.0')
resolver.add('@jscrates/math-primitives@1.1.0')

resolver.add('@jscrates/physics@1.0.0')
resolver.add('@jscrates/unit-conversion@1.0.0')
resolver.add('@jscrates/binary-search@1.0.0')
resolver.add('@jscrates/random-number@1.0.0')
resolver.add('@jscrates/factorial@1.0.0')
resolver.add('@jscrates/pig-latin@1.0.0')
resolver.add('@jscrates/formulae@1.0.0')

resolver.setDependency(
  '@jscrates/math@1.0.0',
  '@jscrates/math-primitives@1.0.0'
)
resolver.setDependency(
  '@jscrates/math@2.0.0',
  '@jscrates/math-primitives@1.1.0'
)

resolver.setDependency('@jscrates/binary-search@1.0.0', '@jscrates/math@2.0.0')
resolver.setDependency('@jscrates/random-number@1.0.0', '@jscrates/math@2.0.0')
resolver.setDependency(
  '@jscrates/unit-conversion@1.0.0',
  '@jscrates/math@1.0.0'
)
resolver.setDependencies('@jscrates/factorial@1.0.0', [
  '@jscrates/formulae@1.0.0',
  '@jscrates/math-primitives@1.1.0',
])

describe('Dependency resolver test suite', () => {
  it('should resolve simple dependency tree.', () => {
    const deps = resolver.resolve('@jscrates/random-number@1.0.0')

    expect(deps).to.include.members([
      '@jscrates/math@2.0.0',
      '@jscrates/math-primitives@1.1.0',
    ])
  })

  it('should resolve complex dependency tree.', () => {
    const _basePkg = '@jscrates/mashup@0.0.1'

    resolver.add(_basePkg)

    resolver.setDependencies(_basePkg, [
      '@jscrates/math@1.0.0',
      '@jscrates/binary-search@1.0.0',
      '@jscrates/pig-latin@1.0.0',
      '@jscrates/unit-conversion@1.0.0',
      '@jscrates/formulae@1.0.0',
    ])

    const deps = resolver.resolve(_basePkg)

    expect(deps).to.include.members([
      '@jscrates/math-primitives@1.0.0',
      '@jscrates/math@1.0.0',
      '@jscrates/math-primitives@1.1.0',
      '@jscrates/math@2.0.0',
      '@jscrates/binary-search@1.0.0',
      '@jscrates/pig-latin@1.0.0',
      '@jscrates/unit-conversion@1.0.0',
      '@jscrates/formulae@1.0.0',
      '@jscrates/mashup@0.0.1',
    ])
  })
})
