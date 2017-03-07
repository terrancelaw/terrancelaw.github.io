var TimeSeriesAreaCharts = {
	colour: "#e5e5e5",

	svgGroup: null,
	height: null,

	create: function(svg, width, height, data) {
		var self = this;

		self.height = height;

		self.svgGroup = svg.append("g")
			.attr("class", "time-series-area-chart")
			.attr("cursor", "pointer");
		SelectionHandler.installSelectionBehaviour(self.svgGroup, insertSelection);

		function insertSelection(svgObject, selectionClass, x, y, width, height) {
			d3.select(svgObject)
				.append("rect")
				.attr("class", selectionClass)
				.attr("x", x)
				.attr("y", y)
				.attr("width", width)
				.attr("height", height)
				.style("fill", "gray")
				.style("stroke", "yellow")
				.style("fill-opacity", 0.05);
		}

		self.createLineChart(self.svgGroup, width, height, data);
		self.translateFlow(self.svgGroup);
		self.createBackground(self.svgGroup, height, width);
	},
	createLineChart: function(svg, width, height, timeSeries) {
		var self = this;

		var maxSize = d3.max(timeSeries);
		var xScale = d3.scale.linear()
			.domain([0, timeSeries.length - 1])
			.range([0, width]);
		var sizeScale = d3.scale.linear()
			.domain(d3.extent(timeSeries))
			.range([0, height]);

		// create area chart
		var area = d3.svg.area()
			.interpolate("monotone")
			.x(function(d, i) { return xScale(i); })
            .y0(function(d) { return sizeScale(d) / 2; })
            .y1(function(d) { return -sizeScale(d) / 2; });

		var flow = svg.append("path")
			.datum(timeSeries)
			.attr("class", "area")
			.attr("d", area)
			.attr("fill", self.colour);
	},
	createBackground: function(svg, height, width) {
		svg.insert("rect", ":first-child")
			.attr("width", width)
			.attr("height", height)
			.attr("x", 0)
			.attr("y", -height / 2)
			.style("fill", "white")
			.style("stroke", "none")
			.style("opacity", 0);
	},
	translateFlow: function(svg) {
		var self = this;

		svg.attr("transform", "translate(0, " + (self.height / 2)+ ")");
	}
}