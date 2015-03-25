d3.reusable = function(chart) {
	function merge(x, y) {
		var z = {};
		for (var p in x) { z[p] = x[p]; }
		for (var p in y) { z[p] = y[p]; }
		return z;
	}

	return function() {
		var options = {};

		var updates = [];
		function addUpdate(paramNames, func) {
			updates.push({
				paramNames: paramNames,
				func: func
			});
		}

		function runUpdates(p, old) {
			for (var i in updates) {
				if (!updates.hasOwnProperty(i)) continue;

				// you registered options, but didn't supply a function
				var func = updates[i].func
				if (!func) continue;

				var params = [];
				var callUpdate = false;
				var paramNames = updates[i].paramNames;
				// you registered a function without supplying options
				if (!paramNames.length) {
					params.push(options);
					callUpdate = true;
				}	else {
					for (var j in paramNames) {
						if (!paramNames.hasOwnProperty(j)) continue;

						var name = paramNames[j];
						params.push(options[name]);
						// first run of graph, run everything
						if (!p) callUpdate = true;
						// you did an options merge, check all options
						else if (p == 'options') {
							if (old[name] != options[name])
								callUpdate = true;
						}
						else if (name == p && old != options[name])
							callUpdate = true;
					}
				}
				if (callUpdate) func.apply(this, params);
			}
		}

		function call(d, i) {
			chart.call(this, reusable, d, i);
		}

		var reusable = function(selection) {
			if (selection) selection.each(call);
			else call();
			runUpdates();
			return reusable;
		};

		function property(p, _) {
			if (_ === undefined) return options[p];
			var oldOption = options[p];
			options[p] = _;
			runUpdates(p, oldOption);
			return reusable;
		}

		reusable.width = function(_) { return property('width', _); };
		reusable.height = function(_) { return property('height', _); };
		reusable.data = function(_) { return property('data', _); };
		reusable.options = function(p1, p2) {
			if (!arguments.length) return options;
			if (typeof p1 == 'string') return property(p1, p2);
			var oldOptions = options;
			options = merge(oldOptions, p1);
			runUpdates('options', oldOptions);
			return reusable;
		};

		reusable.registerOptionChangeDetectors = function() {
			var paramNames = [];
			var i, p, func;
			for (i = 0; i < arguments.length; i++) {
				p = arguments[i];
				if (i == arguments.length - 1 && typeof p == 'function') {
					func = p;
				} else {
					paramNames.push(p);
					// closure for scope
					reusable[p] = function(p) { return function(_) { return property(p, _); }; }(p);
				}
			}
			addUpdate(paramNames, func);
		};

		return reusable;
	}
}