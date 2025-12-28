import chalk from "chalk";

const ICONS = {
  INFO: "\u2139",
  SUCCESS: "\u2714",
  WARN: "\u26A0",
  ERROR: "\u2716",
};

export const logger = {
  info: (msg: string) => console.log(chalk.blue(`${ICONS.INFO}  ${msg}`)),

  success: (msg: string) => console.log(chalk.green(`${ICONS.SUCCESS}  ${msg}`)),

  warn: (msg: string) => console.log(chalk.yellow(`${ICONS.WARN}  ${msg}`)),

  error: (msg: string) => console.log(chalk.red(`${ICONS.ERROR}  ${msg}`)),
};
