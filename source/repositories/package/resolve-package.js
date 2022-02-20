const Package = require('../../models/packages')
const createLogger = require('../../lib/logger')
const DependencyResolver = require('../../services/dependency.service')

// Cache to hold packages that were resolved
// successfully during database query. This prevents
// couple of database trips unless the server was restarted.
// const foundPackagesCache = new Map()
// const resolver = new DependencyResolver()

const recursiveResolvePkg = async (package, resolved = [], unresolved = []) => {
  unresolved.push(package)

  Object.entries(package.dependencies).map(async (dep) => {
    const hasAlreadyBeenResolved = resolved.filter(
      (pkg) => pkg.name === dep[0]
    ).length

    // When the dependency is not resolved yet.
    if (!hasAlreadyBeenResolved) {
      const _resolvedDep = await queryPackageByVersionOrLatest({
        name: dep[0],
        queriedVersion: dep[1],
      })
      await recursiveResolvePkg(_resolvedDep, resolved, unresolved)
    }
  })

  resolved.push(package)
  unresolved.splice(
    unresolved.findIndex((pkg) => pkg.name === package.name),
    1
  )
}

const resolvePackage = async (package) => {
  const log = createLogger('resolvePackage')
  // const { name, queriedVersion = 'latest' } = package

  try {
    return await queryPackageByVersionOrLatest(package)
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
