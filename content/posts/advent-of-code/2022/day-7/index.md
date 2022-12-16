---
title: 'No Space Left On Device'
date: 2022-12-08T11:45:03+00:00
tags: ['Advent of Code', 'Go', 'Learning Go']
author: 'Gal Elmalah'
showToc: true
description: 'Advent of Code day 7 solution'
cover:
  image: 'media/aoc.jpg' # image path/url
  alt: 'computer terminal' # alt text
---

## No Space Left On Device

[Question](https://adventofcode.com/2022/day/7)
This was a fun day! we finally got something challenging.

We got a device from the elves when trying to update that device we got an error that notifies us that there isn't enough memory on our device

```
$ system-update --please --pretty-please-with-sugar-on-top
Error: No space left on the device
```

To determine what's going on we start exploring the device file system and record the output (our puzzle input)
For example

```
$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k
```

represent the following structure

```
- / (dir)
  - a (dir)
    - e (dir)
      - i (file, size=584)
    - f (file, size=29116)
    - g (file, size=2557)
    - h.lst (file, size=62596)
  - b.txt (file, size=14848514)
  - c.dat (file, size=8504156)
  - d (dir)
    - j (file, size=4060174)
    - d.log (file, size=8033020)
    - d.ext (file, size=5626152)
    - k (file, size=7214296)
```

When I first solved it I iterated over all commands and didn't create any kind of structure and just kept track of the current dir and update its parent size once we are done with it.
I thought about trying something a bit more interesting for this post, let's create a file system representation from our input and use it later to answer today's puzzle

First, we need to make sense of each line of our input, for that we are going to create a tokenizer!
our tokens

```go
// token/token.go
package token

type TokenType string

const (
	Cd   TokenType = "Cd"
	Ls   TokenType = "Ls"
	File TokenType = "File"
	Dir  TokenType = "Dir"
)

type Token struct {
	Type    TokenType
	Literal string
}

```

We have 4 types of tokens, one for each type of output line.
In addition, we also save the raw data in `literal` so we can make use of it later on.

Now let's write our tokenizer, its responsibility is to get our input and transform it into a list of meaningful tokens

```go
// token/tokenizer.go
package token

import "strings"

func newToken(tokenType TokenType, literal string) Token {
	return Token{
		Type:    tokenType,
		Literal: literal,
	}
}

func Tokenize(raw string) []Token {
	lines := strings.Split(string(raw), "\n")
	tokens := []Token{}
	for _, l := range lines {
		parts := strings.Split(l, " ")
                // process commands
		if parts[0] == "$" {
			if parts[1] == "ls" {
				tokens = append(tokens, newToken(Ls, l))
			} else {
				tokens = append(tokens, newToken(Cd, l))
			}
                // process ls output
		} else {
			if parts[0] == "dir" {
				tokens = append(tokens, newToken(Dir, l))
			} else {
				tokens = append(tokens, newToken(File, l))
			}
		}
	}
	return tokens
}
```

Create a struct to represent our file system

```go
type FileSystem struct {
	root *FileSystemNode
}

type FileSystemNode struct {
	Size   int
	Parent *FileSystemNode
	Token  token.Token
	Name   string
	Dirs   map[string]*FileSystemNode
}

```

Now to the fun part, going over our tokens and constructing a tree like structure based on that

```go
func newFileSystemNode(name string, token token.Token, parent *FileSystemNode) *FileSystemNode {
	return &FileSystemNode{Name: name, Parent: parent, Token: token, Dirs: map[string]*FileSystemNode{}}
}

func NewFileSystem(tokens []token.Token) *FileSystem {
	root := newFileSystemNode("/", token.Token{Type: token.Dir, Literal: "/"}, nil)
	fileSystem := &FileSystem{root}
	current := root
	for _, t := range tokens {
		switch t.Type {
		case token.File:
			current.Size += CreateFileNode(t.Literal).Size
		case token.Dir:
			node := CreateDirNode(t.Literal)
			current.Dirs[node.Name] = newFileSystemNode(node.Name, t, current)
		case token.Ls:
			continue
		case token.Cd:
			cdNode := CreateCdNode(t.Literal)
			if cdNode.To == ".." {
				current.Parent.Size += current.Size
				current = current.Parent
			} else {
				_, ok := current.Dirs[cdNode.To]
				if ok {
					current = current.Dirs[cdNode.To]
				}
			}
		default:
			fmt.Println("Unexpected token!", t)
		}

	}

	// In case we are not ending at the root node
	for current != root {
		current.Parent.Size += current.Size
		current = current.Parent
	}

	return fileSystem
}

```

We iterate over our tokens and perform some operations depending on the type of token we got

- file token: add the file size to the current dir
- dir token: create a new directory in the current dir and name it based on the token literal (the dir name)
- ls token: we don't care about it and just continue our loop
- cd token:
  - ".." literal: we change `current` to be `current.parent and add the size of the current dir to the parent
  - else, its some dir that we have seen before using `ls` and we change the current dir to be `current.Dirs[dirName]`

There are different kinds of file nodes, they are used to take the token literal and parse it into a meaningful structure.
For example, the cd node looks like this

```go
type CdNode struct {
	To string
}

func CreateCdNode(str string) CdNode {
	parts := strings.Split(str, " ")
	return CdNode{
		To: parts[2],
	}
}
```

At the end of the function we backtrack to our root directory and add each directory size in that path to its parent, this is because our output does not contain `..` commands back to the top.

Now that we have got our file system creation process all dialed in we can start implementing the first part solution

### Part 1

We are tasked to find all directories with size <= 100,000
To do that we need to have a way to walk over each directory in our file system structure. Let's add methods to support that capability

```go
func (tree *FileSystem) Walk(visitor func(t *FileSystemNode)) {
	tree.root.Walk(visitor)
}


func (node *FileSystemNode) Walk(visitor func(t *FileSystemNode)) {
	visitor(node)
	for _, t := range node.Dirs {
		t.Walk(visitor)
	}
}
```

> Both FileSystem and FileSystemNode get a `Walk` method

We pass in a function that will be called on each node in our file system.
Using the above method our solution is now as simple as

```go
func Part1(raw string) int {
	fs := parse(raw)
	sum := 0
	fs.Walk(func(node *fileSystem.FileSystemNode) {
		if node.Size <= 100000 {
			sum += t.Size
		}
	})

	return sum
}

```

### Part 2

In part 2 we are tasked with increasing the amount of free space to at least 3,000,000 we also know that the total memory on our device is 7,000,000
We need to find the smallest directory that we can delete that will increase the amount of free memory >= 3,000,000

For example (directly from the question)

\_In our example, you have the following options:

Delete directory e, which would increase unused space by 584.
Delete directory a, which would increase unused space by 94853.
Delete directory d, which would increase unused space by 24933642.
Delete directory /, which would increase unused space by 48381165.
Directories e and a are both too small; deleting them would not free up enough space. However, directories d and / are both big enough! Between these, choose the smallest: d, increasing unused space by 24933642.\_

The logic to solve part 2 is also fairly straightforward but we do need to expose the size of our `fileSystem` first

```go
func (tree *FileSystem) Size() int {
	return tree.root.Size
}
```

Part 2 solution

```go
func Part2(raw string) int {
	fs := parse(raw)

	const OS_MEM = 70000000
	const THRESHOLD = 30000000

	unusedSpace := OS_MEM - fs.Size()
	min := OS_MEM
	fs.Walk(func(node *fileSystem.FileSystemNode) {
		if unusedSpace+node.Size > THRESHOLD {
			if min > node.Size {
				min = node.Size
			}
		}
	})

	return min
}

```

For each directory, we check if by deleting it we have enough free memory `unusedSpace+t.Size > THRESHOLD` if it does we check to see if it's less than our current smallest directory.

Pheww...That's it for day 7!
I know this approach is a bit too structured for an AoC problem and initially, I solved it without building the entire structure, tokens etc...
For the sake of this blog post, I thought I'll make things a bit more structured and interesting

You can find the complete code here
Thanks for reading!
