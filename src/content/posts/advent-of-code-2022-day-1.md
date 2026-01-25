---
title: "Advent of Code Day 1 - Calorie Counting"
date: "2022-12-02T11:30:03+00:00"
author: "Gal Elmalah"
tags:
  - "Advent of Code"
  - "Go"
  - "Coding Questions"
draft: false
showToc: true
series: "Learning Go"
description: "Advent of Code day 1 solution"
cover: "/images/posts/advent-of-code-2022-day-1/cover.jpg"
coverAlt: "donuts"
showRelatedContent: true
---

The moment we have all been waiting for, December first. The end of the year is upon us and so those [Advent of Code](https://adventofcode.com/)!

To those of you who don't know, AoC is a yearly programming competition where we try to help Santa do some funky sh\*\*.
The competition itself is speed and time based, you can read more about it [here](https://adventofcode.com/2022/about).

[Question](https://adventofcode.com/2022/day/1)

## Part 1

We are given a list of numbers where each consecutive block of numbers represents the calories an elf is carrying with him.
For example

```
1000 - \
2000 -   -> an elf carrying 6000 calories
3000 - /

4000

5000
6000

7000 - \
8000 -   ->  an elf carrying 24000 calories - the Maximum in our list
9000 - /

10000
```

This problem seems simple enough, we need to split the string on empty lines then take each chunk and sum the numbers in it.
Once we obtained the various chunks (elf calories) we can search for the maximum value and we have our answer.

### Parsing

Reading our input from a file named "input.txt"

```go
func parse() []string {
	data, _ := os.ReadFile("./input.txt")
	chunks := strings.Split(string(data), "\n\n")
	return chunks
}

 // example output
// ["1000\n2000\n3000", "4000", "5000\n6000", ....]
```

> Why are we splitting the string on "\n\n"? The only char in an empty line is "\n", combining this with the line before we get "\n\n"

#### Summing the Chunks

Adding a new function that gets a string representing a chunk e.g `1000\n2000\n3000` and returns the sum of those numbers

```go
func sumChunk(chunk string) int {
	sum := 0
	for _, num := range strings.Split(chunk, "\n") {
		v, _ := strconv.Atoi(num)
		sum += v
	}
	return sum
}
 // example output
// [6000, 4000, 11000, ....]

```

to convert a string to an int we need to import the `strconv` package and use the `atoi` function (ascii to int).
Now its probably a good point to mention that in Go you deal with errors by returning them, in the function above the `_` returned from `atoi` represent a possible error that we should deal with but since AoC is all about speed we can just tell the compiler to ignore it by naming it `_`.

#### Putting it All Together

```go
package main

import (
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
)

func main() {
	chunks := parse()
	//
	result := []int{}
	for _, chunk := range chunks {
		result = append(result, sumChunk(chunk))
	}

	sort.Ints(result)

	fmt.Println("Part 1")
	fmt.Println(result[len(result)-1])


}
```

Again for the sake of speed we will just store all the results, sort them in ascending order, using Go `sort` package and use the last position as our answer.

I know, I know I could have found the max entry by comparing them inside the for loop but you'll see it will be worth it in part 2.

## Part 2

In part 2 we are asked to return the sum of the 3 elves carrying the most calories i.e take our sorted array and sum the last 3 elements
We can easily tweak our answer to accommodate these new requirements by adding this line

```go
fmt.Println("Part 2")
fmt.Println(result[len(result)-1] + result[len(result)-2] + result[len(result)-3])
```

I used sorting to get the biggest N elements in the array but there are other more performant approaches here like using a max-heap data structure **BUT** AoC is about keeping it simple and getting a valid answer ASAP so unless you know you'll have a performance problem it's better to go with the simpler and more naive solution most often.

You can find a complete code example [here](https://gist.github.com/galElmalah/3a9b01c98d46ed8f52d8a85c419b2296)
Thanks for reading!
