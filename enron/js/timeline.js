var TimeLine = {
	margin: { top: 5, left: 30, bottom: 5, right: 30 },

	timeLineWidth: null,
	brushWidth: null,
	barHeight: 12,

	svg: null,

	isSmall: true, // is the brush small?

	init: function() {
		var self = this;

		// calculate timeLineWidth and brushWidth
		var lengthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / FlowFactory.numberOfTimePeriods;
		var maxNumOfTimePeriodsShown = Math.floor(FlowFactory.svgWidth / lengthOfOneTimePeriod);
		self.timeLineWidth = FlowFactory.svgWidth - self.margin.left - self.margin.right;
		self.brushWidth = maxNumOfTimePeriodsShown / FlowFactory.numberOfTimePeriods * self.timeLineWidth;

		self.svg = d3.select("#timeline")
						.append("g")
						.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		self.create();
	},
	create: function() {
		var self = this;

		// draw axis
		var parseDate = d3.time.format("%Y-%m").parse;

		var numberOfTimePeriods = Database.sizeDict[Database.emailList[0]].length;
		var firstDate = Database.sizeDict[Database.emailList[0]][0].date;
		var lastDate = Database.sizeDict[Database.emailList[0]][numberOfTimePeriods - 1].date;

		var xScale = d3.time.scale()
	  						.domain([parseDate(firstDate), parseDate(lastDate)])
	  						.range([0, flowViewSvgWidth - self.margin.left - self.margin.right]);
	  	var xAxis = d3.svg.axis()
	  						.scale(xScale)
	  						.orient("bottom")
	  						.tickFormat(d3.time.format("%m/%y"))
	  						.ticks(numberOfTimePeriods);

	  	self.svg.append("g")
	  			.attr("class", "x axis")
	  			.attr("transform", "translate(0, " + self.barHeight + ")")
	  			.call(xAxis);

	  	// draw the track
	 	self.svg.append("rect")
	 			.attr("class", "track")
	 			.attr("class", "background")
	  			.attr("x", 0)
	  			.attr("y", 0)
	  			.attr("width", self.timeLineWidth) // 950 is svg width
	  			.attr("height", self.barHeight)
	  			.style("cursor", "crosshair")
	  			.style("fill", "royalblue")
	  			.style("opacity", 0.2);

	  	// draw the brush
	  	var drag = d3.behavior.drag()
							    .on("drag", function() {
							    	if (self.isSmall) {
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

	  	self.svg.append("rect")
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
	resizeBrush: function() {
		var self = this;

		if (self.isSmall) {
			d3.select("#brush")
				.attr("x", 0)
				.attr("width", self.timeLineWidth);

			self.isSmall = false;
		}
		else {
			d3.select("#brush")
				.attr("x", 0)
				.attr("width", self.brushWidth);

			self.isSmall = true;
		}
	}
}