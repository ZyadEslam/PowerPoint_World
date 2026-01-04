export async function register() {
  // Disable Next.js devtools when using Turbopack to avoid HMR issues
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.TURBOPACK) {
    // Prevent devtools from loading
    if (typeof process !== 'undefined') {
      process.env.NEXT_PRIVATE_SKIP_DEVTOOLS = '1';
    }
  }
}

