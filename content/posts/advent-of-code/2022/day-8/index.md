---
title: 'Treetop Tree House'
date: 2022-12-08T11:59:03+00:00
series: ['Learning Go']
tags: ['Advent of Code', 'Go', 'Coding Questions']
author: 'Gal Elmalah'
showToc: true
description: 'Advent of Code day 8 solution'
cover:
  image: 'media/aoc.jpg' # image path/url
  alt: 'trees' # alt text
---

[Question](https://adventofcode.com/2022/day/8)

The elves come to you with a problem, they want to build a tree house but they want to make sure that they have enough cover.

We are given a map of the forest with a number representing each tree's height.

```
30373
25512
65332
33549
35390
```

## Parsing

We care about the location of each tree and its height.
All of the above is available to us if we parse our map into a matrix `[][]int`

```go
func parse(raw string) [][]int {
	rows := strings.Split(string(raw), "\n")
	matrix := make([][]int, len(rows))
	for i, row := range rows {
		matrix[i] = make([]int, len(row))
	}

	for i, row := range rows {
		for j, c := range row {
			matrix[i][j] = util.ParseInt(string(c))
		}
	}

	return matrix
}
```

## Part 1

We are tasked with determining how many visible trees there are on the map.

A tree is visible from a given direction (up, right, down, and left) only if all the trees directly on that line and to the edge are shorter than him.

From that definition, we can deduce that every tree on the edge of the map is visible and an initial amount of visible trees from the get-go

```go
// (len(mat)-2)*2 top and bottom rows - the shared elements with the columns
// len(mat[0])*2 right and left most columns
visibleTrees := (len(mat)-2)*2 + len(mat[0])*2
```

Now for every other tree we need to check if its visible from some direction
To do that, we will write 4 functions, each to check a different direction

```go

func checkLeft(mat [][]int, i, j int) bool {
	for k := j - 1; k >= 0; k-- {
		if mat[i][k] >= mat[i][j] {
			return false
		}
	}
	return true
}

func checkRight(mat [][]int, i, j int) bool {
	for k := j + 1; k < len(mat[0]); k++ {
		if mat[i][k] >= mat[i][j] {
			return false
		}
	}
	return true
}

func checkUp(mat [][]int, i, j int) bool {
	for k := i - 1; k >= 0; k-- {
		if mat[k][j] >= mat[i][j] {
			return false
		}
	}
	return true
}

func checkDown(mat [][]int, i, j int) bool {
	for k := i + 1; k < len(mat[0]); k++ {
		if mat[k][j] >= mat[i][j] {
			return false
		}
	}
	return true
}

```

For each direction, we are going all the way until the edge, if at some point one of the trees is taller than our current tree we return false and try another direction.

Let's see the complete solution for part one

```go
func Part1(raw string) int {
	mat := parse(raw)
	visibleTrees := (len(mat)-2)*2 + len(mat[0])*2

	for i, row := range mat {
		if i == 0 || i == len(mat)-1 {
			continue
		}

		for j, _ := range row {
			if j == 0 || j == len(row)-1 {
				continue
			}
			if checkLeft(mat, i, j) {
				visibleTrees++
				continue
			}
			if checkRight(mat, i, j) {
				visibleTrees++
				continue
			}
			if checkUp(mat, i, j) {
				visibleTrees++
				continue
			}
			if checkDown(mat, i, j) {
				visibleTrees++
				continue
			}

		}
	}

	return visibleTrees
}

```

We have an `if` statement at the beginning of each loop to make sure we are not counting the edges again.

This solution is very verbose and there are a lot of ways we can optimize it, for example keeping track of the tallest tree in each column and row and with that information skipping some of the checks.

But...the current solution is fast enough and run's in 0.35s on my local machine with my AoC input.

## Part 2

Calculate how many trees are visible from each tree in every direction, multiply the numbers and find the maximum value tree in our map

We are going to take our check functions and create a similar counterpart, named `calc<Direction>`

```go
func calcLeft(mat [][]int, i, j int) int {
	vis := 0
	for k := j - 1; k >= 0; k-- {

		if mat[i][k] >= mat[i][j] {
			return vis + 1
		}
		vis++
	}
	return vis
}

func calcRight(mat [][]int, i, j int) int {
	vis := 0
	for k := j + 1; k < len(mat[0]); k++ {
		if mat[i][k] >= mat[i][j] {
			return vis + 1
		}
		vis++
	}
	return vis
}

func calcUp(mat [][]int, i, j int) int {
	vis := 0
	for k := i - 1; k >= 0; k-- {
		if mat[k][j] >= mat[i][j] {
			return vis + 1
		}
		vis++
	}
	return vis
}

func calcDown(mat [][]int, i, j int) int {
	vis := 0
	for k := i + 1; k < len(mat[0]); k++ {
		if mat[k][j] >= mat[i][j] {
			return vis + 1
		}
		vis++
	}
	return vis
}

```

Each calc function returns the number of trees that are visible from a point on the map.

Our solution now is fairly simple, for each tree we calculate a score based on the instructions.
We then compare that score with our current max and swap them if needed.

```go
func Part2(raw string) int {
	mat := parse(raw)
	max := 0
	for i, row := range mat {
		for j, _ := range row {
			score := calcLeft(mat, i, j) * calcRight(mat, i, j) * calcUp(mat, i, j) * calcDown(mat, i, j)
			if score > max {
				max = score
			}
		}
	}

	return max
}

```

That's it for today, see you tomorrow ⭐️

You can find the complete code here
Thanks for reading!
