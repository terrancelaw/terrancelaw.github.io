var FeatureView = {
	margin: { left: 15, right: 15 },
	width: null,

	headerHeight: null,
	footerHeight: null,
	rowHeight: 20,

	plotWidth: 65,
	textLength: 30,

	columnWidth: [],

	contentSVG: null,
	headerSVG: null,
	footerSVG: null,

	init: function() {
		var self = this;

		self.width = leftContentWidth - self.margin.left - self.margin.right;
		self.headerHeight = featureViewHeaderHeight;
		self.footerHeight = featureViewFooterHeight;

		self.headerSVG = d3.select("#feature-view .header svg")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + "0)");
		self.contentSVG = d3.select("#feature-view .content svg")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + "0)");
		self.footerSVG = d3.select("#feature-view .footer svg")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + "0)");

		self.columnWidth = [
			self.width * 2 / 3 - 30,
			self.width / 3 / 3 * 2 + 30,
			self.width / 3 / 3
		];
	},
	populateView: function(report) {
		var self = this;
		var arrangeListInDescendingOrder = report.arrangeListInDescendingOrder;
		var overallAccuracy = report.overallAccuracyOfFeatureSubset;
		var resultArray = report.result.sort(function(x, y) {
			if (arrangeListInDescendingOrder)
				return d3.descending(x.accuracy, y.accuracy);
			else
				return d3.ascending(x.accuracy, y.accuracy);
		});

		self.drawHeader();
		self.drawContent(resultArray);
		self.drawFooter(overallAccuracy);
	},
	drawHeader: function() {
		var self = this;

		if (self.headerSVG.select("*").empty()) {
			self.headerSVG.append("text")
				.attr("x", self.columnWidth[0] / 2)
				.attr("y", self.headerHeight / 2)
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle")
				.text("Feature Name");
			self.headerSVG.append("text")
				.attr("x", self.columnWidth[0] + self.columnWidth[1] / 2)
				.attr("y", self.headerHeight / 2)
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle")
				.text("Variation");
			self.headerSVG.append("text")
				.attr("x", self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] / 2)
				.attr("y", self.headerHeight / 2)
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle")
				.text("Dist.");
		}
	},
	drawContent: function(resultArray) {
		var self = this;

		// * create rows

		// join data
		var row = self.contentSVG.selectAll(".row")
			.data(resultArray);

		// remove the unneeded and add new
		row.exit().remove();
		row.enter()
			.append("g")
			.attr("class", "row");

		// update attributes which depends on data
		row.attr("transform", function(d, i) {
				return "translate(0," + i * self.rowHeight + ")";
			});

		// remove all elements inside
		row.selectAll("*").remove();

		// * create rect for hovering
		row.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.width)
			.attr("height", self.rowHeight)
			.style("fill", "white")
			.style("stroke", "none");

		// * create value plot
		var valuePlotXShift = self.columnWidth[0] + self.columnWidth[1] / 2 - self.plotWidth / 2;
		var valuePlot = row.append("g")
			.attr("class", "value-plot")
			.attr("transform", "translate(" + valuePlotXShift + ", 0)");

		valuePlot.each(function(d) {
			var minValueOfFeature = Database.minMaxValuesOfFeatures[d.featureName].min;
			var maxValueOfFeature = Database.minMaxValuesOfFeatures[d.featureName].max;

			var xScale = d3.scale.linear()
				.domain([minValueOfFeature, maxValueOfFeature])
				.range([0, self.plotWidth]);

			// draw max min
			d3.select(this)
				.append("line")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", 0 + 8)
				.attr("y2", self.rowHeight - 8)
				.style("stroke", "gray")
				.style("opacity", 0.7);
			d3.select(this)
				.append("line")
				.attr("x1", self.plotWidth)
				.attr("x2", self.plotWidth)
				.attr("y1", 0 + 8)
				.attr("y2", self.rowHeight - 8)
				.style("stroke", "gray")
				.style("opacity", 0.7);

			// draw the two values
			for (var shelfName in d.groupAverage) {
				d3.select(this)
					.append("circle")
					.attr("cx", xScale(d.groupAverage[shelfName]))
					.attr("cy", self.rowHeight / 2)
					.attr("r", 3)
					.style("fill", OOCView.shelfColors[shelfName].pale)
					.style("stroke", OOCView.shelfColors[shelfName].deep)
					.style("opacity", 0.7);
			}
		});

		// * create distinguishing power
		row.append("text")
			.attr("class", "distinguishing-power")
			.attr("x", self.columnWidth[0] + self.columnWidth[1] + self.columnWidth[2] / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text(function(d) {
				return (d["accuracy"] * 100).toFixed(0) + "%";
			});

		// * create feature name the last so that the rectangle covers everything
		row.append("text")
			.attr("class", "feature-name")
			.attr("x", 0)
			.attr("y", self.rowHeight / 2)
			.style("alignment-baseline", "middle")
			.style("cursor", "pointer")
			.text(function(d) {
				var featureName = d["featureName"];
				var shortFeatureName = DataTransformationHandler.createShortString(featureName, self.textLength);
				
				return shortFeatureName;
			})
			.on("mouseover", mouseoverFeatureName)
			.on("mouseout", mouseoutFeatureName);

		// * change svg height
		d3.select("#feature-view .content svg")
			.attr("height", self.rowHeight * resultArray.length);

		function mouseoverFeatureName(d) {
			if (d3.select(this).text().indexOf("...") != -1) {
				// change text
				d3.select(this)
					.text(d["featureName"]);

				// append rect before the text
				var bbox = d3.select(this).node().getBBox();
				var horizontalPadding = 10;
				var verticalPadding = 5;
				var rectWidth = bbox.width + horizontalPadding;
				var rectHeight = bbox.height + verticalPadding;
				d3.select(this.parentNode)
					.insert("rect", ".feature-name")
					.attr("class", "hover-on-text-rect")
					.attr("width", rectWidth)
					.attr("height", rectHeight)
					.attr("x", -horizontalPadding/2)
					.attr("y", self.rowHeight / 2 - rectHeight / 2)
					.attr("rx", 5)
					.attr("ry", 5)
					.style("fill", "white")
					.style("stroke", "gray")
					.style("stroke-dasharray", "2, 2");

				// mark expanded
				d3.select(this)
					.classed("expanded", true);
			}
		}

		function mouseoutFeatureName(d) {
			if (d3.select(this).classed("expanded")) {
				// restore name
				var featureName = d["featureName"];
				var shortFeatureName = DataTransformationHandler.createShortString(featureName, self.textLength);
				d3.select(this)
					.text(shortFeatureName);

				// remove rect
				d3.selectAll(".hover-on-text-rect").remove();

				// unmark expanded
				d3.select(this)
					.classed("expanded", false);
			}
		}
	},
	drawFooter: function(overallAccuracy) {
		var self = this;

		// remove everything first
		self.footerSVG.selectAll("*").remove();

		// add the text
		var accuracyText = self.footerSVG.append("text")
			.attr("x", self.width)
			.attr("y", self.footerHeight / 2)
			.style("text-anchor", "end")
			.style("alignment-baseline", "middle")
			.text("Overall distinguishing power of selected features: " + (overallAccuracy * 100).toFixed(0) + "%");

		// add a tag below it
		var bbox = accuracyText.node().getBBox();
		var horizontalPadding = 10;
		var verticalPadding = 5;
		var rectWidth = bbox.width + horizontalPadding;
		var rectHeight = bbox.height + verticalPadding;
		var accuracyTextParentNode = accuracyText.node().parentNode;

		d3.select(accuracyTextParentNode)
			.insert("rect", "text")
			.attr("width", rectWidth)
			.attr("height", rectHeight)
			.attr("x", self.width - rectWidth + horizontalPadding / 2)
			.attr("y", self.footerHeight / 2 - rectHeight / 2)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "white")
			.style("stroke", "gray")
			.style("stroke-dasharray", "2, 2");
	},
	clear: function() {
		var self = this;

		self.headerSVG.selectAll("*").remove();
		self.contentSVG.selectAll("*").remove();
		self.footerSVG.selectAll("*").remove();

		d3.select("#feature-view .content svg")
			.attr("height", featureViewContentHeight - changeGroupMenuHeaderHeight - changeGroupMenuContentHeight - 5);
	}
}