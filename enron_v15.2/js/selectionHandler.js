var SelectionHandler = {
	mouseDownLeftX: null,
	hasRightClicked: false,

	// for triggering widget construction if the user selected an attribute before
	previousAttribute: null,
	previousSelectedSvg: null,

	topologicalClassName: "flow-vis",
	attributeClassName: "bar-chart-group",

	// individualized functions
	insertSelection: {},
	constructMenu: {},

	installSelectionBehaviour: function(svgObject, insertSelection, constructMenu = null) {
		var self = SelectionHandler;
		var className = svgObject.attr("class");

		var drag = d3.behavior.drag()
				.on("dragstart", self.onDragStart)
				.on("drag", self.onDrag)
				.on("dragend", self.onDragEnd);

		svgObject
			.on("mousemove", self.onMouseMove)
			.on("mouseleave", self.onMouseLeave)
			.call(drag);

		self.insertSelection[className] = insertSelection;

		// if ways of contructing menu provided, allow right click
		if (constructMenu) {
			svgObject.on("contextmenu", self.onRightClick)
			self.constructMenu[className] = constructMenu;
		}
		else {
			// for triggering widgets while brushing (for area chart)
			self.previousAttribute = $("#timeseries-menu select").val();
			self.previousSelectedSvg = className;
		}
	},
	onDragStart: function() {
		if (d3.event.sourceEvent.which == 1) { // for left click only
			var self = SelectionHandler;
			var className = d3.select(this).attr("class");

			// store the original left x
			var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
			var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

			var mouseX = d3.mouse(this)[0];
			var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
			var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

			self.mouseDownLeftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

			// for some reason context menu is not removed normally, remove it forcefully
			d3.select('.d3-context-menu').style('display', 'none');

			// if mouse down on a current selection, create a new selection box
			if (!d3.select(this).select(".current-selection").empty()) {
				var currentSelectionX1 = parseInt(d3.select(this).select(".current-selection").attr("x"));
				var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(this).select(".current-selection").attr("width"));

				// if mouse down on a current selection
				if (mouseX > currentSelectionX1 && mouseX < currentSelectionX2) {
					var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
					var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
					var bBoxHeight = d3.select(this).node().getBBox().height; // height of the selection box

					d3.selectAll(".selection-box").remove();

					self.insertSelection[className](this, "selection-box", leftX, -bBoxHeight / 2, rightX - leftX, bBoxHeight);
				}
			}

			// remove the current selection for creating a new one
			d3.selectAll(".current-selection").remove();
		}
	},
	onDrag: function() {
		if (d3.event.sourceEvent.which == 1) { // for left click only
			var self = SelectionHandler;

			var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
			var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

			var mouseX = d3.mouse(this)[0];
			var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
			var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

			var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
			var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

			// mouse down before, change the current selection box
			var toRight = rightX > self.mouseDownLeftX;
			var originalLeftX = self.mouseDownLeftX;
			var originalRightX = self.mouseDownLeftX + widthOfOneTimePeriod;

			// "stretch" the selection box
			if (toRight) {
				d3.select(this).select(".selection-box")
					.attr("x", originalLeftX)
					.attr("width", rightX - originalLeftX);
			}
			else {
				d3.select(this).select(".selection-box")
					.attr("x", leftX)
					.attr("width", originalRightX - leftX);
			}
		}
	},
	onDragEnd: function() {
		if (d3.event.sourceEvent.which == 1) { // for left click only
			var self = SelectionHandler;
			var className = d3.select(this).attr("class");

			self.mouseDownLeftX = null;
			
			if (!d3.select(this).select(".selection-box").empty()) {
				// clone the selection box
				var x = d3.select(this).select(".selection-box").attr("x");
				var y = d3.select(this).select(".selection-box").attr("y");
				var width = d3.select(this).select(".selection-box").attr("width");
				var height = d3.select(this).select(".selection-box").attr("height");

				self.insertSelection[className](this, "current-selection", x, y, width, height);

				// remove the selection box
				d3.selectAll(".selection-box").remove();

				// if an attribute was selected
				if (self.previousAttribute && self.previousSelectedSvg == className) {
					var parameters = self.getParametersInCurrentSelection(self.previousAttribute);

					// determine if an interval was created
					var intervalCreated = false; // if no current selection, must be false
					if (!d3.select(this).select(".current-selection").empty()) {
						var currentSelectionX1 = parseInt(d3.select(this).select(".current-selection").attr("x"));
						var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(this).select(".current-selection").attr("width"));
						var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
						var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

						var firstTimeStep = Math.ceil(currentSelectionX1 / widthOfOneTimePeriod);
						var secondTimeStep = Math.floor(currentSelectionX2 / widthOfOneTimePeriod);

						intervalCreated = firstTimeStep != secondTimeStep;
					}

					// call the corresponding events
					if (intervalCreated)
						IntervalEventHandler.createEventEdit(self.previousAttribute, parameters);

					if (!intervalCreated && self.isTopological(className))
						TopologicalPointEventHandler.createEventEdit(self.previousAttribute, parameters);

					if (!intervalCreated && !self.isTopological(className))
						AttributePointEventHandler.createEventEdit(self.previousAttribute, parameters);
				}
				else if (self.previousSelectedSvg != className) {
					EventView.removeEventEdit();
				}
			}
		}
	},
	onMouseMove: function() {
		var self = SelectionHandler;
		var className = d3.select(this).attr("class");

		var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
		var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

		var mouseX = d3.mouse(this)[0];
		var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
		var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

		var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
		var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

		var bBoxHeight = d3.select(this).node().getBBox().height; // height of the selection box

		d3.selectAll(".selection-box").remove();

		// has current selection
		if (!d3.select(this).select(".current-selection").empty()) {
			var currentSelectionX1 = parseInt(d3.select(this).select(".current-selection").attr("x"));
			var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(this).select(".current-selection").attr("width"));
			
			// light up the selection box if mouse is in the range of current selection
			if (mouseX > currentSelectionX1 && mouseX < currentSelectionX2) {
				d3.select(this).select(".current-selection")
					.style("stroke", "yellow");
			}
			else {
				d3.select(this).select(".current-selection")
					.style("stroke", "gray");

				self.insertSelection[className](this, "selection-box", leftX, -bBoxHeight / 2, rightX - leftX, bBoxHeight);
			}
		}
		else {
			self.insertSelection[className](this, "selection-box", leftX, -bBoxHeight / 2, rightX - leftX, bBoxHeight);
		}
		
		// change timeline text
		d3.select("#timeline")
			.selectAll("text")
			.style("font-size", null)
			.attr("transform", null);

		var textElementIndex = Math.floor(numberOfTimePeriods);

		var targetText = d3.select("#timeline")
			.selectAll("text")[0][textElementIndex];

		d3.select(targetText)
			.style("font-size", 20)
			.attr("transform", "translate(0, 5)");
	},
	onMouseLeave: function() {
		var self = SelectionHandler;
		var className = d3.select(this).attr("class");

		d3.selectAll(".selection-box").remove();

		d3.select("#timeline")
			.selectAll("text")
			.style("font-size", null)
			.attr("transform", null);

		// on mouse leave is called after on right click
		// on right click set hasRightClicked to be true, set it back
		if (!self.hasRightClicked)
			d3.select(this).select(".current-selection")
				.style("stroke", "gray");
		else
			self.hasRightClicked = false;
	},
	onRightClick: function() {
		var self = SelectionHandler;
		var className = d3.select(this).attr("class");

		// * handling interaction
		// draw current selection and remove selection box if not click within range
		var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
		var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

		var mouseX = d3.mouse(this)[0];
		var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
		var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

		var rightClickWithinInterval = false; // if no current selection, must be false

		if (!d3.select(this).select(".current-selection").empty()) {
			var currentSelectionX1 = parseInt(d3.select(this).select(".current-selection").attr("x"));
			var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(this).select(".current-selection").attr("width"));
			var firstTimeStep = Math.ceil(currentSelectionX1 / widthOfOneTimePeriod);
			var secondTimeStep = Math.floor(currentSelectionX2 / widthOfOneTimePeriod);

			rightClickWithinInterval = (mouseX > currentSelectionX1) && (mouseX < currentSelectionX2) && (firstTimeStep != secondTimeStep);
		}

		if (!rightClickWithinInterval) {
			var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
			var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
			var bBoxHeight = d3.select(this).node().getBBox().height; // height of the selection box

			d3.selectAll(".selection-box").remove();
			d3.selectAll(".current-selection").remove();

			self.insertSelection[className](this, "current-selection", leftX, -bBoxHeight / 2, rightX - leftX, bBoxHeight);
		}
		else {
			self.hasRightClicked = true;
		}

		// menu construction	
		var menu = self.constructMenu[className]();

		return d3.contextMenu(menu)();
	},
	// there is only one current selection at any given time
	getParametersInCurrentSelection: function(attribute) {
		var self = SelectionHandler;

		// get the email
		var parentNodeElm = d3.select(".current-selection").node().parentNode.parentNode;
		var email = d3.select(parentNodeElm).attr("email");
		var parameters = {};

		// current selection must exist when it is called (right click or mouse up), no need to check
		var currentSelectionX1 = parseInt(d3.select(".current-selection").attr("x"));
		var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(".current-selection").attr("width"));
		var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
		var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

		// get first and second time
		var firstTimeStep = Math.ceil(currentSelectionX1 / widthOfOneTimePeriod);
		var secondTimeStep = Math.floor(currentSelectionX2 / widthOfOneTimePeriod);

		var parentNodeClass = d3.select(d3.select(".current-selection").node().parentNode).attr("class");

		// point topological event
		if (firstTimeStep == secondTimeStep && self.isTopological(parentNodeClass)) {
			parameters["attributeValue"] = Database.attribute2DataDict[attribute][email][firstTimeStep]; // first = second
		}

		// point attribute event
		if (firstTimeStep == secondTimeStep && !self.isTopological(parentNodeClass)) {
			parameters["isMax"] = true; // hacky..., make it always true for convenience
		}

		// interval event, assumed current selection exists
		if (firstTimeStep != secondTimeStep) {
			var timeSeriesArrayIndex = Database.convertTimeIndices2Index([firstTimeStep, secondTimeStep]);

			// get current slope, outlier percent and current time series
			var currentSlope = Database.timeSeriesData[attribute][email].slope[timeSeriesArrayIndex];
			var currentOutlierPercent = Database.timeSeriesData[attribute][email].outlierPercent[timeSeriesArrayIndex];
			var currentTimeSeries = Database.attribute2DataDict[attribute][email].slice(firstTimeStep, secondTimeStep + 1);

			parameters["slope"] = currentSlope;
			parameters["timePeriod"] = secondTimeStep - firstTimeStep;
			parameters["noise"] = currentOutlierPercent;
			parameters["timeSeries"] = currentTimeSeries;
		}
		
		return parameters;		
	},
	isTopological: function(className) {
		var self = SelectionHandler;
		var timeSeriesSelected = $("#timeseries-menu select").val();
		var nonTopologicalTimeSeriesName = Object.keys(Database.position2Index);
		nonTopologicalTimeSeriesName.push("None"); // include none as well

		// if it is the flowVis or if it the time series selected is one of the four attributes
		if (className == self.topologicalClassName || $.inArray(timeSeriesSelected, nonTopologicalTimeSeriesName) == -1)
			return true;

		return false;
	}
}