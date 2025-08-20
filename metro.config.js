const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Hermes-specific configuration for better compatibility
config.transformer = {
  ...config.transformer,
  // Enable Hermes parser for better JavaScript parsing
  hermesParser: true,
  // Ensure consistent module resolution
  unstable_allowRequireContext: false,
};

// Performance optimizations - keep it simple and stable
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Bundle optimization settings
config.resolver.alias = {
  // Add aliases for better tree shaking
  '@components': './src/components',
  '@utils': './src/utils',
  '@stores': './src/stores',
  '@assets': './assets',
};

// Optimize asset resolution
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'webp', // Add WebP support
];

// Hermes-compatible serializer configuration
config.serializer = {
  ...config.serializer,
  // Remove custom createModuleIdFactory for Hermes compatibility
  // Hermes requires stable, predictable module IDs
  
  // Add error recovery for module resolution
  customSerializer: null, // Avoid custom serializers that can interfere with Hermes
  
  // Ensure modules are properly indexed
  getModulesRunBeforeMainModule: () => [
    require.resolve('react-native/Libraries/Core/InitializeCore'),
  ],
};

// Only add minification for production builds to avoid development issues
if (process.env.NODE_ENV === 'production') {
  config.transformer.minifierConfig = {
    // Enable advanced minification for better performance in production
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: true,
      wrap_iife: true,
    },
    sourceMap: false,
    toplevel: false,
    warnings: false,
    parse: {},
    compress: {
      drop_console: true, // Remove console logs in production
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.warn'], // Remove specific console methods
    },
  };

  // Production-only optimizations
  config.transformer.enableBabelRCLookup = false; // Faster builds
  config.transformer.enableBabelRuntime = false; // Reduce bundle size
}

// Development optimizations
if (process.env.NODE_ENV === 'development') {
  // Enable source maps for better debugging
  config.transformer.enableBabelRuntime = true;
  
  // Faster development builds
  config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
  
  // Hermes development optimizations
  config.transformer.hermesParser = true;
  config.serializer.customSerializer = undefined; // Avoid custom serializers that can break Hermes
}

// Bundle analysis support - Hermes compatible
if (process.env.ANALYZE_BUNDLE === 'true') {
  // Use default Metro module ID factory for better Hermes compatibility
  // Custom module IDs can cause runtime resolution issues
  console.log('📦 Bundle analysis enabled with Hermes-compatible module IDs');
}

module.exports = withNativeWind(config, { 
  input: './global.css',
  // NativeWind performance optimizations
  inlineRem: 16,
});
