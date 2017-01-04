var Table = {
	margin: { top: 0, left: 10, bottom: 10, right: 10 }, // top height not include table legend height
	width: null, // no height as it depends on the number of objects to be rendered
	rowHeight: 30,

	svgGroup: null,

	init: function() {
		var self = this;

		var topPadding = self.rowHeight / 2 - 6; // font size is 12
		self.margin.bottom = topPadding * 2; // x 2 because there is no top padding

		self.width = tableViewWidth - self.margin.left - self.margin.right;
		self.svgGroup = d3.select("#table")
							.attr("height", self.rowHeight * Database.emailList.length + self.margin.top + self.margin.bottom)
							.append("g")
							.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + tableLegendHeight + ")");

		self.create();
	},
	create: function() {
		var self = this;

		var columnWidth = [self.width / 3 - 10, self.width / 3 - 25, self.width / 3 + 35];
		var row = self.svgGroup.selectAll(".row")
								.data(Database.emailList)
								.enter()
								.append("g")
								.attr("class", "row")
								.attr("transform", function(d, i) {
									return "translate(0, " + (i * self.rowHeight) + ")";
								})
								.style("cursor", "pointer")
								.on("mouseover", function() {
									d3.select(this).classed("highlighted", true);
								})
								.on("mouseout", function() {
									d3.select(this).classed("highlighted", false);
								})
								.on("click", function(d) {
									// append selected to row
									if (!d3.select(this).classed("selected")) {
										d3.select(this).classed("selected", true);
										FlowFactory.createFlow(d);
									}
									else {
										d3.select(this).classed("selected", false);
										FlowFactory.removeFlow(d);
									}
								});

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
			.attr("x", columnWidth[0] / 2)
			.attr("y", self.rowHeight)
			.style("font-size", 12)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "bottom");

		// append position
		row.append("text")
			.text(function(d) {
				return Database.employeeDict[d];
			})
			.attr("x", columnWidth[0] + columnWidth[1] / 2)
			.attr("y", self.rowHeight)
			.style("font-size", 12)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "bottom");

		// append size array
		var leftRightPadding = 10;
		var barXScale = d3.scale.linear()
								.domain([0, Database.sizeDict[Database.emailList[0]].length - 1])
								.range([0, columnWidth[2] - leftRightPadding - leftRightPadding]);
		var barHeightScale = d3.scale.linear()
										.domain([0, Database.maxSizeOfAll])
										.range([0, self.rowHeight - 1]);

		var barChart = row.append("g")
							.attr("transform", "translate(" + (columnWidth[0] + columnWidth[1] + leftRightPadding) + ", 0)");

		barChart.selectAll("rect")
					.data(function(d) {
						return Database.sizeDict[d];
					})
					.enter()
					.append("rect")
					.attr("width", 5)
					.attr("height", function(d, i) {
						return barHeightScale(d.size);
					})
					.attr("x", function(d, i) {
						return barXScale(i)
					})
					.attr("y", function(d, i) {
						return self.rowHeight - barHeightScale(d.size);
					});

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
				.attr("x", columnWidth[0] / 2)
				.attr("y", self.rowHeight / 2)
				.style("font-size", 14)
				.style("font-weight", "bold")
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle");
		legend.append("text")
				.text("Position")
				.attr("x", columnWidth[0] + columnWidth[1] / 2)
				.attr("y", self.rowHeight / 2)
				.style("font-size", 14)
				.style("font-weight", "bold")
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle");
		legend.append("text")
				.text("Email Exchange Freq.")
				.attr("x", columnWidth[0] + columnWidth[1] + columnWidth[2] / 2)
				.attr("y", self.rowHeight / 2)
				.style("font-size", 14)
				.style("font-weight", "bold")
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle");
	}
}