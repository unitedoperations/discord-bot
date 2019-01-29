# Contributing to UO Discord Bot

As a contributor, if you are unsure or not fully confident in the code you've written, feel free to submit the pull request anyway. There are guards in place and a review process for a reason and you won't get in trouble for submitting a pull request that needs to be edited. So if you have written something to contribute to the project or resolve a feature request or issue, go ahead and submit it once you think it's finished!

## Prior to Contributing

If you wish to be a contributor for the project, or an admin/code owner for the repository, please contact Synxe on Discord or [callensm](https://github.com/callensm) on GitHub. You will need to be added to the test environment Discord server that is used for development and vetting of new features and bug fixing, and added to the United Operations GitHub organization and the `UO Discord` development team within the organization.

The technology stack being used for the project is `TypeScript` for development, shell scripts for maintenance and some automation, and `Docker` and `Terraform` for containerization and deployments to the cloud server.

> _If you are proficient in any of these or thing that you can add value to the project in another way, feel free to let me know! I'm always open to innovation!_

## Checklist for Contribution

- [ ] CHANGELOG.md is updated for the upcoming major or minor version release with details about your contribution
- [ ] If you're contribution resolves a feature request or issue, tag your commit hash in the issue thread and handle the respective card in the repository project board
- [ ] Submit your pull request and wait for it to be merged into staging or master for the next deployment

## Code Process

The majority of the code has been written in such a way that the inner processes are abstracted away from feature additions. The process of creating a new feature consists of 3 steps:

1. Create a file named after your new command in the [commands folder](./src/lib/commands).
   - (e.g. the `!ready` command is defined in [the `ready.ts` file](./src/lib/commands/ready.ts))
2. Define your new command function(s) as a module export in [the `commands/index.ts` file](./src/lib/commands/index.ts) in alphabetic order as the others are defined
3. Register your new function(s) in the [main `index.ts` file](./src/index.ts) using the `addCommand` function as seen with other for it to be added to the bot's command registry, along with the usage description which takes a markdown styled string
   - If the command requires provisioning (i.e. only runnable by regulars, admins, etc.) specify that as the last argument of the `addCommand` function as seen with the [`alerts` registration](./src/index.ts)

### Example Command Addition

As an example, below are the additions that would be required to make a simple `echo` command that sends the user back the message they sent to the bot:

```ts
// ./src/lib/commands/echo.ts

import { Message, Guild } from 'discord.js'

/**
 * Sends the user back the same message they sent
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function echo(_guild: Guild, msg: Message, args: string[]): Promise<string> {
  await msg.author.send(args.join(' '))
  return 'ECHO'
}
```

```ts
// ./src/lib/commands/index.ts

// ...
export { echo } from './echo'
// ...
```

```ts
// ./src/index.ts

//...
.addCommand(
  'echo',
  '`!echo`: _sends back the user their same message_',
  cmd.echo
)
//...
```

## Embed Messages

Most commands respond back in the form of an embed message. This is a styled response as you see in the response of the majority of the commands and channel notifications.

If a new formatted embed message is required for your new function, create and export it in the [`messages.ts`](./src/lib/messages.ts) file. The required type definition for it and the properties is should contain are defined as the top of the same file.
