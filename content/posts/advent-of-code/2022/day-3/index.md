---
title: 'Rucksack Reorganization'
date: 2022-12-04T11:30:03+00:00
series: ['Learning Go']
tags: ['Advent of Code', 'Go', 'Learning Go']
author: 'Gal Elmalah'
showToc: true
description: 'Introduction to my journey learning Go'
cover:
  image: 'media/legolas.jpg' # image path/url
  alt: 'legolas from lord of the rings meme' # alt text
---

[Question](https://adventofcode.com/2022/day/3)
We are going into the jungle! We put Legolas in charge of packing the supplies for our journey but it seems like his packing abilities are nothing like his bow-aiming skills and he kind of sucks at packing...
We do however have a manifest of the items in each rucksack, that list looks as follows

```
vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw
```

Each line represents one rucksack and each half of the line represents a compartment inside a rucksack.
Items are identifiable by their chars, and yes, "A" and "a" are not the same items.
For example
The first rucksack contains the items `vJrwpWtwJgWrhcsFMMfFFhFp`, which means its first compartment contains the items `vJrwpWtwJgWr`, while the second compartment contains the items `hcsFMMfFFhFp`. The only item type that appears in both compartments is lowercase p.

To help prioritize item rearrangement, every item type can be converted to a priority:

Lowercase item types a through z have priorities 1 through 26.
Uppercase item types A through Z have priorities 27 through 52.

> _In the above example, the priority of the item type that appears in both compartments of each rucksack is 16 (p), 38 (L), 42 (P), 22 (v), 20 (t), and 19 (s); the sum of these is 157._

### Part 1

In part one we are tasked with summing up the priority of items that appears in both compartments

Let's start with parsing our input

#### Parsing

Ideally, we would like to have an array containing a tuple with a set for each half
for example `vJrwpWtwJgWrhcsFMMfFFhFp -> [ [set(vJrwpWtwJgWr), set(hcsFMMfFFhFp)]... ]`
We are choosing a set DS here to have the ability to easily answer the question "is the letter X in set Y?" later on

```go
// go doesn't have a built in Set DS so we need to roll our own here
func makeSet(chars string) map[rune]bool {
	set := map[rune]bool{}
	for _, c := range chars {
		set[c] = true
	}
	return set
}

func parse() [][]map[rune]bool {
	data, _ := os.ReadFile("./input.txt")
	lines := strings.Split(string(data), "\n")

	rucksacks := [][]map[rune]bool{}
	for _, line := range lines {
		c1 := makeSet(line[:len(line)/2])
		c2 := makeSet(line[len(line)/2:])
		w := []map[rune]bool{c1, c2}
		rucksacks = append(rucksacks, w)
	}

	return rucksacks
}

```

> Interesting to note that we are getting each char as a [rune](https://www.geeksforgeeks.org/rune-in-golang/) which is the ASCII value of said char

> We are using `:` to slice our line into two parts, `line[x:]` means slice from `x` until the end, and `lines[:x]` means slice from the beginning of the array until `x`

#### Solution

Now that we are done preparing our data we can write the following code to calc the priority of each char

```go
func calcPriority(c rune) int {
	if c >= 'a' && c <= 'z' {
		return int(c) - 'a' + 1
	} else {
		return int(c) - 'A' + 27
	}
}
```

Basically, we are taking our rune, deducting the base value e.g 'a' or 'A', and adding the range from the question, meaning, lowercase from 1 to 26 and uppercase from 27 to 52

> This code won't work if I use double quotes in the comparison since you can't compare strings and runes, the single quotes actually define 'a' as having the type `rune`

---

Ok we are all ready to go now, let's solve part 1
We are going to iterate over all rucksacks and for each one of those find the letter that is in the first compartment and the second one.
When we find one, we pass it along to our calcPriority function and accumulate its value

```go
func pt1() int {
	groups := parse()
	sum := 0
	for _, group := range groups {
		s1 := group[0] // first compartment
		s2 := group[1] // second compartment
		for k, _ := range s1 {
			if s2[k] {
				sum += calcPriority(k)
			}
		}
	}

	return sum
}
```

cool cool cool, we're all done with part 1 let's see what part 2 got in store for us

### Part 2

We are not tasked with finding the priority of the group badges, a badge is defined to be an `item` that is contained in 3 consecutive rucksacks

From the example input above we can draw the following example

```
vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
```

And the second group's rucksacks are the next three lines:

```
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw
```

In the first group, the only item type that appears in all three rucksacks is lowercase `r`; this must be their badges. In the second group, their badge item type must be `Z`.

Priorities for these items must still be found to organize the sticker attachment efforts: here, they are 18 (r) for the first group and 52 (Z) for the second group. The sum of these is 70.

We will need to tweak our parsing code a bit to create sets for chunks of 3 rows at a time, this looks like this

```go
func chunkInto(s []string, size int) [][]string {
	results := [][]string{}
	for i := 0; i < len(s); i += size {
		results = append(results, s[i:i+size])
	}
	return results
}


func parse2() [][]map[rune]bool {
	data, _ := os.ReadFile("./input.txt")
	rows := strings.Split(string(data), "\n")
	groups := chunkInto(rows, 3)
	rucksacks := [][]map[rune]bool{}
	for _, chunk := range groups {
		w := []map[rune]bool{}
		for _, c := range chunk {
			w = append(w, makeSet(c))
		}
		rucksacks = append(rucksacks, w)
	}
	return rucksacks
}
```

We can now solve part 2 very similarly to part 1

```go
func pt2() int {
	groups := parse2()

	sum := 0
	for _, group := range groups {
		s1 := group[0]
		s2 := group[1]
		s3 := group[2]
		for k, _ := range s1 {
			if s2[k] && s3[k] {
				sum += calcPriority(k)
			}
		}
	}

	return sum
}
```

And that's it for today boys and girls, I hope you are enjoying AoC as much as I do so far 🙂

---

You can find the complete code [here](https://gist.github.com/galElmalah/3830293074bad10cde7d7b949e87f0a5)
Thanks for reading!
