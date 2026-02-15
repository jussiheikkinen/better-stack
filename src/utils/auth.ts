import { betterAuth } from 'better-auth';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

// Validate required environment variables
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error(
    'Missing required GitHub OAuth environment variables: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET',
  );
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
      strategy: 'jwe', // can be "jwt" or "compact"
      refreshCache: true, // Enable stateless refresh
    },
  },
  account: {
    storeStateStrategy: 'cookie',
    storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
  },
  // emailAndPassword: {
  //   enabled: true,
  // },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
});
