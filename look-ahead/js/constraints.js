const Constraints = [
	
	// width and height

	{
		if: [{ encoding: { x: {}, y: null } }],
		then: { height: 50 }
	},
	{
		if: [{ encoding: { x: null, y: {} } }],
		then: { width: 50 }
	},

	// Single variable
	// Temporal variable: tick
	// Distribution variables (none + quantitative): tick
	// Number variable (mean, median, min, max, sum, count): bar
	// Split variable (bin, oridinal, nominal): point
	// Colour not matter but size and shape should not be occupied

	{
		if: [{ encoding: { x: { type: 'temporal' }, y: null, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: null, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: null, bin: null }, y: null, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: null, bin: null }, x: null, size: null, shape: null } }],
		then: { mark: 'tick' }
	},
	{
		if: [{ encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: null, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: null, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: null, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: null, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: null, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: null, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: null, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: null, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: null, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: null, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'count' }, y: null, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'count' }, x: null, size: null, shape: null } }],
		then: { mark: 'bar' }
	},

	// Two variables
	// Distribution variable + split variable: tick
	// Temporal variable + split variable: tick
	// Number variable + split variable: bar
	// Temporal variable + number variable: line

	{
		if: [{ encoding: { y: { type: 'quantitative', aggregate: null, bin: null }, x: { type: 'ordinal' }, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: null, bin: null }, y: { type: 'ordinal' }, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: null, bin: null }, x: { type: 'nominal' }, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: null, bin: null }, y: { type: 'nominal' }, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: null, bin: null }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: null, bin: null }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'ordinal' }, size: null, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'ordinal' }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'nominal' }, size: null, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'nominal' }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, shape: null } }],
		then: { mark: 'tick' }
	},
	{
		if: [{ encoding: { x: { type: 'quantitative', aggregate: 'count' }, y: { type: 'nominal' }, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'count' }, y: { type: 'ordinal' }, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'ordinal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'ordinal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'ordinal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'ordinal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'ordinal' }, size: null, color: null, shape: null } }],
		then: {
			mark: 'bar',
			encoding: { y: { scale: { padding: 0.35 } } }
		}
	},
	{
		if: [{ encoding: { y: { type: 'quantitative', aggregate: 'count' }, x: { type: 'nominal' }, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'count' }, x: { type: 'ordinal' }, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'ordinal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'ordinal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'ordinal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'ordinal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'nominal' }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'ordinal' }, size: null, color: null, shape: null } }],
		then: {
			mark: 'bar',
			encoding: { x: { scale: { padding: 0.35 } } }
		}
	},
	{
		if: [{ encoding: { y: { type: 'quantitative', aggregate: 'count' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'count' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: null, shape: null } }],
		then: { mark: 'bar' }
	},
	{
		if: [{ encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'count' }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'count' }, size: null, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'min' }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'min' }, size: null, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'max' }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'max' }, size: null, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'mean' }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'mean' }, size: null, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'median' }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'median' }, size: null, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'sum' }, size: null, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'sum' }, size: null, shape: null } }],
		then: { mark: 'line' }
	},

	// Three variables
	// Split variable + number variable (other than count) + any variable in color: point (handle above)
	// Split variable + number variable (other than count) + quantitative in color: bin color
	// Temporal variable + number variable + quantitative in color: bin color

	{
		if: [{ encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },

			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },

			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },

			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },

			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },

			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'min' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'min' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'max' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'max' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'mean' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'mean' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'median' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'median' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'nominal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'ordinal' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'quantitative', aggregate: 'sum' }, y: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'quantitative', aggregate: 'sum' }, x: { type: 'quantitative', aggregate: null, bin: {} }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } }],
		then: { encoding: { color: { aggregate: null, bin: {} } } },
		callback: function() {
			let colourShelfData = Shelf.colour.getCapsuleData();

			colourShelfData.aggregate = 'bin';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: null, bin: null }, shape: null } },

			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'min', bin: null }, shape: null } },

			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'max', bin: null }, shape: null } },

			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'mean', bin: null }, shape: null } },

			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'median', bin: null }, shape: null } },

			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'count' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'min' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'max' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'mean' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'median' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { x: { type: 'temporal' }, y: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } },
			 { encoding: { y: { type: 'temporal' }, x: { type: 'quantitative', aggregate: 'sum' }, size: null, color: { type: 'quantitative', aggregate: 'sum', bin: null }, shape: null } }],
		then: { encoding: { color: { aggregate: null, bin: {} } } },
		callback: function() {
			let colourShelfData = Shelf.colour.getCapsuleData();

			colourShelfData.aggregate = 'bin';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},

	// auto binning

	{
		if: [{ encoding: { column: { type: 'quantitative', aggregate: null, bin: null } } },
			 { encoding: { column: { type: 'quantitative', aggregate: 'min', bin: null } } },
			 { encoding: { column: { type: 'quantitative', aggregate: 'max', bin: null } } },
			 { encoding: { column: { type: 'quantitative', aggregate: 'mean', bin: null } } },
			 { encoding: { column: { type: 'quantitative', aggregate: 'median', bin: null } } },
			 { encoding: { column: { type: 'quantitative', aggregate: 'sum', bin: null } } }],
		then: { encoding: { column: { aggregate: null, bin: {} } } },
		callback: function() {
			let columnShelfData = Shelf.column.getCapsuleData();

			columnShelfData.aggregate = 'bin';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { row: { type: 'quantitative', aggregate: null, bin: null } } },
			 { encoding: { row: { type: 'quantitative', aggregate: 'min', bin: null } } },
			 { encoding: { row: { type: 'quantitative', aggregate: 'max', bin: null } } },
			 { encoding: { row: { type: 'quantitative', aggregate: 'mean', bin: null } } },
			 { encoding: { row: { type: 'quantitative', aggregate: 'median', bin: null } } },
			 { encoding: { row: { type: 'quantitative', aggregate: 'sum', bin: null } } }],
		then: { encoding: { row: { aggregate: null, bin: {} } } },
		callback: function() {
			let rowShelfData = Shelf.row.getCapsuleData();

			rowShelfData.aggregate = 'bin';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { shape: { type: 'quantitative', aggregate: null, bin: null } } },
			 { encoding: { shape: { type: 'quantitative', aggregate: 'min', bin: null } } },
			 { encoding: { shape: { type: 'quantitative', aggregate: 'max', bin: null } } },
			 { encoding: { shape: { type: 'quantitative', aggregate: 'mean', bin: null } } },
			 { encoding: { shape: { type: 'quantitative', aggregate: 'median', bin: null } } },
			 { encoding: { shape: { type: 'quantitative', aggregate: 'sum', bin: null } } }],
		then: { encoding: { shape: { aggregate: null, bin: {} } } },
		callback: function() {
			let shapeShelfData = Shelf.shape.getCapsuleData();

			shapeShelfData.aggregate = 'bin';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { x: { type: 'temporal', timeUnit: null } } }],
		then: { encoding: { x: { timeUnit: 'year' } } },
		callback: function() {
			let xAxisShelfData = Shelf.xAxis.getCapsuleData();

			xAxisShelfData.timeUnit = 'year';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { y: { type: 'temporal', timeUnit: null } } }],
		then: { encoding: { y: { timeUnit: 'year' } } },
		callback: function() {
			let yAxisShelfData = Shelf.yAxis.getCapsuleData();

			yAxisShelfData.timeUnit = 'year';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { column: { type: 'temporal', timeUnit: null } } }],
		then: { encoding: { column: { timeUnit: 'year' } } },
		callback: function() {
			let columnShelfData = Shelf.column.getCapsuleData();

			columnShelfData.timeUnit = 'year';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { row: { type: 'temporal', timeUnit: null } } }],
		then: { encoding: { row: { timeUnit: 'year' } } },
		callback: function() {
			let rowShelfData = Shelf.row.getCapsuleData();

			rowShelfData.timeUnit = 'year';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { size: { type: 'temporal', timeUnit: null } } }],
		then: { encoding: { size: { timeUnit: 'year' } } },
		callback: function() {
			let sizeShelfData = Shelf.size.getCapsuleData();

			sizeShelfData.timeUnit = 'year';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { color: { type: 'temporal', timeUnit: null } } }],
		then: { encoding: { color: { timeUnit: 'year' } } },
		callback: function() {
			let colourShelfData = Shelf.colour.getCapsuleData();

			colourShelfData.timeUnit = 'year';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { shape: { type: 'temporal', timeUnit: null } } }],
		then: { encoding: { shape: { timeUnit: 'year' } } },
		callback: function() {
			let shapeShelfData = Shelf.shape.getCapsuleData();

			shapeShelfData.timeUnit = 'year';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},
	{
		if: [{ encoding: { tooltip: { type: 'temporal', timeUnit: null } } }],
		then: { encoding: { tooltip: { timeUnit: 'year' } } },
		callback: function() {
			let tooltipShelfData = Shelf.tooltip.getCapsuleData();

			tooltipShelfData.timeUnit = 'year';
			Shelves.refreshCapsules();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
		}
	},

	// not allow number of record for some shelves

	{
		if: [{ encoding: { column: { type: 'quantitative', aggregate: 'count' } } }],
		then: { encoding: { column: null } },
		callback: function() {
			Shelves.restoreState();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
			Shelf['column'].blink();
			VisualizationPane.stopUpdating();
		}
	},
	{
		if: [{ encoding: { row: { type: 'quantitative', aggregate: 'count' } } }],
		then: { encoding: { row: null } },
		callback: function() {
			Shelves.restoreState();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
			Shelf['row'].blink();
			VisualizationPane.stopUpdating();
		}
	},
	{
		if: [{ encoding: { shape: { type: 'quantitative', aggregate: 'count' } } }],
		then: { encoding: { shape: null } },
		callback: function() {
			Shelves.restoreState();
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
			Shelf['shape'].blink();
			VisualizationPane.stopUpdating();
		}
	}
]