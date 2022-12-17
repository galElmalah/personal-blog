---
title: 'Hill Climbing Algorithm'
date: 2022-12-14T11:59:03+00:00
series: ['Learning Go']
tags: ['Advent of Code', 'Go']
author: 'Gal Elmalah'
showToc: true
description: 'Advent of Code day 12 solution'
cover:
  image: 'media/cover.jpg' # image path/url
  alt: 'hills' # alt text
---

[Question](https://adventofcode.com/2022/day/12)

We are stuck at a river between two mountains, our communication device can't get a decent signal but don't worry
**THIS IS FINE!!** we can get through this if we only find a high enough place to get a signal out

cool cool cool, no doubt no doubt no doubt stay optimistic, and don't panic!!!

The one thing going for us at the moment is that we have a height map from our device, we just need to get to the heighst point and send a distress signal

Our map looks like this

```
Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi
```

Our current location is marked as **S** and our destination is marked as **E**
We are also told that the height of each location is the ASCII value of each letter
The value of **S = a** and **E = z**

This smells like a graph problem...

### Parsing

We could have used the structure of the input as is but I wanted to make it a bit more meaningful so we will parse it into a matrix of points!
First, we will create a new `Point` struct

```go
type Point struct {
  i, j, v int
}

func (p *Point) id() string {
  return fmt.Sprintf("(%d,%d)", p.i, p.j)
}

func newPoint(i, j, v int) *Point {
  return &Point{i: i, j: j, v: v}
}
```

Each point location is kept with `i` and `j`, and the value is stored in `v`.
We also create a struct method, `id` that we will probably need some time down the line

> Although I'm by no means a go expert, having a new function for a struct seems like the standard. Probably because it's a lot less verbose.

Now let's change our input matrix into a matrix of `Point`s

```go
func createPoint(i, j int, r rune) *Point {
  switch r {
  case 'S':
    return newPoint(i, j, 0)
  case 'E':
    return newPoint(i, j, int('z')-int('a'))
  default:
    return newPoint(i, j, int(r)-int('a'))
  }
}

func parse(raw string) (matrix [][]*Point, start *Point, dest *Point) {
  lines := strings.Split(string(raw), "\n")
  matrix = make([][]*Point, len(lines))
  for i := range matrix {
    matrix[i] = make([]*Point, len(lines[0]))
    rows := []*Point{}
    for j, c := range lines[i] {
      if c == 'S' {
        start = createPoint(i, j, c)
      }
      if c == 'E' {
        dest = createPoint(i, j, c)
      }
      rows = append(rows, createPoint(i, j, c))
    }
    matrix[i] = rows
  }

  return matrix, start, dest
}
```

The first thing we do is to split our input on each `\n` this will give us an array of lines AKA rows.
We will split each of these "rows" to get each "cell" in our input
For each cell, we will create a new point and push it into the current row
eventually we will end up with a matrix of points

### Part 1

We are asked to get from `S` to `E` with the least amount of steps.
Ohh and to make sure we won't get too tired along the way we can only travel from `p1` to `p2` if the value in `p2` is **at most one higher** than the value in `p1`.

Reading the first line, "with the least amount of step" this is a dead giveaway that we can and should use [BFS](https://en.wikipedia.org/wiki/Breadth-first_search)

Since we need a [Queue](https://www.geeksforgeeks.org/queue-data-structure/) to easily implement BFS and Go doesn't have anything built-in, we will need to create our Queue first
Create a new package named, well, `queue` and add the following logic and struct

```go
package queue

import "fmt"

type Queue[T comparable] struct {
  items []T
}

// Enqueue - Adds an item T to the Q
func (q *Queue[T]) Enqueue(item T) {
  q.items = append(q.items, item)
}

// Dequeue - Removes an element from the Q - FIFO
func (q *Queue[T]) Dequeue() T {
  if q.IsEmpty() {
    fmt.Println("Trying to Dequeue from an empty Queue")
  }
  firstItem := q.items[0]
  q.items = q.items[1:]
  return firstItem
}

func (q *Queue[T]) Peek() T {
  return q.items[0]
}

func (q *Queue[T]) NumberOfItems() int {
  return len(q.items)
}

func (q *Queue[T]) IsEmpty() bool {
  return len(q.items) == 0
}

```

There is nothing fancy here, just your regular Q...
Armed with our new Queue we can start implementing BFS
The gist of BFS is

1. Start from node X and push all its neighbors to the "processing" Queue
2. To avoid duplicates in that Queue we will also maintain a Set of "seen" nodes, for that we will use our simple set from [day 6](https://dev.to/galelmalah/aoc-day-6-tuning-trouble-1d9f)
3. The last thing we need is to keep track of how we got to each node, this means for point `p1` who got it inside the Queue that is the currently processed point.
   Let's look at some code

```go
func BFS(graph [][]*Point, s *Point, destination *Point) int {
  // Creating a Queue
  Q := queue.Queue[*Point]{}
  // Adding the start node to the Queue
  Q.Enqueue(s)
  // Keeping track of who got us into the Queue
  backTrack := map[string]string{}
  // Nodes we have seen
  seen := set.NewSimpleSet[string]()
  // Mark the starting node as seen to avoid pushing it into the Queue again
  seen.Add(s.id())
  // We keep going over the "graph" while there are nodes in the Queue
  for !Q.IsEmpty() {
    // The node we are currently processing
    currentNode := Q.Dequeue()
    if currentNode == destination {
      // Yay we got to our destination, we can stop searching
      break
    }

    // Get all valid neighbors from our current node
    // we will go over the implementation of getting neighbors in a minute or two
    neighbors := getNeighbors(graph, currentNode)

    for _, v := range neighbors {
      // For each neighbor, if we haven't seen it before, do the following
      // 1. mark it as seen
      // 2. mark the node that got to him i.e our currently processed node
      // 3. push it to the Queue
      if !seen.Has(v.id()) {
        seen.Add(v.id())
        backTrack[v.id()] = currentNode.id()
        Q.Enqueue(v)
      }
    }
  }
  // go over the route to the destination node and count the number of steps it took us
  return count(backTrack, destination.id())
}

// simple recursive function that uses the node id to jump from p1 to p2 where p2 is the node that got p1 into the Queue
func count(backTrack map[string]string, id string) int {
  v, ok := backTrack[id]
  if ok {
    return 1 + count(backTrack, v)
  }
  return 0
}

func getNeighbors(graph [][]*Point, sink *Point) (neighbors []*Point) {
  // moves represent our up, right, down, and left options
  moves := [][]int{{-1, 0}, {0, 1}, {1, 0}, {0, -1}}
  for _, move := range moves {
    // add the current move to the origin point
    di, dj := move[0]+sink.i, move[1]+sink.j
    // if the new indexes are inbound of our matrix/graph
    if di >= 0 && di < len(graph) && dj >= 0 && dj < len(graph[0]) {
      delta := graph[di][dj].v - sink.v
      // We were also told in the question that we need to make sure we make moves of at most 1
      if delta <= 1 {
        neighbors = append(neighbors, graph[di][dj])
      }
    }
  }
  return neighbors
}

```

I tried making everything as clear as possible but if there is something you are struggling with, hit me up in the comment section

Our final solution looks like this

```go
func Part1(raw string) int {
  graph, start, dest := parse(raw)
  steps := BFS(graph, start, dest)
  return steps
}
```

### Part 2

Part 2 is where things gets interesting, we are now asked to find the shortest path to our destination point but we can use every `a` in our map as a starting position and `S`
We can take a naive approach here and see if it works, what's the naive approach you ask?
Find all starting nodes and from each of those run our BFS and keep track of the minimum value
This also means that we need to change our parsing function to collect all starting points

```go
// start is now an array of points
func parse2(raw string) (matrix [][]*Point, start []*Point, dest *Point) {
  lines := strings.Split(string(raw), "\n")
  matrix = make([][]*Point, len(lines))
  for i := range matrix {
    matrix[i] = make([]*Point, len(lines[0]))
    rows := []*Point{}
    for j, c := range lines[i] {
      if c == 'S' || c == 'a' {
        start = append(start, createPoint(i, j, c))
      }
      if c == 'E' {
        dest = createPoint(i, j, c)
      }
      rows = append(rows, createPoint(i, j, c))
    }
    matrix[i] = rows
  }

  return matrix, start, dest
}
```

And our solution for part 2 will look like this

```go
func getMinValue(arr []int) (m int) {
  for i, e := range arr {
    if i == 0 || e < m && e != 0 {
      m = e
    }
  }
  return md
}

func Part2NaiveApproach(raw string) int {
  graph, start, dest := parse2(raw)
  steps := []int{}
  for _, s := range start {
    res := BFS(graph, s, dest)
    if res > 0 {
      steps = append(steps, res)
    }
  }

  return getMinValue(steps)
}
```

This works for the question input which surprised me but it takes about 3 seconds to complete, we can do better!

There's one thing that comes to mind, why do we need to do a BFS from each node, can't we just add all those starting nodes to our Queue as starting nodes?
Well, we can! its called [multi-source BFS](https://www.geeksforgeeks.org/multi-source-shortest-path-in-unweighted-graph/),
I happen to know this approach from solving the monster question on CSES, [give it a try](https://cses.fi/problemset/task/1194).

Before we start tweaking things and trying new approaches, let's write some benchmarks so we can make sure what we are doing have an impact.

```go
func BenchmarkPart1(b *testing.B) {
  input := util.ReadFile("./input.txt")

  for n := 0; n < b.N; n++ {
    Part1(input)
  }
}

func BenchmarkPart2NaiveApproach(b *testing.B) {
  input := util.ReadFile("./input.txt")

  for n := 0; n < b.N; n++ {
    Part2NaiveApproach(input)
  }
}

```

Run `go test bench=. -count 2`

```
BenchmarkPart1-8                             183           7225891 ns/op
BenchmarkPart1-8                             182           7127653 ns/op
BenchmarkPart2NaiveApproach-8                  1        1530454249 ns/op
BenchmarkPart2NaiveApproach-8                  1        1476970916 ns/op
```

ophh... our naive approach is slow. it only run ones and took `1530454249ns` which is roughly 1.53 seconds
compared to our part 1 results, this is just awful!

Our Multi-Source BFS approach is similar to our original BFS but there are changes in the first couple of lines

```go
// s is now an array of starting points
func MultiSourceBFS(graph [][]*Point, s []*Point, destination *Point) int {
  Q := queue.Queue[*Point]{}
  seen := set.NewSimpleSet[string]()
  // for each starting point push int into the Queue and mark it as seen
  for _, v := range s {
    Q.Enqueue(v)
    seen.Add(v.id())
  }
  ...
  ...
```

See the complete code [here](https://github.com/galElmalah/aoc-2022/blob/master/day-12/main.go#L119)

Let's write a benchmark for our Multi-Source BFS approach

```go
func BenchmarkPart2MultiSourceBfs(b *testing.B) {
  input := util.ReadFile("./input.txt")
  // run the Fib function b.N times
  for n := 0; n < b.N; n++ {
    Part2MultiSourceBfs(input)
  }
}

```

Wow, what a difference! Our Multi-source BFS run ~205 times and each run took only `~5841816ns` which is roughly 0.0058 seconds!
That's about 274 times faster!

```
BenchmarkPart1-8                             184           7306437 ns/op
BenchmarkPart1-8                             181           6429481 ns/op
BenchmarkPart2NaiveApproach-8                  1        1475075477 ns/op
BenchmarkPart2NaiveApproach-8                  1        1450753723 ns/op
BenchmarkPart2MultiSourceBfs-8               205           5841816 ns/op
BenchmarkPart2MultiSourceBfs-8               204           5818908 ns/op
```

So we had a fun graph problem and we have seen a few approaches to solve it, what a fun day!
hopefully, you learned something new from this day post.

As a final note I'll leave you all with a question, is there an even better way of doing what we just did?
Can we perhaps change our logic a bit and start from a different node and get our desired answer in an even more efficient way?
Let me know in the comments if you have any ideas :)

---

That's it for today, see you tomorrow ⭐️

You can find the complete code [here](https://github.com/galElmalah/aoc-2022/tree/master/day-12)
Thanks for reading!
