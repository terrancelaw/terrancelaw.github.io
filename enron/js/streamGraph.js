var StreamGraph = {
	layerData: [],

	svgGroup: null,

	create: function(svg, width, height, data) {
		var self = this;

		self.svgGroup = svg.append("g")
							.attr("class", "stream")
							.attr("transform", "translate(0, " + (-height / 2) + ")")
							.attr("cursor", "pointer")
							.on("mousemove", function() {
								var totalNumberOfTimePeriods = Database.sizeDict[Database.emailList[0]].length - 1;
								var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

								var mouseX = d3.mouse(this)[0];
								var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
								var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

								var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
								var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

								d3.selectAll(".selectionBox").remove();

								d3.select(this)
									.append("rect")
									.attr("class", "selectionBox")
									.attr("x", leftX)
									.attr("y", 0)
									.attr("width", rightX - leftX)
									.attr("height", height / 2 - 2) // 2 is the stroke width
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
									.style("font-size", 15)
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
		self.createStreamGraph(self.svgGroup, width, height, self.layerData);
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

		// create layer arrays
		var layerArrays = {};
		for (var i = 0; i < uniquePositions.length; i++)
			layerArrays[uniquePositions[i]] = [];

		for (var t = 0; t < dataByDate.length; t++) {
			// at each time point, push a zero to each array

			for (var i = 0; i < uniquePositions.length; i++)
				layerArrays[uniquePositions[i]].push(0);

			// loop through all positions which exist
			for (var i = 0; i < dataByDate[t].length; i++)
				layerArrays[dataByDate[t][i].position][t] += dataByDate[t][i].frequency;
		}

		// sort layers by onset time
		var layerZeroCount = [];
		for (key in layerArrays) {
			var zeroCount = 0, i = 0;
			while (layerArrays[key][i] == 0) {
				zeroCount++;
				i++;
			}

			layerZeroCount.push({
				position: key,
				zeroCount: zeroCount
			});
		}

		layerZeroCount.sort(function(a, b) {
			return a.zeroCount - b.zeroCount;
		});

		var sortedLayerArray = [];
		for (var i = 0; i < layerZeroCount.length; i++) {
			// alternate between push and unshift
			// the middle layer has the earliest onset time
			if (i % 2 == 0) {
				sortedLayerArray.push({
					position: layerZeroCount[i].position,
					timeSeries: layerArrays[layerZeroCount[i].position]
				});
			}
			else {
				sortedLayerArray.unshift({
					position: layerZeroCount[i].position,
					timeSeries: layerArrays[layerZeroCount[i].position]
				});
			}
		}

		// compute g0 for each time step
		var n = sortedLayerArray.length; // n is total number of layers
		var g0 = [];
		for (var t = 0; t < totalNumberOfTimeStep; t++) {
			var summation = 0;
			for (var i = 1; i <= n; i++) {
				// from the equation, i start from the bottom layer
				summation += (n - i + 1) * sortedLayerArray[i - 1].timeSeries[t];
			}

			g0AtT = -1 / (n + 1) * summation;

			g0.push(g0AtT);
		}

		// compute an array for each layer for rendering
		// each item {x: i, y: bottom coord, y0: high of stream}
		var totalNumberOfLayers = sortedLayerArray.length;
		var coordOfStream = [];

		for (var i = 0; i < totalNumberOfLayers; i++) // 0 corr to bottom layer
			coordOfStream.push([]);

		for (var t = 0; t < totalNumberOfTimeStep; t++) {
			var currentG = g0[t];
			for (var i = 0; i < totalNumberOfLayers; i++) {
				var fi = sortedLayerArray[i].timeSeries[t];

				var coordForithLayerAtT = {
					x: t,
					y: currentG,
					y0: fi,
					position: sortedLayerArray[i].position
				};

				currentG += fi;

				coordOfStream[i].push(coordForithLayerAtT)
			}
		}

		// stretch the stream
		var xScale = d3.scale.linear()
								.domain([0, totalNumberOfTimeStep - 1])
								.range([0, width]);

		var bottomLayerIndex = 0, topLayerIndex = coordOfStream.length - 1;
		var minY = 999, maxY = -999;

		for (var i = 0; i < coordOfStream[bottomLayerIndex].length; i++) {
			if (coordOfStream[bottomLayerIndex][i].y < minY)
				minY = coordOfStream[bottomLayerIndex][i].y;
		}

		for (var i = 0; i < coordOfStream[topLayerIndex].length; i++) {
			if (coordOfStream[topLayerIndex][i].y + coordOfStream[topLayerIndex][i].y0 > maxY)
				maxY = coordOfStream[topLayerIndex][i].y + coordOfStream[topLayerIndex][i].y0;
		}

		var yScale = d3.scale.linear()
								.domain([minY, maxY])
								.range([height / 2, 0]);



		var heightScale = d3.scale.linear()
								.domain([0, maxY - minY])
								.range([0, height / 2]);

		for (var i = 0; i < coordOfStream.length; i++) {
			for (var j = 0; j < coordOfStream[i].length; j++) {
				coordOfStream[i][j].x = xScale(coordOfStream[i][j].x);
				coordOfStream[i][j].y = yScale(coordOfStream[i][j].y);
				coordOfStream[i][j].y0 = heightScale(coordOfStream[i][j].y0);
			}
		}

		// prepare resources for streamgraph rendering
		self.layerData = coordOfStream;
	},
	createStreamGraph: function(svg, width, height, layerData) {
		var self = this;

		var colour = d3.scale.category10();

		var area = d3.svg.area()
							.interpolate("basis")
							.x(function(d) { return d.x; })
		                    .y0(function(d) { return d.y; }) // set the baseline to zero
		                    .y1(function(d) { return d.y - d.y0; });

		// create a rect to cover the top of the arcs
		svg.append("rect")
			.attr("width", width)
			.attr("height", height / 2)
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "white");

		svg.selectAll(".stream")
			.data(layerData)
			.enter()
			.append("path")
			.attr("class", "stream")
			.attr("d", area)
			.style("fill", function(d) {
				var index = Database.position2Index[d[0].position];
				return Database.positionColours[index];
			})
			.style("stroke", "none")
			.style("opacity", 0.7);
	}
}