var FirstLayer = {
	colour: "#e5e5e5",

	// resources for creating labels
	name: null,
	xScale: null,
	flowHeight: null,

	svgGroup: null,

	height: null, // height of the whole group

	create: function(svg, width, height, data, numberOfClustersAtEachTimeStep) {
		var self = this;

		self.svgGroup = svg.append("g")
							.attr("class", "size-cluster")
							.attr("cursor", "pointer")
							.on("mousemove", function() {
								var totalNumberOfTimePeriods = Database.sizeDict[Database.emailList[0]].length - 1;
								var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

								var mouseX = d3.mouse(this)[0];
								var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
								var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

								var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
								var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

								var bBoxHeight = d3.select(this).select(".area").node().getBBox().height; // height of the selection box

								d3.selectAll(".selectionBox").remove();

								d3.select(this)
									.append("rect")
									.attr("class", "selectionBox")
									.attr("x", leftX)
									.attr("y", -bBoxHeight / 2)
									.attr("width", rightX - leftX)
									.attr("height", bBoxHeight)
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

		self.createLayer(self.svgGroup, width, height, data, numberOfClustersAtEachTimeStep);
		self.createLabels(self.svgGroup, self.xScale, self.flowHeight / 2 + 10, self.name, data);
		self.translateFlow(self.svgGroup, BarCharts.height);
		self.createBackground(self.svgGroup, self.height, width);
	},
	createLayer: function(svg, width, height, data, numberOfClustersAtEachTimeStep) {
		var self = this;

		var maxSize = d3.max(data, function(d, i) {
			return d.size;
		});
		var xScale = d3.scale.linear()
								.domain([0, data.length - 1])
								.range([0, width]);
		var sizeScale = d3.scale.linear()
								.domain([0, maxSize])
								.range([0, height / 2]);

		// create area chart
		var area = d3.svg.area()
							.interpolate("monotone")
							.x(function(d, i) { return xScale(i); })
		                    .y0(function(d, i) {
		                    	var paddingForClusters = 0;

		                    	if (numberOfClustersAtEachTimeStep[i] > 0)
		                    		paddingForClusters = 2 * SecondLayer.gapBetweenNodes + (numberOfClustersAtEachTimeStep[i] - 1) * SecondLayer.gapBetweenNodes;

		                    	return (sizeScale(d.size) + paddingForClusters) / 2; 
		                    })
		                    .y1(function(d, i) {
		                    	var paddingForClusters = 0;

		                    	if (numberOfClustersAtEachTimeStep[i] > 0)
		                    		paddingForClusters = 2 * SecondLayer.gapBetweenNodes + (numberOfClustersAtEachTimeStep[i] - 1) * SecondLayer.gapBetweenNodes;

		                    	return (- sizeScale(d.size) - paddingForClusters) / 2;
		                    });

		var flow = svg.append("path")
						.datum(data)
						.attr("class", "area")
						.attr("d", area)
						.attr("fill", self.colour);

		// insert rect for hovering
		var flowHeight = flow.node().getBBox().height;

		// prepare resources for creating labels
		self.name = data[0].name;
		self.name = self.name.substring(0, self.name.indexOf("@"));
		self.xScale = xScale;
		self.flowHeight = flowHeight;
	},
	createLabels: function(svg, xScale, yTranslate, name, data) {
		// create tick marks
		var tickHeight = 10;

  		var tickGroup = svg.append("g")
  							.attr("class", "tick-Group");
  		var tick = tickGroup.selectAll("g")
		  					.data(data)
		  					.enter()
		  					.append("g");

		tick.append("line")
			.attr("x1", function(d, i) {
				return xScale(i);
			})
			.attr("x2", function(d, i) {
				return xScale(i);
			})
			.attr("y1", yTranslate)
			.attr("y2", yTranslate + tickHeight)
			.attr("stroke", "black")
			.attr("stroke-width", "1px");

		// create name label
		var email = name + "@enron.com"

		svg.append("text")
  			.attr("class", "name-label")
			.text(name + " (" + Database.employeeDict[email] + ")")
			.attr("x", 0)
			.attr("y", yTranslate + 40)
			.style("text-anchor", "start")
			.style("font-size", 40);
	},
	translateFlow: function(svg, barChartsHeight) {
		var self = this;
		self.height = svg.node().getBBox().height;

		// translate by bBoxHeight / 2 and height / 2 (for bar charts)
		svg.attr("transform", "translate(0, " + (self.height / 2 + barChartsHeight)+ ")");
	},
	createBackground: function(svg, bbHeight, width) {
		svg.insert("rect", ":first-child")
			.attr("width", width)
			.attr("height", bbHeight)
			.attr("x", 0)
			.attr("y", -bbHeight / 2)
			.style("fill", "white")
			.style("stroke", "none")
			.style("opacity", 0);
	}
}