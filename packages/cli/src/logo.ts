import kleur from 'kleur';

export const LOGO = `
${kleur.magenta().bold('██╗  ██╗███████╗██╗   ██╗██╗   ██╗')}
${kleur.magenta().bold('╚██╗██╔╝██╔════╝╚██╗ ██╔╝╚██╗ ██╔╝')}
${kleur.magenta().bold(' ╚███╔╝ █████╗   ╚████╔╝  ╚████╔╝')}
${kleur.magenta().bold(' ██╔██╗ ██╔══╝    ╚██╔╝    ╚██╔╝')}
${kleur.magenta().bold('██╔╝ ██╗███████╗   ██║      ██║')}
${kleur.magenta().bold('╚═╝  ╚═╝╚══════╝   ╚═╝      ╚═╝')}
`;

export function printLogo(): void {
  console.log(LOGO);
  console.log(kleur.bold('  Xeyy — StyleX-native component registry\n'));
}
