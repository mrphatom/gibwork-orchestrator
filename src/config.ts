import 'dotenv/config';
import { z } from 'zod';

const Schema = z.object({
  solanaPrivateKey: z.string().optional(),
  gibworkEnvironment: z.enum(['stage', 'production']).default('stage'),
  dryRun: z.boolean().default(true),
  defaultReward: z.string().default('50.00'),
  defaultMint: z.string().default('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  defaultTags: z.array(z.string()).default(['internal']),
  discordWebhookUrl: z.string().optional(),
  slackWebhookUrl: z.string().optional(),
});

function list(v: string | undefined, fb: string[] = []) {
  if (!v) return fb;
  return v.split(',').map(s => s.trim()).filter(Boolean);
}

export const config = Schema.parse({
  solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY || process.env.GIBWORK_PRIVATE_KEY,
  gibworkEnvironment: (process.env.GIBWORK_ENVIRONMENT as any) || 'stage',
  dryRun: process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1' || !process.env.SOLANA_PRIVATE_KEY,
  defaultReward: process.env.DEFAULT_REWARD || '50.00',
  defaultMint: process.env.DEFAULT_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  defaultTags: list(process.env.DEFAULT_TAGS, ['internal']),
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
});

export function assertWallet() {
  if (!config.solanaPrivateKey && !config.dryRun) {
    throw new Error('SOLANA_PRIVATE_KEY required when not in dry-run');
  }
}

export function doctorReport(): string[] {
  return [
    `Environment    : ${config.gibworkEnvironment}`,
    `Dry-run        : ${config.dryRun}`,
    `Wallet present : ${config.solanaPrivateKey ? 'yes' : 'no'}`,
    `Default reward : ${config.defaultReward}`,
    `Default tags   : ${config.defaultTags.join(', ')}`,
  ];
}
