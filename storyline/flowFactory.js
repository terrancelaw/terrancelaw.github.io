var FlowFactory = { // all the flow creation requests are send here
	margin: {top: 10, right: 10, bottom: 10, left: 10},
	canvasWidth: 1800,
	canvasHeight: 500,
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

		var flowGroup = self.allFlows.append("g")
										.attr("class", "flow");

		// flow determines the height of the bounding box
		var bboxHeight = Flow.create(self.margin, self.canvasWidth, self.canvasHeight, flowGroup, self.sizeData[name], name);
		Cluster.create(self.margin, self.canvasWidth, self.canvasHeight, flowGroup, self.sizeData[name], self.communityData[name]);
		self.nextY_zoom += bboxHeight + 20;

		if (!self.zoomedOut) { // big version
			if (self.nextY_zoom > self.svgHeight) {
				d3.select("#chart")
					.attr("height", self.nextY_zoom + 50); // 50 is for tooltip
			}
		}
		else {
			if (self.nextY_zoom > self.svgHeight) {
				d3.select("#chart")
					.attr("height", (self.nextY_zoom + 50) / self.zoomFactor); // 50 is for tooltip
			}
		}
	},
	createFlowBehavior: function() { // zoom in and out, clear all flows
		var self = this;

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

		// clear all flows
		// restore original size of svg
		$("#remove").click(function() {
			d3.selectAll(".flow").remove();

			d3.select("#chart")
					.attr("height", self.svgHeight);

			self.nextY_zoom = 0;
		});
	}
};