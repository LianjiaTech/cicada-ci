import { registerAs } from '@nestjs/config';

export default registerAs('github', () => ({
  oauth_client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
  oauth_client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
  oauth_redirect_uri: process.env.GITHUB_OAUTH_REDIRECT_URI,
  deploy_key: process.env.GITHUB_DEPLOY_KEY,
  webhook_url: process.env.GITHUB_WEBHOOK_URL,
}));
