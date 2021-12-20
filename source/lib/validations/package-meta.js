const axios = require('axios').default
const Validator = require('jsonschema').Validator

let jsonSchema
const schema = new Validator()

const JSON_SCHEMA_URL = process.env.JSON_SCHEMA_URL

async function fetchPackageMetaSchema() {
  try {
    if (jsonSchema) {
      return jsonSchema
    }
    const { data } = await axios.get(JSON_SCHEMA_URL)
    jsonSchema = data
  } catch (error) {
    jsonSchema = false
  }
}

async function validatePackageMetaSchema(meta) {
  await fetchPackageMetaSchema()
  if (!jsonSchema) return false
  return schema.validate(meta, jsonSchema).valid
}

module.exports = validatePackageMetaSchema
