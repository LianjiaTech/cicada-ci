import { registerAs } from '@nestjs/config';

export default registerAs('gitlab', () => ({
  host: process.env.GITLAB_HOST,
}));
