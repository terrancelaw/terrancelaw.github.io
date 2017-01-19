var IntervalEventHandler = {
	currentAttribute: null,
	currentPercentageChange: null,
	currentStartingPosition: null,
	currentNumberOfTimePeriods: null,
	currentOutlierPercentage: null,
	
	isInt: {}, // for determining whether the range should be int or floating point numbers

	init: function(currentAttribute, currentPercentageChange, currentStartingPosition, currentNumberOfTimePeriods, currentOutlierPercentage) {
		var self = this;

		self.currentAttribute = currentAttribute;
		self.currentPercentageChange = currentPercentageChange;
		self.currentStartingPosition = currentStartingPosition;
		self.currentNumberOfTimePeriods = currentNumberOfTimePeriods;
		self.currentOutlierPercentage = currentOutlierPercentage;

		self.isInt[LearningView.pcName] = false;
		self.isInt[LearningView.spName] = true;
		self.isInt[LearningView.tpName] = true;
		self.isInt[LearningView.opName] = false;

		EventView.isInterval = true;
		self.createEventName();
		EventView.determineCurrentEventAddedColourAndFull();
	},
	createParameterWidgets: function(currentAttribute, currentPercentageChange, currentStartingPosition, currentNumberOfTimePeriods, currentOutlierPercentage) {
		var self = this;

		self.init(currentAttribute, currentPercentageChange, currentStartingPosition, currentNumberOfTimePeriods, currentOutlierPercentage);

		// remove previous events
		EventView.eventEditSvg.selectAll("*").remove();
		LearningView.learningParametersSvg.selectAll("*").remove();

		// create widgets and event tag
		self.createMainContent();
		self.createControls();
	},
	createMainContent: function() {
		var self = this;

		 EventView.addEventTagToEventEdit();
		 EventView.eventEditSvg.select(".add-button")
			.on("click", onClickAddButton);

		function onClickAddButton() {
			if (!EventView.isFull && !EventView.isAdded) {
				// get the parameter values
				var startingPositionRange = LearningView.getStartingPositionRange();
				var timePeriodRange = LearningView.getTimePeriodRange();
				var percentageChangeRange = LearningView.getPercentageChangeRange(self.currentPercentageChange);
				var outlierToleranceRange = LearningView.getOutlierToleranceRange();

				// register the new event
				EventView.event2Index[EventView.currentEventName] = EventView.nextEventIndex;
				EventView.updateNextEventIndex();

				// adding new event
				for (email in Database.attribute2DataDict[self.currentAttribute]) {
					var valueArray = Database.attribute2DataDict[self.currentAttribute][email];

					for (var t1 = startingPositionRange[0]; t1 < valueArray.length - 1 && t1 <= startingPositionRange[1]; t1++) {
						var endPointOfLongestMatch = null;
						for (var t2 = t1 + timePeriodRange[0]; t2 < valueArray.length && t2 <= t1 + timePeriodRange[1]; t2++) {
							var isMatch = true;

							// check if percentage change falls into range
							var firstValue = valueArray[t1];
							var secondValue = valueArray[t2];
							var percentageChange;
							if (firstValue == 0 && secondValue == 0) {
								isMatch = false;
								continue;
							}
							else {
								percentageChange = (secondValue - firstValue) / firstValue;
							}

							if (percentageChange < percentageChangeRange[0] || percentageChange > percentageChangeRange[1]) {
								isMatch = false;
								continue;
							}

							// check if outlier percentage falls into range
							var numberOfOutliers = 0;
							for (var t3 = t1 + 1; t3 <= t2; t3++) {
								var currentValue = valueArray[t3];
								var previousValue = valueArray[t3 - 1];

								var decreaseOutlier = self.currentPercentageChange >= 0 && currentValue <= previousValue;
								var increaseOutlier = self.currentPercentageChange < 0 && currentValue >= previousValue;

								if (decreaseOutlier || increaseOutlier)
									numberOfOutliers++;
							}

							var percentageOfOutlier = numberOfOutliers / (t2 - t1);
							if (percentageOfOutlier < outlierToleranceRange[0] || percentageOfOutlier > outlierToleranceRange[1]) {
								isMatch = false;
								continue;
							}

							// went through all the test!! pattern matched
							endPointOfLongestMatch = t2;
						}

						// store the event
						if (endPointOfLongestMatch) {
							Database.appendEvent(EventView.currentEventName, Database.dateStringArray[t1], Database.dateStringArray[endPointOfLongestMatch], email);
							t1 = endPointOfLongestMatch;
						}
					}
				}

				// add the event to the view
				EventView.addEventToView();
				EventView.removeEventEdit();
				LearningView.removeParameterWidgets();

				// updating the events in the table view
				Table.updateEvents();
			}
		}
	},
	createControls: function() {
		var self = this;

		// * percentage change brush
		var startValue, endValue;
		var currentValue = Math.round(self.currentPercentageChange * 10) / 10;
		var name = LearningView.pcName;
		var className = name.split(" ").join("-");

		if (currentValue >= 0) { // increase
			startValue = Math.round(self.currentPercentageChange * 0.5 * 10) / 10;
			endValue = Math.round(self.currentPercentageChange * 1.5 * 10) / 10;
		}
		else {
			startValue = Math.round(self.currentPercentageChange * 1.5 * 10) / 10;
			endValue = Math.round(self.currentPercentageChange * 0.5 * 10) / 10;
		}

		var endPadding = (endValue - startValue) / 18;
		startValue -= endPadding;
		endValue += endPadding;

		LearningView.brush[name] = LearningView.createParameterWidget(name, 0, LearningView.firstRowY, startValue, currentValue, endValue)
			.on("brush", onBrushMove)
			.on("brushend", onBrushEnd);

		// modify the brush appearance
		var trueStartValue = startValue + endPadding;
		var trueEndValue = endValue - endPadding;
		var xScale = d3.scale.linear()
			.domain([startValue, endValue])
			.range([0, LearningView.sliderWidth]);

		LearningView.learningParametersSvg.select(".Percentage-change-range.brush .overall-lower-bound")
			.attr("x", xScale(trueStartValue))
			.text(trueStartValue);
		LearningView.learningParametersSvg.select(".Percentage-change-range.brush .overall-upper-bound")
			.attr("x", xScale(trueEndValue))
			.text(trueEndValue);

		LearningView.learningParametersSvg.select(".Percentage-change-range.brush").append("line")
			.attr("x1", xScale(trueStartValue))
			.attr("x2", xScale(trueStartValue))
			.attr("y1", 0)
			.attr("y2", LearningView.barHeight)
			.style("stroke", "gray")
			.style("stroke-width", 1);
		LearningView.learningParametersSvg.select(".Percentage-change-range.brush").append("line")
			.attr("x1", xScale(trueEndValue))
			.attr("x2", xScale(trueEndValue))
			.attr("y1", 0)
			.attr("y2", LearningView.barHeight)
			.style("stroke", "gray")
			.style("stroke-width", 1);

		// * starting position brush
		var startValue = 0;
		var currentValue = self.currentStartingPosition;
		var endValue = Database.numberOfTimeSteps - 2;
		var name = LearningView.spName;
		var className = name.split(" ").join("-");

		LearningView.brush[name] = LearningView.createParameterWidget(name, LearningView.columnWidth, LearningView.firstRowY, startValue, currentValue, endValue)
			.on("brush", onBrushMove)
			.on("brushend", onBrushEnd);

		// * number of time period brush
		var startValue = 1;
		var currentValue = self.currentNumberOfTimePeriods;
		var endValue = Database.numberOfTimeSteps - 1;
		var name = LearningView.tpName;
		var className = name.split(" ").join("-");

		LearningView.brush[name] = LearningView.createParameterWidget(name, 0, LearningView.secondRowY, startValue, currentValue, endValue)
			.on("brush", onBrushMove)
			.on("brushend", onBrushEnd);

		// * outlier tolerance brush
		var startValue = 0;
		var currentValue = Math.round(self.currentOutlierPercentage * 10) / 10;
		var endValue = 1;
		var name = LearningView.opName;
		var className = name.split(" ").join("-");

		LearningView.brush[name] = LearningView.createParameterWidget(name, LearningView.columnWidth, LearningView.secondRowY, startValue, currentValue, endValue)
			.on("brush", onBrushMove)
			.on("brushend", onBrushEnd);

	  	function onBrushMove() {
	  		var name = d3.select(this).attr("brush-name");
			var className = name.split(" ").join("-");

			// determine new lower and upper bound
			var lowerBound, upperBound;
	  		if (self.isInt[name]) {
	  			lowerBound = LearningView.brush[name].empty() ? null : Math.round(LearningView.brush[name].extent()[0]);
	  			upperBound = LearningView.brush[name].empty() ? null : Math.round(LearningView.brush[name].extent()[1]);
	  		}
	  		else { // show one decimal place
	  			lowerBound = LearningView.brush[name].empty() ? null : Math.round(LearningView.brush[name].extent()[0] * 10) / 10;
	  			upperBound = LearningView.brush[name].empty() ? null : Math.round(LearningView.brush[name].extent()[1] * 10) / 10;
	  		}

	  		// change the lower bound and upper bound text
	  		LearningView.learningParametersSvg.select("." + className + ".brush .brush-lower-bound")
	  			.text(lowerBound);
	  		LearningView.learningParametersSvg.select("." + className + ".brush .brush-upper-bound")
	  			.text(upperBound);

	  		// starting position upper bound depends on time period brush lower bound
	  		if (name == LearningView.tpName) {
	  			var newStartingPositingUpperBound = Database.numberOfTimeSteps - 1 - lowerBound;

	  			// change brush scale
	  			var xScale = d3.scale.linear()
					.domain([0, newStartingPositingUpperBound])
					.range([0, LearningView.sliderWidth]);
				LearningView.brush[LearningView.spName].x(xScale);

				// change current value position
				var currentValueNewPosition = xScale(self.currentStartingPosition);
				var spClassName = LearningView.spName.split(" ").join("-");
				LearningView.learningParametersSvg.select("." + spClassName + ".brush .current-value")
					.attr("transform", "translate(" + xScale(self.currentStartingPosition) + ", " + "0)")
					.style("display", null);

				if (currentValueNewPosition > LearningView.sliderWidth) {
					LearningView.learningParametersSvg.select("." + spClassName + ".brush .current-value")
						.style("display", "none");
				}

				// change upper bound text
	  			LearningView.learningParametersSvg.select("." + spClassName + ".brush .overall-upper-bound")
	  				.text(newStartingPositingUpperBound);

	  			// change brush upper and lower bound
	  			var newLowerBound, newUpperBound;
	  			if (self.isInt[LearningView.spName]) {
	  				newLowerBound = LearningView.brush[LearningView.spName].empty() ? null : Math.round(LearningView.brush[LearningView.spName].extent()[0]);
	  				newUpperBound = LearningView.brush[LearningView.spName].empty() ? null : Math.round(LearningView.brush[LearningView.spName].extent()[1]);
		  		}
		  		else { // show one decimal place
		  			newLowerBound = LearningView.brush[LearningView.spName].empty() ? null : Math.round(LearningView.brush[LearningView.spName].extent()[0] * 10) / 10;
		  			newUpperBound = LearningView.brush[LearningView.spName].empty() ? null : Math.round(LearningView.brush[LearningView.spName].extent()[1] * 10) / 10;
		  		}

	  			LearningView.learningParametersSvg.select("." + spClassName + ".brush .brush-lower-bound")
	  				.text(newLowerBound);
	  			LearningView.learningParametersSvg.select("." + spClassName + ".brush .brush-upper-bound")
	  				.text(newUpperBound);
	  		}

	  		// percentage change > 1.5 = inf, percentage change < 0.5 = 0
	  		if (name == LearningView.pcName) {
	  			var brushLowerBound = LearningView.brush[name].extent()[0];
	  			var brushUpperBound = LearningView.brush[name].extent()[1];
	  			var upperThreshold, lowerThreshold;
	  			var pcClassName = LearningView.pcName.split(" ").join("-");

	  			if (self.currentPercentageChange >= 0) { // increase
	  				lowerThreshold = Math.round(self.currentPercentageChange * 0.5 * 10) / 10;
	  				upperThreshold = Math.round(self.currentPercentageChange * 1.5 * 10) / 10;

	  				if (brushLowerBound < lowerThreshold) {
		  				LearningView.learningParametersSvg.select("." + pcClassName + ".brush .brush-lower-bound")
		  					.text(0);
		  			}
		  			if (brushUpperBound > upperThreshold) {
		  				LearningView.learningParametersSvg.select("." + pcClassName + ".brush .brush-upper-bound")
		  					.text("∞");
		  			}
	  			}
	  			else {
	  				lowerThreshold = Math.round(self.currentPercentageChange * 1.5 * 10) / 10;
	  				upperThreshold = Math.round(self.currentPercentageChange * 0.5 * 10) / 10;

	  				if (brushLowerBound < lowerThreshold) {
		  				LearningView.learningParametersSvg.select("." + pcClassName + ".brush .brush-lower-bound")
		  					.text("-∞");
		  			}
		  			if (brushUpperBound > upperThreshold) {
		  				LearningView.learningParametersSvg.select("." + pcClassName + ".brush .brush-upper-bound")
		  					.text("0");
		  			}
	  			}
	  		}
	  	}

	  	function onBrushEnd() {
	  		var name = d3.select(this).attr("brush-name");
			var className = name.split(" ").join("-");

			// if dragged, de-select invariant button
			// if not dragged, select invariant button
	  		if (LearningView.brush[name].empty()) {
	  			LearningView.learningParametersSvg.select(".button." + className)
	  				.classed("selected", true);
	  			LearningView.learningParametersSvg.select(".button." + className + " rect")
	  				.style("fill", "yellow");
	  		}
	  		else {
	  			LearningView.learningParametersSvg.select(".button." + className)
	  				.classed("selected", false);
	  			LearningView.learningParametersSvg.select(".button." + className + " rect")
	  				.style("fill", "#e5e5e5");
	  		}
	  	}
	},
	createEventName: function() {
		var self = this;

		// determine current event name
		var currentEventList = Object.keys(EventView.event2Index);

		if (self.currentPercentageChange >= 0)
			EventView.currentEventName = self.currentAttribute + " increases";
		else
			EventView.currentEventName = self.currentAttribute + " decreases";

		// * add id to the event name for idenfication

		// find the max event id for the event with the same name
		var maxEventID = -999;
		for (var i = 0; i < currentEventList.length; i++) {
			// found, get the id of that event
			var foundIndex = currentEventList[i].indexOf(EventView.currentEventName);
			if (foundIndex != -1) {
				var eventID = parseInt(currentEventList[i].split("#")[1]);
				if (eventID > maxEventID)
					maxEventID = eventID;
			}
		}

		// append event id to the event name
		if (maxEventID == -999) // not found
			EventView.currentEventName = EventView.currentEventName + " #1";
		else
			EventView.currentEventName = EventView.currentEventName + " #" + (maxEventID + 1);
	}
}