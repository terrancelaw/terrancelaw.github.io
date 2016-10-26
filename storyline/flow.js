Flow = {
	margin: {top: 150, right: 100, bottom: 20, left: 20},
	width: null,
	height: null,

  	svg: null, // for zoom behavior

  	maxSize: 0,

  	sizeData:[], // only include the data from 2015-01 onwards
  	incomingCoord: [],
  	outgoingCoord: [],

  	xScale: null,
  	yScale: null,

  	init: function() {
  		var self = this;

  		self.width = 1800 - self.margin.left - self.margin.right;
    	self.height = 600 - self.margin.top - self.margin.bottom;

  		self.svg = d3.select("#chart")
  						.attr("width", self.width + self.margin.left + self.margin.right)
  						.attr("height", self.height + self.margin.top + self.margin.bottom);

  		var flowGroup = self.svg.append("g")
  								.attr("class", "flow-group")
  								.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

  		d3.csv("size.csv", type, function(data) {
  			startIndex = data.map(function(d) { return d.date; }).indexOf("2015-01");
  			self.sizeData = data.slice(startIndex, data.length);

  			self.maxSize = d3.max(self.sizeData, function(d) { return d.size });

  			var color = "#e5e5e5";

  			self.xScale = d3.scale.linear()
  									.domain([0, self.sizeData.length - 1])
  									.range([0, self.width]);

  			self. yScale = d3.scale.linear()
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
  		})

  		function type(d) {
  			d.size = +d.size;
  			d.incoming = +d.incoming;
  			d.outgoing = +d.outgoing;

  			return d;
  		}
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
		    }

		    self.outgoingCoord.push({
		    	x: middlePos.x,
		    	y: middlePos.y
		    });

		 	bottomPath.remove();
  		}
  	}
};