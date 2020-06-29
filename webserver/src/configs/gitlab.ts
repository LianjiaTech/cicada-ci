import { registerAs } from '@nestjs/config';

export default registerAs('gitlab', () => ({
  host: process.env.GITLAB_HOST,
  oauth_client_id: process.env.GITLAB_OAUTH_CLIENT_ID,
  oauth_client_secret: process.env.GITLAB_OAUTH_CLIENT_SECRET,
  oauth_redirect_uri: process.env.GITLAB_OAUTH_REDIRECT_URI,
  deploy_key: process.env.GITLAB_DEPLOY_KEY,
  webhook_url: process.env.GITLAB_WEBHOOK_URL,
}));
