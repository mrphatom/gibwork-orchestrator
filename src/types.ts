import { z } from 'zod';

export const BountySpecSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  reward: z.string().or(z.number()),
  tags: z.array(z.string()).default([]),
  minSubmissionAmount: z.string().optional(),
  deadline: z.string().optional(),
  allowOnlyVerified: z.boolean().optional(),
  externalRef: z.string().optional(),
});

export type BountySpec = z.infer<typeof BountySpecSchema>;

export interface ManagedBounty {
  taskId: string;
  title: string;
  reward: string;
  status: 'open' | 'review' | 'closed' | 'refunded';
  createdAt: string;
  externalRef?: string;
  url: string;
}
