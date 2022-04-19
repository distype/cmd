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

A command handler for [Distype](https://github.com/distype/distype).

## Example Bot

```ts
import { Client } from 'distype';
import { CommandHandler } from '@distype/cmd';

const client = new Client(YOUR_BOT_TOKEN);
const commandHandler = new CommandHandler(client);

commandHandler.addCommand({});

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
