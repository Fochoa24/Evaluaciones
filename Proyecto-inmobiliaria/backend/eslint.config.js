const js = require('@eslint/js');
const globals = require('globals');

/** Reglas recomendadas de ESLint para Node.js (CommonJS). Uso: npm run lint */
module.exports = [
    { ignores: ['node_modules/'] },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: { ecmaVersion: 2023, sourceType: 'commonjs', globals: globals.node },
        rules: {
            // `_req`, `_next`: parámetros que Express exige aunque no se usen.
            // `const { campo, ...resto } = obj` sirve para quitar `campo`.
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }]
        }
    }
];
