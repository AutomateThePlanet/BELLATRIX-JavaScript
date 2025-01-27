import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { ignores: ['**/*/coverage/**/*'] },
    { languageOptions: { globals: globals.node } },
    ...tseslint.configs.recommended,
    {
        rules: {
            'eol-last': 'error',
            'semi': 'error',
            'no-trailing-spaces': 'error',
            'indent': ['error', 4, { SwitchCase: 1 }],
            'spaced-comment': ['error', 'always'],
            'no-fallthrough': 'error',
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-floating-promises': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'TSEnumDeclaration',
                    message: 'TypeScript enums are not allowed. Instead, use a constant object with Object.freeze for immutability. Example:\n\n' +
                        'const MyConstants = Object.freeze({\n' +
                        `    KEY_ONE: 'valueOne',\n` +
                        `    KEY_TWO: 'valueTwo',\n` +
                        `    KEY_THREE: 'valueThree',\n` +
                        `    KEY_FOUR: 'valueFour',\n` +
                        '} as const);\n\n' +
                        'This ensures immutability while avoiding the use of enums.',
                },
            ],
        },
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
            },
        },
    }
];
