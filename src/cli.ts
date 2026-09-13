#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import YAML from 'yaml';
import { config } from './config.js';
import { createBounty, listMyBounties, listSubmissions, approveSubmission, rejectSubmission } from './gibwork.js';
import { BountySpecSchema } from './types.js';

const program = new Command();

program
  .name('gibwork-orchestrator')
  .description('Team control plane for creating, reviewing and managing Gibwork bounties')
  .version('1.0.0');

program
  .command('create')
  .description('Create a bounty from CLI flags or a YAML/JSON file')
  .option('-f, --file <path>', 'Path to bounty spec (YAML or JSON)')
  .option('--title <title>', 'Bounty title')
  .option('--content <text>', 'Bounty description')
  .option('--reward <amount>', 'Reward amount', config.defaultReward)
  .option('--tags <tags>', 'Comma-separated tags')
  .option('--ref <ref>', 'External reference (Linear, GitHub issue, etc.)')
  .option('--dry-run', 'Force dry-run', config.dryRun)
  .action(async (opts) => {
    try {
      if (opts.dryRun) (config as any).dryRun = true;

      let spec: any;

      if (opts.file) {
        const raw = fs.readFileSync(opts.file, 'utf-8');
        spec = opts.file.endsWith('.json') ? JSON.parse(raw) : YAML.parse(raw);
      } else {
        if (!opts.title || !opts.content) {
          throw new Error('Either --file or both --title and --content are required');
        }
        spec = {
          title: opts.title,
          content: opts.content,
          reward: opts.reward,
          tags: opts.tags ? opts.tags.split(',').map((t: string) => t.trim()) : config.defaultTags,
          externalRef: opts.ref,
        };
      }

      const parsed = BountySpecSchema.parse(spec);
      const result = await createBounty(parsed);

      console.log(chalk.green('\n✓ Bounty created'));
      console.log(`  Task ID : ${result.taskId}`);
      console.log(`  URL     : ${result.url}`);
      if (result.externalRef) console.log(`  Ref     : ${result.externalRef}`);
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List bounties owned by the configured wallet')
  .option('--json', 'JSON output')
  .action(async (opts) => {
    try {
      const bounties = await listMyBounties();
      if (opts.json) {
        console.log(JSON.stringify(bounties, null, 2));
        return;
      }
      console.log(chalk.bold.blue('\nYour Bounties\n'));
      if (bounties.length === 0) {
        console.log(chalk.yellow('No bounties found (or dry-run mode).'));
        return;
      }
      bounties.forEach((b, i) => {
        console.log(`${i + 1}. ${b.title}`);
        console.log(`   ID     : ${b.taskId}`);
        console.log(`   Reward : ${b.reward}`);
        console.log(`   URL    : ${b.url}\n`);
      });
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('submissions')
  .description('List submissions for a bounty')
  .requiredOption('--task <id>', 'Task ID')
  .option('--json', 'JSON output')
  .action(async (opts) => {
    try {
      const subs = await listSubmissions(opts.task);
      if (opts.json) {
        console.log(JSON.stringify(subs, null, 2));
        return;
      }
      console.log(chalk.bold.blue(`\nSubmissions for ${opts.task}\n`));
      console.log(JSON.stringify(subs, null, 2));
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('approve')
  .description('Approve a submission and release funds')
  .requiredOption('--task <id>', 'Task ID')
  .requiredOption('--submission <id>', 'Submission ID')
  .requiredOption('--amount <amount>', 'Amount to release')
  .option('--dry-run', 'Force dry-run', config.dryRun)
  .action(async (opts) => {
    try {
      if (opts.dryRun) (config as any).dryRun = true;
      const result = await approveSubmission(opts.task, opts.submission, opts.amount);
      console.log(chalk.green('Approval result:'), result);
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('reject')
  .description('Reject a submission')
  .requiredOption('--task <id>', 'Task ID')
  .requiredOption('--submission <id>', 'Submission ID')
  .option('--reason <text>', 'Rejection reason', 'Does not meet requirements')
  .option('--dry-run', 'Force dry-run', config.dryRun)
  .action(async (opts) => {
    try {
      if (opts.dryRun) (config as any).dryRun = true;
      const result = await rejectSubmission(opts.task, opts.submission, opts.reason);
      console.log(chalk.green('Rejection result:'), result);
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message || err);
      process.exit(1);
    }
  });

program.parse();
