---
title: 'The role of test drivers'
date: 2020-10-07T11:59:03+00:00
tags: ['testing', 'TDD', 'clean code', 'abstractions']
author: 'Gal Elmalah'
showToc: true
cover:
  image: 'media/9-array-methods-cover.png'
  alt: 'js array methods' # alt text
---

Often times, I find my test files becomes a big mess. hundred of lines and some duplications 
In this post, I'm going to share some tips that relate to tests and the role of test drivers in creating clear and simple tests that are easy to read and maintain.
I am going to show these using a simple example server project written in Typescript.

The tools in our toolbox to enable 

## Test driver, huh?!
// image of stunt driver or something funny
A test driver is usually a class or a function that "drives" the behavior and action happening in your test suite, some people will advocate for separating the driver from the setup but I am not a purist to the extreme.

## Our Example Project
All of the code can be found [here](link to github).
Its basically a fastly server that saves and serves blog posts (how ironic) to and from an in-memory data-structure

## Test driver split
Given - exisitng state before we actually perform any action, for ecaxmple: we have a user details in our DB (signup flow)
When - some action happens, this usually is the action that we are going to check the effect of in our system.

Assertions - Not really 
