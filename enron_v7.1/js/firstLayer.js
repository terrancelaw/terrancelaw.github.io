var FirstLayer = {
	colour: "#e5e5e5",

	// resources for creating labels
	name: null,
	xScale: null,
	flowHeight: null,

	svgGroup: null,

	height: null, // height of the whole group

	mouseDownLeftX: null,

	create: function(svg, width, height, data, numberOfClustersAtEachTimeStep) {
		var self = this;

		self.svgGroup = svg.append("g")
			.attr("class", "network-cluster")
			.attr("cursor", "pointer")
			.on("contextmenu", onRightClickNetworkClusterGroup)
			.on("mousedown", onMouseDownNetworkClusterGroup)
			.on("mouseup", onMouseUpNetworkClusterGroup)
			.on("mousemove", onMouseMoveNetworkClusterGroup)
			.on("mouseleave", onMouseLeaveNetworkClusterGroup);

		self.createLayer(self.svgGroup, width, height, data, numberOfClustersAtEachTimeStep);
		self.createLabels(self.svgGroup, self.xScale, self.flowHeight / 2 + 10, self.name, data);
		self.translateFlow(self.svgGroup, BarCharts.height);
		self.createBackground(self.svgGroup, self.height, width);

		function onMouseDownNetworkClusterGroup() {
			if (d3.event.which == 1) { // left click only
				// store the original left x
				var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
				var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

				var mouseX = d3.mouse(this)[0];
				var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
				var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

				self.mouseDownLeftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

				// remove the current selection for creating a new one
				d3.selectAll(".current-selection").remove();

				// for some reason context menu is not removed normally, remove it forcefully
				d3.select('.d3-context-menu').style('display', 'none');
				self.selectedAttribute = null;
				self.selectedTimeStep = null;
			}
		}

		function onMouseUpNetworkClusterGroup() {
			if (d3.event.which == 1) { // left click only
				self.mouseDownLeftX = null;

				// clone the selection box
				if (!d3.select(this).select(".selection-box").empty()) {
					var x = d3.select(this).select(".selection-box").attr("x");
					var y = d3.select(this).select(".selection-box").attr("y");
					var width = d3.select(this).select(".selection-box").attr("width");
					var height = d3.select(this).select(".selection-box").attr("height");

					d3.select(this)
						.append("rect")
						.attr("class", "current-selection")
						.attr("x", x)
						.attr("y", y)
						.attr("width", width)
						.attr("height", height)
						.style("fill", "gray")
						.style("stroke", "gray")
						.style("fill-opacity", 0.05);

					// remove the selection box
					d3.selectAll(".selection-box").remove();
				}
			}
		}

		function onMouseMoveNetworkClusterGroup() {
			var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
			var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

			var mouseX = d3.mouse(this)[0];
			var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
			var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

			var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
			var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

			var bBoxHeight = d3.select(this).select(".area").node().getBBox().height; // height of the selection box

			// draw selection box
			if (self.mouseDownLeftX) { // change the existing if mouse down (must not have current selection)
				var toRight = rightX > self.mouseDownLeftX;
				var originalLeftX = self.mouseDownLeftX;
				var originalRightX = self.mouseDownLeftX + widthOfOneTimePeriod;

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
			else if (!d3.select(this).select(".current-selection").empty()) { // not mouse down but has current selection
				var currentSelectionX1 = parseInt(d3.select(this).select(".current-selection").attr("x"));
				var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(this).select(".current-selection").attr("width"));
				d3.selectAll(".selection-box").remove();
				
				// light up the selection box if mouse is in the range of current selection
				if (mouseX > currentSelectionX1 && mouseX < currentSelectionX2) {
					d3.select(this).select(".current-selection")
						.style("stroke", "red");
				}
				else {
					d3.select(this).select(".current-selection")
						.style("stroke", "gray");

					d3.select(this)
						.append("rect")
						.attr("class", "selection-box")
						.attr("x", leftX)
						.attr("y", -bBoxHeight / 2)
						.attr("width", rightX - leftX)
						.attr("height", bBoxHeight)
						.style("fill", "gray")
						.style("stroke", "gray")
						.style("fill-opacity", 0.05);
				}
			}
			else if (d3.select(this).select(".current-selection").empty()) { // not mouse down, remove and create new box
				d3.selectAll(".selection-box").remove();

				d3.select(this)
					.append("rect")
					.attr("class", "selection-box")
					.attr("x", leftX)
					.attr("y", -bBoxHeight / 2)
					.attr("width", rightX - leftX)
					.attr("height", bBoxHeight)
					.style("fill", "gray")
					.style("stroke", "gray")
					.style("fill-opacity", 0.05);
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
		}

		function onMouseLeaveNetworkClusterGroup() {
			d3.selectAll(".selection-box").remove();

			d3.select("#timeline")
				.selectAll("text")
				.style("font-size", null)
				.attr("transform", null);

			d3.select(this).select(".current-selection")
				.style("stroke", "gray");
		}

		function onRightClickNetworkClusterGroup() {
			// * handling interaction

			// get the current time step
			var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
			var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

			var mouseX = d3.mouse(this)[0];
			var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
			var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;
			var currentTimeStep = Math.floor(numberOfTimePeriods);

			// draw current selection and remove selection box if not click within range
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
				var bBoxHeight = d3.select(this).select(".area").node().getBBox().height; // height of the selection box

				d3.selectAll(".selection-box").remove();
				d3.selectAll(".current-selection").remove();

				d3.select(this)
					.append("rect")
					.attr("class", "current-selection")
					.attr("x", leftX)
					.attr("y", -bBoxHeight / 2)
					.attr("width", rightX - leftX)
					.attr("height", bBoxHeight)
					.style("fill", "gray")
					.style("stroke", "gray")
					.style("fill-opacity", 0.05);
			}

			// * menu construction

			// get the email
			var parentNodeElm = d3.select(this).node().parentNode;
			var email = d3.select(parentNodeElm).attr("email");

			// construct menu (add stability and density if needed)
			var stabilityBtnSelected = d3.select("#flow-view .ui-menu-bar .control #stable-button").classed("selected");
			var densityBtnSelected = d3.select("#flow-view .ui-menu-bar .control #density-button").classed("selected");

			var menu = [];
			var menuItems = ["Size", "Number of Clusters"]

			if (stabilityBtnSelected)
				menuItems.push("Stability");
			if (densityBtnSelected)
				menuItems.push("Density");

			for (var i = 0; i < menuItems.length; i++) {
				// parameter preparation
				var parameters = {};

				if (!rightClickWithinInterval) { // point event
					parameters["currentAttributeValue"] = Database.attribute2DataDict[menuItems[i]][email][currentTimeStep];
				}
				else { // interval event (more than two time steps)
					// current selection exists, no need to check
					var currentSelectionX1 = parseInt(d3.select(this).select(".current-selection").attr("x"));
					var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(this).select(".current-selection").attr("width"));

					// get first and second time
					var firstTimeStep = Math.ceil(currentSelectionX1 / widthOfOneTimePeriod);
					var secondTimeStep = Math.floor(currentSelectionX2 / widthOfOneTimePeriod);
					var currentAttribute = menuItems[i];

					// * current percentage change
					var firstValue = Database.attribute2DataDict[currentAttribute][email][firstTimeStep];
					var secondValue = Database.attribute2DataDict[currentAttribute][email][secondTimeStep];
					var currentPercentageChange;

					if (firstValue == 0)
						currentPercentageChange = "INF";
					else
						currentPercentageChange = (secondValue - firstValue) / firstValue;

					// * Outlier time period percentage
					var currentTimeStep = firstTimeStep + 1;
					var previousValue = Database.attribute2DataDict[currentAttribute][email][currentTimeStep - 1];
					var currentValue = Database.attribute2DataDict[currentAttribute][email][currentTimeStep];
					var outlierTimePeriodCount = 0;

					while (currentTimeStep <= secondTimeStep) {
						var isDecreaseOutlier = secondValue >= firstValue && currentValue <= previousValue;
						var isIncreaseOutlier = secondValue < firstValue && currentValue >= previousValue;

						// count outliers
						if (isDecreaseOutlier || isIncreaseOutlier)
							outlierTimePeriodCount++;

						currentTimeStep++;
						previousValue = Database.attribute2DataDict[currentAttribute][email][currentTimeStep - 1];
						currentValue = Database.attribute2DataDict[currentAttribute][email][currentTimeStep];
					}

					var currentOutlierPercentage = outlierTimePeriodCount / (secondTimeStep - firstTimeStep);

					parameters["currentPercentageChange"] = currentPercentageChange;
					parameters["currentStartingPosition"] = firstTimeStep;
					parameters["currentNumberOfTimePeriods"] = secondTimeStep - firstTimeStep;
					parameters["currentOutlierPercentage"] = currentOutlierPercentage;
				}
				
				menu.push({
					title: menuItems[i],
					isInterval: rightClickWithinInterval,
					parameters: parameters,
					action: function(title, isInterval, p) {
						if (isInterval)
							IntervalEventHandler.createParameterWidgets(title, p.currentPercentageChange, p.currentStartingPosition, p.currentNumberOfTimePeriods, p.currentOutlierPercentage);
						else
							TopologicalPointEventHandler.createEventEdit(title, p.currentAttributeValue);
					}
				});
			}

			return d3.contextMenu(menu)();
		}
	},
	createLayer: function(svg, width, height, data, numberOfClustersAtEachTimeStep) {
		var self = this;

		var maxSize = d3.max(data, function(d, i) {
			return d.size;
		});
		var xScale = d3.scale.linear()
			.domain([0, data.length - 1])
			.range([0, width]);
		var sizeScale = d3.scale.linear()
			.domain([0, maxSize])
			.range([0, height / 2]);

		// create area chart
		var area = d3.svg.area()
			.interpolate("monotone")
			.x(function(d, i) { return xScale(i); })
            .y0(function(d, i) {
            	var paddingForClusters = 0;

            	if (numberOfClustersAtEachTimeStep[i] > 0)
            		paddingForClusters = 2 * SecondLayer.gapBetweenNodes + (numberOfClustersAtEachTimeStep[i] - 1) * SecondLayer.gapBetweenNodes;

            	return (sizeScale(d.size) + paddingForClusters) / 2; 
            })
            .y1(function(d, i) {
            	var paddingForClusters = 0;

            	if (numberOfClustersAtEachTimeStep[i] > 0)
            		paddingForClusters = 2 * SecondLayer.gapBetweenNodes + (numberOfClustersAtEachTimeStep[i] - 1) * SecondLayer.gapBetweenNodes;

            	return (- sizeScale(d.size) - paddingForClusters) / 2;
            });

		var flow = svg.append("path")
			.datum(data)
			.attr("class", "area")
			.attr("d", area)
			.attr("fill", self.colour);

		// insert rect for hovering
		var flowHeight = flow.node().getBBox().height;

		// prepare resources for creating labels
		self.name = data[0].name;
		self.name = self.name.substring(0, self.name.indexOf("@"));
		self.xScale = xScale;
		self.flowHeight = flowHeight;
	},
	createLabels: function(svg, xScale, yTranslate, name, data) {
		// create tick marks
		var tickHeight = 10;

  		var tickGroup = svg.append("g")
			.attr("class", "tick-Group");
  		var tick = tickGroup.selectAll("g")
			.data(data)
			.enter()
			.append("g");

		tick.append("line")
			.attr("x1", function(d, i) {
				return xScale(i);
			})
			.attr("x2", function(d, i) {
				return xScale(i);
			})
			.attr("y1", yTranslate)
			.attr("y2", yTranslate + tickHeight)
			.attr("stroke", "black")
			.attr("stroke-width", "1px");

		// create name label
		var email = name + "@enron.com"

		svg.append("text")
  			.attr("class", "name-label")
			.text(name + " (" + Database.employeeDict[email] + ")")
			.attr("x", 0)
			.attr("y", yTranslate + 40)
			.style("text-anchor", "start")
			.style("font-size", 40);
	},
	translateFlow: function(svg, barChartsHeight) {
		var self = this;
		self.height = svg.node().getBBox().height;

		// translate by bBoxHeight / 2 and height / 2 (for bar charts)
		svg.attr("transform", "translate(0, " + (self.height / 2 + barChartsHeight)+ ")");
	},
	createBackground: function(svg, bbHeight, width) {
		svg.insert("rect", ":first-child")
			.attr("width", width)
			.attr("height", bbHeight)
			.attr("x", 0)
			.attr("y", -bbHeight / 2)
			.style("fill", "white")
			.style("stroke", "none")
			.style("opacity", 0);
	}
}