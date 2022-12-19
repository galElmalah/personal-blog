---
title: 'Rock Paper Scissors 🪨🧻✂'
date: 2022-12-02T11:40:03+00:00
series: ['Learning Go']
tags: ['Advent of Code', 'Go', 'Coding Questions']
author: 'Gal Elmalah'
showToc: true
description: 'Introduction to my journey learning Go'
cover:
  image: 'media/aoc.jpg' # image path/url
  alt: 'aoc meme' # alt text
---

[Question](https://adventofcode.com/2022/day/2)

> _The Elves begin to set up camp on the beach. To decide whose tent gets to be closest to the snack storage, a giant Rock Paper Scissors tournament is already in progress._

God the question's description is always pure gold...now let's jump right in.

We are given a string, our "strategy guide" that represents a rock, paper, scissors turn decision.
The string is divided into two columns, the first represents the first player's decision and the second ours.
For example:

```
A Y
B X
C Z
```

We are also told the following:
For player 1 - A = Rock, B = Paper, C = Scissors
For player 2 - X = Rock, Y = Paper, Z = Scissors
We are also given a score table for the outcome and the decision we made, for example, a win is 6 points and choosing paper is 2 points, etc...

Like previous questions, we'll start by parsing our input

#### Parsing

We can go (see what I did there?) with several options to represent our game but in my opinion, an array of tuples is the simplest option

```go
func parse(raw string) [][]string {
	chunks := strings.Split(string(raw), "\n")
	pairs := make([][]string, len(chunks))
	for i := range pairs {
		pairs[i] = strings.Split(chunks[i], " ")
	}

	return pairs
}
// example output
// [ [A, Y], [B, X], [C, Z] ]
```

> The [make](https://go.dev/tour/moretypes/13) function allocates a piece of memory in a certain, specified size for our array

### Part 1

We are asked to provide our total score if we play exactly as instructed in the strategy guide.
Let's think about this for a bit, there are several ways we can solve this, we can use a bunch of `if` statements or some fancy pattern matching, since go does not have pattern matching and I don't want to write a ton of `if` statements we will go with a hybrid approach.
We will create 3 different mappings:

1. Represents the points we get for our choice e.g rock, paper, or scissors
2. Winning state, meaning If we choose X what does the other player need to choose for us to Win
3. Tie state, essentially the same as .2

```go
scores := map[string]int{
	"X": 1,
	"Y": 2,
	"Z": 3,
}

// If I choose X(Rock) I need him to choose C(scissors) in order to win
win := map[string]string{
	"X": "C",
	"Y": "A",
	"Z": "B",
}

tie := map[string]string{
	"X": "A",
	"Y": "B",
	"Z": "C",
}
```

> We don't take into account the losing state since its essentially a no-op (0 points)

Building on top of these maps and our parsing logic, we can now solve the first part with the following code

```go
func part1(raw []byte) int {

	pairs := parse(string(raw))

	// X Rock, Y Paper, Z Scissors
	scores := map[string]int{
		"X": 1,
		"Y": 2,
		"Z": 3,
	}

	win := map[string]string{
		"X": "C",
		"Y": "A",
		"Z": "B",
	}

	tie := map[string]string{
		"X": "A",
		"Y": "B",
		"Z": "C",
	}

	score := 0
	for _, pair := range pairs {
		his := pair[0]
		my := pair[1]
		score += scores[my]
		if win[my] == his {
			score += WINNING_POINTS
		}

		if tie[my] == his {
			score += TIE_POINTS
		}

	}
	return score

}
// output for part 1 based on the example is
// 15 -> (8 + 1 + 6)
```

At each loop iteration we first add the points based on our choice `score += scores[my]` then we check if `his` move is what we need based on our player choice, to win or get a tie, and if it is we add the necessary points to our total score.

### Part 2

In part two the sneaky elves switch things up a bit.
Instead of our column representing our moves, it represents the turn outcome where X = lose, Y = tie, and Z = win and we need to choose our choice accordingly.
For example, let's look at the first turn `A Y`, the new meaning of this pair is "player one chose Rock, and the game ended in a tie" building on this information we can create new mappings, the new mappings will be between player 1 choice and the choice player 2 need to make to get to a certain state e.g winning, losing, tie, etc...
Since it's pretty similar to part 1, we will jump right ahead and look at part 2 as a whole

```go
func part2(raw []byte) int {

	var pairs = parse(string(raw))

	// X Lose, Y Tie, Z Win
	scores := map[string]int{
		"X": 1,
		"Y": 2,
		"Z": 3,
	}

	win := map[string]string{
		"C": "X",
		"A": "Y",
		"B": "Z",
	}

	tie := map[string]string{
		"A": "X",
		"B": "Y",
		"C": "Z",
	}

	lose := map[string]string{
		"A": "Z",
		"B": "X",
		"C": "Y",
	}
	score := 0

	for _, pair := range pairs {
		hisMove := pair[0]
		myMove := pair[1]

                // we lose
		if myMove == "X" {
			score += scores[lose[hisMove]]
		}
                // we end in a tie
		if myMove == "Y" {
			score += TIE_POINTS
			score += scores[tie[hisMove]]
		}
                // we win
		if myMove == "Z" {
			score += WINNING_POINTS
			score += scores[win[hisMove]]
		}
	}
	return score
}
```

For each desired state we check what move we need to do based on player 2 choice and pass it down to the `scores` map.

That's it we are all done with paper, rock, scissors and I must admit that I didn't think it can be so confusing 🤣

You can find the complete code [here](https://gist.github.com/galElmalah/a6b80b9bc9d3c6e00f79ceea2aca5773)
Thanks for reading!
