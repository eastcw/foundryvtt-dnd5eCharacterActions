module.exports = {
  parserOptions: {
    ecmaVersion: 15,
    extraFileExtensions: ['.cjs', '.mjs'],
    sourceType: 'module',
  },

  env: {
    browser: true,
    es15: true,
  },

  extends: ['eslint:recommended', '@typhonjs-fvtt/eslint-config-foundry.js/0.8.0', 'plugin:prettier/recommended'],

  plugins: [],

  rules: {
    // Specify any specific ESLint rules.
  },

  overrides: [
    {
      files: ['./*.js', './*.cjs', './*.mjs'],
      env: {
        node: true,
      },
    },
  ],
};
