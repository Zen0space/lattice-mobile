// Prettier configuration for React Native + Expo (2025 Best Practices)
module.exports = {
  // Core formatting
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  
  // Line length and wrapping
  printWidth: 100,
  proseWrap: 'preserve',
  
  // Trailing commas (ES5 for better git diffs)
  trailingComma: 'es5',
  
  // Brackets and spacing
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // JSX specific
  jsxSingleQuote: false,
  
  // End of line (auto for cross-platform compatibility)
  endOfLine: 'auto',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // React Native specific overrides
  overrides: [
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        parser: 'babel',
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'always',
        printWidth: 80,
      },
    },
  ],
};
