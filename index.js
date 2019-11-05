var visit = require('unist-util-visit')
var escapeStringRegexp = require('escape-string-regexp')

module.exports = ({ markdownAST }, { replacements = {}, prefix = '%' }) => {
  // Attaches prefix to the start of the string.
  const attachPrefix = str => (prefix || '') + str

  // Removes prefix from the start of the string.
  const stripPrefix = str =>
    prefix ? str.replace(RegExp(`^${prefix}`), '') : str

  // RegExp to find any replacement keys.
  const regexp = RegExp(
    '(' +
      Object.keys(replacements)
        .map(key => escapeStringRegexp(attachPrefix(key)))
        .join('|') +
      ')',
    'g',
  )

  const replacer = (_match, name) => replacements[stripPrefix(name)]

  visit(markdownAST, ['text', 'html', 'code', 'inlineCode', 'link'], node => {
    if (node.type === 'link'){
      const processedText = node.url.replace(regexp, replacer)
      node.url = processedText
    } else {
      const processedText = node.value.replace(regexp, replacer)
      node.value = processedText
    }
  })
  
  return markdownAST
}
