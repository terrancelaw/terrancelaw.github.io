var Table = {
	margin: { top: 0, left: 10, bottom: 10, right: 10 }, // top height not include table legend height
	width: null, // no height as it depends on the number of objects to be rendered
	rowHeight: 35,

	pixelGroupTopBottomPadding: 2,
	barGroupTopBottomPadding: 2,
	maxPixelGroupsHeight: 31, // 34 + 2 + 2 = 38
	graphGroupLeftRightPadding: 30,
	pixelGroupLeftRightPadding: 25,
	barGroupLeftRightPadding: 25,
	positionLeftPadding: 15,

	svgGroup: null,

	columnWidth: [],

	init: function() {
		var self = this;

		var topPadding = self.rowHeight / 2 - 6; // font size is 12
		self.margin.bottom = topPadding * 2; // x 2 because there is no top padding

		self.width = tableViewWidth - self.margin.left - self.margin.right;
		self.svgGroup = d3.select("#table")
			.attr("height", self.rowHeight * Database.emailList.length + self.margin.top + self.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");
		self.columnWidth = [self.width / 5 - 80, self.width / 5 - 90, self.width / 5 - 20, self.width / 5 - 20, self.width / 5 + 220]

		self.createRows();
		self.createBarCharts();
		self.createPixelGroups();
		self.createDynamicGraphSimilarity();
		self.createLegend();
	},
	createRows: function() {
		var self = this;

		var row = self.svgGroup.selectAll(".row")
			.data(Database.emailList)
			.enter()
			.append("g")
			.attr("class", function(d, i) {
				if (i % 2 == 0)
					return "row even";
				else
					return "row odd";
			})
			.attr("transform", function(d, i) {
				return "translate(0, " + (i * self.rowHeight) + ")";
			})
			.style("cursor", "pointer")
			.on("mouseover", onMouseOverRow)
			.on("mouseout", onMouseOutRow)
			.on("click", onClickRow);

		// append rectangle for hovering
		row.append("rect")
			.attr("class", "highlight")
			.attr("width", self.width)
			.attr("height", self.rowHeight)
			.attr("x", 0)
			.attr("y", self.rowHeight / 2 - 6); // minus 6 because font size is 12

		// append email
		row.append("text")
			.text(function(d) {
				return d;
			})
			.attr("x", self.columnWidth[0] / 2)
			.attr("y", self.rowHeight)
			.style("font-size", 12)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "bottom");

		// append position circle
		row.append("circle")
			.attr("r", 5)
			.attr("cx", self.columnWidth[0] + self.positionLeftPadding)
			.attr("cy", self.rowHeight - 5) // 5 is the font size
			.attr("fill", function(d) {
				var position = Database.employeeDict[d];
				var positionIndex = Database.position2Index[position];
				var positionColour = Database.positionColours[positionIndex];

				if (position == "unknown")
					return "white";

				return positionColour;
			})
			.attr("stroke", "black")

		// append position
		row.append("text")
			.text(function(d) {
				return Database.employeeDict[d];
			})
			.attr("x", self.columnWidth[0] + self.positionLeftPadding + 15)
			.attr("y", self.rowHeight)
			.style("font-size", 12)
			.style("alignment-baseline", "bottom");

		function onMouseOverRow() {
			d3.select(this).classed("highlighted", true);
		}

		function onMouseOutRow() {
			d3.select(this).classed("highlighted", false);
		}

		function onClickRow(d) {
			// append selected to row
			if (!d3.select(this).classed("selected")) {
				d3.select(this).classed("selected", true);
				FlowFactory.createFlow(d);
			}
			else {
				d3.select(this).classed("selected", false);
				FlowFactory.removeFlow(d);
			}
		}
	},
	createBarCharts: function() {
		var self = this;
		var row = self.svgGroup.selectAll(".row");

		// create bar charts
		var barXScale = d3.scale.linear()
			.domain([0, Database.networkDict[Database.emailList[0]].length - 1])
			.range([0, self.columnWidth[2] - self.barGroupLeftRightPadding - self.barGroupLeftRightPadding]);
		var barHeightScale = d3.scale.linear()
			.domain([0, Database.maxSizeOfAll])
			.range([0, self.rowHeight - self.barGroupTopBottomPadding * 2]);
		var barWidth = 5;
		var barXTranslate = self.columnWidth[0] + self.columnWidth[1] + self.barGroupLeftRightPadding;
		var barYTranslate = self.rowHeight / 2 - 6 - self.barGroupTopBottomPadding; // 3 is the padding

		var barChart = row.append("g")
			.attr("transform", "translate(" + barXTranslate + ", " + barYTranslate + ")");

		barChart.selectAll("rect")
			.data(function(d) {
				return Database.networkDict[d];
			})
			.enter()
			.append("rect")
			.attr("width", barWidth)
			.attr("height", function(d, i) {
				return barHeightScale(d.size);
			})
			.attr("x", function(d, i) {
				return barXScale(i)
			})
			.attr("y", function(d, i) {
				return self.rowHeight - barHeightScale(d.size);
			});
	},
	createPixelGroups: function() {
		var self = this;
		var row = self.svgGroup.selectAll(".row");

		// create event pixel group
		var pixelGroupXTranslate = self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] + self.pixelGroupLeftRightPadding;
		var pixelGroupYTranslate = self.rowHeight / 2 - 6 + self.pixelGroupTopBottomPadding; // yTranslate should be the same as the rectangle for hovering

		row.append("g")
			.attr("class", "event-pixel-group")
			.attr("transform", "translate(" + pixelGroupXTranslate + ", " + pixelGroupYTranslate + ")");
	},
	createDynamicGraphSimilarity: function() {
		var self = this;
		var row = self.svgGroup.selectAll(".row");

		// create dynamic graph similarity group
		var similarityXTranslate = self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] + self.columnWidth[3] + self.graphGroupLeftRightPadding;
		var similarityYTranslate = 6 + self.pixelGroupTopBottomPadding + self.rowHeight / 2 ; // yTranslate should be the same as the rectangle for hovering

		var graphSimilarityGroup = row.append("g")
			.attr("class", "dynamic-graph-similarity")
			.attr("transform", "translate(" + similarityXTranslate + ", " + similarityYTranslate + ")");

		graphSimilarityGroup.selectAll("circle")
			.data(Database.emailList)
			.enter()
			.append("circle")
			.style("fill", "none");
	},
	createLegend: function() {
		var self = this;
		var row = self.svgGroup.selectAll(".row");

		// create legend
		var legend = d3.select("#table-legend")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", 0)");

		legend.append("rect")
			.attr("width", tableViewWidth - 20)
			.attr("height", tableLegendHeight)
			.style("fill", "white");

		legend.append("text")
			.text("Email")
			.attr("x", self.columnWidth[0] / 2)
			.attr("y", self.rowHeight / 2)
			.style("font-size", 14)
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle");
		legend.append("text")
			.text("Position")
			.attr("x", self.columnWidth[0] + self.columnWidth[1] / 2)
			.attr("y", self.rowHeight / 2)
			.style("font-size", 14)
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle");
		legend.append("text")
			.text("Email Exchange Freq.")
			.attr("x", self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] / 2)
			.attr("y", self.rowHeight / 2)
			.style("font-size", 14)
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle");
		legend.append("text")
			.text("Events")
			.attr("x", self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] + self.columnWidth[3] / 2)
			.attr("y", self.rowHeight / 2)
			.style("font-size", 14)
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle");
		legend.append("text")
			.text("Ego-network Similarity")
			.attr("x", self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] + self.columnWidth[3] + self.columnWidth[4] / 2)
			.attr("y", self.rowHeight / 2)
			.style("font-size", 14)
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle");
		legend.append("text")
			.text("←Similar")
			.attr("x", self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] + self.columnWidth[3] + self.graphGroupLeftRightPadding * 2 - 7)
			.attr("y", self.rowHeight - 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "bottom");
		legend.append("text")
			.text("Dissimilar→")
			.attr("x", self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] + self.columnWidth[3] + self.columnWidth[4] - self.graphGroupLeftRightPadding * 3 - 3)
			.attr("y", self.rowHeight - 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "bottom");

		// create download button
		var xTranslate = self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] + self.columnWidth[3] / 2 + 55;
		var downloadButton = legend.append("g")
			.attr("class", "download-button")
			.attr("transform", "translate(" + xTranslate + ", " + 0 + ")")
			.attr("cursor", "pointer")
			.on("click", onClickDownloadButton);

		var downloadButtonText = downloadButton.append("text")
			.text("Download")
			.attr("x", 0)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle");

		var bbox = downloadButtonText[0][0].getBBox();
		downloadButton.insert("rect", "text")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2)
			.style("rx", 5)
			.style("ry", 5)
			.style("fill", "#e5e5e5");

		function onClickDownloadButton() {
			var csvContent = "data:text/csv;charset=utf-8,";
			csvContent += "eventName,startDate,endDate,email\n"

			Database.events.forEach(function(event, i) {
				var endDate = (event.endDate == null) ? "" : event.endDate;
			   	dataString = event.name + "," + event.startDate + "," + endDate + "," + event.email;
			   	csvContent += i < Database.events.length ? dataString + "\n" : dataString;
			});

			var encodedUri = encodeURI(csvContent);
			window.location.href = encodedUri;
		}
	},
	updateEvents: function() {
		var self = this;

		// preprocess the events
		var eventsByEmail = d3.nest()
			.key(function(d) {
				return d.email;
			})
			.map(Database.events);

		// * update the events in the table
		var pixelHeight = (self.maxPixelGroupsHeight - (EventView.maxNumberOfEvents - 1)) / EventView.maxNumberOfEvents; // 6 = gap numbers x gap pixels
		var pixelWidth = 4;
		var paddingBetweenPixel = (self.columnWidth[3] - self.pixelGroupLeftRightPadding - self.pixelGroupLeftRightPadding - pixelWidth * Database.numberOfTimeSteps) / (Database.numberOfTimeSteps - 1)
		var pixelXAndWidthScale = d3.scale.linear()
			.domain([0, Database.numberOfTimeSteps - 1])
			.range([0, self.columnWidth[3] - self.pixelGroupLeftRightPadding - self.pixelGroupLeftRightPadding]);

		var eventPixelGroup = self.svgGroup.selectAll(".row .event-pixel-group");

		// join data for pixel group
		var pixelGroup = eventPixelGroup.selectAll("g")
			.data(function(d) {
				// return an array with each element as an event type
				var eventGroupArray = [];

				if (d in eventsByEmail) {
					var eventsByName = d3.nest()
						.key(function(event) {
							return event.name;
						})
						.map(eventsByEmail[d]);

					for (name in eventsByName)
						eventGroupArray.push(eventsByName[name]);
				}

				return eventGroupArray;
			});

		// update for pixel group
		pixelGroup
			.attr("transform", function(d, i) {
				var yTranslate = self.maxPixelGroupsHeight - (i + 1) * (pixelHeight + 1);
				return "translate(0, " + yTranslate + ")";
			});

		// enter for pixel group
		pixelGroup.enter()
			.append("g")
			.attr("transform", function(d, i) {
				var yTranslate = self.maxPixelGroupsHeight - (i + 1) * (pixelHeight + 1);
				return "translate(0, " + yTranslate + ")";
			});

		// exit for pixel group
		pixelGroup.exit().remove();

		// join data for pixels in a group
		var pixels = pixelGroup.selectAll("rect")
			.data(function(d) {
				return d;
			});

		// update for pixels in a group
		pixels
			.attr("width", function(d) {
				var startTimeIndex = Database.dateString2Index[d.startDate];

				if (d.endDate) {
					var endTimeIndex = Database.dateString2Index[d.endDate];
					return pixelXAndWidthScale(endTimeIndex - startTimeIndex) - paddingBetweenPixel;
				}
				else {
					return pixelWidth;
				}
			})
			.attr("x", function(d) {
				return pixelXAndWidthScale(Database.dateString2Index[d.startDate]) + paddingBetweenPixel / 2;
			})
			.style("fill", function(d) {
				var eventIndex = EventView.event2Index[d.name];

				return EventView.colours(eventIndex);
			});

		// enter for pixels in a group
		pixels.enter()
			.append("rect")
			.attr("width", function(d) {
				var startTimeIndex = Database.dateString2Index[d.startDate];

				if (d.endDate) {
					var endTimeIndex = Database.dateString2Index[d.endDate];
					return pixelXAndWidthScale(endTimeIndex - startTimeIndex) - paddingBetweenPixel;
				}
				else {
					return pixelWidth;
				}
			})
			.attr("height", pixelHeight)
			.attr("x", function(d) {
				return pixelXAndWidthScale(Database.dateString2Index[d.startDate]) + paddingBetweenPixel / 2;
			})
			.attr("y", 0.5) // 0.5 is the top padding
			.style("fill", function(d) {
				var eventIndex = EventView.event2Index[d.name];

				return EventView.colours(eventIndex);
			});

		// exit for pixels in a group
		pixels.exit().remove();
	},
	updateDynamicGraphSimilarity: function() {
		var self = this;

		// determine max distance
		var maxDistance = 0;
		for (var email in ComparisonHandler.listsOfSimilarGraphs) {
			var currentList = ComparisonHandler.listsOfSimilarGraphs[email];

			for (var i = 0; i < currentList.length; i++) {
				if (currentList[i].distance > maxDistance)
					maxDistance = currentList[i].distance;
			}
		}

		var leftRightPadding = 10;
		var xScale = d3.scale.linear()
			.domain([0, maxDistance])
			.range([0, self.columnWidth[4] - self.graphGroupLeftRightPadding - self.graphGroupLeftRightPadding]);

		// * create the circles inside
		var graphSimilarityGroup = self.svgGroup.selectAll(".row .dynamic-graph-similarity");

		// join
		var circles = graphSimilarityGroup.selectAll("circle")
			.data(function(d) {
				return ComparisonHandler.listsOfSimilarGraphs[d];
			});

		// enter
		circles
			.enter()
			.append("circle")
			.attr("class", function(d) {
				return d.email.split(".").join("-");
			})
			.attr("cx", function(d) {
				return xScale(d.distance);
			})
			.style("fill", function(d) {
				var position = Database.employeeDict[d.email];
				if (position != "unknown") {
					var colourIndex = Database.position2Index[position];
					var colour = Database.positionColours[colourIndex];

					return colour;
				}
				
				return "none";
			})
			.style("stroke", "none")
			.attr("cy", 0)
			.attr("r", 4)
			.style("opacity", 0.5)
			.style("cursor", "pointer")
			.on("mouseover", onMouseOverCircle)
			.on("mouseout", onMouseOutCircle)

		// update
		circles
			.attr("class", function(d) {
				return d.email.split(".").join("-");
			})
			.style("fill", function(d) {
				var position = Database.employeeDict[d.email];
				if (position != "unknown") {
					var colourIndex = Database.position2Index[position];
					var colour = Database.positionColours[colourIndex];

					return colour;
				}
				
				return "none";
			})
			.style("stroke", "none")
			.attr("cy", 0)
			.attr("r", 4)
			.style("opacity", 0.5)
			.style("cursor", "pointer")
			.on("mouseover", onMouseOverCircle)
			.on("mouseout", onMouseOutCircle)
			.transition()
			.duration(100)
			.attr("cx", function(d) {
				return xScale(d.distance);
			});

		// exit
		circles.exit().remove();

		function onMouseOverCircle(d) {
			// * make the circle larger
			d3.select(this)
				.attr("r", 7);

			// * draw text

			// get the x y position of the hovered circle
			var parentParentTranslateX = d3.transform(d3.select(this.parentNode.parentNode).attr("transform")).translate[0];
			var parentTranslateX = d3.transform(d3.select(this.parentNode).attr("transform")).translate[0];
			var circleX = parseInt(d3.select(this).attr("cx")) + parentTranslateX + parentParentTranslateX;

			var parentParentTranslateY = d3.transform(d3.select(this.parentNode.parentNode).attr("transform")).translate[1];
			var parentTranslateY = d3.transform(d3.select(this.parentNode).attr("transform")).translate[1];
			var circleY = parseInt(d3.select(this).attr("cy")) + parentTranslateY + parentParentTranslateY;

			var newPixelGroupLeftRightPadding = 15;
			var pixelGroupWidth = self.columnWidth[3] - self.pixelGroupLeftRightPadding * 2 + newPixelGroupLeftRightPadding * 2;

			if (circleX + 20 + pixelGroupWidth > self.width)
				circleX = circleX - 20 - 20 - pixelGroupWidth;

			// construct text string
			var textString = "";
			var numberOfEmailCount = 0;

			var targetX = d3.select(this).attr("cx");
			d3.select(this.parentNode).selectAll("circle")
				.each(function(d) {
					var currentX = d3.select(this).attr("cx");

					// only append three emails at that location
					if (currentX == targetX) {
						if (numberOfEmailCount < 2)
							textString += d.email + ", ";
						else if (numberOfEmailCount == 2)
							textString += d.email + "...";

						numberOfEmailCount++;
					}
				});

			if (numberOfEmailCount < 3)
				textString = textString.substring(0, textString.length - 2); // remove ,
			if (numberOfEmailCount == 3)
				textString = textString.substring(0, textString.length - 3); // remove ...

			// append the text above
			d3.select(this.parentNode.parentNode.parentNode)
				.append("text")
				.attr("id", "graph-identity")
				.text(textString)
				.attr("x", circleX + 20 + 5)
				.attr("y", circleY - 20)
				.style("alignment-baseline", "middle");
				
			// * draw pixel display
			var pixelHeight = (self.maxPixelGroupsHeight - (EventView.maxNumberOfEvents - 1)) / EventView.maxNumberOfEvents; // 6 = gap numbers x gap pixels
			var pixelWidth = 4;
			var paddingBetweenPixel = (self.columnWidth[3] - self.pixelGroupLeftRightPadding - self.pixelGroupLeftRightPadding - pixelWidth * Database.numberOfTimeSteps) / (Database.numberOfTimeSteps - 1)
			var pixelXAndWidthScale = d3.scale.linear()
				.domain([0, Database.numberOfTimeSteps - 1])
				.range([0, pixelGroupWidth - newPixelGroupLeftRightPadding - newPixelGroupLeftRightPadding]);

			// retrieve the events of that person
			var nameOfSelectedPerson = d3.select(this).attr("class").split("-").join(".");
			var eventsOfSelectedPerson = [];
			for (var i = 0; i < Database.events.length; i++) {
				if (Database.events[i].email == nameOfSelectedPerson)
					eventsOfSelectedPerson.push(Database.events[i])
			}

			// construct event group array
			var eventsByName = d3.nest()
				.key(function(event) {
					return event.name;
				})
				.map(eventsOfSelectedPerson);

			var eventGroupArray = [];
			for (name in eventsByName)
				eventGroupArray.push(eventsByName[name]);

			// append the pixel display group
			var currentEventPixelGroup = d3.select(this.parentNode.parentNode.parentNode)
				.append("g")
				.attr("id", "current-pixel-group")
				.attr("transform", "translate(" + (circleX + 20) + ", " + (circleY - self.rowHeight / 2 + 6) + ")");

			// append the bottom rectangle
			currentEventPixelGroup.append("rect")
				.attr("width", pixelGroupWidth)
				.attr("height", self.rowHeight)
				.attr("rx", 10)
				.attr("ry", 10)
				.style("fill", "white")
				.style("stroke", "black");

			// append the pixels on top
			var currentPixelGroup = currentEventPixelGroup.selectAll("g")
				.data(eventGroupArray)
				.enter()
				.append("g")
				.attr("transform", function(d, i) {
					var yTranslate = self.maxPixelGroupsHeight - (i + 1) * (pixelHeight + 1);
					return "translate(" + newPixelGroupLeftRightPadding + ", " + yTranslate + ")";
				});

			currentPixelGroup.selectAll("rect")
				.data(function(d) {
					return d;
				})
				.enter()
				.append("rect")
				.attr("width", function(d) {
					var startTimeIndex = Database.dateString2Index[d.startDate];

					if (d.endDate) {
						var endTimeIndex = Database.dateString2Index[d.endDate];
						return pixelXAndWidthScale(endTimeIndex - startTimeIndex) - paddingBetweenPixel;
					}
					else {
						return pixelWidth;
					}
				})
				.attr("height", pixelHeight)
				.attr("x", function(d) {
					return pixelXAndWidthScale(Database.dateString2Index[d.startDate]) + paddingBetweenPixel / 2;
				})
				.attr("y", 0.5) // 0.5 is the top padding
				.style("fill", function(d) {
					var eventIndex = EventView.event2Index[d.name];

					return EventView.colours(eventIndex);
				});
		}

		function onMouseOutCircle(d) {
			// restore circle size
			d3.select(this)
				.attr("r", 4);

			// remove text and pixel display
			d3.select("#graph-identity").remove();
			d3.select("#current-pixel-group").remove();
		}
	}
}