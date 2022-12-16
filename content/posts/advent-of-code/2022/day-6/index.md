---
title: 'Tuning Trouble'
date: 2022-12-05T11:45:03+00:00
series: ['Learning Go']
tags: ['Advent of Code', 'Go', 'Learning Go']
author: 'Gal Elmalah'
showToc: true
description: 'Advent of Code day 6 solution'
cover:
  image: 'media/aoc.jpg' # image path/url
  alt: 'tv noise' # alt text
---

[Question](https://adventofcode.com/2022/day/6)
Finally, we move out of camp!
As we start heading out of the camp one of the elves gives us a communication device, it will come as no surprise that we got the only malfunctioning device...

The device receives streams of signals that are built from a list of chars, to fix our device we need to be able to find the _start-of-packet marker_.

### Part 1

We are told that the start of the packet is defined as a series of **four different consecutive chars**.
Given our signle, we need to determine how many chars should be processed before the first marker appears or in other words the index at the end of our marker.

For example, `mjq<start>jpqm<end>gbljsphdztnvjfqwrcgsmlb`

> `<start>` and `<end>` represents the start and end of the marker accordingly

meaning the answer should be **7** (index of `m`)

Basically what we need to accomplish here is to find 4 consecutive chars in a row, there are multiple ways of doing this but we will use `Sets` to count the number of unique chars within a given range i.e i -> i+4
In each position of that range, we will take the char and add it to our set, at the end of the range if the set size is 4 then we got a winner and we can return our current index `i` + 4.

> Set is a data structure that guarantees the uniqueness of each key, in Go, there isn't a built-in type for that but we can easily create a set using a `map[rune]bool` type to make this a bit more interesting let's create a generic set package

#### Set

We will create a package called `set` and in it, a struct named `SimpleSet` that will support a basic set of operations

- Add
- Has
- Size
  Here is the code for our `SimpleSet`

```go
package set

type SimpleSet[T comparable] struct {
	items map[T]bool
}

func NewSimpleSet[T comparable](values ...T) *SimpleSet[T] {
	m := make(map[T]bool)

	return &SimpleSet[T]{
		items: m,
	}
}

func (s *SimpleSet[T]) Add(key T) {
	s.items[key] = true
}

func (s *SimpleSet[T]) Has(key T) bool {
	_, ok := s.items[key]
	return ok
}

func (s *SimpleSet[T]) Size() int {
	return len(s.items)
}

```

I'm using generics to have this set useful in days to come, you can read more about it [here](https://go.dev/blog/intro-generics)

I don't get how come Go didn't have generics until recently, imagine repeating the same code for our set for every type!

---

Armed with our new set, lets solve part 1!

```go
func Part1(raw string) int {
	for i := range raw {
		set := set.NewSimpleSet[rune]()
		for _, c := range raw[i : i+4] {
			set.Add(c)
		}

		if set.Size() == 4 {
			return i + 4
		}
	}
	return -1
}
```

### Part 2

Exactly like part 1 but now the marker needs to be 14 consecutive chars
We can take our part 1 solution and have it accept an offset to fit both parts

```go
func Part1(raw string, offset int) int {
	for i := range raw {
		set := set.NewSimpleSet[rune]()
		for _, c := range raw[i : i+offset] {
			set.Add(c)
		}

		if set.Size() == offset {
			return i + offset
		}
	}
	return -1
}
```

Our part 2 solution will be `Part1(input, 14`.

The solution can be optimized a bit by returning early if a char is already in our set, before we do anything we first need to measure our current solution.

This can be easily done using [Go benchmarks](https://pkg.go.dev/testing#hdr-Benchmarks) capabilities.

Create a new file `main_test.go` and write our benchmarks there

```go
package main

import (
	"testing"

	"github.com/galElmalah/aoc-2022/util"
)

func BenchmarkPart1(b *testing.B) {
	input := util.ReadFile("./input.txt")
	// run the Fib function b.N times
	for n := 0; n < b.N; n++ {
		Part1(input, 4)
	}
}

func BenchmarkPart2(b *testing.B) {
	input := util.ReadFile("./input.txt")
	// run the Fib function b.N times
	for n := 0; n < b.N; n++ {
		Part1(input, 14)
	}
}

```

Running `go test -bench=. -count 3` results in

```
BenchmarkPart1-8            3819            285783 ns/op
BenchmarkPart1-8            3873            285734 ns/op
BenchmarkPart1-8            4021            284767 ns/op
BenchmarkPart2-8            1086           1083411 ns/op
BenchmarkPart2-8            1083           1073575 ns/op
BenchmarkPart2-8            1046           1075867 ns/op
```

Now let's add the following `if` to our inner loop

```go
if set.Has(c) {
    break
}
```

re-run the benchmark

```
BenchmarkPart1-8            3607            296341 ns/op
BenchmarkPart1-8            3748            294505 ns/op
BenchmarkPart1-8            3734            289663 ns/op
BenchmarkPart2-8            2490            465996 ns/op
BenchmarkPart2-8            2526            454670 ns/op
BenchmarkPart2-8            2541            451878 ns/op
```

we can see that for part 1 there is barely an improvement but for part 2 that early return does make a noticeable difference, awesome!

That's it for today, we created our very own Set data structure and used go benchmarks to optimize our solution.

I hoped you enjoyed and learned something new cause I sure did!

You can find the complete code here
Thanks for reading!
