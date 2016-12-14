var TimeLine = {
	margin: {top: 3, right: 30, bottom: 350, left: 30},
	svg: null,

	barHeight: 12,

	timeLineWidth: null,
	brushWidth: null,

	small: true,

	init: function() {
		var self = this;
		
		// calculate timeLineWidth and brushWidth
		var lengthOfTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / FlowFactory.numberOfTimePeriods;
		var maxNumOfTimePeriodsShown = Math.floor(FlowFactory.svgWidth / lengthOfTimePeriod);
		self.timeLineWidth = FlowFactory.svgWidth - self.margin.left - self.margin.right;
		self.brushWidth = maxNumOfTimePeriodsShown / FlowFactory.numberOfTimePeriods * self.timeLineWidth;
		
	  	self.svg = d3.select("#timeline");

	  	var parseDate = d3.time.format("%Y-%m").parse;

	  	var xScale = d3.time.scale()
	  						.domain([parseDate("2015-01"), parseDate("2016-07")])
	  						.range([0, 950 - self.margin.left - self.margin.right]);

	  	var xAxis = d3.svg.axis()
	  						.scale(xScale)
	  						.orient("bottom")
	  						.tickFormat(d3.time.format("%m/%y"))
	  						.ticks(20);

	  	var timeline = self.svg.append("g")
	  							.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

	  	timeline.append("g")
	  			.attr("class", "x axis")
	  			.attr("transform", "translate(0, " + self.barHeight + ")")
	  			.call(xAxis);

	  	timeline.append("rect")
	  			.attr("class", "background")
	  			.attr("x", 0)
	  			.attr("y", 0)
	  			.attr("width", self.timeLineWidth) // 950 is svg width
	  			.attr("height", self.barHeight)
	  			.style("cursor", "crosshair")
	  			.style("fill", "royalblue")
	  			.style("opacity", 0.2);

	  	var drag = d3.behavior.drag()
							    .on("drag", function() {
							    	if (self.small) {
							    		var newX = parseInt(d3.select(this).attr("x")) + d3.event.dx;
								    	var width = parseInt(d3.select(this).attr("width"))

								    	// avoid overflow
								    	var rightMost = FlowFactory.svgWidth - self.margin.right - self.margin.left - width;
								    	if (newX < 0)
								    		newX = 0;
								    	if (newX > rightMost) 
								    		newX = rightMost;

								    	// move the brush
								    	d3.select(this).attr("x", newX);

								    	// move the flow diagram
								    	var xTranslate = (newX / self.timeLineWidth) * FlowFactory.canvasWidth;
								    	var flowTranslate = "translate(" + (-xTranslate + FlowFactory.margin.left) + "," + 
								    						FlowFactory.margin.top + ")";
								    	var labelTranslate = "translate(" + xTranslate + ", 0)"; // offset the effect...
								    	
								    	d3.select("#all-flows")
								    		.attr("transform", flowTranslate);
								    	d3.selectAll(".name-label")
								    		.attr("transform", labelTranslate);
							    	}
								});

	  	timeline.append("rect")
	  			.attr("id", "brush")
	  			.attr("x", 0)
	  			.attr("y", 0)
	  			.attr("width", self.brushWidth) // 950 is svg width
	  			.attr("height", self.barHeight)
	  			.style("cursor", "move")
	  			.style("fill", "black")
	  			.style("stroke", "black")
	  			.style("fill-opacity", 0.125)
	  			.call(drag);
	},
	resizeBrush: function(small) { // make it smaller?
		var self = this;

		if (!small) { // make it large
			d3.select("#brush")
				.attr("x", 0)
				.attr("width", self.timeLineWidth);

			self.small = false;
		}
		else {
			d3.select("#brush")
				.attr("x", 0)
				.attr("width", self.brushWidth);

			self.small = true;
		}
	}
}