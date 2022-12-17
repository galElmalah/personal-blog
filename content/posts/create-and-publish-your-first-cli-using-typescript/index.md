---
title: 'Create and Publish Your First CLI Using Typescript'
date: 2021-02-08T11:30:03+00:00
tags: ['Typescript', 'tutorial']
author: 'Gal Elmalah'
showToc: true
weight: 4
cover:
  image: 'media/cover.jpg' # image path/url
  alt: 'computer with terminal open' # alt text
---

Following my previous blog post
[5-cli-tools-that-will-increase-your-dev-velocity-and-code-quality](./5-cli-tools-that-will-increase-your-dev-velocity-and-code-quality/)
I wrote a quick guide on how to write and publish a CLI.

## What's in it for you?

1. Write a cool as f\*\*\* CLI tool.
2. Learn how to set up a project using Typescript.
3. Publish your new shiny CLI to npm.

## setup

We will use [Scaffolder](https://github.com/galElmalah/scaffolder) to generate all the boilerplate we need for our shiny CLI.

```zsh
npx scaffolder-cli interactive --from-github https://github.com/galElmalah/ts-cli-scaffolder.git --template cli
```

> [Scaffolder](https://github.com/galElmalah/scaffolder) makes creating and sharing boilerplate code a breeze, Check it out!

Once `npm` has finished installing all of our dependencies, we should have a clean, greenfield project.

---

Let's have a quick look at the `package.json` file.

First of all, as you can see we got a postfix to our `name` field, I added this to prevent naming conflicts with existing packages 😄

Second, we got a `bin` field.
`bin` field tells [npm](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#bin) that this package has an executable that should be invoked using the `coolGroup` command.

```json
"bin" : {
  "coolGroup" : "./dist/cli.js"
}
```

Finally, we have [`commander`](https://github.com/tj/commander.js?) as a dependency. We are going to use it to register commands for our cli to act on.

> In a gist commander makes creating CLI's a breeze

Now Let's quickly go over the `tsconfig.json` file.

```json
{
  "compilerOptions": {
    "module": "commonJs", // Module code generation
    "target": "es6", // Target a specific ECMAScript version
    "outDir": "dist/", // The TSC compiler will output our files to the ./dist folder
    "lib": ["es6"] // Specify library files to be included in the compilation step
  },
  "files": ["src/cli.ts"], // Mark cli.ts as our entry point
  "exclude": ["node_modules"]
}
```

_We mentioned `./dist/cli.js` in the `bin` field. We can do that because we tell typescript to compile our code into a `dist` folder._

> If you want to learn more about Typescript or tsconfig.json, I recommend this [free book](https://basarat.gitbook.io/typescript/).

## We are finally done going over our boilerplate. Let's get down to business.

We are going to write a simple CLI that does the following:

1. Go over all the files in a directory and get their extension.
2. Create a folder for each type of file extension.
3. Move all the files to their matching folders.

### 0.5. Some imports for later

```typescript
import { readdirSync, existsSync, statSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';
```

### 1. Go over all the files in a directory and get their extension.

```typescript
// `getPath` is a little helper that will make more sense when we will look at the whole file.
const getPath = (...paths) => join(sourcePath, ...paths);
const toFileExtension = (fromFileName: string) => fromFileName.split('.').pop();
const isFile = (aFile: string) => statSync(getPath(aFile)).isFile();

const files = readdirSync(sourcePath).filter(isFile);

const getWorkingDirectoryFileExtensions = (): string[] =>
  Array.from(new Set(files.map(toFileExtension)));
```

### 2. Create a folder for each type of file extension.

> If the folder already exists, then skip its creation to avoid errors.

```typescript
const createDirectory = (aFileExtension: string) =>
  mkdirSync(getPath(aFileExtension));
const shouldCreateFolder = (aFileExtension: string) =>
  !existsSync(getPath(aFileExtension));

getWorkingDirectoryFileExtensions()
  .filter(shouldCreateFolder)
  .forEach(createDirectory);
```

### 3. Move all the files to their matching folders.

```typescript
const moveToFileExtensionFolder = (aFile) =>
  renameSync(getPath(aFile), getPath(toFileExtension(aFile), aFile));

files.forEach(moveToFileExtensionFolder);
```

### Putting it all together

We are going to put all of this logic inside a file named `groupFilesByExtensions.ts`

```typescript
import { readdirSync, existsSync, statSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';

export const groupFilesByExtensions = (sourcePath: string) => {
  const getPath = (...paths: string[]) => join(sourcePath, ...paths);
  const toFileExtension = (fromFileName: string) =>
    fromFileName.split('.').pop();
  const isFile = (aFile: string) => statSync(getPath(aFile)).isFile();

  const files = readdirSync(sourcePath).filter(isFile);

  const getWorkingDirectoryFileExtensions = () =>
    Array.from(new Set(files.map(toFileExtension)));

  const createDirectory = (aFileExtension) =>
    mkdirSync(getPath(aFileExtension));
  const shouldCreateFolder = (aFileExtension) =>
    !existsSync(getPath(aFileExtension));

  getWorkingDirectoryFileExtensions()
    .filter(shouldCreateFolder)
    .forEach(createDirectory);

  const moveToFileExtensionFolder = (aFile: string) =>
    renameSync(getPath(aFile), getPath(toFileExtension(aFile), aFile));

  files.forEach(moveToFileExtensionFolder);
};
```

---

We got all of our logic in working condition. Now, let's wire this thing up.

What will be a reasonable workflow for this CLI? Let's write it up as a user story.

### 1. As a user, I want to type `coolGroup` in my cli and have all files in my current working directory grouped.

By importing our `groupFilesByExtensions` function into `cli.ts` file.

> We add a [shebang(`#!/usr/bin/env node`)](<https://en.wikipedia.org/wiki/Shebang_(Unix)#:~:text=From%20Wikipedia%2C%20the%20free%20encyclopedia,bang%2C%20or%20hash%2Dpling.>) to specify the script interpreter that's used to execute our code.

```typescript
#!/usr/bin/env node

import { groupFilesByExtensions } from './groupFilesByExtensions';

// process.cwd() give us back the current working directory
groupFilesByExtensions(process.cwd());
```

Let's introduce another requirement and see we can adjust to it.

### 2. As a user, I to be able to specify the folder `coolGroup` will work on.

> For example `coolGroup --entry-point ./group/this/folder`

Change the `cli.ts` file to accommodate this change

```typescript
#!/usr/bin/env node
import * as commander from 'commander';
import { groupFilesByExtensions } from './groupFilesByExtensions';

commander
  .option(
    '--entry-point [value]',
    'Relative path to a folder you want to group.'
  )
  .action((command) => {
    /*
    commander parses the input for us.
    The options we specify then get exposed via the `command` argument - command.<our-option>
    */
    const groupFolderPath = command.entryPoint
      ? join(process.cwd(), command.entryPoint)
      : process.cwd();
    groupFilesByExtensions(groupFolderPath);
  })
  .parse(process.argv);
```

Now our users can specify a path to the folder they want to group.  
As a bonus, we get a nice help section out of the box!

> run `npm run build` and then `node ./dist/cli.js` to see it in action locally (or use [npm link](https://docs.npmjs.com/cli/v6/commands/npm-link))

![help output](https://dev-to-uploads.s3.amazonaws.com/i/bpysrxkbr300r98zmr1l.png)

---

## Share it with the world!

We got a cool working CLI but it only exists on our local machine.

Let's share this brilliant creation with the world by publishing it to npm.

**_Before moving to the next section, if you don't have an npm user follow this [guide](https://docs.npmjs.com/creating-a-new-npm-user-account) to create one and set up the credentials._**

To publish our package all we need is to run `npm publish` and you should be good to go!

> For a more polished publish flow check [np](https://github.com/sindresorhus/np) out.

If everything went well you should see something like this.

![publish result](https://dev-to-uploads.s3.amazonaws.com/i/mgam4dki8pthb6pbzhat.png)

---

check it out by running `npx <your-module-name-here>` inside whatever folder you like.

![the cli in action](https://dev-to-uploads.s3.amazonaws.com/i/ipvi0qs3nelvhhbh1lgo.gif)

woohoo, we are all done.

![party](https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy-downsized.gif)
**Check out my other blog posts on dev.to**

{% link https://dev.to/galelmalah/5-cli-tools-that-will-increase-your-dev-velocity-and-code-quality-1fe8 %}

{% link https://dev.to/galelmalah/what-is-scaffolder-and-how-you-can-use-it-to-increase-your-team-dev-velocity-558l %}

{% link https://dev.to/galelmalah/9-great-tips-to-use-array-methods-like-a-pro-dcc %}
