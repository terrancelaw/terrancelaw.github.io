var Flow = {
	margin: null,
	width: null, // of the group not of svg
	height: null,

  	svg: null, // for zoom behavior

  	maxSize: 0,
  	maxFlow: 0,

  	sizeData:[], // only include the data from 2015-01 onwards
  	timeStepsDrawn: 0,

  	xScale: null,
  	sizeScale: null,
  	flowWidthScale: null,

  	color: "#d9d9d9",

  	init: function(margin, canvasWidth, canvasHeight, svg, data) {
  		var self = this;

  		self.margin = margin;
  		self.width = canvasWidth - margin.left - margin.right;
    	self.height = canvasHeight - margin.top - margin.bottom;

    	self.svg = svg;

    	self.sizeData = data;
    	self.timeStepsDrawn = self.sizeData.length - 1; // the last timestep is not draw because it has no stability

    	self.maxSize = d3.max(self.sizeData, function(d, i) {
    		if (i == self.sizeData.length - 1) // last time step is not drawn, should not be considered
    			return 0;
    		return d.size 
    	});
    	var maxInFlow = d3.max(self.sizeData, function(d, i) { 
    		if (i == 0) // the first one should not be considered
    			return 0;
    		return d.incoming;
    	});
    	var maxOutFlow = d3.max(self.sizeData, function(d, i) {
    		if (i == 0) // the first one should not be considered
    			return 0;
    		return d.outgoing 
    	});
    	self.maxFlow = (maxInFlow > maxOutFlow) ? maxInFlow : maxOutFlow;

    	self.xScale = null;
    	self.yScale = null;
  	},
  	create: function(margin, canvasWidth, canvasHeight, svg, data, name) { // graph render in svg
  		var self = this;

  		// to make sure past rendering does not affect current rendering
  		self.init(margin, canvasWidth, canvasHeight, svg, data);

  		var flowGroup = self.svg.append("g")
  								.attr("class", "flow-group");

		self.xScale = d3.scale.linear()
								.domain([0, self.timeStepsDrawn - 1])
								.range([0, self.width]);
		self.sizeScale = d3.scale.linear()
									.domain([0, self.maxSize])
									.range([0, self.height / 2]);

		// create the area chart
		var area =  d3.svg.area()
		                    .interpolate("cardinal")
		                    .x(function(d, i) { return self.xScale(i); })
		                    .y0(function(d) { return 0; }) // set the baseline to the zero
		                    .y1(function(d) { return -self.sizeScale(d.size); });

		var dataToBeRendered = [];
		for (var i = 0; i < self.timeStepsDrawn; i++)
			dataToBeRendered.push(self.sizeData[i]);
		var stream = flowGroup.append("path")
								.datum(dataToBeRendered)
								.attr("class", "area")
								.attr("d", area)
								.attr("fill", self.color);

		// create incoming arc
		var radius = self.width / ((self.sizeData.length - 1) * 5);
		var flowMaxWith = (self.width / (self.sizeData.length - 1) - radius * 2) / 2;

		self.flowWidthScale = d3.scale.linear()
										.domain([0, self.maxFlow])
										.range([0, flowMaxWith]);
		var arc = d3.svg.arc()
		                .startAngle(270 * (Math.PI / 180))
		                .endAngle(360 * (Math.PI / 180))
		                .innerRadius(radius);

		flowGroup.selectAll(".incoming")
			        .data(self.sizeData)
			        .enter()
			        .append("path")
			        .attr("class", "incoming")
			        .attr("d", function(d, i) {
			        	// render only after index = 1
			        	if (i == 0)
			        		arc.outerRadius(radius);
			        	else
			            	arc.outerRadius(radius + self.flowWidthScale(d.incoming));

			            return arc();
			        })
			        .attr("fill", self.color)
			        .attr("transform", function(d, i) {
			        	var xTranslate, yTranslate;

			        	// move index = 1 to position of index = 0...
			        	if (i == 0) {
			        		xTranslate = 0;
			        		yTranslate = 0;
			        	}
			        	else {
			        		xTranslate = self.xScale(i - 1);
			            	yTranslate = radius;
			        	}

			            return "translate(" + xTranslate + " ," +  yTranslate + ")"
			        });

		// create outgoing arc
		arc.startAngle(0) //converting from degs to radians
		    .endAngle(90 * (Math.PI / 180))
		    .innerRadius(radius);

		flowGroup.selectAll(".outgoing")
			        .data(self.sizeData)
			        .enter()
			        .append("path")
			        .attr("class", "outgoing")
			        .attr("d", function(d, i) {
			        	if (i == 0)
				        	arc.outerRadius(radius);
				        else
			            	arc.outerRadius(radius + self.flowWidthScale(d.outgoing));

			            return arc();
			        })
			        .attr("fill", self.color)
			        .attr("transform", function(d, i) {
			        	var xTranslate, yTranslate;

			        	if (i == 0) {
			        		xTranslate = 0;
			        		yTranslate = 0;
			        	}
			        	else {
			        		xTranslate = self.xScale(i - 1);
			            	yTranslate = radius;
			        	}

			            return "translate(" + xTranslate + " ," +  yTranslate + ")"
			        });

		// create the labels at the bottom
		self.createLabels(radius + 10, name);

		// translate the flow based on the height
		var maxFlowHeight = self.height / 2;
		svg.attr("transform", "translate(0," + (maxFlowHeight + FlowFactory.nextY_zoom) + ")"); // offset from the previous flow should be included

		return self.computeBoundingBox(); // to determine the yPos of next flow
  	},
  	createLabels: function(yTranslate, name) {
  		var self = this;
  		var tickHeight = 10;

  		var tickGroup = self.svg.append("g")
  								.attr("class", "tick-Group");

  		var tick = tickGroup.selectAll("g")
		  					.data(self.sizeData)
		  					.enter()
		  					.append("g");

		tick.append("line")
			.attr("class", "more")
			.attr("x1", function(d, i) {
				return self.xScale(i);
			})
			.attr("x2", function(d, i) {
				return self.xScale(i);
			})
			.attr("y1", yTranslate)
			.attr("y2", yTranslate + tickHeight)
			.attr("stroke", "black")
			.attr("stroke-width", "3px")
			.on("mouseover", function(d, i) { 
				d3.select(this)
					.attr("stroke-width", "7px")
					.attr("y1", yTranslate - tickHeight);

				showTooltip(d, this);
			})
			.on("mouseout", function() { 
				d3.select(this)
					.attr("stroke-width", "3px")
					.attr("y1", yTranslate);

				hideTooltip();
			});

		tick.append("text")
			.attr("x", function(d, i) {
				return self.xScale(i);
			})
			.attr("y", yTranslate + 20)
			.attr("text-anchor", "middle")
			.text(function(d) {
				return d.date;
			});

        function showTooltip(d, El) {
		    var x = parseInt(d3.select(El).attr("x1"));
		    var y = parseInt(d3.select(El).attr("y2"));

		    if (x + 125 >= FlowFactory.canvasWidth)
		    	x -= 125;

		    var tooltipText = "Network size: " + d.size + "<br>" +
		    					"Incoming nodes: " + d.incoming + "<br>" + 
		    					"Outgoing nodes: " + d.outgoing;

		    // create tooltip using a SUPERRRR hacky way...
	        var tooltipDiv = d3.select(d3.select(El).node().parentNode)
    							.append("foreignObject")
							    .attr("x", function () {
      								return x;
      							})
							    .attr("y", function () {
      								return y;
      							})
      							.attr("width", "125")
      							.attr("height", "100%")
							    .attr("class", "tipsy")
							    .append("xhtml:div")
							    .html("<div class='tipsy-inner' style='padding:10px'>" + tooltipText + "</div>");
		}

		function hideTooltip() {
		    d3.select(".tipsy").remove();
		}

		// create name label
		self.svg.append("text")
  				.attr("class", "name-label")
  				.text(name)
  				.attr("x", 0)
  				.attr("y", yTranslate + 40)
  				.attr("text-anchor", "start")
  				.attr("font-size", 20);
  	},
  	computeBoundingBox: function() {
  		var self = this;

  		return self.svg.node().getBBox().height;
  	}
};