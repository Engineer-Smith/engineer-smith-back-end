// src/constants/tags.ts - Tags constants for enum validation

/**
 * Flat array of ALL valid tags for Mongoose enum validation
 */
export const VALID_TAGS = [
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
] as const;

export type ValidTag = typeof VALID_TAGS[number];