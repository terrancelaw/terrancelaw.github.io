var IntervalEventHandler = {
	currentAttribute: null,
	currentSlope: null,
	currentTimePeriod: null,
	currentNoise: null,
	currentTimeSeries: null, // for drawing line chart
	
	isInt: {}, // for determining whether the range should be int or floating point numbers

	stableThreshold: 0.05, // abs within 0.05 <= stable, < -0.05 decrease, > 0.05 increase

	sName: "Slope",
	tpName: "Time period",
	nName: "Noise",

	sliderLeftPadding: 10,
	sliderRightPadding: 30,
	sliderColumnWidth: null,
	sliderWidth: null,
	sliderHeight: 10,

	brush: {},

	init: function(currentAttribute, parameters) {
		var self = this;

		// remove previous widgets
		EventView.removeEventEdit();

		// initialization
		self.currentAttribute = currentAttribute;
		self.currentSlope = parameters.slope;
		self.currentTimePeriod = parameters.timePeriod;
		self.currentNoise = parameters.noise;
		self.currentTimeSeries = parameters.timeSeries;

		self.isInt[self.sName] = false;
		self.isInt[self.tpName] = true;
		self.isInt[self.nName] = false;

		self.sliderColumnWidth = (eventViewWidth - EventView.margin.left - EventView.margin.right) / 2;
		self.sliderWidth = self.sliderColumnWidth - self.sliderLeftPadding - self.sliderRightPadding;

		EventView.isInterval = true;
		self.createEventName();
		EventView.determineCurrentEventAddedColourAndFull();
	},
	createEventEdit: function(currentAttribute, parameters) {
		var self = this;

		self.init(currentAttribute, parameters);

		// create widgets and event tag
		self.createMainContent();
		self.createControls();
		self.createLineChart();
	},
	createMainContent: function() {
		var self = this;

		EventView.addEventTagToEventEdit(addEventToDatabase, true);

		function addEventToDatabase() {
			// get the parameter values
			var slopeRange = self.getSlopeRange();
			var timePeriodRange = self.getTimePeriodRange();
			var noiseRange = self.getNoiseRange();

			// adding new event
			for (var email in Database.timeSeriesData[self.currentAttribute]) {
				var slopeArray = Database.timeSeriesData[self.currentAttribute][email].slope;
				var outlierPercentArray = Database.timeSeriesData[self.currentAttribute][email].outlierPercent;
				var maxIndex = slopeArray.length;
				var endPointOfLongestMatch = null;

				for (var i = 0; i < maxIndex; i++) {
					var timeIndices = Database.convertIndex2TimeIndices(i);
					var firstIndex = timeIndices[0];
					var secondIndex = timeIndices[1];
					var isMatch = true;

					// check if time period within range
					var outOfRange = secondIndex - firstIndex < timePeriodRange[0] || secondIndex - firstIndex > timePeriodRange[1];
					if (outOfRange) {
						firstIndex++;
						secondIndex = firstIndex + 1;
						endPointOfLongestMatch = null;
						i = Database.convertTimeIndices2Index([firstIndex, secondIndex]);

						// jump!!!
						continue;
					}

					// check if slope falls into range
					var slope = slopeArray[i];
					if (slope < slopeRange[0] || slope > slopeRange[1])
						isMatch = false;

					// check if outlier percentage falls into range
					var outlierPercent = outlierPercentArray[i];
					if (outlierPercent < noiseRange[0] || outlierPercent > noiseRange[1])
						isMatch = false;

					// went through all the tests!! pattern matched, store second index of longest match
					if (isMatch)
						endPointOfLongestMatch = secondIndex;

					// store if it is the last item in the loop
					var lastItemInLoop = secondIndex == Database.numberOfTimeSteps - 1 || secondIndex == firstIndex + timePeriodRange[1];
					if (lastItemInLoop && endPointOfLongestMatch) {
						Database.appendEvent(EventView.currentEventName, Database.dateStringArray[firstIndex], Database.dateStringArray[endPointOfLongestMatch], email);
						
						firstIndex = endPointOfLongestMatch;
						secondIndex = firstIndex + 1;
						endPointOfLongestMatch = null;
						i = Database.convertTimeIndices2Index([firstIndex, secondIndex]);

						// jump!!!
						continue;
					}
				}
			}

			return [EventView.currentEventName]; // adding only one event
		}
	},
	createControls: function() {
		var self = this;

		// * slope brush
		var trueStartValue = Math.round(Database.slopeRangeDict[self.currentAttribute][0] * 1.5 * 10) / 10;
		var trueEndValue = Math.round(Database.slopeRangeDict[self.currentAttribute][1] * 1.5 * 10) / 10;
		var endPadding = (trueEndValue - trueStartValue) / 18;
		var startValue = trueStartValue - endPadding;
		var endValue = trueEndValue + endPadding;

		var currentValue = self.currentSlope;
		var name = self.sName;
		var className = name.split(" ").join("-");
		var x = self.sliderColumnWidth;

		self.brush[name] = self.createParameterWidget(name, x, EventView.firstRowY, startValue, currentValue, endValue)
			.on("brush", onBrushMove)
			.on("brushend", onBrushEnd);

		// modify the brush appearance
		var xScale = d3.scale.linear()
			.domain([startValue, endValue])
			.range([0, self.sliderWidth]);

		EventView.eventEditSvg.select("." + className + ".brush .overall-lower-bound")
			.attr("x", xScale(trueStartValue))
			.text(trueStartValue);
		EventView.eventEditSvg.select("." + className + ".brush .overall-upper-bound")
			.attr("x", xScale(trueEndValue))
			.text(trueEndValue);

		EventView.eventEditSvg.select("." + className + ".brush").append("line")
			.attr("x1", xScale(trueStartValue))
			.attr("x2", xScale(trueStartValue))
			.attr("y1", 0)
			.attr("y2", self.sliderHeight)
			.style("stroke", "gray")
			.style("stroke-width", 1);
		EventView.eventEditSvg.select("." + className + ".brush").append("line")
			.attr("x1", xScale(trueEndValue))
			.attr("x2", xScale(trueEndValue))
			.attr("y1", 0)
			.attr("y2", self.sliderHeight)
			.style("stroke", "gray")
			.style("stroke-width", 1);

		// * time period brush
		var startValue = 1;
		var currentValue = self.currentTimePeriod;
		var endValue = Database.numberOfTimeSteps - 1;
		var name = self.tpName;
		var className = name.split(" ").join("-");
		var x = 0;

		self.brush[name] = self.createParameterWidget(name, x, EventView.secondRowY, startValue, currentValue, endValue)
			.on("brush", onBrushMove)
			.on("brushend", onBrushEnd);

		// * noise brush
		var startValue = 0;
		var currentValue = self.currentNoise;
		var endValue = 1;
		var name = self.nName;
		var className = name.split(" ").join("-");
		var x = self.sliderColumnWidth;

		self.brush[name] = self.createParameterWidget(name, x, EventView.secondRowY, startValue, currentValue, endValue)
			.on("brush", onBrushMove)
			.on("brushend", onBrushEnd);

	  	function onBrushMove() {
	  		var name = d3.select(this).attr("brush-name");
			var className = name.split(" ").join("-");

			// determine new lower and upper bound
			var lowerBound, upperBound;
	  		if (self.isInt[name]) {
	  			lowerBound = self.brush[name].empty() ? null : Math.round(self.brush[name].extent()[0]);
	  			upperBound = self.brush[name].empty() ? null : Math.round(self.brush[name].extent()[1]);
	  		}
	  		else { // show two decimal place
	  			lowerBound = self.brush[name].empty() ? null : Math.round(self.brush[name].extent()[0] * 100) / 100;
	  			upperBound = self.brush[name].empty() ? null : Math.round(self.brush[name].extent()[1] * 100) / 100;
	  		}

	  		// change the lower bound and upper bound text
	  		EventView.eventEditSvg.select("." + className + ".brush .brush-lower-bound")
	  			.text(lowerBound);
	  		EventView.eventEditSvg.select("." + className + ".brush .brush-upper-bound")
	  			.text(upperBound);

	  		// slope > 1.5 = inf, percentage change < 0.5 = 0
	  		if (name == self.sName) {
	  			var brushLowerBound = self.brush[name].extent()[0];
	  			var brushUpperBound = self.brush[name].extent()[1];
	  			var lowerThreshold = Math.round(Database.slopeRangeDict[self.currentAttribute][0] * 1.5 * 10) / 10;
	  			var upperThreshold = Math.round(Database.slopeRangeDict[self.currentAttribute][1] * 1.5 * 10) / 10;
	  			var slopeBrushClassName = self.sName.split(" ").join("-");

  				if (brushLowerBound < lowerThreshold) {
	  				EventView.eventEditSvg.select("." + slopeBrushClassName + ".brush .brush-lower-bound")
	  					.text("-∞");
	  			}
	  			if (brushUpperBound > upperThreshold) {
	  				EventView.eventEditSvg.select("." + slopeBrushClassName + ".brush .brush-upper-bound")
	  					.text("∞");
	  			}
	  		}
	  	}

	  	function onBrushEnd() {
	  		var name = d3.select(this).attr("brush-name");
			var className = name.split(" ").join("-");

			// if dragged, de-select invariant button
			// if not dragged, select invariant button
	  		if (self.brush[name].empty()) {
	  			EventView.eventEditSvg.select(".button." + className)
	  				.classed("selected", true);
	  			EventView.eventEditSvg.select(".button." + className + " rect")
	  				.style("fill", "yellow");
	  		}
	  		else {
	  			EventView.eventEditSvg.select(".button." + className)
	  				.classed("selected", false);
	  			EventView.eventEditSvg.select(".button." + className + " rect")
	  				.style("fill", "#e5e5e5");
	  		}
	  	}
	},
	createLineChart: function() {
		var self = this;

		var lineChart = EventView.eventEditSvg.append("g")
			.attr("class", "line-chart")
			.attr("transform", "translate(" + self.sliderLeftPadding + "," + EventView.firstRowY + ")");

		var xScale = d3.scale.linear()
			.domain([0, self.currentTimeSeries.length - 1])
			.range([0, self.sliderWidth + 20]);
		var yScale = d3.scale.linear()
			.domain(d3.extent(self.currentTimeSeries))
			.range([self.sliderHeight * 2, 0]);

		var line = d3.svg.line()
		    .x(function(d, i) { return xScale(i); })
		    .y(function(d) { return yScale(d); })
		    .interpolate("cardinal");;

		// draw the line
		lineChart.append("path")
			.datum(self.currentTimeSeries)
        	.attr("d", line)
        	.attr("transform", "translate(0, -15)")
        	.style("fill", "none")
        	.style("stroke", "black");

        // draw the label
        lineChart.append("text")
			.attr("x", self.sliderWidth / 2)
			.attr("y", self.sliderHeight + 1)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "text-before-edge")
			.text("Shape");
	},
	createEventName: function() {
		var self = this;

		// determine current event name
		var newEventName = "";
		if (Math.abs(self.currentSlope) <= self.stableThreshold)
			newEventName = self.currentAttribute + " is stable";
		else if (self.currentSlope < - self.stableThreshold)
			newEventName = self.currentAttribute + " decreases";
		else if (self.currentSlope > self.stableThreshold)
			newEventName = self.currentAttribute + " increases";

		// store the event
		EventView.storeEventName(newEventName);
	},
	createParameterWidget: function(name, xColumnShift, yTranslate, startValue, currentValue, endValue) {
		var self = this;

		// create brush
		var xScale = d3.scale.linear()
			.domain([startValue, endValue])
			.range([0, self.sliderWidth]);
		var brush = d3.svg.brush()
	        .x(xScale);
	    var className = name.split(" ").join("-");

	    var brushGroup = EventView.eventEditSvg.append("g")
	    	.attr("brush-name", name)
	    	.attr("class", "brush " + className)
	    	.attr("transform", "translate(" + (xColumnShift + self.sliderLeftPadding) + ", " + yTranslate + ")")
	    	.call(brush);
	    brushGroup.selectAll("rect")
	    	.attr("height", self.sliderHeight);
	    brushGroup.select(".background")
	    	.style("visibility", null);

	    brushGroup.append("text")
			.attr("x", self.sliderWidth / 2)
			.attr("y", self.sliderHeight + 1)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "text-before-edge")
			.text(name);

		// draw the overall range
	  	brushGroup.append("text")
	  		.attr("class", "overall-lower-bound")
			.attr("x", 0)
			.attr("y", -3)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "baseline")
			.text(startValue);
	  	brushGroup.append("text")
	  		.attr("class", "overall-upper-bound")
			.attr("x", self.sliderWidth)
			.attr("y", -3)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "baseline")
			.text(endValue);

		// draw current value
		var currentValueLine = brushGroup.append("g")
			.attr("class", "current-value")
			.attr("transform", "translate(" + xScale(currentValue) + ", " + "0)");

		currentValueLine.append("line")
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("y1", 0)
			.attr("y2", self.sliderHeight)
			.style("stroke", "red")
			.style("stroke-width", 1);
		currentValueLine.append("text")
			.attr("x", 0)
			.attr("y", -3)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "baseline")
			.style("fill", "red")
			.text(currentValue);

		// draw the range of the brush
		brushGroup.select(".resize.w").append("text")
			.attr("class", "brush-lower-bound")
			.attr("x", -3)
			.attr("y", self.sliderHeight / 2)
			.style("text-anchor", "end")
			.style("alignment-baseline", "central");
	  	brushGroup.select(".resize.e").append("text")
	  		.attr("class", "brush-upper-bound")
			.attr("x", 3)
			.attr("y", self.sliderHeight / 2)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central");

		// create invariant button (by default selected)
		var button = EventView.eventEditSvg.append("g")
			.attr("brush-name", name)
			.attr("class", "button selected " + className)
			.attr("transform", "translate(" + (xColumnShift + self.sliderColumnWidth - self.sliderRightPadding + 5) + ", " + yTranslate + ")")
			.style("cursor", "pointer")
			.on("click", onClickInvariantButton);;

		var buttonText = button.append("text")
			.attr("x", 0)
			.attr("y", self.sliderHeight / 2)
			.style("alignment-baseline", "central")
			.text("Inv");

		var bbox = buttonText[0][0].getBBox()
		button.insert("rect", "text")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2)
			.style("rx", 5)
			.style("ry", 5)
			.style("fill", "yellow");

		return brush;

		function onClickInvariantButton() {
			var name = d3.select(this).attr("brush-name");
			var className = name.split(" ").join("-");

			if (!d3.select(this).classed("selected")) {
				// add the class
				d3.select(this)
					.classed("selected", true);

				// hightlight the button
				d3.select(this)
					.select("rect")
					.style("fill", "yellow");

				// remove the brush
				EventView.eventEditSvg.select("." + className + ".brush .extent")
					.attr("width", 0);
				EventView.eventEditSvg.select("." + className + ".brush .brush-upper-bound")
					.text("");
				EventView.eventEditSvg.select("." + className + ".brush .brush-lower-bound")
					.text("");
			}
		}
	},
	getSlopeRange: function() {
		var self = this;

		if (self.sName in self.brush) {
			var slopeRange = self.brush[self.sName].empty() ? null : self.brush[self.sName].extent();

			if (slopeRange) {
				var lowerThreshold = Math.round(Database.slopeRangeDict[IntervalEventHandler.currentAttribute][0] * 1.5 * 10) / 10;
	  			var upperThreshold = Math.round(Database.slopeRangeDict[IntervalEventHandler.currentAttribute][1] * 1.5 * 10) / 10;

				// change to -Infinity and Infinity if needed
				slopeRange[0] = (slopeRange[0] < lowerThreshold) ? -Infinity : Math.round(slopeRange[0] * 100) / 100;
	  			slopeRange[1] = (slopeRange[1] > upperThreshold) ? Infinity : Math.round(slopeRange[1] * 100) / 100;
			}
			else {
				slopeRange = [-Infinity, Infinity];
			}

			return slopeRange;
		}
		
		return null;
	},
	getTimePeriodRange: function() {
		var self = this;

		if (self.nName in self.brush) {
			var timePeriodRange = self.brush[self.tpName].empty() ? null : self.brush[self.tpName].extent();

			if (timePeriodRange) {
				timePeriodRange[0] = Math.round(timePeriodRange[0]);
				timePeriodRange[1] = Math.round(timePeriodRange[1]);
			}
			else {
				timePeriodRange = [1, Database.numberOfTimeSteps - 1];
			}

			return timePeriodRange;
		}

		return null;
	},
	getNoiseRange: function() {
		var self = this;

		if (self.nName in self.brush) {
			var noiseRange = self.brush[self.nName].empty() ? null : self.brush[self.nName].extent();

			if (noiseRange) {
				noiseRange[0] = Math.round(noiseRange[0] * 100) / 100;
				noiseRange[1] = Math.round(noiseRange[1] * 100) / 100;
			}
			else {
				noiseRange = [0, 1];
			}

			return noiseRange;
		}

		return null;
	}
}