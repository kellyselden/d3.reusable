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
		var updateParamsLookup = {};
		function addUpdate(update) {
			updateParamsLookup[updates.length] = getParamNames(update);
			updates.push(update);
		}

		function runUpdates(p, old) {
			for (var i = 0; i < updates.length; i++) {
				var params = [];
				var callUpdate = false;
				var paramNames = updateParamsLookup[i];
				if (!paramNames.length)
					callUpdate = true;
				else
					for (var j in paramNames) {
						var name = paramNames[j];
						params.push(options[name]);
						if (!p) callUpdate = true;
						else if (p == 'options') {
							if (old[name] != options[name])
								callUpdate = true;
						}
						else if (name == p && old != options[name])
							callUpdate = true;
					}
				if (callUpdate) updates[i].apply(this, params);
			}
		}

		function call(d, i) {
			var update = chart.call(this, reusable, d, i);
			if (!update) return;
			if (typeof update == 'function')
				addUpdate(update);
			else if (typeof update == 'object')
				for (var j in update)
					addUpdate(update[j]);
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
			for (var i in arguments) {
				var p = arguments[i];
				reusable[p] = function(p) { return function(_) { return property(p, _); }; }(p); //closure for scope
			}
		};

		return reusable;
	}
}