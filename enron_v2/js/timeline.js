var TimeLine = {
	margin: { top: 5, left: 30, bottom: 5, right: 30 },

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
	  			.attr("transform", "translate(0, 10)")
	  			.call(xAxis);
	}
}