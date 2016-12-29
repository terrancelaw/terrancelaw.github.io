var FlowFactory = {
	margin: { top: 10, left: 30, bottom: 10, right: 30 },

	// dimension of the canvas for drawing the flows
	canvasWidth: 3300,
	canvasHeight: 300,

	// dimensions of the whole flow view (including the timeline)
	svgWidth: null,
	svgHeight: null,

	svgGroup: null,

	isSmall: false,

	nextY_zoom: 0,
	zoomFactor: 0,

	// for allowing users to adjust the vertical scale
	maxPossibleSize: 0,

	numberOfTimePeriods: null,

	init: function() {
		var self = this;

		self.svgWidth = flowViewSvgWidth;
		self.svgHeight = flowSvgHeight + timelineSvgHeight;

		self.svgGroup = d3.select("#chart")
							.append("g")
							.attr("id", "all-flows")
							.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		self.numberOfTimePeriods = Database.sizeDict[Database.emailList[0]].length;

		self.initButtonBehavior();
		self.createLegend();
	},
	initButtonBehavior: function() {
		var self = this;

		// create color encoding control
		d3.select("#flow-view .ui-menu-bar .control")
			.append("text")
			.text("Link color:")
			.attr("x", 10)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central");

		d3.select("#flow-view .ui-menu-bar .control")
			.append("text")
			.text("Stability")
			.attr("id", "stable-button")
			.attr("class", "button")
			.attr("x", 70)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("cursor", "pointer")
			.on("click", function() {
				if (!d3.select(this).classed("selected")) {
					d3.select(this).classed("selected", true);
					d3.select("#merge-split-button").classed("selected", false);

					d3.selectAll(".link").style("display", "none");
					d3.selectAll(".transition").style("display", null);
				}
			});

		d3.select("#flow-view .ui-menu-bar .control")
			.append("text")
			.text("Merge and Split")
			.attr("id", "merge-split-button")
			.attr("class", "button selected")
			.attr("x", 120)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("cursor", "pointer")
			.on("click", function() {
				if (!d3.select(this).classed("selected")) {
					d3.select(this).classed("selected", true);
					d3.select("#stable-button").classed("selected", false);

					d3.selectAll(".transition").style("display", "none");
					d3.selectAll(".link").style("display", null);
				}
			});

		$("#resize").click(function() {
			if (self.isSmall) {
				// remove scaling effects
				var transformStr = "translate(" + self.margin.left + "," + self.margin.top + ")";

				d3.select("#all-flows")
					.attr("transform", transformStr);

				// change size of svg;
				d3.select("#chart")
					.attr("height", self.nextY_zoom + 50);

				// restore the text
				d3.selectAll(".name-label")
					.style("font-size", 20);

				d3.selectAll(".date-label")
					.style("display", null);

				self.isSmall = false;
			}
			else {
				// scale up the flows
				self.zoomFactor  = (self.canvasWidth - self.margin.left - self.margin.right) / (self.svgWidth - self.margin.left - self.margin.right);
				var inverseFactor = 1 / self.zoomFactor;
				var transformStr = "translate(" + self.margin.left + "," + self.margin.top + ")" +
									"scale(" + inverseFactor + ", " + inverseFactor + ")";

				d3.select("#all-flows")
					.attr("transform", transformStr);

				// change size of svg
				var currentHeight = parseInt(d3.select("#chart").attr("height"));
				d3.select("#chart")
					.attr("height", currentHeight / self.zoomFactor);

				// remove the transform in case the slider was moved
				d3.selectAll(".name-label")
					.attr("transform", null)
					.style("font-size", 40);

				d3.selectAll(".date-label")
					.style("display", "none");

				self.isSmall = true;
			}

			TimeLine.resizeBrush();
		});

		$("#remove").click(function() {
			// clear all flows
			d3.selectAll(".flow").remove();

			// restore original size of svg
			d3.select("#chart").attr("height", self.svgHeight);
			self.nextY_zoom = 0;

			// remove the row highlights
			d3.selectAll(".row.selected")
				.classed("selected", false);
		})
	},
	createFlow: function(name) {
		var self = this;

		var className = name.substring(0, name.indexOf("@"));
		className = className.split('.').join('-');

		var flow = self.svgGroup.append("g")
									.attr("class", "flow " + className);
		var flowWidth = self.canvasWidth - self.margin.left - self.margin.right;
		var flowHeight = self.canvasHeight - self.margin.top - self.margin.bottom;

		// draw the three layers
		StreamGraph.create(flow, flowWidth, flowHeight, Database.typeDict[name]); // (max width of stream is half of flowWidth)
		FirstLayer.create(flow, flowWidth, flowHeight, Database.sizeDict[name]);
		var bboxHeight = SecondLayer.create(flow, flowWidth, flowHeight, Database.sizeDict[name], Database.clusterDict[name], name.substring(0, name.indexOf("@")));

		// translate the flow group so that the size position is in the middle
		var maxBarHeight = flowHeight / 2;
		flow.attr("transform", "translate(0," + (maxBarHeight + self.nextY_zoom) + ")");
		self.nextY_zoom += bboxHeight + 20;

		// change size of svg depending on the number of flow
		if (self.isSmall) {
			d3.select("#chart")
				.attr("height", (self.nextY_zoom + 50) / self.zoomFactor);
		}
		else {
			d3.select("#chart")
				.attr("height", self.nextY_zoom + 50);
		}
	},
	removeFlow: function(name) {
		var self = this;

		var className = name.substring(0, name.indexOf("@"));
		className = className.split('.').join('-');

		// compute bounding box height of the flow and remove from nextY_zoom
		var bboxHeight = self.svgGroup.select(".flow." + className).node().getBBox().height;
		self.nextY_zoom -= bboxHeight + 20;

		// restore height of svg
		if (self.isSmall) {
			d3.select("#chart")
				.attr("height", (self.nextY_zoom + 50) / self.zoomFactor);
		}
		else {
			d3.select("#chart")
				.attr("height", self.nextY_zoom + 50);
		}

		// remove the corresponding flow and shift the ones below up
		var removedFlowTranslateY = d3.transform(self.svgGroup.select(".flow." + className).attr("transform"));
		removedFlowTranslateY = removedFlowTranslateY.translate[1];

		self.svgGroup.select(".flow." + className).remove();

		self.svgGroup.selectAll(".flow")
						.each(function() {
							var currentTranslateY = d3.transform(d3.select(this).attr("transform")).translate[1];

							if (currentTranslateY > removedFlowTranslateY) {
								currentTranslateY -= bboxHeight + 20;
								d3.select(this)
									.transition()
									.attr("transform", "translate(0, " + currentTranslateY + ")")
							}
						});
	},
	createLegend: function() {
		var svg = d3.select("#flow-view .ui-menu-bar .control");

		svg.append("text")
			.attr("x", 270)
			.attr("y", 10)
			.style("alignment-baseline", "middle")
			.text("Legend:");

		svg.append("circle")
			.attr("cx", 320)
			.attr("cy", 10)
			.attr("r", 5)
			.style("fill", Database.positionColours[0]);

		svg.append("text")
			.attr("x", 330)
			.attr("y", 10)
			.style("alignment-baseline", "middle")
			.text("CEO")

		svg.append("circle")
			.attr("cx", 370)
			.attr("cy", 10)
			.attr("r", 5)
			.style("fill", Database.positionColours[1]);

		svg.append("text")
			.attr("x", 380)
			.attr("y", 10)
			.style("alignment-baseline", "middle")
			.text("President");

		svg.append("circle")
			.attr("cx", 440)
			.attr("cy", 10)
			.attr("r", 5)
			.style("fill", Database.positionColours[2]);

		svg.append("text")
			.attr("x", 450)
			.attr("y", 10)
			.style("alignment-baseline", "middle")
			.text("Vice President");

		svg.append("circle")
			.attr("cx", 530)
			.attr("cy", 10)
			.attr("r", 5)
			.style("fill", Database.positionColours[3]);

		svg.append("text")
			.attr("x", 540)
			.attr("y", 10)
			.style("alignment-baseline", "middle")
			.text("Director/ Managing Director");

		svg.append("circle")
			.attr("cx", 680)
			.attr("cy", 10)
			.attr("r", 5)
			.style("fill", Database.positionColours[5]);

		svg.append("text")
			.attr("x", 690)
			.attr("y", 10)
			.style("alignment-baseline", "middle")
			.text("Manager");

		svg.append("circle")
			.attr("cx", 750)
			.attr("cy", 10)
			.attr("r", 5)
			.style("fill", Database.positionColours[6]);

		svg.append("text")
			.attr("x", 760)
			.attr("y", 10)
			.style("alignment-baseline", "middle")
			.text("In House Lawyer/ Trader/ Employee");
	}
}