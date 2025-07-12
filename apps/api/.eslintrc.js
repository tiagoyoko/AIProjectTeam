module.exports = {
  extends: ['../../packages/config/eslint.js'],
  env: {
    node: true,
    es2020: true
  },
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'no-console': 'off' // Allow console in API server
  }
}; 