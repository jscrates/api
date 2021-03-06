const messages = require('../../lib/messages')
const { createJSONResponder } = require('../../lib/responders')
const resolvePackage = require('../../repositories/package/resolve-package')

// Cache to hold packages that were resolved successfully during database query.
// This prevents couple of database trips unless the server was restarted.
// const foundPackagesCache = new Map()

// We allow packages to be queried using the following syntaxes
//
// 1. Only package name: `bodmas`
// 2. Package name with version: `bodmas@1.0.0`
// 3. Scoped package name: `@jscrates/cli`
// 4. Scoped package name with version: `@jscrates/cli@2.0.0`
//
// The delimiter hence used to seperate the package name & version is `@`
const PACKAGE_VERSION_DELIMITER = '@'

/**
 * Splits given string at the provided index.
 *
 * Example:
 *
 * ```js
 * const packageName = '@jscrates/cli@2.0.0'
 * const normalizedPackageName = splitAtIndex(
 *  packageName,
 *  packageName.lastIndexOf('@')
 * )
 * console.log(normalizedPackageName) // ['@jscrates/cli', '2.0.0]
 * ```
 *
 * @param {string} value String to split
 * @param {number} index Index at which string will be split
 * @returns {string[]}
 */
function splitAtIndex(value, index) {
  if (typeof value !== 'string' || typeof index !== 'number') return
  return [value.substring(0, index), value.substring(index + 1)]
}

/**
 * Provided an array, it will remove all the
 * [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)
 * values in it.
 *
 * @param {unknown[]} source Array to filter.
 * @returns {unknown[]} The same array you provided but without falsy values.
 */
function removeFalsyValues(source) {
  if (!Array.isArray(source)) return
  return source.filter(Boolean)
}

/**
 *
 * Normalize package name according to the
 * [NPM naming conventions](https://github.com/npm/validate-npm-package-name#naming-rules).
 *
 * TODO: Validate package name using [this package](https://github.com/npm/validate-npm-package-name)
 * when publishing the package.
 *
 * @param {string} name Package name
 * @returns {string[0]} Array containing package name & version in that order
 */
function normalizePackageName(name) {
  if (typeof name !== 'string') return

  if (name.startsWith('@') && (name.match(/\@/g) || []).length === 1) {
    return [name]
  }

  return removeFalsyValues(
    splitAtIndex(name, name.lastIndexOf(PACKAGE_VERSION_DELIMITER))
  )
}

async function retrievePackage(req, res) {
  const respond = createJSONResponder(res)

  try {
    const { packages } = req.body

    if (!packages) {
      return respond(400, {
        error: messages.MISSING_CREDENTIALS,
      })
    }

    console.group('Getting packages')
    console.time('Normalizing')

    const _deDupedPackages = [...new Set(packages)]
    const _queriedPackages = _deDupedPackages
      .map(normalizePackageName)
      .map((package, idx) => ({
        name: package[0],
        queriedVersion: package[1],
        originalQuery: _deDupedPackages[idx],
      }))

    console.timeEnd('Normalizing')
    console.time('Querying')

    const _resolvedQueriedPackages = await Promise.all(
      _queriedPackages.map(resolvePackage)
    )

    console.timeEnd('Querying')
    console.time('Building response')

    const _queriedPackageErrors = []
    const _queriedPackagesFound = []

    _resolvedQueriedPackages.map((package) => {
      const { name, isFound } = package

      if (!isFound) {
        return _queriedPackageErrors.push(package?.error)
      }

      return _queriedPackagesFound.push({
        name,
        dist: package?.dist,
        dependencies: package?.dependencies,
      })
    })

    if (!_queriedPackagesFound?.length) {
      return respond(400, {
        errors: _queriedPackageErrors,
      })
    }

    console.timeEnd('Building response')
    console.groupEnd('Getting packages')

    return respond(200, {
      data: _queriedPackagesFound,
      errors: _queriedPackageErrors,
    })
  } catch (error) {
    console.error(error)
    return respond(500, {
      error: messages.SERVER_ERROR,
    })
  }
}

module.exports = retrievePackage
