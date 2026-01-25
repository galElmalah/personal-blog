---
title: "9 Great Tips To Use Javascript Array Methods Like a Pro!"
date: "2020-10-07T11:59:03+00:00"
author: "Gal Elmalah"
tags:
  - "Javascript"
  - "tips"
  - "clean code"
draft: false
showToc: true
cover: "/images/posts/9-array-methods-tips/9-array-methods-cover.png"
coverAlt: "js array methods"
---

As a developer, I always reflect upon the code I write and read. Through this process, I have collected a bunch of useful tips.
In this post, I'm going to share those tips that relate to array methods.

Although I'm talking about array methods, these tips apply in other situations. Keep them in mind while you code.

### The tips

Some are better naming conventions and rules on when to apply them.
Some are little tricks to make your code cleaner.
Most of them are very opinionated :smile:.

> I tried categorizing them into _general_ and _specific_ tips to make it easier to digest and use as a reference.

## General tips

### Name your functions

Future readers of the code shouldn't have to think about what's that function is doing. Be a nice human and use meaningful names.

```javascript
const numbers = [1,2,3,4];

 // BAD - I need to think about what this function is doing
numbers.filter(num => num % 2 === 0);

// GOOD - I can read this line and immediately tell what's going on.
const isEven = num => num % 2 === 0);
numbers.filter(isEven);
```

### Don't pass arguments from one function to another

Array methods call functions that were sent to them with [specific arguments](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map). There is no need to explicitly pass those arguments through another function.

```javascript
const numbers = [1, 2, 3, 4];
const multiplyByTwo = (num) => num * 2;

// BAD - There is no need to explicitly pass num.
numbers.map((num) => multiplyByTwo(num));

// GOOD
numbers.map(multiplyByTwo);
```

### Use partial application

Do you need more than whats passed to you by the array method? Use partial application.

> don't know what's a partial application? [check this out](https://en.wikipedia.org/wiki/Partial_application).

```javascript
const numbers = [1, 2, 3, 4];

// BAD
const multiplyBy = (num, multiplier) => num * multiplier;
numbers.map((num) => multiplyBy(num, 2));

const multiplyBy = (multiplier) => (num) => num * multiplier;
// GOOD
numbers.map(multiplyBy(2));

// GOOD - more verbose
const multiplyByTwo = multiplyBy(2);
numbers.map(multiplyByTwo);
```

### Break long chains or Assign them to a variable/function

When I see 3 or 4 levels of array methods chained together without anything indicating the result of that chain, I ask myself, Why? Why do I have to go over each line and figure out what the result is going to be?
There are two ways we can solve this.

1.  Break the chain - assign the result of each line to a variable and operate on that variable.
2.  Assign the result to a function or a variable with a meaningful name.

let's say we want to find all employees that are above 18, give them a random bonus and then get the sum of their salaries.

```javascript
const employees = [{name:"bruce banner", age:21, salary: 1500}, ...];
const isAboveEighteen = (employ) => employ.age > 18;
const addRandomBonus = (employ) => ({...employ, salary: employ.salary*(Math.random() + 1)});
const toSumOfSalaries = (sum, employ) => sum + employ.salary;

// BAD - I need to think how each line effect the next one and what will be the outcome
employees
  .filter(isAboveEighteen)
  .map(addRandomBonus)
  .reduce(toSumOfSalaries);

// Breaking the chain
const aboveEighteenEmployees = employees.filter(isAboveEighteen);
const salariesWithBonus = aboveEighteenEmployees.map(addRandomBonus);
const sumOfSalaries = salariesWithBonus.reduce(toSumOfSalaries);

// Assign the result
// *If we need to reuse this then we would use a function
const aboveEighteenAfterBonusSumOfSalaries = employees
      .filter(isAboveEighteen)
      .map(addRandomBonus)
      .reduce(toSumOfSalaries);

```

---

## Map tips

### When transforming from type A to B use "toB" as the function name and "A" or "fromA" as the function argument

For example, let's say we want to transform error codes into human-readable error messages.

> In this example **A** is `errorCode` and **B** is `errorMessage`.

```javascript
const errorCodes = [1, 2, 3];
const errorCodesMessages = {1: "your code is great!", 2: "your code is awesome!".... };

const toErrorMessage = (fromErrorCode) => errorCodesMessages[fromErrorCode];
errorCodes.map(toErrorMessage);
```

In this example, it's clear from our code what we intend to do.
`toErrorMessage` function conveys that we are transforming to **B**.
Our array should tell us that we are operating on error codes. But, if we screw up the naming of the array, then it's clear from the function argument we are operating on **A**.

### Performing actions

We can use the same convention we used in the above example, but it feels a bit awkward and overly verbose.
Instead, for actions, we will just state the action we are performing.

Let's say we want to add a unique id to an array of users

```javascript
const users = [{name: "john doe", email: "johnDoe@evilcorp.com"}, ....];
const addId = obj => ({...obj, id: uuid()});
users.map(addId);
```

---

## Filter tips

### Use it when it's the right tool for the job

When is `filter` the right tool for the job? When you want to get a subset of an array based on some condition.
In other cases, where you want to get a specific member, assert that a condition holds for at least one member or for all of them, use `find`, `some`, or `every` - **know your tools and when to use them**.

> Don't really know these methods? Read about them [find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find), [some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some) and [every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)

```javascript
const peoples = [{ name: "Bruce Wayne", country: "USA", city: "Gotham",... }, ...];

// find
const isBruceWayne = person => person.name === "Bruce Wayne";
peoples.filter(isBruceWayne)[0]; // BAD
peoples.find(isBruceWayne); // GOOD

// some
const isFromTheUSA = person => person.country === "USA";
// has peoples from USA?
!!peoples.filter(isFromTheUSA)[0];  // BAD
peoples.some(isFromTheUSA);  // GOOD

// every
const isNotFromTheUSA = person => person.country !== "USA";
// everyone from the USA?
!peoples.filter(isNotFromTheUSA)[0]  // BAD
peoples.every(isFromTheUSA)  // GOOD
```

### Make it sound like a question

This one applies to all conditional statements.
If the return value of our function is a `boolean` i.e `true` or `false`, then we should write our function in a way that will read like a question.

```javascript
const numbers = [1,2,3,4]

// BAD - Reads like a statment
const even = num => num % 2 === 0);
numbers.filter(even);

// GOOD - Reads like a question
const isEven = num => num % 2 === 0);
numbers.filter(isEven);
```

_Some common prefixes are `is`, `has`, `should`..._

### Check for multiple conditions in one pass

If you want to check for multiple conditions in one pass, use [ramda](https://ramdajs.com/) [anyPass](https://ramdajs.com/docs/#anyPass) and [allPass](https://ramdajs.com/docs/#allPass) functions when you want to combine multiple conditions while adhering to [SRP](https://en.wikipedia.org/wiki/Single-responsibility_principle).

For example, let's say we want to get all the even numbers that are bigger than 10 OR odd numbers that are smaller than 10.

```javascript
import R from 'ramda';
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
// This is a simple example but you can imagine how it can get out of control.
const isAValidNumber = (num) => {
  if (num % 2 === 0 && num > 10) {
    return true;
  }
  if (num % 2 && num < 10) {
    return true;
  }
};

// Good - We've split our logic into small, reusable functions, that do one thing.
const isEven = (num) => num % 2 === 0;
const isOdd = (num) => !isEven(num);
const isBiggerThanTen = (num) => num > 10;
const isSmallerThanTen = (num) => num < 10;
const isValidNumber = R.anyPass([
  R.allPass([isBiggerThanTen, isEven]),
  R.allPass([isSmallerThanTen, isOdd]),
]);
numbers.filter(isValidNumber);
```

We added some code, but look at it, it's so clear what we want to achieve!

_If you don't like the functional approach or your team is not familiar with `ramda`, there are other ways to get the same result, like plugging the functions we wrote into the `if` statements in the first implementation of `isValidNumber`._

> Want to apply multiple functions in one pass using map? check out `ramda` [pipe](https://ramdajs.com/docs/#pipe) or [compose](https://ramdajs.com/docs/#compose).

---

## Got any tips to share?

Those were my greatest hits for using array methods.
Got any tips of your own? Found something new or interesting in this post?
Leave a comment and share this post with your fellow developers:smile:
