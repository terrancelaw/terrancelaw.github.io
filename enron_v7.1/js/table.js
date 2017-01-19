var Table = {
	margin: { top: 0, left: 10, bottom: 10, right: 10 }, // top height not include table legend height
	width: null, // no height as it depends on the number of objects to be rendered
	rowHeight: 35,

	pixelGroupTopBottomPadding: 2,
	maxPixelGroupsHeight: 31, // 34 + 2 + 2 = 38

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
		self.columnWidth = [self.width / 4 - 20, self.width / 4 - 30, self.width / 4 + 25, self.width / 4 + 25]

		self.create();
	},
	create: function() {
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
				return d.substring(0, d.indexOf("@"));
			})
			.attr("x", self.columnWidth[0] / 2)
			.attr("y", self.rowHeight)
			.style("font-size", 12)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "bottom");

		// append position
		row.append("text")
			.text(function(d) {
				return Database.employeeDict[d];
			})
			.attr("x", self.columnWidth[0] + self.columnWidth[1] / 2)
			.attr("y", self.rowHeight)
			.style("font-size", 12)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "bottom");

		// append size array
		var leftRightPadding = 10;
		var barTopBottomPadding = 2;
		var barXScale = d3.scale.linear()
			.domain([0, Database.networkDict[Database.emailList[0]].length - 1])
			.range([0, self.columnWidth[2] - leftRightPadding - leftRightPadding]);
		var barHeightScale = d3.scale.linear()
			.domain([0, Database.maxSizeOfAll])
			.range([0, self.rowHeight - barTopBottomPadding * 2]);
		var barWidth = 5;
		var barXTranslate = self.columnWidth[0] + self.columnWidth[1] + leftRightPadding;
		var barYTranslate = self.rowHeight / 2 - 6 - barTopBottomPadding; // 3 is the padding

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

		// create event pixel group
		var pixelGroupXTranslate = self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] + leftRightPadding;
		var pixelGroupYTranslate = self.rowHeight / 2 - 6 + self.pixelGroupTopBottomPadding; // yTranslate should be the same as the rectangle for hovering

		row.append("g")
			.attr("class", "event-pixel-group")
			.attr("transform", "translate(" + pixelGroupXTranslate + ", " + pixelGroupYTranslate + ")");

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
	updateEvents: function() {
		var self = this;

		// preprocess the events
		var eventsByEmail = d3.nest()
			.key(function(d) {
				return d.email;
			})
			.map(Database.events);

		// * update the events in the table
		var leftRightPadding = 10;
		var pixelHeight = (self.maxPixelGroupsHeight - (EventView.maxNumberOfEvents - 1)) / EventView.maxNumberOfEvents; // 6 = gap numbers x gap pixels
		var pixelWidth = 4;
		var pixelXAndWidthScale = d3.scale.linear()
			.domain([0, Database.numberOfTimeSteps - 1])
			.range([0, self.columnWidth[3] - leftRightPadding - leftRightPadding]);

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

		// enter for pixel group (no need to update)
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
			.attr("x", function(d) {
				return pixelXAndWidthScale(Database.dateString2Index[d.startDate]);
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
					return pixelXAndWidthScale(endTimeIndex - startTimeIndex);
				}
				else {
					return pixelWidth;
				}
			})
			.attr("height", pixelHeight)
			.attr("x", function(d) {
				return pixelXAndWidthScale(Database.dateString2Index[d.startDate]);
			})
			.attr("y", 0.5) // 0.5 is the top padding
			.style("fill", function(d) {
				var eventIndex = EventView.event2Index[d.name];

				return EventView.colours(eventIndex);
			});

		// exit for pixels in a group
		pixels.exit().remove();
	}
}