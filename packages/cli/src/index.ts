#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init.ts';
import { add } from './commands/add.ts';
import { build } from './commands/build.ts';
import { list } from './commands/list.ts';
import { search } from './commands/search.ts';
import { info } from './commands/info.ts';
import { docs } from './commands/docs.ts';
import { doctor } from './commands/doctor.ts';
import { registry } from './commands/registry.ts';
import { migrate } from './commands/migrate.ts';

import packageJson from '../package.json' with { type: 'json' };

const program = new Command()
  .name('xeyy')
  .description('StyleX-native component registry CLI')
  .version(packageJson.version, '-v, --version', 'output the version number');

program.addCommand(init);
program.addCommand(add);
program.addCommand(build);
program.addCommand(list);
program.addCommand(search);
program.addCommand(info);
program.addCommand(docs);
program.addCommand(doctor);
program.addCommand(registry);
program.addCommand(migrate);

program.parse();