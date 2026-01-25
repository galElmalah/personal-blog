---
title: "Advent of Code Day 5 - Supply Stacks"
date: "2022-12-05T11:30:03+00:00"
author: "Gal Elmalah"
tags:
  - "Advent of Code"
  - "Go"
  - "Coding Questions"
draft: false
showToc: true
series: "Learning Go"
description: "Advent of Code day 5 solution"
cover: "/images/posts/advent-of-code-2022-day-5/aoc.jpg"
coverAlt: "crane"
---

[Question](https://adventofcode.com/2022/day/5)

Welcome to day 5 of AoC, aka, annoying AF parsing day.

We are crane operators!
What do we want?! More stacks and crates!

Anyhow, we are charged to execute a series of delicate manuvers using our insane crane skills

Our input is given to us as follows

```
    [D]
[N] [C]
[Z] [M] [P]
 1   2   3

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2
```

The first half represents the current state of stacks and crates.
The second one is a series of moves we need to perform.

**Crates can only be moved one at a time!**

## Parsing

How can we parse that input into something meaningful?
Well first let's seprate both halves using

```go
parts := strings.Split(raw, "\n\n")
rawStacks := parts[0]
rawMoves := parts[1]
```

Now let's tackle parsing the crates!

> _One way we can go about it is simply copy-pasting our input into an object by hand but where is the fun in that?!_

If we look closely at our input we might notice that the letters fit in chunks of four chars, for example

```

 0 | 1 | 2 | // positions in chunks array
xxxxxxxxxxxx
    [D]
[N] [C]
[Z] [M] [P]
 1   2   3
             // row 1 col 1,2,3
chunks -> [ ["   ","[D] ","   "] ...]
```

Armed with that information we can write the following code to prase crates and classify them into the right stack

```go
func parseStacks(crates []string) [][]string {
	stacks := make([][]string, 9)
	for _, row := range crates {
		rowOfCrates := chunkBy(strings.Split(row, ""), 4)
		for crateNo, crateCandidate := range rowOfCrates {
			for _, char := range crateCandidate {
				if char >= "A" && char <= "Z" {
					//pre-appending an element to array
					stacks[crateNo] = append([]string{char}, stacks[crateNo]...)
				}
			}
		}
	}
	return stacks
}

```

Let us look at the list of instructions, each line represents one command `move x from y to z`, lets's create a struct to populate exactly that and turn our list into a list of those structs

```go
type Instruction struct {
	amount int
	from   int
	to     int
}

func toInts(fromStrings []string) (result []int) {
	for _, n := range fromStrings {
		num, _ := strconv.Atoi(n)
		result = append(result, num)
	}
	return result
}

func parseInstructions(rawInstructions []string) (instructions []Instruction) {
	matcher := regexp.MustCompile(`move (\d+) from (\d+) to (\d+)`)
	for _, line := range rawInstructions {
		match := toInts(matcher.FindStringSubmatch(line)[1:])
		instructions = append(instructions, Instruction{
			amount: match[0],
			from:   match[1] - 1,
			to:     match[2] - 1,
		})
	}

	return instructions
}

```

Combining `parseInstructions` and `parseStacks` to get our `parse` function

```go
func parse(raw string) ([][]string, []Instruction) {
	chunks := strings.Split(string(raw), "\n\n")
	rawCrates := strings.Split(chunks[0], "\n")
	rawInstructions := strings.Split(chunks[1], "\n")

	return parseStacks(rawCrates), parseInstructions(rawInstructions)
}
```

> In go you can have [more than one return value](https://gobyexample.com/multiple-return-values).

## Part 1

Perform the list of instructions then construct a string built from the top crate of each stack, for example in our current example its `NDP` but after the instructions are applied its `CMZ`

Using our parsed instructions and stacks, the solution becomes quite trivial

```go
func Part1(raw string) string {

	stacks, instructions := parse(string(raw))

	// applying instructions
	for _, instruction := range instructions {
		from := instruction.from
		to := instruction.to
		// another approach is to create a slice of size amount from `moveFrom`
		// reverse that slice and push it to `moveTo` but the approach here is much simpler to reason about
		for i := 0; i < instruction.amount; i++ {
			stacks[to] = append(stacks[to], stacks[from][len(stacks[from])-1])
			stacks[from] = stacks[from][:len(stacks[from])-1]
		}
	}

	answer := ""
	for _, stack := range stacks {
		if len(stack) > 0 {
			answer += stack[len(stack)-1]
		}
	}

	return answer

}
```

And that's it for part one, besides the parsing it was quite simple.

## Part 2

Something was off with our stacks, we went to make sure that our crane is CrateMover 9000 but it was the 9001 model! this means we can move multiple crates at once.

The meaning of this in the context of the code we wrote is that we don't need to preserve a stack-like order when moving crates, the top element from our source crane will stay on top instead of being at the bottom of the crates we are moving

```go
func Part2(raw string) string {
	stacks, instructions := parse(string(raw))
	// mutating the stacks
	for _, instruction := range instructions {
		from := instruction.from
		to := instruction.to
		amount := instruction.amount
		takeRange := len(stacks[from]) - amount
		// take items from `takeRange` until the end of the slice and append them to the target stack
		stacks[to] = append(stacks[to], stacks[from][takeRange:]...)
		// remove items that come after the `takeRange` from our source crate
		stacks[from] = stacks[from][:takeRange]
	}

	answer := ""
	for _, stack := range stacks {
		if len(stack) > 0 {
			answer += stack[len(stack)-1]
		}
	}

	return answer

}
```

That's it for day 5 of AoC, hoped you enjoyed reading it, and feel free to suggest improvements to my poor Go or solution

You can find the complete code here
Thanks for reading!
