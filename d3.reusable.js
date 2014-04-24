d3.reusable = function(chart) {

	//retrieved 4-4-14
	//http://stackoverflow.com/a/9924463/1703845
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	function getParamNames(func) {
	  var fnStr = func.toString().replace(STRIP_COMMENTS, '')
	  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
	  if(result === null)
		 result = []
	  return result
	}

	function merge(x, y){
		var z = {};
		for (var p in x) { z[p] = x[p]; }
		for (var p in y) { z[p] = y[p]; }
		return z;
	}

	return function() {
		var options = {};

		var updates = [];
		function runUpdates(p) {
			for (var i in updates) {
				var update = updates[i];
				var params = [];
				var found;
				var paramNames = getParamNames(update);
				if (paramNames.length == 0)
					found = true;
				for (var j in paramNames) {
					var name = paramNames[j];
					params.push(options[name]);
					if (!p || name === p)
						found = true;
				}
				if (found) update.apply(this, params);
			}
		}

		function call(d, i) {
			var update = chart.call(this, reusable, d, i);
			if (!update) return;
			if (typeof update == 'function')
				updates.push(update);
			else if (typeof update == 'object')
				for (var j in update)
					updates.push(update[j]);
		}

		var reusable = function(selection) {
			if (selection) selection.each(call);
			else call();
			runUpdates();
			return reusable;
		};

		function property(p, _) {
			if (_ === undefined) return options[p];
			options[p] = _;
			runUpdates(p);
			return reusable;
		}

		reusable.width = function(_) { return property('width', _); };
		reusable.height = function(_) { return property('height', _); };
		reusable.data = function(_) { return property('data', _); };
		reusable.options = function(p1, p2) {
			if (!arguments.length) return options;
			if (typeof p1 == 'string') return property(p1, p2);
			options = merge(options, p1);
			runUpdates('options');
			return reusable;
		};

		return reusable;
	}
}