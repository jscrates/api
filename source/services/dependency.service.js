// @ts-check

/**
 * Data class representing an unit package (or service).
 * We only need to bother about its `dependencies`.
 *
 * TODO: We also might need to include `devDependencies`.
 */
class DependencyService {
  /**
   * @param {String} name
   */
  constructor(name) {
    this.name = name
    this.dependencies = []
  }
}

class DependencyResolver {
  static ROOT_SERVICE_NAME = '$root$'

  constructor() {
    // Map holding packages (or services) added to
    // the resolver instance.
    this.services = {}
  }

  /**
   * Add a package (or service) to the list.
   *
   * Example:
   * ```js
   * const resolver = new DependencyResolver()
   *
   * resolver.add('package-a')
   * resolver.add('package-b')
   * ```
   *
   * @param {String} name
   */
  add = (name) => {
    this._addAndGet(name)
  }

  /**
   * Creates a `DependencyService` if it doesn't already exist.
   *
   * @param {String} serviceName
   */
  _addAndGet = (serviceName) => {
    const _existingService = this.services[serviceName]

    if (_existingService) {
      return _existingService
    }

    this.services[serviceName] = new DependencyService(serviceName)

    // To avoid circular dependency of root service, we add the
    // ROOT_SERVICE_NAME as a dependency.
    if (serviceName !== DependencyResolver.ROOT_SERVICE_NAME) {
      this.setDependency(DependencyResolver.ROOT_SERVICE_NAME, serviceName)
    }

    return this.services[serviceName]
  }

  /**
   * Adds provided [dependencyName] as dependency for the [serviceName].
   *
   * @param {String} serviceName
   * @param {String} dependencyName
   */
  setDependency = (serviceName, dependencyName) => {
    const _service = this._addAndGet(serviceName)
    const _dependency = this._addAndGet(dependencyName)
    _service.dependencies.push(_dependency)
  }

  /**
   * Add multiple [dependencies] to [serviceName].
   *
   * @param {String} serviceName
   * @param {String[]} dependencies
   */
  setDependencies = (serviceName, dependencies) => {
    const _service = this._addAndGet(serviceName)

    dependencies.forEach((dep) => {
      const _dependency = this._addAndGet(dep)
      _service.dependencies.push(_dependency)
    })
  }

  /**
   * Recursively resolves dependencies for the given service.
   *
   * @param {String} serviceName
   */
  resolve(serviceName) {
    const _resolved = []
    const _unresolved = []
    const _service = this.services[serviceName]

    if (!_service) {
      throw new Error(`[Dependency Service]: ${serviceName} does not exist.`)
    }

    this._recursiveResolve(_service, _resolved, _unresolved)
    return _resolved.map((service) => service.name)
  }

  /**
   * Loop through service and resolve all the dependencies recursively.
   *
   * @param {DependencyService} service
   * @param {DependencyService[]} resolved
   * @param {DependencyService[]} unresolved
   */
  _recursiveResolve = (service, resolved, unresolved) => {
    unresolved.push(service)

    service.dependencies.forEach((dep) => {
      if (resolved.indexOf(dep) === -1) {
        if (unresolved.indexOf(dep) !== -1) {
          throw new Error(
            `Circular reference detected! ${service.name} → ${dep.name}`
          )
        }

        this._recursiveResolve(dep, resolved, unresolved)
      }
    })

    resolved.push(service)
    unresolved.splice(unresolved.indexOf(service), 1)
  }
}

function main() {
  const resolver = new DependencyResolver()

  resolver.add('@jscrates/factorial')
  resolver.add('@jscrates/math')
  resolver.add('@jscrates/binary-search')
  resolver.add('@jscrates/pig-latin')

  resolver.setDependency('@jscrates/factorial', '@jscrates/math')
  resolver.setDependency('@jscrates/binary-search', '@jscrates/math')
  resolver.setDependency('@jscrates/pig-latin', '@jscrates/math')
  resolver.setDependency('@jscrates/math', '@jscrates/math-primitives')

  console.log(resolver.resolve('@jscrates/binary-search'))
}

module.exports = DependencyResolver
