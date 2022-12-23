---
title: 'Cathode-Ray Tube'
date: 2022-12-13T11:59:03+00:00
series: ['Learning Go']
tags: ['Advent of Code', 'Go', 'Coding Questions']
author: 'Gal Elmalah'
showToc: true
description: 'Advent of Code day 10 solution'
cover:
  image: 'media/aoc.jpg' # image path/url
  alt: 'trees' # alt text
---

[Question](https://adventofcode.com/2022/day/10)

Crap seems like our rope physics knowledge from yesterday didn't help and we wound up in the river...
The elves are nowhere to be found and our communication system is spitting out weird signals and noise
Luckily we can probably get this device up and running in no time we just need to make a drop-in replacement for the device's video system.
To do that we need to decode the instructions from the CPU and the register value first

We are given the CPU output and told that each operation takes `Y` cycles to complete, for example:

```
noop
addx 3
addx -5
```

- addx - takes two rounds, add the right-hand value to X
- noop - take one round, does nothing

## Parsing

First, Create a new `Instruction` struct

```go
type Instruction struct {
  cycles int
  value  int
}
```

Compared to previous days the parsing here is a piece of cake

```go
func parse(raw string) (instructions []*Instruction) {
  lines := strings.Split(string(raw), "\n")

  for _, l := range lines {
    if strings.Contains(l, "noop") {
      instructions = append(instructions, &Instruction{cycles: 1, value: 0})
    } else {
      parts := strings.Split(l, " ")
      instructions = append(instructions, &Instruction{cycles: 2, value: util.ParseInt(parts[1])})
    }
  }
  return
}
```

you might notice that our function signature is a bit weird, it ends with `(instructions []Instruction) ` and we return nothing at the end of the function.
This syntax creates a variable at the top of our function, and the last return statement is called a "naked" return, which returns `instructions` by default.
In my opinion, it shouldn't be used for any function with more than a couple of lines of code, instead, we should use the named variable and `return instructions` but for the sake of learning new things we will stick with the "naked" return (I kind of like that terminology)

## Part 1

We need to sample the value in register X\*ticks in various CPU cycles, more precisly during the `20th, 60th, 100th, 140th, 180th, and 220th` cycles and sum them up

There is no kind of gotchas in these sort of questions (usually), most simulation question just needs to be carefully read and then directly apply the instructions in the code

**Directly from AoC**
_addx V takes two cycles to complete. **After** two cycles, the X register is increased by the value V. (V can be negative._
_noop takes one cycle to complete. It has no other effect._

the thing to note here is that the instruction value takes effect only **after** the specific number of cycles has passed

So what does our solution needs to do?

1. Go over each instruction
2. Keep track of the system `ticks` (not the same as cycle)
3. Keep track of X
4. Sample X in each one of the intervals
5. Run each instruction Y number of cycles
6. Update X after each instruction

We are adding a notion of `ticks`, ticks happen on every run regardless of the number of cycles an instructions should take

```go
func Part1(raw string) int {
  instructions := parse(raw)
  x := 1
  result := 0
  ticks := 0
  for _, ci := range instructions {
    for j := 0; j < ci.cycles; j++ {
      ticks++ // updating ticks on every cycle
      if ticks%20 == 0 && ticks%40 != 0 {
        result += x * ticks
      }
    }
    x += ci.value
  }

  return result
}
```

## Part 2

using the value of X during each tick we need to draw some stuff to the screen
Our screen is 40 pixels wide and its height is 6 pixels

There is no notion of vertical positions, meaning that our x value needs to be translated to the range we defined above 40\*6

We are told there is a `sprite` 3 pixels long and the `x` value determines her center position.
During each cycle we bump our location in the screen, if the current position includes the currently drawn pixel we say it _lit_ and draw `#` otherwise its _dark_ and we draw `.`

The output of this should be a sequence of chars and that will be our answer! How cool is that right?

This question is a bit trickier than part 1 but still, the main thing is to read the instructions carefully and translate them back into code

First, lets create a screen!

```go
func printCrt(crt [][]string) {
  for i, r := range crt {
    fmt.Println(i, r)
  }
}

func makeCrt() [][]string {
  crt := make([][]string, 6)
  for i, _ := range crt {
    crt[i] = make([]string, 40)
  }
  return crt
}
```

Next comes our logic

```go
func Part2(raw string) {
  instructions := parse(raw)
  crt := makeCrt()
  x := 1
  ticks := 0
  for _, ci := range instructions {
    for j := 0; j < ci.cycles; j++ {
      row := int(ticks / 40)
      col := ticks % 40
      d := util.Abs(col - x)
      if d < 2 {
        crt[row][col] = "#"
      } else {
        crt[row][col] = "."
      }
      ticks++
    }
    x += ci.value
  }

  print(crt)
}

```

Not everything here is obvious so let's go over the tricky lines one by one:

**`row := int(ticks / 40)`** - we know that each row is 40 long, so we can divide the number ticks by the width of each row to determine in each row we should be relative to our CRT e.g `30/40 -> 0, 90/40 -> 2` etc..

**`col := ticks%40`** - we have a "window" with a length of 40 and a value that is increasing but we still want to fall into that bucker of values e.g `30%40 -> 30, 50%40 -> 10 (second row 10th pixel), 220%40 -> 20` etc...

**`d := util.Abs(col - x)`** - our delta from the center of the sprite, if its smaller than 2 (remember that x is the center of the sprite) we draw a _lit_ pixel, otherwise we draw a _dark_ pixel

#### With my input I got the following output, what about you?

![solution output](./media/output.png)

---

That's it for today, see you tomorrow ⭐️

You can find the complete code [here](https://github.com/galElmalah/aoc-2022/tree/master/day-10)
Thanks for reading!
