var BarCharts = {

	svgGroup: null,

	barHeight: 13,
	paddingBtwBars: 2,
	paddingBtwBarCharts: 30,

	height: null, // height of the whole group

	create: function(svg, width, height, data) {
		var self = this;

		self.svgGroup = svg.append("g")
			.attr("class", "bar-chart-group")
			.attr("cursor", "pointer")
			.on("mousemove", onMouseMoveBarChartGroup)
			.on("mouseleave", onMouseLeaveBarChartGroup)
			.on('contextmenu', onRightClickBarChartGroup);

		self.createBarCharts(self.svgGroup, width, height, data);
		self.createBackground(self.svgGroup, self.height, width);

		function onMouseMoveBarChartGroup() {
			var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
			var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

			var mouseX = d3.mouse(this)[0];
			var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
			var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

			var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
			var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

			var barChartsHeight = d3.select(this).node().getBBox().height;

			d3.selectAll(".selection-box").remove();

			d3.select(this)
				.insert("rect", ":first-child")
				.attr("class", "selection-box")
				.attr("x", leftX)
				.attr("y", 0)
				.attr("width", rightX - leftX)
				.attr("height", barChartsHeight) // 2 is the stroke width
				.style("fill", "gray")
				.style("stroke", "gray")
				.style("fill-opacity", 0.05);

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

		function onMouseLeaveBarChartGroup() {
			d3.selectAll(".selection-box").remove();

			d3.select("#timeline")
				.selectAll("text")
				.style("font-size", null)
				.attr("transform", null);
		}

		function onRightClickBarChartGroup() {
			// get the corresponding time
			var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
			var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

			var mouseX = d3.mouse(this)[0];
			var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
			var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;
			var currentTimeStep = Math.floor(numberOfTimePeriods);

			// get the email
			var parentNodeElm = d3.select(this).node().parentNode;
			var email = d3.select(parentNodeElm).attr("email");

			// get the positions contacted at that time step
			var positionArray = Database.attributeDict[email][currentTimeStep];

			// determine whether the positions at the time step are max
			// the positions are sorted by frequency but there can be more than one max
			var maxArray = [];
			for (var i = 0; i < positionArray.length; i++) {
				if (i == 0)
					maxArray.push(true);
				else if (positionArray[i].frequency == positionArray[0].frequency)
					maxArray.push(true);
				else
					maxArray.push(false);
			}

			// construct menu
			var menu = [];
			for (var i = 0; i < positionArray.length; i++) {
				var menuItem = {
					title: positionArray[i].position,
					isInterval: false,
					parameters: { isMax: maxArray[i] } ,
					action: function(title, isInterval, p) {
						AttributePointEventHandler.createEventEdit(title, p.isMax);
					}
				}

				menu.push(menuItem);
			}

			return d3.contextMenu(menu)();
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