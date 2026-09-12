import { Command } from 'commander';
import { registryAdd } from './registry-add.ts';
import { registryStatus } from './registry-status.ts';
import { registrySync } from './registry-sync.ts';
import { registryValidate } from './registry-validate.ts';

/** Grouped authoring commands for maintaining the Xeyy registry itself. */
export const registry = new Command()
  .name('registry')
  .description('Authoring commands for the Xeyy registry (require the Xeyy repo layout)');

registry.addCommand(registryAdd);
registry.addCommand(registryStatus);
registry.addCommand(registrySync);
registry.addCommand(registryValidate);