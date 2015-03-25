# d3.reusable

A helper for making reusable d3 graphs

An extension of the concept from http://bost.ocks.org/mike/chart/

Using parts of http://bost.ocks.org/mike/bar/ for simplicity

Examples located [here](https://github.com/kellyselden/d3.reusable.examples)

Here is a simple example the old way:

```js
var aReusableChart = function() {
	return function(selection) {
		d3.select(selection)
			.append("div")
			.attr("class", "chart")
		  .selectAll("div")
			.data([4, 8, 15, 16, 23, 42])
		  .enter().append("div")
			.style("width", function(d) { return d * 10 + "px"; })
			.text(function(d) { return d; });
	};
};
```

And how it would look using reusable:

```js
var aReusableChart = d3.reusable(function() {
    d3.select(this)
		.append("div")
		.attr("class", "chart")
	  .selectAll("div")
		.data([4, 8, 15, 16, 23, 42])
	  .enter().append("div")
		.style("width", function(d) { return d * 10 + "px"; })
		.text(function(d) { return d; });
});
```

You always start by selecting **this**. It is the selection passed in when you are calling it later. Then you append a completely new chart so multiple instances don't interfere.

Then you can instantiate in a number of ways. Given HTML like so:

```html
<div id="container">
```

The quickest way is to call it to get a new chart, then call it again immediately if you don't want to have multiple charts. You pass in the selection the second call when the chart is going to run.

```js
aReusableChart()('#container');
```

You can also attach it to a selection like any other D3 chart:

```js
d3.select('#container')
	.call(aReusableChart());
```

Of course, the purpose of this library is reusability, so if you plan on using your chart multiple times on the page, you would instantiate it once so you can keep it around for later:

```js
var myChart = aReusableChart();
//then
myChart('#container');
//or
d3.select('#container')
	.call(myChart);
```

Now, the advanced features start with a reference to your chart instance inside the reusable definition:

```js
var aReusableChart = d3.reusable(function(me) {
	
	//access the options
	var options = me.options();
	
	//attach a public function
	me.alterChartSomehow = function() {
		//...
	};
	
	//...
});
```

You can call **me** anything you want. It gives you access to the options and a way to attach functions for public use.

## Options

The options can be used and set from both inside and outside the reusable function.

```js
//inside reusable
var options = me.options();

//outside reusable
var options = myChart.options();
```

Once you have the options object, you can alter it in the following ways:

```js
//object notation
var width = options.width;
//array notation
var height = options['height'];
//add a value to be publicly accessible
options.something = true;
//or
options['something'] = true;
```

If you need a single option, and you don't need the entire options object, you can access it via parameter:

```js
//getting
var something = me.options('something');
//setting
me.options('something', true);
```

You can also chain or merge the options:

```js
//chain
myChart.options('weight', 30).options('size', 2);
//merge
myChart.options({ weight: 30, size: 2 });
```

The options function is one of four built-in accessors that were common enough to warrant, the others are **.width()**, **.height()**, and **.data()**. If you want your own option accessor function, you can register them like so:

```js
me.registerOptionChangeDetectors('something'/*, 'somethingElse', ...*/);
```

This will allow you to call a function with that name on your chart:

```js
myChart.something(true);
```

And it will trigger the option change detection shown below.

## Public Functions

A common use for the public functions is so:

```js
//defined in reusable function
me.showSection = function(id) {
	//...
};

//called from outside, in perhaps a click handler
button2.onclick = function() {
	myChart.showSection(2);
};
```

## Option Change Detection

Option change detection is a feature that is useful for responsive charts so you don't have to rebuild the chart every time the display needs to change.

```js
var aReusableChart = d3.reusable(function() {
    var chart = d3.select(this)
		.append("div")
		.attr("class", "chart");

	chart.selectAll("div")
		.data([4, 8, 15, 16, 23, 42])
	  .enter().append("div")
		.style("width", function(d) { return d * 10 + "px"; })
		.text(function(d) { return d; });

	me.registerOptionChangeDetectors('width', 'height', function(width, height) {
		chart.attr('width', width)
			.attr('height', height);
	});
});
```

Now, whenever the width or height is changed from outside:

```js
myChart.width(myChart.width() + 1).height(myChart.height() + 1);
```

The function with the width and height parameters is called. It is also called at the end of chart initialization, so you need not call it manually in your reusable definition.

You can also supply a function without watching options:

```js
me.registerOptionChangeDetectors(function(options) {
	//...
})
```

The function will be called every time an option value changes, and it receives the entire options object.
