---
title: '5 CLI Tools That Will Increase Your Velocity and Code Quality'
date: 2020-11-09T11:30:03+00:00
tags: ['productivity']
author: 'Gal Elmalah'
cover:
  image: 'media/cover.jpg' # image path/url
  alt: 'bubbles' # alt text
---

Everyone likes CLI's (or maybe it's just me).

I have compiled a list of the CLI's I use on a daily basis, some are well known some are less so, but all of them help me get things done faster and some even help me keep my code cleaner.

> This list is ordered from most used to least used on a daily basis.

## 1. [z - Go from A to Z with ease](https://github.com/agkozak/zsh-z)

This one will make you look like a ninja and help you boost your productivity!
In a gist `z` helps you navigate your file system faster.

Basically, it ranks all the directories you visit, and given a query, it will take you to the directory that will most likely match your query.

![z in action](https://dev-to-uploads.s3.amazonaws.com/i/q91wsgp7ewjdmh0dsrmj.gif)

---

## 2. [Scaffolder - Generate boilerplate code with ease](https://github.com/galElmalah/scaffolder)

Hate copy-pasting files?
You want to make sure all of your modules follow the same structure?
You want to generate boilerplate code i.e react components or a complete project set up in an intuitive and easy way?
Scaffolder got your back, you can define templates with dynamic parameters and generate them easily with a [CLI](https://github.com/galElmalah/scaffolder#getting-started) or a [vscode extension](https://github.com/galElmalah/scaffolder/tree/master/packages/scaffolder-vscode).

> In essence, it will save you tons of time

There are tons of other features as well, like sharing templates via GitHub or defining your own functions to be run inside your templates.

![Scaffolder in action](https://dev-to-uploads.s3.amazonaws.com/i/e0v3qu2r82fu3hcr3hlm.gif)

P.S, I wrote it, so I'm kind of biased. Feel free to leave a star or a feature request

---

## 3. [tldr-pages - Just show me how to use this](https://github.com/tldr-pages/tldr)

From the project repo:

> "The tldr-pages project is a collection of community-maintained help pages for command-line tools, that aims to be a simpler, more approachable complement to traditional man pages."

Essentially you'll get a bunch of useful examples for the command you specified

![tldrgif](https://dev-to-uploads.s3.amazonaws.com/i/pmh1vkkuhgbdazd9l20k.gif)

---

## 4. [np - Publish npm packages like a pro](https://github.com/sindresorhus/np)

Hate going through the same routine each time you publish your npm package? np will help you automate this process while adding many other goodies like GitHub release tags and multiple versions of increment strategies.
It's described well in the project repo "A better `npm publish`".

![np in action](https://dev-to-uploads.s3.amazonaws.com/i/a27sdsgum0cap5q2qjbq.gif)

---

## 5. [lerna - One repo to rule them all](https://github.com/lerna/lerna)

Did you ever develop multiple packages that depend on one another? if so, then you know the pain of npm links, building, testing, and publishing all of the relevant packages.
If you didn't get the pleasure of managing this stuff manually, then let me save you the trouble and introduce you to `lerna` your new best friend

> You might also want to check [yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)

---

### Go ahead and give these CLI's a try and tell me what you think in the comment section

**You might be interested in the following posts**  
[Create and Publish Your First CLI Using Typescript](../create-and-publish-your-first-cli-using-typescript/)

_Got any CLI tools that help you increase your dev velocity and quality? Leave a comment and share them with the rest of us_
