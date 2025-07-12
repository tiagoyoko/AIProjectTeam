module.exports = {
  extends: [
    './eslint.js',
    'next/core-web-vitals'
  ],
  rules: {
    // Next.js specific rules
    '@next/next/no-html-link-for-pages': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    
    // React hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  parserOptions: {
    project: './tsconfig.json'
  }
}; 