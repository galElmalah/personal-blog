---
title: 'Visualizing Bubble Sort in 5 Minutes Using HTML5 Canvas API'
date: 2020-11-02T11:30:03+00:00
tags: ['Javascript', 'HTML', 'algorithms']
author: 'Gal Elmalah'
showToc: true
weight: 2
description: Visualize what?!'
cover:
  image: 'media/cover.jpg' # image path/url
  alt: 'bubbles' # alt text
---

For most developers, bubble sort is one of the first algorithms we learn. Therefore, visualizing it can be highly satisfying and feels a bit like meeting an old friend after a long time.

This article will take you through visualizing the bubble sort algorithm using [HTML5 canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).

If you would like to jump straight to the results and have a look at the code, [here is a codepen](https://codepen.io/gal8914/pen/ExVJJeb).

In the meantime, below is a little sneak peek of what we are going to accomplish here.
![Outcome Text](https://dev-to-uploads.s3.amazonaws.com/i/9tmdcuh2gtzl21id4fx1.gif)

---

If you want to follow along, run the following command to get the initial boilerplate code generated into your working directory.

```bash
npx scaffolder-cli i --from-github https://github.com/galElmalah/scaffolder-canvas-template.git --template canvas && cd visualizing-bubble-sort
```

> This will leverage [Scaffolder](https://github.com/galElmalah/scaffolder) to create the initial setup.

Or create a basic `index.html` file and `script.js`.

## Now lets jump right ahead and start coding

> All of the javascript code is written in `script.js`.

The first thing we will need is an unsorted array to sort. 
Let's write a helper function for creating shuffled arrays.

{{< gist galelmalah 66b49f69f9b1346eb709b5088bacb895 >}}

Cool. Now, we will write a simple implementation of the bubble sort algorithm.

{{< gist galElmalah 9b6c55c50ffcb3f5cb4d9c5ba5cc3c6e >}}

Next, we'll get our canvas and create a context.

{{< gist galElmalah 5fc668e90e90abe41c0373573495dca1 >}}

---

So we got all the basics covered, and now it's up to us to decide how to visualize the array. 
The most straightforward way is to just draw a rectangle corresponding to each array element, and set the height according to that element value (the higher the value the higher the rectangle will be).

Here is a representation of our custom rectangle.

{{< gist galElmalah 43c6bf1ae60edbce4b9274b2c4ab8fab >}}

---

Let's test that everything is working as expected, by drawing our shuffled array.

{{< gist galElmalah 77c2cecf46a4161baca35af32076808a >}}

---

Multiply each height param by 5 to get a nice scale, so each pixel will equal 5 pixels.

> We can make the height and width of the rectangle dynamic, by making it span the full height and width of the screen.
> Try doing this yourself.
> [Here](https://codepen.io/gal8914/pen/ZEbNyXP) is a working example for the lazy ones (notice the `calcMembersHeightScale` and `calcMembersWidth` functions).

---

If all goes well, you should see something similar to the following in your browser.
![expected result](https://dev-to-uploads.s3.amazonaws.com/i/d3601d17xhfdks6umfqa.png)

---

Now, let's go back to our sorting function. What are the actions and states we care about? compare, swap, and sort.
Let's add a custom action dictionary.

{{< gist galElmalah a44353e93c59bbcee545658d34b4d481 >}}

Change our bubble sort function to accept an `onAction` callback, and call it when an action is made in our bubble sort with the appropriate action.

{{< gist galElmalah f2c6708d5ecbd3f58edf42a0bf0fd84f >}}

## We are almost done so hang in there!

What should we do in each action?
Give the members a different color based on the action, and "move" them if necessary - which will just be swapping their values.
Now let's create an action map, according to our known actions.

{{< gist galElmalah 1a659b2fd9981116360215305cfa3d71 >}}

We seem to have all of the parts needed in order to visualize this nifty little thing!
Let's give it a try.

{{< gist galElmalah 5fdfc9cc26336e16aea346032a544044 >}}

I'll be damned! it seems like we got only the fully sorted state.
How can we solve this? we need to time our painting somehow.
Let's add two variables, `speed` which will determine how much time will pass between each step, and `ticks` to count each call to our `onAction` callback.
{{< gist galElmalah b71096146695cea31ec814c3fed18b6c >}}

A couple of things you should notice in the above example:

- Clearing the canvas on each iteration.
- Resetting the color property for all of our rectangles on each iteration.

---

Now putting it all together, we should end up with something like this.

{{< gist galElmalah a227a2b12557d4c799adfc2a57e4a422 >}}

And there you have it, we just visualized this cool algorithm in 5 minutes!

{{< codepen id="ExVJJeb" >}}

---

Hope you enjoyed this little blog post!
![victory dance](https://media.giphy.com/media/2Yc1CBBFBR3Glp1MVO/giphy-downsized.gif)

_If you liked this visualization, check out some more [sorting algorithms visualizations](https://galelmalah.github.io/sorting-visualisations/) I created._
