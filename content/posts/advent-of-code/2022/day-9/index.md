---
title: 'Rope Bridge'
date: 2022-12-10T11:59:03+00:00
series: ['Learning Go']
tags: ['Advent of Code', 'Go', 'Learning Go']
author: 'Gal Elmalah'
showToc: true
description: 'Advent of Code day 9 solution'
cover:
  image: 'media/aoc.jpg' # image path/url
  alt: 'bridge rope' # alt text
---

[Question](https://adventofcode.com/2022/day/9) AkA doing weird rope physics!

You come across an old rope bridge and you are not sure it can hold your fat a\*\* so you decide to model some rope physics to distract yourself (like that's going to help...)

**Directly from AoC**
_Consider a rope with a knot at each end; these knots mark the **head** and the **tail** of the rope. If the head moves far enough away from the tail, the tail is pulled toward the head._

We are given a series of moves to be done by the head, for example:

```
R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2
```

### Parsing

Defining an `Instruction` struct, each instruction has a direction `L,R,U,D` and steps `<number of steps to perform>`
Iterating over our input we can map each line to our new instruction struct as follows

```go
type Instruction struct {
  direction string
  steps     int
}

func parse(raw string) (instructions []Instruction) {
  lines := strings.Split(string(raw), "\n")
  for _, l := range lines {
    parts := strings.Split(l, " ")
    instructions = append(instructions, Instruction{direction: parts[0], steps: util.ParseInt(parts[1])})
  }
  return instructions
}
```

### Part 1

We are asked to simulate the position of the tail after each instruction execution
We will treat both the head and tail as if they are starting from position `0,0`

We know that the head should change its `x` or `y` value based on the current instruction direction.
Let's create a struct to represent a Point and expose a method `move` that mutates the point accordingly

```go
type Point struct {
  x, y int
}

func (p *Point) move(direction string) {
  switch direction {
  case "L":
    p.x--
  case "R":
    p.x++
  case "U":
    p.y--
  case "D":
    p.y++
  }
}

func newPoint(x, y int) *Point {
  return &Point{x, y}
}
```

Now lets start writing our solution for part 1

```go

instructions := parse(raw)
  head, tail := newPoint(0, 0), newPoint(0, 0)

  visited := set.NewSimpleSet[string]()
  for _, ci := range instructions {
    for i := 0; i < ci.steps; i++ {
      head.move(ci.direction)
      // we need to adjust the tail point according to the head location
    }

  }

  return visited.Size()
}

```

>     Next, adjust the tail point according to the head point

From the question description

> Due to the aforementioned Planck lengths, the rope must be quite short; in fact, the head (H) and tail (T) must always be touching (diagonally adjacent and even overlapping both counts as touching):

As you can see, we need to "touch" the head at any point in time, or in other words, the distance between the points `x` and `y` cords is always less than 2

```go
func (p *Point) adjust(leadingPoint *Point) {
  dx := util.Abs(leadingPoint.x - p.x)
  dy := util.Abs(leadingPoint.y - p.y)

  if dx >= 2 || dy >= 2 {
    if leadingPoint.x > p.x {
      p.x++
    } else if leadingPoint.x < p.x {
      p.x--
    }

    if leadingPoint.y > p.y {
      p.y++
    } else if leadingPoint.y < p.y {
      p.y--
    }
  }
}
```

Armed with our new point structure we can implement the actual logic for part 1
We will use our [SimpleSet from day 6](https://dev.to/galelmalah/aoc-day-6-tuning-trouble-1d9f) to keep track of the number of points the tail visited
The size of that set will be the answer for this part

```go
func Part1(raw string) int {
  instructions := parse(raw)
  head, tail := newPoint(0, 0), newPoint(0, 0)

  visited := set.NewSimpleSet[string]()
  for _, ci := range instructions {
    for i := 0; i < ci.steps; i++ {
      visited.Add(tail.id())
      head.move(ci.direction)
      tail.adjust(head)
    }

  }

  return visited.Size()
}
```

### Part 2

Crap the rope just snaps and for some reason that does not make any sense we now have **10** knots to simulate... that's what happens when you combine elves and rope physics.

At first glance, this seems complicated but in reality, we just need to think about the new requirements as an array of points where `points[j]` is the tail of `points[j+1]` and for each move adjust all `tail` points according to their relative `heads`

```go
func Part2(raw string) int {
  instructions := parse(raw)
  // 1 point for the leading edge + 9 tail points
  knots := make([]*Point, 10)

  // All points start from 0,0
  for i, _ := range knots {
    knots[i] = newPoint(0, 0)
  }

  visited := set.NewSimpleSet[string]()


  for _, ci := range instructions {
    for i := 0; i < ci.steps; i++ {
      // Move the actual head
      knots[0].move(ci.direction)

      // Adjust each point relative to its head
      for j := 0; j < len(knots)-1; j++ {
        head, tail := knots[j], knots[j+1]
        tail.adjust(head)
      }
      visited.Add(knots[len(knots)-1].id())
    }
  }

  return visited.Size()
}

```

Same as part one, we keep track of the points we visited using our `SimpleSet`

---

That's it for today, see you tomorrow ⭐️

You can find the complete code here
Thanks for reading!
