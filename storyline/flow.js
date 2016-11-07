var Flow = {
	margin: null,
	width: null, // of the group not of svg
	height: null,

  	svg: null, // for zoom behavior

  	maxSize: 0,

  	sizeData:[], // only include the data from 2015-01 onwards
  	incomingCoord: [],
  	outgoingCoord: [],

  	xScale: null,
  	yScale: null,

  	init: function(margin, canvasWidth, canvasHeight, svg, data) {
  		var self = this;

  		self.margin = margin;
  		self.width = canvasWidth - margin.left - margin.right;
    	self.height = canvasHeight - margin.top - margin.bottom;

    	self.svg = svg;

    	self.sizeData = data;
    	self.incomingCoord = [];
    	self.outgoingCoord = [];

    	self.maxSize = d3.max(self.sizeData, function(d) { return d.size });

    	self.xScale = null;
    	self.yScale = null;
  	},
  	create: function(margin, canvasWidth, canvasHeight, svg, data, name) { // graph render in svg
  		var self = this;

  		// to make sure past rendering does not affect current rendering
  		self.init(margin, canvasWidth, canvasHeight, svg, data);

  		var flowGroup = self.svg.append("g")
  								.attr("class", "flow-group");

		var color = "#e5e5e5";

		self.xScale = d3.scale.linear()
								.domain([0, self.sizeData.length - 1])
								.range([0, self.width]);
		self.yScale = d3.scale.linear()
								.domain([-self.maxSize / 2, self.maxSize / 2])
								.range([-self.height / 6, self.height / 6]); // height /3 /2 
		var sizeScale = d3.scale.linear()
								.domain([0, self.maxSize])
								.range([0, self.height / 3]);

		self.computeArcCoord();

		// create the area chart
		var area =  d3.svg.area()
	                    .interpolate("cardinal")
	                    .x(function(d, i) { return self.xScale(i); })
	                    .y0(function(d) { return self.yScale(-d.size / 2); })
	                    .y1(function(d) { return self.yScale(d.size / 2); });

		var stream = flowGroup.selectAll(".area")
								.data([self.sizeData])
								.enter()
								.append("path")
								.attr("class", "area")
								.attr("d", area)
								.attr("fill", color);

		// create incoming arc
		var radius = self.width / ((self.sizeData.length - 1) * 2.5);
		var arc = d3.svg.arc()
		                .startAngle(180 * (Math.PI / 180))
		                .endAngle(270 * (Math.PI / 180))
		                .innerRadius(radius);

		flowGroup.selectAll(".incoming")
			        .data(self.sizeData)
			        .enter()
			        .append("path")
			        .attr("class", "incoming")
			        .attr("d", function(d, i) {
			        	if (i == 0)
			        		arc.outerRadius(radius);
			        	else
			            	arc.outerRadius(radius + sizeScale(d.incoming));

			            return arc();
			        })
			        .attr("fill", color)
			        .attr("transform", function(d, i) {
			        	var xTranslate, yTranslate;

			        	if (i == 0) {
			        		xTranslate = 0;
			        		yTranslate = 0;
			        	}
			        	else {
			        		xTranslate = self.incomingCoord[i - 1].x;
			            	yTranslate = self.incomingCoord[i - 1].y - radius;
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
			            	arc.outerRadius(radius + sizeScale(d.outgoing));

			            return arc();
			        })
			        .attr("fill", color)
			        .attr("transform", function(d, i) {
			        	var xTranslate, yTranslate;

			        	if (i == 0) {
			        		xTranslate = 0;
			        		yTranslate = 0;
			        	}
			        	else {
			        		xTranslate = self.outgoingCoord[i - 1].x;
			            	yTranslate = self.outgoingCoord[i - 1].y + radius;
			        	}

			            return "translate(" + xTranslate + " ," +  yTranslate + ")"
			        });

		// translate the flow based on the height
		var maxFlowHeight = self.yScale(self.maxSize / 2);
		var arcRadius = radius;

		// offset from the previous flow should be included
		svg.attr("transform", "translate(0," + (maxFlowHeight + arcRadius + FlowFactory.nextY_zoom) + ")");

		// create the labels at the bottom
		self.createLabels(maxFlowHeight + arcRadius, name);

		return self.computeBoundingBox(); // to determine the yPos of next flow
  	},
  	computeArcCoord: function() {
  		var self = this;

  		for (var i = 0; i < self.sizeData.length - 1; i++) {
  			//
  			// compute incoming arcs' coord
  			//
  			var offset = (i == 0) ? i : i - 1;
  			// for example, if i = 3, it consider 2 as one -> need offset
  			var area =  d3.svg.area()
			                    .interpolate("cardinal")
			                    .x(function(d, index) { return self.xScale(index + offset); })
			                    .y0(function(d) { return self.yScale(-d.size / 2); })
			                    .y1(function(d) { return self.yScale(-d.size / 2); });

			// for each period, look at the things before and after for more accurate computation
			var currentSizeArray = [];
			var start = (i == 0) ? i : i - 1;
			var end = (i == self.sizeData.length - 2) ? i + 1 : i + 2;
			for (var j = start; j <= end; j++) {
				currentSizeArray.push(self.sizeData[j]);
			}
			
			// hacky way to get the length of a path
			var topPath = self.svg.append("path")
									.attr("d", area(currentSizeArray))
									.attr("stroke", "none");
    		var pathLength = topPath.node().getTotalLength();
    		
			var targetX = (self.xScale(i) + self.xScale(i + 1)) / 2; // should be the middle of two time step
		    var begin = 0, end = pathLength, middle, middlePos; // begin, middle, end are lengths
		    var diffThres = 3;

		    // like binary search
		    while (true) {
			    middle = begin + (end - begin) / 2;
			    middlePos = topPath.node().getPointAtLength(middle);

			    if (end - begin < diffThres)
			        break;

			    if (middlePos.x > targetX)
			        end = middle;
			    else if (middlePos.x < targetX)
			        begin = middle;
			    else
			    	break; // middlePos = target
		    }

		    self.incomingCoord.push({
		    	x: middlePos.x,
		    	y: middlePos.y
		    });

		 	topPath.remove();

		 	//
  			// compute outgoing arcs' coord
  			//
  			area.y0(function(d) { return self.yScale(d.size / 2); })
  				.y1(function(d) { return self.yScale(d.size / 2); });
			
			// hacky way to get the length of a path
			var bottomPath = self.svg.append("path")
									.attr("d", area(currentSizeArray))
									.attr("stroke", "none");
    		var pathLength = bottomPath.node().getTotalLength();
    		
			var targetX = (self.xScale(i) + self.xScale(i + 1)) / 2; // should be the middle of two time step
		    var begin = 0, end = pathLength, middle, middlePos; // begin, middle, end are lengths
		    var diffThres = 3;

		    // like binary search
		    while (true) {
			    middle = begin + (end - begin) / 2;
			    middlePos = bottomPath.node().getPointAtLength(middle);

			    if (end - begin < diffThres)
			        break;

			    if (middlePos.x > targetX)
			        end = middle;
			    else if (middlePos.x < targetX)
			        begin = middle;
			    else
			    	break; // middlePos = target
		    }

		    self.outgoingCoord.push({
		    	x: middlePos.x,
		    	y: middlePos.y
		    });

		 	bottomPath.remove();
  		}
  	},
  	createLabels: function(yTranslate, name) {
  		var self = this;

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
			.attr("y2", yTranslate + 10)
			.attr("stroke", "black")
			.attr("stroke-width", "3px")
			.on("mouseover", function(d, i) { 
				d3.select(this)
					.attr("stroke-width", "7px")
					.attr("y1", yTranslate - 10);

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