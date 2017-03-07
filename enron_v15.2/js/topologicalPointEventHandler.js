var TopologicalPointEventHandler = { // mostly for handling event edit behavior
	leftRightPadding: 30,
	trackWidth: null,
	barHeight: 20,

	currentAttribute: null,
	currentAttributeValue: null,

	xScale: null,
	brush: null,

	numberOfbins: 25,

	// for determining whether the range should be int or floating point numbers
	isInt: {
		"Size": true,
		"Number of Clusters": true,
		"Density": false,
		"Stability": true
	},

	init: function(name, parameters) {
		var self = this;

		// remove the previous widgets
		EventView.removeEventEdit();

		self.trackWidth = eventViewWidth - EventView.margin.left - EventView.margin.right - self.leftRightPadding * 2;

		self.currentAttribute = name;
		if (!self.isInt[self.currentAttribute])
			self.currentAttributeValue = Math.round(parameters.attributeValue * 10) / 10;
		else
			self.currentAttributeValue = parameters.attributeValue;

		var lowerBound = Database.rangeDict[self.currentAttribute][0];
		var upperBound = Database.rangeDict[self.currentAttribute][1];
		if (upperBound < 25 && self.isInt[self.currentAttribute])
			self.numberOfbins = (upperBound - lowerBound) + 1;
		else
			self.numberOfbins = 25;

		EventView.isInterval = false;
		EventView.currentEventName = name + " in [null, null]";
		EventView.determineCurrentEventAddedColourAndFull();
	},
	createEventEdit: function(name, parameters) {
		var self = this;

		self.init(name, parameters);

		// create range selector and the event tag
		self.createRangeSelector();
		self.createBarChart();
		self.createMainContent();
	},
	createRangeSelector: function() {
		var self = this;

		// draw brush
		self.xScale = d3.scale.linear()
			.domain(Database.rangeDict[self.currentAttribute])
			.range([0, self.trackWidth]);
		self.brush = d3.svg.brush()
	        .x(self.xScale)
	        .on("brush", onBrushMove)
	        .on("brushend", onBrushEnd);

	    var brushGroup = EventView.eventEditSvg.append("g")
	    	.attr("class", "brush")
	    	.attr("transform", "translate(" + self.leftRightPadding + ", " + (EventView.optionY - self.barHeight) + ")")
	    	.call(self.brush);
	    brushGroup.selectAll("rect")
	    	.attr("height", self.barHeight);
	    brushGroup.select(".background")
	    	.style("visibility", null);

	  	// draw the overall range
	  	brushGroup.append("text")
			.attr("x", 0)
			.attr("y", -3)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "baseline")
			.text(Database.rangeDict[self.currentAttribute][0]);
	  	brushGroup.append("text")
			.attr("x", self.trackWidth)
			.attr("y", -3)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "baseline")
			.text(Database.rangeDict[self.currentAttribute][1]);

		// draw the range of the brush
		brushGroup.select(".resize.w").append("text")
			.attr("class", "lower-bound")
			.attr("x", 0)
			.attr("y", -13)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "baseline")
			.style("font-size", 15);
	  	brushGroup.select(".resize.e").append("text")
	  		.attr("class", "upper-bound")
			.attr("x", 0)
			.attr("y", -13)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "baseline")
			.style("font-size", 15);

		// draw the name
		brushGroup.append("text")
			.attr("x", self.trackWidth / 2)
			.attr("y", self.barHeight + 1)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "text-before-edge")
			.text(self.currentAttribute);

	  	function onBrushMove() {
			var lowerBound, upperBound;

	  		if (self.isInt[self.currentAttribute]) {
	  			lowerBound = self.brush.empty() ? null : Math.round(self.brush.extent()[0]);
	  			upperBound = self.brush.empty() ? null : Math.round(self.brush.extent()[1]);
	  		}
	  		else { // show one decimal place
	  			lowerBound = self.brush.empty() ? null : Math.round(self.brush.extent()[0] * 10) / 10;
	  			upperBound = self.brush.empty() ? null : Math.round(self.brush.extent()[1] * 10) / 10;
	  		}

	  		// change the lower bound and upper bound text
	  		EventView.eventEditSvg.select(".brush .lower-bound")
	  			.text(lowerBound);
	  		EventView.eventEditSvg.select(".brush .upper-bound")
	  			.text(upperBound);

	  		EventView.currentEventName = self.currentAttribute + " in [" + lowerBound + ", " + upperBound + "]";
	  		EventView.determineCurrentEventAddedColourAndFull();
	  		EventView.updateEventEdit();
	  	}

	  	function onBrushEnd() {
	  		// show the add button only if brush is created
	  		if (self.brush.empty()) {
	  			EventView.eventEditSvg.select(".add-button")
	  				.style("display", "none");
	  		}
	  		else {
	  			EventView.eventEditSvg.select(".add-button")
	  				.style("display", null);
	  		}
	  	}
	},
	createBarChart: function() {
		var self = this;
		var lineChartData = [];

		// determine range of a bin
		var lowerBound = Database.rangeDict[self.currentAttribute][0];
		var upperBound = Database.rangeDict[self.currentAttribute][1];
		var sizeOfBin = (upperBound - lowerBound) / self.numberOfbins;

		// create the bins for counting
		for (var i = 0; i < self.numberOfbins; i++)
			lineChartData.push(0);


		for (email in Database.attribute2DataDict[self.currentAttribute]) {
			var valueArray = Database.attribute2DataDict[self.currentAttribute][email];

			for (var t = 0; t < valueArray.length; t++) {
				var binIndex = Math.floor((valueArray[t] - lowerBound) / sizeOfBin);

				// handle the special case
				if (binIndex == self.numberOfbins)
					binIndex--;

				lineChartData[binIndex]++;
			}
		}

		// draw the bar chart
		var xScale = d3.scale.linear()
			.domain([0, self.numberOfbins - 1])
			.range([0, self.trackWidth]);
		var yScale = d3.scale.linear()
			.domain(d3.extent(lineChartData))
			.range([self.barHeight, 0]);
		var line = d3.svg.line()
		    .x(function(d, i) { return xScale(i); })
		    .y(function(d) { return yScale(d); })
		    .interpolate("cardinal");

		var lineChart = EventView.eventEditSvg.select(".brush")
			.insert("g", ".background");

		lineChart.append("path")
			.datum(lineChartData)
			.attr("d", line)
			.style("fill", "none")
			.style("stroke", "black");

		// draw the current value in the bar chart
		var currentValue = lineChart.append("g")
			.attr("transform", "translate(" + self.xScale(self.currentAttributeValue) + ", " + "0)");

		currentValue.append("line")
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("y1", 0)
			.attr("y2", self.barHeight)
			.style("stroke", "red")
			.style("stroke-width", 1);

		currentValue.append("text")
			.attr("x", 0)
			.attr("y", -3)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "baseline")
			.style("fill", "red")
			.text(self.currentAttributeValue);
	},
	createMainContent: function() {
		var self = this;

		EventView.addEventTagToEventEdit(addEventToDatabase, false);

		EventView.eventEditSvg.select(".add-button")
			.style("display", "none");

		function addEventToDatabase() {
			// adding new event
			for (email in Database.attribute2DataDict[self.currentAttribute]) {
				var valueArray = Database.attribute2DataDict[self.currentAttribute][email];
				var lowerBound, upperBound;

		  		if (self.isInt[self.currentAttribute]) {
		  			lowerBound = self.brush.empty() ? null : Math.ceil(self.brush.extent()[0]);
		  			upperBound = self.brush.empty() ? null : Math.ceil(self.brush.extent()[1]);
		  		}
		  		else { // show one decimal place
		  			lowerBound = self.brush.empty() ? null : Math.round(self.brush.extent()[0] * 10) / 10;
		  			upperBound = self.brush.empty() ? null : Math.round(self.brush.extent()[1] * 10) / 10;
		  		}

		  		for (var t = 0; t < valueArray.length; t++) {
		  			if (valueArray[t] >= lowerBound && valueArray[t] <= upperBound)
		  				Database.appendEvent(EventView.currentEventName, Database.dateStringArray[t], null, email);
		  		}
			}

			return [EventView.currentEventName];
		}
	}
}