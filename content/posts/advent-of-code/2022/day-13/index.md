---
title: 'Advent of Code Day 13 - Distress Signal'
date: 2022-12-19T05:33:23.419Z
series: ['Learning Go']
tags: ['Advent of Code', 'Go', 'Coding Questions']
author: 'Gal Elmalah'
showToc: true
description: 'Advent of Code day 13 solution'
cover:
  image: 'media/cover.png' # image path/url
  alt: '<alt text>' # alt text
---

[Question](https://adventofcode.com/2022/day/13)

> Phew... This took a lot of googling to get right. Working with unstructured data in Go wasn't as simple as I'm used to from JS. Having said that, I think the outcome is quite alright.

The communication device is still acting up...
We receive a distress signal but it seems like the packets are arriving out of order (our puzzle input).

Packet pairs are separated by an empty line and the packet data is represented as integers and a list of integers.

**Example**

```
[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]

```

## Parsing

Splitting parsing into two parts:

1. Parse the raw input into pairs of packets
2. Deserialize each packet

### Parse the raw data into packets pairs

From the question description, we know that packets are separated into pairs that and each pair is separated by an empty line
Within a pair, each packet is on its on line.

```go
  var packets []string
  packetPairs := strings.Split(string(raw), "\n\n")
  for _, l := range packetPairs {
    parts := strings.Split(l, "\n")
    packets = append(packets, parts...)
  }
```

At this stage, our data looks something like this

```
// example packet pair
[1,1,3,1,1]
[1,1,5,1,1]

[["[1,1,3,1,1]", "[1,1,5,1,1]"], ...//other pairs]
```

### Deserialize each packet

Let's take that string and construct something meaningful from that, in our case, it's going to be an array of integers and arrays.  
Luckily for us, the packets are a valid JSON string, we can use Go built-in [json.Unmarshal](https://pkg.go.dev/encoding/json#Unmarshal) function.

The `json.Unmarshal` accepts our JSON string in byte formats and some variables to assign the results to.
Ideally, we would like the variable we assign the results to have a type that reflects that recursive nature but as far as I can tell it's not possible in go.

```go
// Ideal type
type intOrArrayOfInt = [](int | intOrArrayOfInt)
type Deserialized = intOrArrayOfInt
```

Instead, we will assign the results to variables of type `any` and handle the different types in our logic using [type assertion](https://go.dev/ref/spec#Type_assertions).
Our `parse` function now looks like this

```go
func parse(raw string) []any {
  var packets []any
  packetPairs := strings.Split(string(raw), "\n\n")
  for _, l := range packetPairs {
    var left, right any
    parts := strings.Split(l, "\n")
    json.Unmarshal([]byte(parts[0]), &left)
    json.Unmarshal([]byte(parts[1]), &right)

    packets = append(packets, left, right)
  }

  return packets
}
```

## Part 1

We are asked to find **valid** pairs of packets and sum up their indexes.  
But what exactly is an **invalid** pair of packets you ask?!

For each index `i` in our pair of packets, we need to make sure that the following holds
There is some index `i` such that `left[i] < right[i]`, if at any index `j` where `j < i` we find that `left[j] > right[j]` or we run out of items in our `right` packet before our `left` we say that that packet pair as invalid!

**Example**

```
// The "nothing special" pair
== Pair 1 ==
- Compare [1,1,3,1,1] vs [1,1,5,1,1]
  - Compare 1 vs 1
  - Compare 1 vs 1
  - Compare 3 vs 5
    - Left side is smaller, so inputs are in the right order
...
...
// The "my right side numbers are smaller" pair
== Pair 3 ==
- Compare [9] vs [[8,7,6]]
  - Compare 9 vs [8,7,6]
    - Mixed types; convert left to [9] and retry comparison
    - Compare [9] vs [8,7,6]
      - Compare 9 vs 8
        - Right side is smaller, so inputs are not in the right order

// The "my left side is the same as your right side and we are all human beings" pair
== Pair 4 ==
- Compare [[4,4],4,4] vs [[4,4],4,4,4]
  - Compare [4,4] vs [4,4]
    - Compare 4 vs 4
    - Compare 4 vs 4
  - Compare 4 vs 4
  - Compare 4 vs 4
  - Left side ran out of items, so inputs are in the right order

// The "my right side is shorter, fuck!" pair
== Pair 5 ==
- Compare [7,7,7,7] vs [7,7,7]
  - Compare 7 vs 7
  - Compare 7 vs 7
  - Compare 7 vs 7
  - Right side ran out of items, so inputs are not in the right order
```

Now we need to write the actual logic that enforces those rules.
The first thing we notice is that on equal numbers we keep going until we find a violation or we succeed, this means that a simple `true`/`false` return value is not sufficient. We need a way to say `lower`, `equal`, and `greater`, we can do just that using simple subtraction and setting `0` as our `equal` point, and `greater` marks an invalid packet pair

We will start by writing a `compare` function that takes `left` and `right` as arguments and using type assertion validate that they are of type `array`.

```go
func compare(left, right any) int {
  leftArr, isLeftArray := left.([]any)
  rightArr, isRightArray := right.([]any)
  ...
}
```

We will build our logic based on `isLeftArray` and `isRightArray`, they represent the success or failure of the assertion, basically answering the question "Is it an array of any type?"

We now have 5 cases to deal with

1. Both are not arrays -> return `left` - `right`
2. Only `left` is not an array -> wrap `left` in an array and call `compare`
3. Only `right` is not an array -> wrap `right` in an array and call `compare`
4. Both are not arrays -> call `compare` for each element in range
5. We run out of items -> subtract the `len` of each side

```go
func compare(left, right any) int {
  leftArr, isLeftArray := left.([]any)
  rightArr, isRightArray := right.([]any)
  if !isLeftArray && !isRightArray {
    return int(left.(float64) - right.(float64))
  } else if !isLeftArray {
    return compare([]any{left}, right)
  } else if !isRightArray {
    return compare(left, []any{right})
  }

  for i := 0; i < util.Min(len(leftArr), len(rightArr)); i++ {
    res := compare(leftArr[i], rightArr[i])
    // at some point we either found an invalid pair of numbers or a valid one, either way, we will stop and return the result.
    if res != 0 {
      return res
    }
  }

  return len(leftArr) - len(rightArr)

}
```

When both `left` and `right` are not arrays we cast them to `float64` since that's the actual type the deserialization gave us back and not an `int`

We have a working `compare` function, let's utilize it in our solution

```go

func Part1(raw string) int {
  packets := parse(raw)
  sum := 0

  for i := 0; i < len(packets)-1; i += 2 {
    rs := compare(packets[i], packets[i+1])
    if rs <= 0 {
      sum += int((i +
    }
  }

  return sum
}
```

> Adding 2 to each index to compensate for the fact that we start from zero and then divide by 2 to account for `i` jumping 2 steps on each iteration

## Part 2

> Now, you just need to put all of the packets in the right order. Disregard the blank lines in your list of received packets.

We are asked to add two divider packets `[[2]]` and `[[6]]` to our received packets, then sort our packets in the right order according to the rules described in part 1.
After we sort our packets we need to find the divider packets indexes and multiply them together to get our answer for part 2. easy peasy!

Luckily for us, we created our compare function in a way we can easily reuse to sort our packets.

```go
func stringifyPacket(p any) string {
  packet, _ := json.Marshal(p)
  return string(packet)
}

func Part2(raw string) int {
  packets := parse(raw)
  div1, div2 := []any{[]any{float64(2)}}, []any{[]any{float64(6)}}
  div1Str, div2Str := stringifyPacket(div1), stringifyPacket(div2)

  packets = append(packets, div1, div2)

  sort.Slice(packets, func(i, j int) bool { return compare(packets[i], packets[j]) < 0 })

  res := 1
  for i, p := range packets {
    if len(p.([]any)) == 1 {
      packet := stringifyPacket(p)
      if packet == div1Str || packet == div2Str {
        res *= i + 1
      }
    }
  }

  return res
}

```

The only other thing to note here is how we find the divider packets, what I did is pretty shitty but all of those types gave me a major headache and I ended up stratifying the packets and comparing the actual strings.  
A better solution will be to maybe pack them in a struct and assign IDs, pass pointers instead of values so we can compare the memory addresses or assert the length is one and the values are either 2 or 6.

---

That's it for today, see you tomorrow ⭐️

You can find the complete code [here](https://github.com/galElmalah/aoc-2022/blob/master/day-13/main.go)
Thanks for reading!
