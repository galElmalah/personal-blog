---
title: "Advent of Code Day 4 - Camp Cleanup"
date: "2022-12-04T11:40:03+00:00"
author: "Gal Elmalah"
tags:
  - "Advent of Code"
  - "Go"
  - "Coding Questions"
draft: false
showToc: true
series: "Learning Go"
description: "Introduction to my journey learning Go"
cover: "/images/posts/advent-of-code-2022-day-4/aoc.jpg"
coverAlt: "forest"
---

[Question](https://adventofcode.com/2022/day/4)
Seems like this time we are tasked with optimizing the elves' cleaning tasks! those elves can improve their lists...
The cleaning tasks are assigned to each pair of elves, for example:

```
2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8
```

> For the first few pairs, this list means:
>
> - Within the first pair of Elves, the first Elf was assigned sections 2-4 (sections 2, 3, and 4), while the second Elf was assigned sections 6-8 (sections 6, 7, 8).
> - The Elves in the second pair were each assigned two sections.

As always, let's start with parsing our list of assignments to something we can work with

## Parsing

First, let's decide what we would like our output to look like.
we can create a struct that represents each pair task but that seems a bit redundant, let's keep it simple and create something like
`[[st1, et1, st2, et2] , ... ]` where st1 and et1 is the first elf range of sections and st2 and et2 are the second elf range.

We will call a range of sections a "task" from now on.

To get that we can go with splitting on various delimiters but today I finally had an excuse to use a [Regex](https://pkg.go.dev/regexp) in go.

We will create a regex, containing [capture groups](https://pkg.go.dev/regexp/syntax) for each `t` and use
[FindStringSubmatch](https://pkg.go.dev/regexp#Regexp.FindStringSubmatch) to iterate over the resulting matches.

```go
func parse(raw string) [][]int {
	lines := strings.Split(string(raw), "\n")
	pairs := [][]int{}
	r := regexp.MustCompile(`(\d+)-(\d+),(\d+)-(\d+)`)

	for _, l := range lines {
		match := r.FindStringSubmatch(l)
		pair := []int{}
		for _, m := range match[1:] {
			num, _ := strconv.Atoi(m)
			pair = append(pair, int(num))
		}
		pairs = append(pairs, pair)
	}

	return pairs
}

```

> Its worth noting that the first match is the entire string we are passing and that's why we are skipping it when looping over the results `range match[1:]`

## Part 1

The elves are really smart and noticed that some tasks entirely overlap with their partner tasks.
We are tasked with finding and counting those overlaps.

Let's draw this out so it will be a bit clearer

```
.234.....  2-4 // no overlapping
.....678.  6-8

.23......  2-3 // no overlapping
...45....  4-5

....567..  5-7 // just a partial overlapping NOT GOOD ENOUGH
......789  7-9

.2345678.  2-8
..34567..  3-7 // contained in 2-8

.....6...  6-6 // contained in 4-6
...456...  4-6

.23456...  2-6 // again, partial overlapping
...45678.  4-8
```

From the above, we can say that if one of the elves' starting tasks is greater or equal to the other elf starting task AND the final task is smaller or equal, then the assignment is contained.
We now write a solution to part 1

```go
func part1(raw []byte) int {

	var assignments = parse(string(raw))
	count := 0
	for _, pairAssignmentRange := range assignments {
		st1 := pairAssignmentRange[0]
		et1 := pairAssignmentRange[1]
		st2 := pairAssignmentRange[2]
		et2 := pairAssignmentRange[3]
		if (st1 >= st2 && et1 <= et2) || (st2 >= st1 && et2 <= et1) {
			count++
		}

	}

	return count

}
```

> If you know a better way to take those values from `pairAssignmentRange` let me know in the comment section

## Part 2

We are asked to count overlapping tasks of any kind meaning its enough that we will have one overlapping "section" in our range for it to count as an overlap
What does that mean in code? it means that we are looking for tasks that are ending inside the range of the other task.
For example

```
....567..  5-7
......789  7-9
```

These tasks overlap over "section" 7.
We can now write our part 2 solution as follows

```go

func part2(raw []byte) int {
	var assignments = parse(string(raw))
	count := 0
	for _, pairAssignmentRange := range assignments {
		st1 := pairAssignmentRange[0]
		et1 := pairAssignmentRange[1]
		st2 := pairAssignmentRange[2]
		et2 := pairAssignmentRange[3]
		if (et1 >= st2 && et1 <= et2) || (et2 >= st1 && et2 <= et1) {
			count++
		}

	}

	return count
}

```

The only thing we changed was the `if` statement to look at the ending task "section"

To sum things up, each day I feel more and more confident with Go, and the task's code starts flowing.  
I think that one of Go's upsides is that the language is fairly small without any fancy concepts so the learning curve is not that long or hard.

You can find the complete code [here](https://gist.github.com/galElmalah/ddc546f264eb55d56bc762bd1118cced)
Thanks for reading!
