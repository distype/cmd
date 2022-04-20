<div align="center">
    <br>
    <h1>@distype/cmd</h1>
    <br><br>
    <p>
        <a href="https://www.npmjs.com/package/@distype/cmd"><img src="https://img.shields.io/npm/v/@distype/cmd.svg?color=5162F&style=for-the-badge&logo=npm"></a>
        <a href="https://github.com/distype/cmd/actions/workflows/build.yml"><img src="https://img.shields.io/github/workflow/status/distype/cmd/Build?style=for-the-badge&logo=github"><a>
        <a href="https://github.com/distype/cmd/actions/workflows/tests.yml"><img src="https://img.shields.io/github/workflow/status/distype/cmd/Tests?label=tests&style=for-the-badge&logo=github"><a>
        <a href="https://discord.gg/hRXKcUKGHB"><img src="https://img.shields.io/discord/564877383308541964?color=5162F1&style=for-the-badge&logo=discord&logoColor=white"></a>
    </p>
</div>

## About

A command handler for [Distype](https://github.com/distype/distype) (WIP).

## How it works

Commands are made via builders ([example below](https://github.com/distype/cmd/blob/main/README.md#example-bot)), and are then pushed to the command handler to be executed whenever an interaction is received. This library also includes builders for other components, including embeds, modals, and message components.

Command execute methods use a command context to allow you to access useful variables, such as the client and information about the command. Additionally, command parameters are dynamically typed on the command context (shown below).

![img](https://raw.githubusercontent.com/distype/assets/main/cmd.gif)

## Example Bot

```ts
import { Client } from 'distype';
import { CommandHandler } from '@distype/cmd';

const client = new Client(YOUR_BOT_TOKEN);

// Create the command handler.
const commandHandler = new CommandHandler(client);

// Create a command.
const fooCommand = new ChatCommand()
    .setName(`foo`)
    .setDescription(`Foo command`)
    .addStringParameter(true, `bar`, `Describe bar`)
    .addUserParameter(true, `baz`, `Which user is baz?`)
    .setExecute((ctx) => {
        ctx.send(`You said bar is "${ctx.parameters.bar}", and that ${ctx.parameters.baz.user.username} is baz!`);
    });

// Save the foo command to the command handler.
commandHandler.bindCommand(fooCommand);

client.gateway.on(`SHARDS_READY`, () => {
    // Pushes saved commands to your application.
    commandHandler.push();
});

client.gateway.connect();
```

> Note that Discord API typings are for API version `10`, and are from [discord-api-types](https://www.npmjs.com/package/discord-api-types). While you can still specify different API versions to be used, it is not recommended.

## Installation

`@distype/cmd` can be installed via npm.
```sh
npm install @distype/cmd
```

### Prerequisites

- **[Node.js >=16.13.0](https://nodejs.org/)**
- **[NPM >=8.1.0](https://www.npmjs.com/)**
