var BarCharts = {

	svgGroup: null,

	barHeight: 12,
	paddingBtwBars: 0,
	paddingBtwBarCharts: 80,

	height: null, // height of the whole group

	create: function(svg, width, height, data) {
		var self = this;

		self.svgGroup = svg.append("g")
			.attr("class", "bar-chart-group")
			.attr("cursor", "pointer");
		SelectionHandler.installSelectionBehaviour(self.svgGroup, insertSelection, constructMenu);

		self.createBarCharts(self.svgGroup, width, height, data);
		self.createBackground(self.svgGroup, self.height, width);

		function insertSelection(svgObject, selectionClass, x, y, width, height) {
			d3.select(svgObject)
				.insert("rect", ":first-child")
				.attr("class", selectionClass)
				.attr("x", x)
				.attr("y", 0)
				.attr("width", width)
				.attr("height", height) // 2 is the stroke width
				.style("fill", "gray")
				.style("stroke", "yellow")
				.style("fill-opacity", 0.05);
		}

		function constructMenu() {
			// current selection must exist when it is called (right click or mouse up), no need to check
			var currentSelectionX1 = parseInt(d3.select(".current-selection").attr("x"));
			var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(".current-selection").attr("width"));
			var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
			var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

			// get first and second time
			var firstTimeStep = Math.ceil(currentSelectionX1 / widthOfOneTimePeriod);
			var secondTimeStep = Math.floor(currentSelectionX2 / widthOfOneTimePeriod);

			// construct menu
			var menu = [];
			var menuItems = Object.keys(Database.position2Index); // show everything for convenience
			var parameters = {};

			for (var i = 0; i < menuItems.length; i++) {
				parameters = SelectionHandler.getParametersInCurrentSelection(menuItems[i]);

				var menuItem = {
					title: menuItems[i],
					isInterval: firstTimeStep != secondTimeStep,
					parameters: parameters,
					action: function(title, isInterval, parameters) {
						if (isInterval)
							IntervalEventHandler.createEventEdit(title, parameters);
						else
							AttributePointEventHandler.createEventEdit(title, parameters);

						// store the attribute so that upon selection, the widgets change
						var className = d3.select(d3.select(".current-selection").node().parentNode).attr("class");
						SelectionHandler.previousAttribute = title;
						SelectionHandler.previousSelectedSvg = className;
					}
				}

				menu.push(menuItem);
			}

			return menu;
		}
	},
	createBarCharts: function(svg, width, height, dataByDate) {
		var self = this;

		// create the bar charts
		var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
		var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;
		var maxFrequency = 0;
		for (var i = 0; i < dataByDate.length; i++) {
			for (var j = 0; j < dataByDate[i].length; j++) {
				if (dataByDate[i][j].frequency > maxFrequency)
					maxFrequency = dataByDate[i][j].frequency;
			}
		}

		var xScale = d3.scale.linear()
			.domain([0, dataByDate.length - 1])
			.range([0, width]);
		var widthScale = d3.scale.linear()
			.domain([0, maxFrequency])
			.range([0, widthOfOneTimePeriod - self.paddingBtwBarCharts]);

		var barChart = svg.selectAll(".barChart")
			.data(dataByDate)
			.enter()
			.append("g")
			.attr("class", "barChart")
			.attr("transform", function(d, i) {
				return "translate(" + xScale(i) + ", 0)";
			});

		barChart.selectAll(".bar")
			.data(function(d) {
				return d;
			})
			.enter()
			.append("rect")
			.attr("class", function(d) {
				return "bar " + d.position.split(" ").join("-");
			})
			.attr("width", function(d) {
				return widthScale(d.frequency);
			})
			.attr("height", self.barHeight)
			.attr("x", function(d) {
				return -widthScale(d.frequency) / 2;
			})
			.attr("y", function(d, i) {
				return i * (self.barHeight + self.paddingBtwBars);
			})
			.style("fill", function(d) {
				var index = Database.position2Index[d.position];
				return Database.positionColours[index];
			})
			.style("stroke", "black")
			.on("mouseover", onMouseOverBar)
			.on("mouseout", onMouseOutBar);

		self.height = svg.node().getBBox().height;

		function onMouseOverBar(d) {
			var barChartGroup = d3.select(this).node().parentNode.parentNode;
			var className = d.position.split(" ").join("-");

			// change bars
			d3.select(barChartGroup)
				.selectAll(".bar")
				.style("opacity", 0.1);
			d3.select(barChartGroup)
				.selectAll(".bar." + className)
				.style("opacity", 1);

			// change legend text
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("circle")
				.style("opacity", 0.1);
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("text.legend")
				.style("opacity", 0.1);

			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("circle." + className)
				.style("opacity", 1);
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("text." + className)
				.style("opacity", 1);
		}

		function onMouseOutBar(d) {
			var barChartGroup = d3.select(this).node().parentNode.parentNode;
			var className = d.position.split(" ").join("-");

			// restore bar
			d3.select(barChartGroup)
				.selectAll(".bar")
				.style("opacity", 1);

			// restore legend text
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("circle")
				.style("opacity", 1);
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("text.legend")
				.style("opacity", 1);
		}
	},
	createBackground: function(svg, bbHeight, width) {
		svg.insert("rect", ":first-child")
			.attr("width", width)
			.attr("height", bbHeight)
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "white")
			.style("stroke", "none")
			.style("opacity", 0);
	}
}