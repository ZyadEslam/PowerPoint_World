const createNextIntlPlugin = require("next-intl/plugin")("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["localhost"],
    // Keep unoptimized: true since we handle optimization in our custom API route with Sharp
    // This prevents Next.js from trying to optimize images from /api/product/image/** routes
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 85, 90, 100], // Configured quality values used in the app
    minimumCacheTTL: 31536000, // 1 year cache
    // Allow our API routes with any query parameters
    // Note: pathname doesn't include query strings, but ** matches any path
    // Query strings are automatically allowed when pathname matches
    localPatterns: [
      {
        pathname: "/api/product/image/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/product/image/**",
        search: "**",
      },
      {
        protocol: "https",
        hostname: "quick-cart-e-commerce-pi.vercel.app",
        pathname: "/api/product/image/**",
        search: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  trailingSlash: true,
  // Target modern browsers only - reduces polyfills and legacy code
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Exclude devtools from production build
  webpack: (config, { dev, isServer }) => {
    // Make webpack available for plugins
    const webpack = require("webpack");

    // Fix for "self is not defined" error - provide fallback for browser globals on server
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    if (dev) {
      config.optimization.minimize = false;
      config.cache = false;
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    } else {
      // Production optimizations - only apply splitChunks to client bundles
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          minimize: true,
          usedExports: true,
          sideEffects: false,
          // Better code splitting for reduced initial bundle size
          splitChunks: {
            chunks: "all",
            maxInitialRequests: 25,
            minSize: 20000,
            cacheGroups: {
              default: false,
              vendors: false,
              // Framework chunk - React and core dependencies
              framework: {
                name: "framework",
                chunks: "all",
                test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                priority: 40,
                enforce: true,
              },
              // Next.js and Next.js related
              nextjs: {
                name: "nextjs",
                test: /[\\/]node_modules[\\/](next|next-intl|next-auth)[\\/]/,
                chunks: "all",
                priority: 33,
                enforce: true,
              },
              // UI libraries
              ui: {
                name: "ui-libs",
                test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
                chunks: "all",
                priority: 32,
                minChunks: 1,
              },
              // Large vendor libraries
              lib: {
                test(module) {
                  return (
                    module.size() > 160000 &&
                    /node_modules[/\\]/.test(module.identifier()) &&
                    !/[\\/]node_modules[\\/](react|react-dom|next|next-intl|next-auth|lucide-react)[\\/]/.test(
                      module.identifier()
                    )
                  );
                },
                name(module) {
                  const packageName = module
                    .identifier()
                    .match(/[\\/]node_modules[\\/](.+?)([\\/]|$)/);
                  if (packageName) {
                    return `lib-${packageName[1].replace(
                      /[^a-zA-Z0-9]/g,
                      "-"
                    )}`;
                  }
                  const hash = require("crypto").createHash("sha1");
                  hash.update(module.identifier());
                  return `lib-${hash.digest("hex").substring(0, 8)}`;
                },
                priority: 30,
                minChunks: 1,
                reuseExistingChunk: true,
              },
              // Common chunk - shared code
              commons: {
                name: "commons",
                minChunks: 2,
                priority: 20,
                reuseExistingChunk: true,
              },
              // Shared chunk - smaller shared modules
              shared: {
                name(module, chunks) {
                  return require("crypto")
                    .createHash("sha1")
                    .update(chunks.reduce((acc, chunk) => acc + chunk.name, ""))
                    .digest("hex")
                    .substring(0, 8);
                },
                priority: 10,
                minChunks: 2,
                reuseExistingChunk: true,
              },
            },
          },
        };
      }
    }

    // Make @vercel/kv optional - use IgnorePlugin to prevent webpack from trying to resolve it if not installed

    // Check if @vercel/kv is installed
    const checkPackage = (pkg) => {
      try {
        require.resolve(pkg);
        return true;
      } catch {
        return false;
      }
    };

    // Only add IgnorePlugin for @vercel/kv if it's NOT installed
    if (!checkPackage("@vercel/kv")) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@vercel\/kv$/,
        })
      );
    }

    // Make validator optional - always ignore to prevent webpack from trying to resolve it
    // The sanitizer uses eval() to dynamically require it at runtime
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^validator$/,
      })
    );

    // Ignore framer-motion if not installed - prevents HMR errors in Turbopack
    if (!checkPackage("framer-motion")) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^framer-motion$/,
        })
      );
    }

    // Mark redis as external for server-side only (it's only used in API routes)
    if (isServer) {
      config.externals = config.externals || [];
      if (typeof config.externals === "function") {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          ({ request }, callback) => {
            if (request === "redis") {
              return callback(null, "commonjs " + request);
            }
            callback();
          },
        ];
      } else if (Array.isArray(config.externals)) {
        config.externals.push("redis");
      }
    }

    return config;
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  swcMinify: true, // Use SWC for minification (faster and better)
  experimental: {
    optimizePackageImports: ["lucide-react"],
    instrumentationHook: true,
  },
  headers: async () => {
    const isProduction = process.env.NODE_ENV === "production";

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
                {
                  key: "Content-Security-Policy",
                  value:
                    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accept.paymob.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://accept.paymob.com; frame-src https://accept.paymob.com;",
                },
              ]
            : []),
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Note: Content-Encoding is automatically set by Next.js when compress: true
          // Don't set it manually as it causes ERR_CONTENT_DECODING_FAILED
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source:
          "/:path*\\.(js|css|json|xml|txt|svg|ico|png|jpg|jpeg|gif|webp|avif|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // webpack: (config, { isServer }) => {
  //   // Fix for framer-motion and other client-side libraries
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //       net: false,
  //       tls: false,
  //     };
  //   }

  //   // Handle module resolution issues
  //   config.module = config.module || {};
  //   config.module.rules = config.module.rules || [];

  //   config.module.rules.push({
  //     test: /\.mjs$/,
  //     include: /node_modules/,
  //     type: "javascript/auto",
  //   });

  //   return config;
  // },
  // transpilePackages: ['framer-motion'],
  // webpack: (config) => {
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     'framer-motion': require.resolve('framer-motion'),
  //   };
  //   return config;
  // },
};

module.exports = createNextIntlPlugin(nextConfig);
