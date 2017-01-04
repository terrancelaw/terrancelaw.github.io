var BarCharts = {
	dataByDate: [],

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
							.on("mousemove", function() {
								var totalNumberOfTimePeriods = Database.sizeDict[Database.emailList[0]].length - 1;
								var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

								var mouseX = d3.mouse(this)[0];
								var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
								var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

								var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
								var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

								var barChartsHeight = d3.select(this).node().getBBox().height

								d3.selectAll(".selectionBox").remove();

								d3.select(this)
									.append("rect")
									.attr("class", "selectionBox")
									.attr("x", leftX)
									.attr("y", 0)
									.attr("width", rightX - leftX)
									.attr("height", barChartsHeight) // 2 is the stroke width
									.style("fill", "none")
									.style("stroke", "black")
									.style("stroke-width", 2);

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
							})
							.on("mouseleave", function() {
								d3.selectAll(".selectionBox").remove();

								d3.select("#timeline")
									.selectAll("text")
									.style("font-size", null)
									.attr("transform", null);
							});

		self.preprocessing(width, height, data);
		self.createBarCharts(self.svgGroup, width, height, self.dataByDate);
		self.createBackground(self.svgGroup, self.height, width);
	},
	preprocessing: function(width, height, data) {
		var self = this;
		var dataByDate = [];
		var uniquePositions = [];
		var dataWithoutUnknown = [];

		// determine the number of layers
		for (var i = 0; i < data.length; i++) {
			if ($.inArray(data[i].position, uniquePositions) == -1 && data[i].position != "unknown")
				uniquePositions.push(data[i].position);
		}

		// remove the items position of which is unknown
		for (var i = 0; i < data.length; i++) {
			if (data[i].position != "unknown")
				dataWithoutUnknown.push(data[i]);
		}

		var tempDataByDate = d3.nest()
								.key(function(d) {
									return d.date;
								})
								.map(dataWithoutUnknown);

		// create dataByDate which contains every month
		var totalNumberOfTimeStep = Database.sizeDict[Database.emailList[0]].length;
		var firstTimeStep = Database.sizeDict[Database.emailList[0]][0].date;
		var lastTimeStep = Database.sizeDict[Database.emailList[0]][totalNumberOfTimeStep - 1].date;
		var parseDate = d3.time.format("%Y-%m").parse;
		var currentDate = parseDate(firstTimeStep);
		var lastDate = parseDate(lastTimeStep);

		while (currentDate <= lastDate) {
			// construct date string
			var year = currentDate.getYear() + 1900;
			var month = currentDate.getMonth() + 1;

			if (month < 10)
				month = "0" + month.toString();
			else
				month = month.toString();

			var currentDateString = year + "-" + month;

			if (currentDateString in tempDataByDate)
				dataByDate.push(tempDataByDate[currentDateString]);
			else
				dataByDate.push([]);

			currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
		}

		// sort by position and then by frequency
		for (var i = 0; i < dataByDate.length; i++) {
			dataByDate[i].sort(function(x, y) {
				return d3.ascending(Database.position2Index[x.position], Database.position2Index[y.position]);
			});
		}
		for (var i = 0; i < dataByDate.length; i++) {
			dataByDate[i].sort(function(x, y) {
				return d3.descending(x.frequency, y.frequency);
			});
		}
		
		// prepare resources for streamgraph rendering
		self.dataByDate = dataByDate;
	},
	createBarCharts: function(svg, width, height, dataByDate) {
		var self = this;

		// create the bar charts
		var totalNumberOfTimePeriods = Database.sizeDict[Database.emailList[0]].length - 1;
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
							.range([0, widthOfOneTimePeriod - self.paddingBtwBarCharts])

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
			.on("mouseover", function(d) {
				var barChartGroup = d3.select(this).node().parentNode.parentNode;
				var className = d.position.split(" ").join("-");

				d3.select(barChartGroup)
					.selectAll(".bar")
					.style("opacity", 0.1);

				d3.select(barChartGroup)
					.selectAll(".bar." + className)
					.style("opacity", 1);
			})
			.on("mouseout", function(d) {
				var barChartGroup = d3.select(this).node().parentNode.parentNode;
				var className = d.position.split(" ").join("-");

				d3.select(barChartGroup)
					.selectAll(".bar")
					.style("opacity", 1);
			})

		self.height = svg.node().getBBox().height;
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