var TimeLine = {
	margin: { top: 5, left: 25, bottom: 5, right: 25 },

	svg: null,

	init: function() {
		var self = this;

		self.svg = d3.select("#timeline")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		self.create();
	},
	create: function() {
		var self = this;

		// draw axis
		var parseDate = d3.time.format("%Y-%m").parse;

		var numberOfTimeSteps = Database.numberOfTimeSteps;
		var firstDate = Database.networkDict[Database.emailList[0]][0].date;
		var lastDate = Database.networkDict[Database.emailList[0]][numberOfTimeSteps - 1].date;

		var xScale = d3.time.scale()
			.domain([parseDate(firstDate), parseDate(lastDate)])
			.range([0, flowViewSvgWidth - self.margin.left - self.margin.right]);
	  	var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.tickFormat(d3.time.format("%y-%m"))
			.ticks(numberOfTimeSteps);

	  	self.svg.append("g")
  			.attr("class", "x axis")
  			.attr("transform", "translate(0, 10)")
  			.call(xAxis);
	}
}