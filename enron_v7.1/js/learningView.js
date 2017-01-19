var LearningView = {
	margin: { top: 10, left: 10, bottom: 10, right: 10 },

	leftPadding: 30,
	rightPadding: 60,
	columnWidth: null,
	sliderWidth: null,
	barHeight: 15,

	learningPanelSvg: null,
	learningParametersSvg: null,

	firstRowY: null,
	secondRowY: null,
	width: null,

	brush: {},

	pcName: "Percentage change range",
	spName: "Starting position range",
	tpName: "Number of time period range",
	opName: "Noise tolerance",

	init: function() {
		var self = this;

		self.firstRowY = learningParametersHeight - 90;
		self.secondRowY = learningParametersHeight - 50;
		self.width = learningViewWidth - self.margin.left - self.margin.right;

		self.columnWidth = LearningView.width / 2;
		self.sliderWidth = self.columnWidth - self.leftPadding - self.rightPadding;

		self.learningPanelSvg = d3.select("#learning-panel")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		self.learningParametersSvg = d3.select("#learning-parameters")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");
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

	    var brushGroup = LearningView.learningParametersSvg.append("g")
	    	.attr("brush-name", name)
	    	.attr("class", "brush " + className)
	    	.attr("transform", "translate(" + (xColumnShift + self.leftPadding) + ", " + yTranslate + ")")
	    	.call(brush);
	    brushGroup.selectAll("rect")
	    	.attr("height", self.barHeight);
	    brushGroup.select(".background")
	    	.style("visibility", null);

	    brushGroup.append("text")
			.attr("x", self.sliderWidth / 2)
			.attr("y", self.barHeight + 1)
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
			.attr("y2", self.barHeight)
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
			.attr("y", self.barHeight / 2)
			.style("text-anchor", "end")
			.style("alignment-baseline", "central");
	  	brushGroup.select(".resize.e").append("text")
	  		.attr("class", "brush-upper-bound")
			.attr("x", 3)
			.attr("y", self.barHeight / 2)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central");

		// create percentage-change invariant button (by default selected)
		var button = LearningView.learningParametersSvg.append("g")
			.attr("brush-name", name)
			.attr("class", "button selected " + className)
			.attr("transform", "translate(" + (xColumnShift + self.columnWidth - self.rightPadding + 20) + ", " + yTranslate + ")")
			.style("cursor", "pointer")
			.on("click", onClickInvariantButton);;

		var buttonText = button.append("text")
			.attr("x", 0)
			.attr("y", self.barHeight / 2)
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
				LearningView.learningParametersSvg.select("." + className + ".brush .extent")
					.attr("width", 0);
				LearningView.learningParametersSvg.select("." + className + ".brush .brush-upper-bound")
					.text("");
				LearningView.learningParametersSvg.select("." + className + ".brush .brush-lower-bound")
					.text("");
			}
		}
	},
	removeParameterWidgets: function() {
		var self = this;

		self.learningParametersSvg.selectAll("*").remove();
		self.brush = {};
	},
	getStartingPositionRange: function() {
		var self = this;

		var startingPositionRange = self.brush[self.spName].empty() ? null : self.brush[self.spName].extent();

		if (startingPositionRange) {
			startingPositionRange[0] = Math.round(startingPositionRange[0]);
			startingPositionRange[1] = Math.round(startingPositionRange[1]);
		}
		else {
			startingPositionRange = [0, Database.numberOfTimeSteps - 2];
		}

		return startingPositionRange;
	},
	getTimePeriodRange: function() {
		var self = this;

		var timePeriodRange = self.brush[self.tpName].empty() ? null : self.brush[self.tpName].extent();

		if (timePeriodRange) {
			timePeriodRange[0] = Math.round(timePeriodRange[0]);
			timePeriodRange[1] = Math.round(timePeriodRange[1]);
		}
		else {
			timePeriodRange = [1, Database.numberOfTimeSteps - 1];
		}

		return timePeriodRange;
	},
	getPercentageChangeRange: function(currentPercentageChange) {
		var self = this;

		if (self.pcName in self.brush) {
			var percentageChangeRange = self.brush[self.pcName].empty() ? null : self.brush[self.pcName].extent();

			if (percentageChangeRange) {
				var trueStartValue, trueEndValue;

				if (currentPercentageChange >= 0) { // increase
					trueStartValue = Math.round(currentPercentageChange * 0.5 * 10) / 10;
					trueEndValue = Math.round(currentPercentageChange * 1.5 * 10) / 10;

					// change to 0 and Infinity if needed
					if (percentageChangeRange[0] < trueStartValue)
						percentageChangeRange[0] = 0;
					else
						percentageChangeRange[0] = Math.round(percentageChangeRange[0] * 10) / 10;

		  			if (percentageChangeRange[1] > trueEndValue)
		  				percentageChangeRange[1] = Infinity;
		  			else 
		  				percentageChangeRange[1] = Math.round(percentageChangeRange[1] * 10) / 10;
				}
				else {
					trueStartValue = Math.round(currentPercentageChange * 1.5 * 10) / 10;
					trueEndValue = Math.round(currentPercentageChange * 0.5 * 10) / 10;

					// change to 0 and Infinity if needed
					if (percentageChangeRange[0] < trueStartValue)
						percentageChangeRange[0] = -Infinity;
					else
						percentageChangeRange[0] = Math.round(percentageChangeRange[0] * 10) / 10;

		  			if (percentageChangeRange[1] > trueEndValue)
		  				percentageChangeRange[1] = 0;
		  			else 
		  				percentageChangeRange[1] = Math.round(percentageChangeRange[1] * 10) / 10;
				}
			}
			else {
				percentageChangeRange = [-Infinity, Infinity];
			}

			return percentageChangeRange;
		}
		
		return null;
	},
	getOutlierToleranceRange: function() {
		var self = this;

		if (self.opName in self.brush) {
			var outlierToleranceRange = self.brush[self.opName].empty() ? null : self.brush[self.opName].extent();

			if (outlierToleranceRange) {
				outlierToleranceRange[0] = Math.round(outlierToleranceRange[0] * 10) / 10;
				outlierToleranceRange[1] = Math.round(outlierToleranceRange[1] * 10) / 10;
			}
			else {
				outlierToleranceRange = [0, 1];
			}

			return outlierToleranceRange;
		}

		return null;
	}
}