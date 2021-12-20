const messages = {
  NOT_FOUND: 'We have reached the end of (crates) warehouse but found nothing!',
  LOGIN_DONE: 'Login successful',
  SERVER_ERROR: 'Oops! Something went wrong. We are investigating the issue.',
  PACKAGE_UPLOADED: 'Package has been uploaded to the repository.',
  PACKAGE_SIZE_EXCEEDED: 'Package size has exceeded the 10MB limit.',
  REGISTRATION_DONE:
    'Registration successful, you can now login for publishing your own packages.',
  MISSING_CREDENTIALS:
    "We don't have enough information to process this request.",
  PACKAGE_FILE_TYPE:
    'Packages bundled as tarballs (.tgz) only are allowed for publishing.',
  ERR_PKG_META_PARSING:
    'There was an error parsing the package-meta.json file.',
  ERR_PKG_META_VALIDATION:
    'The `package-meta.json` does not appear to be valid.',
}

module.exports = messages
