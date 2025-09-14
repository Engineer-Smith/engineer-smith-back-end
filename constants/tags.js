// ==========================================
// /constants/tags.js - Dual format: enum array + language-organized tags
// ==========================================

/**
 * Flat array of ALL valid tags for Mongoose enum validation
 * This is what gets used in Test.js schema: enum: VALID_TAGS
 */
const VALID_TAGS = [
  // Core languages
  'html', 'css', 'javascript', 'typescript', 'python', 'sql', 'dart', 'json',

  // Frameworks & libraries  
  'react', 'react-native', 'flutter', 'express', 'nodejs',

  // HTML specific
  'semantic-elements', 'structure', 'forms', 'accessibility', 'lists', 'tables',
  'links', 'meta-tags', 'media', 'video', 'audio', 'elements', 'canvas', 'graphics',
  'doctype', 'storage', 'validation', 'microdata', 'structured-data', 'web-components',
  'viewport', 'aria', 'geolocation', 'apis', 'performance', 'rendering', 'syntax',
  'nesting', 'comments', 'attributes', 'ids', 'whitespace', 'parsing',
  'browser-compatibility', 'scripts', 'encoding', 'history-api', 'spa', 'web-workers',
  'input-types', 'dom', 'interactive',

  // CSS specific
  'selectors', 'properties', 'values', 'box-model', 'layout', 'positioning',
  'flexbox', 'grid', 'responsive-design', 'media-queries', 'animations', 'transitions',
  'transforms', 'pseudo-classes', 'pseudo-elements', 'units', 'colors', 'typography',
  'backgrounds', 'borders', 'shadows', 'gradients', 'variables', 'custom-properties',
  'preprocessors', 'sass', 'scss', 'less', 'stylus',

  // JavaScript specific
  'variables', 'data-types', 'operators', 'conditionals', 'loops', 'functions',
  'arrays', 'objects', 'strings', 'numbers', 'booleans', 'null-undefined', 'scope',
  'hoisting', 'closures', 'this-keyword', 'prototypes', 'inheritance', 'classes',
  'modules', 'imports-exports', 'destructuring', 'spread-operator', 'rest-parameters',
  'template-literals', 'arrow-functions', 'callbacks', 'promises', 'async-await',
  'async-programming', 'events', 'event-handling', 'dom-manipulation', 'json-handling',
  'regex', 'error-handling', 'try-catch', 'debugging', 'testing', 'es6', 'es2015+',

  // React specific
  'components', 'jsx', 'props', 'state', 'hooks', 'useState', 'useEffect', 'useContext',
  'useReducer', 'useMemo', 'useCallback', 'custom-hooks', 'lifecycle-methods',
  'event-handling-react', 'conditional-rendering', 'lists-keys', 'forms-controlled',
  'state-management', 'context-api', 'redux', 'react-router', 'routing', 'navigation',
  'performance-optimization', 'memo', 'virtual-dom', 'reconciliation', 'useRef',

  // React Native specific
  'native-components', 'navigation-native', 'styling-native', 'platform-specific',
  'touchables', 'gestures', 'animations-native', 'networking', 'storage-native',
  'permissions', 'device-apis', 'native-modules', 'debugging-native',

  // Python specific
  'python-syntax', 'python-data-types', 'python-variables', 'python-operators',
  'python-conditionals', 'python-loops', 'python-functions', 'python-classes',
  'python-inheritance', 'python-modules', 'python-packages', 'python-imports',
  'list-comprehensions', 'dictionary-comprehensions', 'generators', 'iterators',
  'decorators', 'context-managers', 'exception-handling', 'file-handling',
  'python-data-structures', 'lists', 'tuples', 'dictionaries', 'sets',
  'string-methods', 'lambda-functions', 'map-filter-reduce', 'oop', 'magic-methods', 'math',

  // SQL specific
  'queries', 'select-statements', 'where-clauses', 'joins', 'inner-join', 'outer-join',
  'left-join', 'right-join', 'cross-join', 'unions', 'subqueries', 'aggregates',
  'group-by', 'having', 'order-by', 'indexes', 'primary-keys', 'foreign-keys',
  'constraints', 'transactions', 'acid-properties', 'database-design', 'normalization',
  'denormalization', 'views', 'stored-procedures', 'triggers', 'functions-sql',

  // Dart specific
  'dart-syntax', 'dart-variables', 'dart-functions', 'dart-classes', 'dart-inheritance',
  'dart-mixins', 'dart-generics', 'dart-collections', 'dart-async', 'dart-streams',
  'dart-isolates', 'null-safety', 'late-variables', 'nullable-types',

  // Flutter specific
  'widgets', 'stateless-widgets', 'stateful-widgets', 'widget-tree', 'build-method',
  'state-management-flutter', 'provider', 'bloc', 'riverpod', 'getx', 'navigation-flutter',
  'routes', 'material-design', 'cupertino-design', 'layouts-flutter', 'styling-flutter',
  'animations-flutter', 'gestures-flutter', 'forms-flutter', 'networking-flutter',
  'storage-flutter', 'platform-channels', 'plugins', 'packages-flutter',

  // Express/Node.js specific
  'routing-express', 'middleware', 'request-response', 'http-methods', 'status-codes',
  'headers', 'body-parsing', 'url-parameters', 'query-parameters', 'cookies',
  'sessions', 'authentication', 'authorization', 'jwt', 'bcrypt', 'cors', 'helmet',
  'morgan', 'compression', 'rate-limiting', 'validation-express', 'error-handling-express',
  'database-integration', 'mongoose', 'sequelize', 'mongodb', 'postgresql', 'mysql', 'parameters', 'static-files',
  'patterns',

  // TypeScript specific
  'types', 'interfaces', 'type-annotations', 'type-inference', 'union-types',
  'intersection-types', 'literal-types', 'generic-types', 'mapped-types',
  'conditional-types', 'utility-types', 'type-guards', 'type-assertions',
  'decorators-ts', 'namespaces', 'modules-ts', 'declaration-files', 'tsconfig', 'enums', 'optional-properties',

  // General programming concepts
  'algorithms', 'data-structures', 'big-o-notation', 'recursion', 'sorting',
  'searching', 'hash-tables', 'linked-lists', 'stacks', 'queues', 'trees',
  'graphs', 'dynamic-programming', 'greedy-algorithms', 'divide-conquer',

  // Development concepts
  'version-control', 'git', 'debugging-general', 'testing-general', 'unit-testing',
  'integration-testing', 'tdd', 'bdd', 'code-review', 'refactoring', 'clean-code',
  'design-patterns', 'solid-principles', 'dry-principle', 'separation-concerns',

  // Web development
  'http-https', 'rest-api', 'graphql', 'websockets', 'ajax', 'fetch-api',
  'xml-http-request', 'cors-web', 'caching', 'service-workers', 'pwa',
  'web-storage', 'local-storage', 'session-storage', 'cookies-web',

  // Mobile development
  'mobile-development', 'ios-development', 'android-development', 'cross-platform',
  'responsive-mobile', 'touch-interfaces', 'mobile-performance', 'app-lifecycle',

  // Security
  'security', 'xss', 'csrf', 'sql-injection', 'input-validation', 'sanitization',
  'encryption', 'hashing', 'oauth', 'security-headers', 'https-security',

  // Performance
  'performance-web', 'optimization', 'lazy-loading', 'code-splitting', 'bundling',
  'minification', 'compression-web', 'cdn', 'image-optimization', 'critical-css',

  // JSON specific
  'json-syntax', 'json-parsing', 'json-serialization', 'json-validation',
  'json-schema', 'json-api', 'json-web-tokens',

  // UI/UX concepts
  'ui-components', 'user-interface', 'user-experience', 'accessibility-web',
  'screen-readers', 'keyboard-navigation', 'color-contrast', 'semantic-markup'
];

/**
 * Tags organized by language for frontend filtering
 * When user selects HTML language, show only these tags
 */
const TAGS_BY_LANGUAGE = {
  html: [
    'html', 'dom', 'semantic-elements', 'structure', 'forms', 'accessibility',
    'lists', 'tables', 'links', 'meta-tags', 'media', 'video', 'audio',
    'elements', 'canvas', 'graphics', 'doctype', 'storage', 'validation',
    'microdata', 'structured-data', 'web-components', 'viewport', 'aria',
    'geolocation', 'apis', 'performance', 'rendering', 'syntax', 'nesting',
    'comments', 'attributes', 'ids', 'whitespace', 'parsing', 'browser-compatibility',
    'scripts', 'encoding', 'history-api', 'spa', 'web-workers', 'input-types', 'interactive'
  ],

  css: [
    'css', 'selectors', 'properties', 'values', 'box-model', 'layout', 'positioning',
    'flexbox', 'grid', 'responsive-design', 'media-queries', 'animations', 'transitions',
    'transforms', 'pseudo-classes', 'pseudo-elements', 'units', 'colors', 'typography',
    'backgrounds', 'borders', 'shadows', 'gradients', 'variables', 'custom-properties',
    'preprocessors', 'sass', 'scss', 'less', 'stylus'
  ],

  javascript: [
    'javascript', 'variables', 'data-types', 'operators', 'conditionals', 'loops',
    'functions', 'arrays', 'objects', 'strings', 'numbers', 'booleans', 'null-undefined',
    'scope', 'hoisting', 'closures', 'this-keyword', 'prototypes', 'inheritance', 'classes',
    'modules', 'imports-exports', 'destructuring', 'spread-operator', 'rest-parameters',
    'template-literals', 'arrow-functions', 'callbacks', 'promises', 'async-await',
    'async-programming', 'events', 'event-handling', 'dom-manipulation', 'json-handling',
    'regex', 'error-handling', 'try-catch', 'debugging', 'testing', 'es6', 'es2015+',
    'algorithms', 'data-structures'
  ],

  typescript: [
    'typescript', 'javascript', 'types', 'interfaces', 'type-annotations', 'type-inference',
    'union-types', 'intersection-types', 'literal-types', 'generic-types', 'mapped-types',
    'conditional-types', 'utility-types', 'type-guards', 'type-assertions', 'decorators-ts',
    'namespaces', 'modules-ts', 'declaration-files', 'tsconfig', 'variables', 'functions',
    'classes', 'async-programming', 'error-handling', 'enums', 'optional-properties'
  ],

  react: [
    'react', 'javascript', 'components', 'jsx', 'props', 'state', 'hooks', 'useState',
    'useEffect', 'useContext', 'useReducer', 'useMemo', 'useCallback', 'custom-hooks',
    'lifecycle-methods', 'event-handling-react', 'conditional-rendering', 'lists-keys',
    'forms-controlled', 'state-management', 'context-api', 'redux', 'react-router',
    'routing', 'navigation', 'performance-optimization', 'memo', 'virtual-dom', 'reconciliation',
    'ui-components', 'testing', 'useRef'
  ],

  'react-native': [
    'react-native', 'react', 'javascript', 'native-components', 'navigation-native',
    'styling-native', 'platform-specific', 'touchables', 'gestures', 'animations-native',
    'networking', 'storage-native', 'permissions', 'device-apis', 'native-modules',
    'debugging-native', 'mobile-development', 'ios-development', 'android-development',
    'cross-platform'
  ],

  flutter: [
    'flutter', 'dart', 'widgets', 'stateless-widgets', 'stateful-widgets', 'widget-tree',
    'build-method', 'state-management-flutter', 'provider', 'bloc', 'riverpod', 'getx',
    'navigation-flutter', 'routes', 'material-design', 'cupertino-design', 'layouts-flutter',
    'styling-flutter', 'animations-flutter', 'gestures-flutter', 'forms-flutter',
    'networking-flutter', 'storage-flutter', 'platform-channels', 'plugins', 'packages-flutter',
    'mobile-development'
  ],

  dart: [
    'dart', 'dart-syntax', 'dart-variables', 'dart-functions', 'dart-classes', 'dart-inheritance',
    'dart-mixins', 'dart-generics', 'dart-collections', 'dart-async', 'dart-streams',
    'dart-isolates', 'null-safety', 'late-variables', 'nullable-types', 'variables',
    'functions', 'classes', 'async-programming', 'error-handling', 'algorithms', 'data-structures'
  ],

  python: [
    'python', 'python-syntax', 'python-data-types', 'python-variables', 'python-operators',
    'python-conditionals', 'python-loops', 'python-functions', 'python-classes', 'python-inheritance',
    'python-modules', 'python-packages', 'python-imports', 'list-comprehensions', 'dictionary-comprehensions',
    'generators', 'iterators', 'decorators', 'context-managers', 'exception-handling', 'file-handling',
    'python-data-structures', 'lists', 'tuples', 'dictionaries', 'sets', 'string-methods',
    'lambda-functions', 'map-filter-reduce', 'oop', 'magic-methods', 'algorithms', 'data-structures',
    'variables', 'functions', 'classes', 'loops', 'conditionals', 'math'
  ],

  sql: [
    'sql', 'queries', 'select-statements', 'where-clauses', 'joins', 'inner-join', 'outer-join',
    'left-join', 'right-join', 'cross-join', 'unions', 'subqueries', 'aggregates', 'group-by',
    'having', 'order-by', 'indexes', 'primary-keys', 'foreign-keys', 'constraints', 'transactions',
    'acid-properties', 'database-design', 'normalization', 'denormalization', 'views',
    'stored-procedures', 'triggers', 'functions-sql', 'data-structures'
  ],

  express: [
    'express', 'nodejs', 'javascript', 'routing-express', 'middleware', 'request-response',
    'http-methods', 'status-codes', 'headers', 'body-parsing', 'url-parameters', 'query-parameters',
    'cookies', 'sessions', 'authentication', 'authorization', 'jwt', 'bcrypt', 'cors', 'helmet',
    'morgan', 'compression', 'rate-limiting', 'validation-express', 'error-handling-express',
    'database-integration', 'mongoose', 'sequelize', 'mongodb', 'postgresql', 'mysql', 'rest-api', 'parameters', 'static-files',
    'patterns'
  ],

  json: [
    'json', 'json-syntax', 'json-parsing', 'json-serialization', 'json-validation',
    'json-schema', 'json-api', 'json-web-tokens', 'data-structures'
  ]
};

/**
 * Tag metadata for display purposes (optional, for UI)
 */
const TAG_METADATA = {
  'html': { label: 'HTML', description: 'HyperText Markup Language', color: '#E34F26' },
  'css': { label: 'CSS', description: 'Cascading Style Sheets', color: '#1572B6' },
  'javascript': { label: 'JavaScript', description: 'JavaScript programming language', color: '#F7DF1E' },
  'semantic-elements': { label: 'Semantic Elements', description: 'HTML5 semantic elements' },
  'forms': { label: 'Forms', description: 'HTML form elements and validation' },
  'flexbox': { label: 'Flexbox', description: 'CSS Flexible Box Layout' },
  'arrays': { label: 'Arrays', description: 'JavaScript arrays and array methods' },
  // Add more as needed...
};

/**
 * Get tags for a specific language
 */
function getTagsForLanguage(language) {
  return TAGS_BY_LANGUAGE[language] || [];
}

/**
 * Get tags for multiple languages
 */
function getTagsForLanguages(languages) {
  const tags = new Set();
  languages.forEach(lang => {
    getTagsForLanguage(lang).forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Validate tags against all valid tags
 */
function validateTags(tags) {
  if (!Array.isArray(tags)) {
    throw new Error('Tags must be an array');
  }
  return tags.filter(tag => !VALID_TAGS.includes(tag));
}

/**
 * Get all valid tags (for enum)
 */
function getAllValidTags() {
  return [...VALID_TAGS];
}

/**
 * Check if tag is valid
 */
function isValidTag(tag) {
  return VALID_TAGS.includes(tag);
}

/**
 * Get structured data for frontend API
 */
function getTagsForFrontend(languages = null) {
  if (!languages) {
    return {
      tagsByLanguage: TAGS_BY_LANGUAGE,
      tagMetadata: TAG_METADATA,
      allTags: VALID_TAGS
    };
  }

  const languageArray = Array.isArray(languages) ? languages : [languages];
  const applicableTags = getTagsForLanguages(languageArray);

  return {
    applicableTags,
    tagMetadata: applicableTags.reduce((acc, tag) => {
      acc[tag] = TAG_METADATA[tag] || { label: tag, description: `${tag} related concepts` };
      return acc;
    }, {})
  };
}

module.exports = {
  VALID_TAGS,                    // ✅ For Mongoose enum: enum: VALID_TAGS
  TAGS_BY_LANGUAGE,             // ✅ For frontend filtering
  TAG_METADATA,                 // ✅ For UI display
  getTagsForLanguage,           // ✅ Get HTML-only tags
  getTagsForLanguages,          // ✅ Get multi-language tags
  validateTags,                 // ✅ For validation
  getAllValidTags,              // ✅ Alternative getter
  isValidTag,                   // ✅ Single tag check
  getTagsForFrontend            // ✅ API endpoint ready
};