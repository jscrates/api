const Package = require('../../models/packages')
const createLogger = require('../../lib/logger')
const DependencyResolver = require('../../services/dependency.service')

// Cache to hold packages that were resolved
// successfully during database query. This prevents
// couple of database trips unless the server was restarted.
const foundPackagesCache = new Map()
const resolver = new DependencyResolver()

class PackageModel {
  constructor(name, queriedVersion, originalQuery) {
    this.name = name
    this.queriedVersion = queriedVersion
    this.originalQuery = originalQuery
  }
}

const resolvePackage = async (package) => {
  const log = createLogger('resolvePackage')
  const { name, queriedVersion = 'latest' } = package

  try {
    const cacheKey = `${name}@${queriedVersion}`

    resolver.add(cacheKey)

    if (foundPackagesCache.has(cacheKey)) {
      log(`${cacheKey} found in cache.`)
      return Promise.resolve(foundPackagesCache.get(cacheKey))
    }

    const resolvedPackage = await queryPackageByVersionOrLatest(package)

    // if (resolvedPackage.dependencies) {
    //   const resolveDeps = Object.entries(resolvedPackage.dependencies).map(
    //     async (dep) => {
    //       return await queryPackageByVersionOrLatest(
    //         new PackageModel(dep[0], dep[1], dep.join('@'))
    //       )
    //     }
    //   )

    //   const resolvedDeps = await Promise.all(resolveDeps)

    //   console.log({ ...resolvedPackage, deps: resolvedDeps })
    // }

    // Only packages resolved successfully can be safely
    // added to cache due to the fact that they won't be
    // changing unless a new version is published.
    if (resolvedPackage.isFound) {
      foundPackagesCache.set(cacheKey, resolvedPackage)
    }

    return resolvedPackage
  } catch (error) {
    log(error)
    return error
  }
}

const queryPackageByVersionOrLatest = async (package) => {
  const log = createLogger('queryPackageByVersionOrLatest')
  const { name, queriedVersion } = package
  const response = {
    name,
    queriedVersion,
    isFound: false,
  }

  try {
    const queryResult = await Package.aggregate([
      {
        $match: {
          name,
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          latest: 1,
          dependencies: 1,
          version: {
            $filter: {
              input: '$versions',
              as: 'version',
              cond: {
                $eq: ['$$version.version', queriedVersion || '$latest'],
              },
            },
          },
        },
      },
    ])

    if (!queryResult?.length) {
      return {
        ...response,
        error: `The package \`${name}\` does not exist.`,
      }
    }

    if (!queryResult[0]?.version?.length) {
      return {
        ...response,
        error: `The package \`${name}\` with version \`${queriedVersion}\` does not exist.`,
      }
    }

    return {
      ...response,
      isFound: true,
      dist: queryResult[0]?.version[0],
      dependencies: queryResult[0]?.dependencies ?? {},
    }
  } catch (error) {
    log(error)
    throw new Error({
      ...response,
      error: `Unable to resolve ${name}.`,
    })
  }
}

module.exports = resolvePackage
