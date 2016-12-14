var FlowFactory = { // all the flow creation requests are send here
	margin: {top: 10, right: 30, bottom: 10, left: 30},
	canvasWidth: 2000,
	canvasHeight: 300,
	svgWidth: 950,
	svgHeight: 500,

	svg: null,
	allFlows: null,

	numberOfTimePeriods: 19, // hard coded...

	zoomedOut: false,

	sizeData: [], // for rendering the first layer
	communityData: [], // for rendering the second layer

	nextY_zoom: 0, // next flow should be rendered here
	zoomFactor: 0,

	// TODO
	maxPossibleNetworkSize: 0, // max possible network size among all entities (to create y scale)

	init: function(svgWidth, svgHeight) {
		var self = this;

		self.svg = d3.select("#chart");
		self.svgWidth = svgWidth;
		self.svgHeight = svgHeight;

		self.allFlows = self.svg.append("g")
								.attr("id", "all-flows")
								.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

		self.getData();
		self.createFlowBehavior();
	},
	getData: function() {
		var self = this;

		d3.csv("csv/size.csv", sizeType, function(sizeData) {
			d3.csv("csv/allFirmsCommunities.csv", communityType, function(communityData) {
				self.sizeData = d3.nest()
									.key(function(d) {
										return d.name;
									})
									.map(sizeData);

				self.maxPossibleNetworkSize = d3.max(sizeData, function(d) {
					return d.size;
				});

				self.communityData = d3.nest()
										.key(function(d) {
											return d.name;
										})
										.map(communityData);
			});
		});

		function communityType(d) {
			d.id = +d.id;
			
		    // handling targets
		    d.target = d.target.split("|");
		    if (d.target != "") {
		    	d.target = d.target.map(function(t) { // map is not mutable
		    		return +t;
		        });
		    }
		    else {
		    	d.target = [];
		    }

		    // handling sources
		    d.source = d.source.split("|");
		    if (d.source != "") {
		    	d.source = d.source.map(function(t) { // map is not mutable
		    		return +t;
		        });
		    }
		    else {
		    	d.source = [];
		    }
					
			d.size = +d.size;

			return d;
		}

		function sizeType(d) {
			d.size = +d.size;
			d.incoming = +d.incoming;
			d.outgoing = +d.outgoing;

			return d;
		}
	},
	createFlow: function(name) {
		var self = this;
		var className = name.split('.').join('-');
		className = className.split(';').join('-');
		var flowGroup = self.allFlows.append("g")
										.attr("class", "flow " + className);

		// flow determines the height of the bounding box
		var bboxHeight = Flow.create(self.margin, self.canvasWidth, self.canvasHeight, flowGroup, self.sizeData[name], name);
		Cluster.create(self.margin, self.canvasWidth, self.canvasHeight, flowGroup, self.sizeData[name], self.communityData[name], name);
		self.nextY_zoom += bboxHeight + 20;

		if (!self.zoomedOut) { // big version
			d3.select("#chart")
				.attr("height", self.nextY_zoom + 50); // 50 is for tooltip
		}
		else {
			d3.select("#chart")
				.attr("height", (self.nextY_zoom + 50) / self.zoomFactor); // 50 is for tooltip
		}
	},
	removeFlow: function(name) {
		var self = this;
		var className = name.split('.').join('-');
		className = className.split(';').join('-');

		// compute bounding box height of the flow and remove from nextY_zoom
		var bboxHeight = self.allFlows.select(".flow." + className).node().getBBox().height;
		self.nextY_zoom -= bboxHeight + 20;

		// restore height of svg
		if (!self.zoomedOut) { // big version
			d3.select("#chart")
				.attr("height", self.nextY_zoom + 50); // 50 is for tooltip
		}
		else {
			d3.select("#chart")
				.attr("height", (self.nextY_zoom + 50) / self.zoomFactor); // 50 is for tooltip
		}

		// remove the corresponding flow and shift the ones below up
		var removedFlowTranslateY = d3.transform(self.allFlows.select(".flow." + className).attr("transform"));
		removedFlowTranslateY = removedFlowTranslateY.translate[1];

		self.allFlows.select(".flow." + className).remove();

		self.allFlows.selectAll(".flow")
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
	createFlowBehavior: function() { // zoom in and out, clear all flows
		var self = this;

		// create color encoding control
		d3.select("#flow-view-control")
			.append("text")
			.text("Link color:")
			.attr("x", 10)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central");

		d3.select("#flow-view-control")
			.append("text")
			.text("Stability")
			.attr("id", "stable-button")
			.attr("class", "button selected")
			.attr("x", 70)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("cursor", "pointer")
			.on("click", function() {
				if (!d3.select(this).classed("selected")) {
					d3.select(this).classed("selected", true);
					d3.select("#merge-split-button").classed("selected", false);

					self.recolourFlow("stability");
				}
			});

		d3.select("#flow-view-control")
			.append("text")
			.text("Merge and Split")
			.attr("id", "merge-split-button")
			.attr("class", "button")
			.attr("x", 120)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("cursor", "pointer")
			.on("click", function() {
				if (!d3.select(this).classed("selected")) {
					d3.select(this).classed("selected", true);
					d3.select("#stable-button").classed("selected", false);

					self.recolourFlow("merge-and-split");
				}
			});

		// create resize behavior
		$("#resize").click(function() {
			if (!self.zoomedOut) { // big version, zoom out
				self.zoomFactor  = (self.canvasWidth - self.margin.left - self.margin.right) / (self.svgWidth - self.margin.left - self.margin.right);
				var inverseFactor = 1 / self.zoomFactor;
				var transformStr = "translate(" + self.margin.left + "," + self.margin.top + ")" +
									"scale(" + inverseFactor + ", " + inverseFactor + ")";

				d3.select("#all-flows")
					.attr("transform", transformStr);
				TimeLine.resizeBrush(false);

				// change size of svg
				var currentHeight = parseInt(d3.select("#chart").attr("height"));
				d3.select("#chart")
					.attr("height", currentHeight / self.zoomFactor);

				// remove the transform in case the slider was moved
				d3.selectAll(".name-label")
					.attr("transform", null);

				self.zoomedOut = true;
			}
			else {
				var transformStr = "translate(" + self.margin.left + "," + self.margin.top + ")";

				d3.select("#all-flows")
					.attr("transform", transformStr);
				TimeLine.resizeBrush(true);

				// change size of svg;
				d3.select("#chart")
					.attr("height", self.nextY_zoom + 50); // 50 is for tooltip

				self.zoomedOut = false;
			}
		});

		$("#remove").click(function() {
			// clear all flows
			d3.selectAll(".flow").remove();

			// restore original size of svg
			d3.select("#chart").attr("height", self.svgHeight);
			self.nextY_zoom = 0;

			// restore table
			$("#table-view tbody tr.selected").removeClass("selected");
		});
	},
	recolourFlow: function(changeTo) {
		var self = this;

		if (changeTo == "merge-and-split") {
			d3.selectAll(".cluster-group")
				.selectAll(".link")
				.style("fill", function(d) {
	                var source = d[0];
	                var target = d[2];

	                if (source.target.length > 1 && target.source.length > 1) // split and merge
	                	return "#8b7c6e"

	                if (source.target.length > 1) // split
	                	return "#ff9e4a"

	                if (target.source.length > 1) // merge
	                	return "#1f77b4"
	                  
	                return "#999999";
	            });
		}
		else {
			d3.selectAll(".cluster-group")
				.selectAll(".link")
				.style("fill", function(d) {
					var source = d[0];
                  	var target = d[2];
                  	var name = d3.select(this).attr("name");

                  	return "url(#" + name + "-gradient-" + source.timeStep + "-" + target.timeStep + ")";
	            });
		}
	}
};