import { createGibworkClient } from '@gibwork/sdk/node';
import { config, assertWallet } from './config.js';
import type { BountySpec, ManagedBounty } from './types.js';
import chalk from 'chalk';

let client: any = null;

function getClient() {
  assertWallet();
  if (!client) {
    client = createGibworkClient({
      privateKey: config.solanaPrivateKey!,
      production: config.gibworkEnvironment === 'production',
    });
  }
  return client;
}

export async function createBounty(spec: BountySpec): Promise<ManagedBounty> {
  const reward = String(spec.reward);
  const tags = spec.tags.length ? spec.tags : config.defaultTags;

  console.log(chalk.cyan('\n→ Creating bounty...'));
  console.log(`  Title  : ${spec.title}`);
  console.log(`  Reward : ${reward}`);
  console.log(`  Tags   : ${tags.join(', ')}`);
  console.log(`  Dry-run: ${config.dryRun}`);

  if (config.dryRun) {
    const id = `dry-${Date.now()}`;
    return {
      taskId: id,
      title: spec.title,
      reward,
      status: 'open',
      createdAt: new Date().toISOString(),
      externalRef: spec.externalRef,
      url: `https://gib.work/task/${id}`,
    };
  }

  const gib = getClient();
  const task = await gib.tasks.create({
    title: spec.title,
    content: spec.content,
    tags,
    payment: {
      mintAddress: config.defaultMint,
      amount: reward,
    },
    minSubmissionAmount: spec.minSubmissionAmount || '5.00',
  });

  return {
    taskId: task.taskId,
    title: spec.title,
    reward,
    status: 'open',
    createdAt: new Date().toISOString(),
    externalRef: spec.externalRef,
    url: `https://gib.work/task/${task.taskId}`,
  };
}

export async function listMyBounties(): Promise<ManagedBounty[]> {
  if (config.dryRun) {
    console.log(chalk.yellow('[DRY-RUN] Returning empty list'));
    return [];
  }
  const gib = getClient();
  const result = await gib.tasks.list();
  const tasks = Array.isArray(result) ? result : (result?.tasks || []);
  return tasks.map((t: any) => ({
    taskId: t.taskId || t.id,
    title: t.title,
    reward: t.payment?.amount || t.reward || '0',
    status: 'open',
    createdAt: t.createdAt || '',
    url: `https://gib.work/task/${t.taskId || t.id}`,
  }));
}

export async function listSubmissions(taskId: string) {
  if (config.dryRun) return [];
  const gib = getClient();
  return gib.submissions.list(taskId);
}

export async function approveSubmission(taskId: string, submissionId: string, amount: string) {
  if (config.dryRun) {
    console.log(chalk.yellow(`[DRY-RUN] Would approve ${submissionId} for ${amount}`));
    return { status: 'dry-run' };
  }
  const gib = getClient();
  return gib.submissions.approve(taskId, submissionId, { amount });
}

export async function rejectSubmission(taskId: string, submissionId: string, reason: string) {
  if (config.dryRun) {
    console.log(chalk.yellow(`[DRY-RUN] Would reject ${submissionId}: ${reason}`));
    return { status: 'dry-run' };
  }
  const gib = getClient();
  return gib.submissions.reject(taskId, submissionId, reason);
}
