var RankChart = {
	margin: {top: 20, right: 20, bottom: 20, left: 50},
    width: null,
    height: null,

    svg: null,
    group: null,

    chartData: null,
    patternData: {},

    currentID: "38259P",

    xScale: null, 
    yScale: null,

    startYear: null,
    endYear: null,

    toRight: null,
    previousYear: null,

    list: null,

    init: function() {
    	var self = this;

    	// create the list item
    	var options = {
		  valueNames: ['name'],
		  item: '<li><span class="name"></span></li>'
		};
		self.list = new List('result', options);

    	self.width = 500 - self.margin.left - self.margin.right,
    	self.height = 180 - self.margin.top - self.margin.bottom;

    	self.svg = d3.select(".rank")
    					.attr("width", self.width + self.margin.left + self.margin.right)
    					.attr("height", self.height + self.margin.top + self.margin.bottom)
    	self.group = self.svg.append("g")
    							.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    	self.svg.on("mousedown", function() {
    		var mouse = d3.mouse(this);
		    var parseDate = d3.time.format("%Y").parse;
		    self.startYear = self.xScale.invert(mouse[0] - self.margin.left).getFullYear();
		    self.endYear = self.startYear + 1;
		    self.previousYear = self.xScale.invert(mouse[0] - self.margin.left).getFullYear();

		    if (self.startYear != null) {
			    self.group.select(".select-rect")
			    			.attr("width", self.xScale(parseDate(self.endYear.toString())) - self.xScale(parseDate(self.startYear.toString())))
			    			.attr("x", self.xScale(parseDate(self.startYear.toString())))
		    }
	    })
	    .on("mousemove", function() {
		    if (self.previousYear != null) { // mouse down before
		    	var mouse = d3.mouse(this);
	    		var parseDate = d3.time.format("%Y").parse;
	    		var currentYear = self.xScale.invert(mouse[0] - self.margin.left).getFullYear();

		    	if (currentYear != self.previousYear) {
		    		// changing toRight's value
		    		if (self.toRight == null)
		    			self.toRight = (currentYear > self.previousYear) ? true : false;
		    		if (self.toRight && currentYear < self.startYear)
		    			self.toRight = false
		    		if (!self.toRight && currentYear > self.startYear)
		    			self.toRight = true;

		    		// never change the start year
			    	if (self.toRight)
				    	self.endYear = currentYear + 1;
				    else
				    	self.endYear = currentYear;

				    var xYear = (self.startYear < self.endYear) ? self.startYear : self.endYear;

			    	self.group.select(".select-rect")
				    			.attr("width", Math.abs(self.xScale(parseDate(self.endYear.toString())) - self.xScale(parseDate(self.startYear.toString()))))
				    			.attr("x", self.xScale(parseDate(xYear.toString())));

				    self.previousYear = currentYear;
		    	}
	    	}
	    })
	    .on("mouseup", function() {
	    	var pattern = []; // [1: rank decreases, 0: stay the same or increases]

	    	for (var i = self.startYear % 100; i < self.endYear % 100; i++) { // compare i with i + 1
	    		if (self.chartData[self.currentID][i + 1].rank < self.chartData[self.currentID][i].rank)
	    			pattern.push(1);
	    		else
	    			pattern.push(0);
	    	}

	    	// clear old items in the list
	    	self.list.clear();

	    	var count = 0;
	    	var foundID = [];
	    	for (ID in self.patternData) {
	    		var foundIndex = self.patternData[ID].toString().indexOf(pattern.toString());
	    		if (foundIndex > 0) {
	    			self.list.add({ name: self.chartData[ID][0].name });

	    			var start = 2000 + foundIndex / 2; // year from which the pattern starts
	    			foundID.push({
	    				ID: ID, 
	    				startYear: start
	    			});

	    			count++;
	    		}

	    		if (count >= 100)
	    			break;
	    	}

	    	// number of li and foundID should be the same
	    	d3.selectAll(".list li")
	    		.data(foundID)
	    		.on("mouseover", function(d, i) {
	    			var parseDate = d3.time.format("%Y").parse;

	    			self.update(d.ID, true);

	    			self.group.select(".select-rect")
	    						.transition()
				    			.attr("width", Math.abs(self.xScale(parseDate(self.endYear.toString())) - self.xScale(parseDate(self.startYear.toString()))))
				    			.attr("x", self.xScale(parseDate(d.startYear.toString())));
	    		});

	    	self.toRight = null;
	    	self.previousYear = null;
	    });

	    d3.select(".scroller-wrapper")
	    	.on("mouseout", function() {
	    		if (self.startYear && self.endYear) {
	    			var parseDate = d3.time.format("%Y").parse;
		    		var xYear = (self.startYear < self.endYear) ? self.startYear : self.endYear;

		    		self.update(self.currentID, true);

		    		console.log

	    			self.group.select(".select-rect")
	    						.transition()
				    			.attr("width", Math.abs(self.xScale(parseDate(self.endYear.toString())) - self.xScale(parseDate(self.startYear.toString()))))
				    			.attr("x", self.xScale(parseDate(xYear.toString())));
	    		}
	    		
	    	})

    	d3.csv("rank.csv", type, function(data) {
    		self.chartData = d3.nest()
				    			.key(function(d) {
				    				return d.id;
				    			})
				    			.map(data);

			// create the pattern file
			for (ID in self.chartData) {
				var pattern = [];

				for (var i = 0; i < self.chartData[ID].length - 1; i++) { // compare i with i + 1
					if (self.chartData[ID][i + 1].rank < self.chartData[ID][i].rank)
		    			pattern.push(1);
		    		else
		    			pattern.push(0);
				}

				self.patternData[ID] = pattern;
			}

			self.xScale = d3.time.scale()
									.domain(d3.extent(self.chartData[self.currentID], function(d) { return d.year; }))
									.range([0, self.width]);
			self.yScale = d3.scale.linear()
									.domain(d3.extent(self.chartData[self.currentID], function(d) { return d.rank; }))
									.range([self.height, 0]);

			var xAxis = d3.svg.axis()
								.scale(self.xScale)
								.orient("bottom");
			var yAxis = d3.svg.axis()
								.scale(self.yScale)
								.ticks(5)
								.orient("left");

			var line = d3.svg.line()
								.x(function(d) { return self.xScale(d.year); })
								.y(function(d) { return self.yScale(d.rank); });

			var area = d3.svg.area()
								.x(function(d) { return self.xScale(d.year); })
								.y0(self.height)
								.y1(function(d) { return self.yScale(d.rank); });

			self.group.append("path")
						.datum(self.chartData[self.currentID])
						.attr("class", "area")
						.attr("d", area);

			self.group.append("path")
						.datum(self.chartData[self.currentID])
						.attr("class", "line")
						.attr("d", line);

			self.group.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + self.height + ")")
						.call(xAxis);

			self.group.append("g")
						.attr("class", "y axis")
						.call(yAxis)
						.append("text")
					    .attr("transform", "rotate(-90)")
					    .attr("y", 6)
					    .attr("dy", ".71em")
					    .attr("dx", "2em")
					    .style("text-anchor", "end")
					    .text("PageRank");

			self.group.append("rect")
						.attr("class", "select-rect")
	    				.attr("fill", "black")
	    				.attr("width", 0)
	    				.attr("height", self.height)
	    				.attr("opacity", 0.1)
	    				.attr("x", 0)
	    				.attr("y", 0)
    	});

    	function type(d) {
    		var parseDate = d3.time.format("%Y").parse;

    		d.year = parseDate(d.year);
    		d.rank = +d.rank;

    		return d;
    	}
    },
    update: function(newID, preview) {
    	var self = this;

    	if (!preview)
    		self.currentID = newID;

    	var xScale = d3.time.scale()
								.domain(d3.extent(self.chartData[newID], function(d) { return d.year; }))
								.range([0, self.width]);
		var yScale = d3.scale.linear()
								.domain(d3.extent(self.chartData[newID], function(d) { return d.rank; }))
								.range([self.height, 0]);

		var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom");
		var yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left");

		var line = d3.svg.line()
						    .x(function(d) { return xScale(d.year); })
						    .y(function(d) { return yScale(d.rank); });

		var area = d3.svg.area()
							.x(function(d) { return xScale(d.year); })
							.y0(self.height)
							.y1(function(d) { return yScale(d.rank); });

		self.group.select("path.area")
						.datum(self.chartData[newID])
						.transition()
						.attr("d", area);

		self.group.select("path.line")
					.datum(self.chartData[newID])
					.transition()
					.attr("d", line);

		self.group.select(".x.axis")
					.transition()
					.call(xAxis);

		self.group.select(".y.axis")
					.transition()
					.call(yAxis)
    },
    clear: function() {
    	var self = this;

    	self.list.clear();
    	self.startYear = null;
    	self.endYear = null;
    }
}