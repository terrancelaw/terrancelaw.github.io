var EventSummaryView = {
	textMargin: { top: 30, left: 10 },
	barMargin: { top: 70, left: 45, bottom: 80, right: 30 },

	barGroupSvg: null,
	barGroupWidth: null,
	barGroupHeight: null,

	// created during bar chart creation
	barXScale: null,
	barYScale: null,
	barHeightScale: null,
	barChartData: null,

	init: function() {
		var self = this;

		// dimensions
		self.barGroupHeight = eventSummaryViewHeight - self.barMargin.top - self.barMargin.bottom;
		self.barGroupWidth = eventSummaryViewWidth - self.barMargin.left - self.barMargin.right;

		// section title
		d3.select("#event-summary").append("text")
			.attr("x", 0)
			.attr("y", -15)
			.attr("transform", "translate(" + self.textMargin.left + ", " + self.textMargin.top + ")")
			.style("font-weight", "bold")
			.text("Event Summary");

		// bar
		self.barGroupSvg = d3.select("#event-summary")
			.append("g")
			.attr("transform", "translate(" + self.barMargin.left + ", " + self.barMargin.top + ")");
		self.barGroupSvg.append("g")
	      	.attr("class", "axis x-axis");
	    self.barGroupSvg.append("g")
	      	.attr("class", "axis y-axis");
	},
	updateBarChart: function() {
		var self = this;

		if (Database.events.length == 0) {
			self.barGroupSvg.selectAll("*").remove();

			// add the axis back
			self.barGroupSvg.append("g")
	      		.attr("class", "axis x-axis");
	    	self.barGroupSvg.append("g")
	      		.attr("class", "axis y-axis");

			return;
		}

		self.preprocessBarChartData();
		self.updateAxis();
		self.updateBars()
	},
	preprocessBarChartData: function() {
		var self = this;

		var eventsByDateAndName = {};
		for (var i = 0; i < Database.events.length; i++) {
			var currentEventObject = Database.events[i];
			var startDateString = currentEventObject.startDate;
			var endDateString = currentEventObject.endDate;
			var eventName = currentEventObject.eventName;

			if (endDateString == null) {
				if (!(startDateString in eventsByDateAndName))
					eventsByDateAndName[startDateString] = {};
				if (!(eventName in eventsByDateAndName[startDateString]))
						eventsByDateAndName[startDateString][eventName] = [];

				eventsByDateAndName[startDateString][eventName].push(currentEventObject);
			}

			// iterate through all the dates between start and end dates and store the result
			else {
				var parseDate = d3.time.format("%Y-%m").parse;
				var currentDate = parseDate(startDateString);
				var lastDate = parseDate(endDateString);

				while (currentDate <= lastDate) {
					// construct date string
					var year = currentDate.getYear() + 1900;
					var month = currentDate.getMonth() + 1;
					month = (month < 10) ? "0" + month.toString() : month.toString();
					var currentDateString = year + "-" + month;

					// store to eventsByDateAndName
					if (!(currentDateString in eventsByDateAndName))
						eventsByDateAndName[currentDateString] = {};
					if (!(eventName in eventsByDateAndName[currentDateString]))
						eventsByDateAndName[currentDateString][eventName] = [];

					eventsByDateAndName[currentDateString][eventName].push(currentEventObject);

					// next iteration
					currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
				}
			}
		}

		// * create the data structure for rending stacked bar chart

		// the max total number of events at a time step (for determining the x axis)
		var maxTotalNumberOfEventsInATimeStep = 0;
		for (var date in eventsByDateAndName) {
			var totalNumberOfEvents = 0;

			for (var eventName in eventsByDateAndName[date])
				totalNumberOfEvents += eventsByDateAndName[date][eventName].length;

			if (totalNumberOfEvents > maxTotalNumberOfEventsInATimeStep)
				maxTotalNumberOfEventsInATimeStep = totalNumberOfEvents;
		}

		// set the axis
		var dateInOrder = Object.keys(eventsByDateAndName);
		dateInOrder.sort();

		var barXScale = d3.scale.ordinal()
			.domain(dateInOrder)
			.rangeBands([0, self.barGroupWidth], 0.4);
		var barYScale = d3.scale.linear()
			.domain([0, maxTotalNumberOfEventsInATimeStep])
			.range([self.barGroupHeight, 0]);
		var barHeightScale = d3.scale.linear()
			.domain([0, maxTotalNumberOfEventsInATimeStep])
			.range([0, self.barGroupHeight]);

		// create bar chart data
		var barChartData = [];
		for (var i = 0; i < dateInOrder.length; i++) {
			var y = self.barGroupHeight;
			var date = dateInOrder[i];
			var barChartDataAtEachTimeStep = {
				xTranslate: barXScale(date),
				date: date,
				barData: []
			};

			if (date in eventsByDateAndName) {
				for (var eventName in eventsByDateAndName[date]) {
					var numberOfEvents = eventsByDateAndName[date][eventName].length;
					var colour = EventView.colours(EventView.event2Index[eventName]);
					y -= barHeightScale(numberOfEvents);

					// store the result
					barChartDataAtEachTimeStep.barData.push({
						y: y,
						height: barHeightScale(numberOfEvents),
						colour: colour,
						eventName: eventName
					});
				}
			}

			barChartData.push(barChartDataAtEachTimeStep);
		}

		self.barXScale = barXScale;
		self.barYScale = barYScale;
		self.barHeightScale = barHeightScale;
		self.barChartData = barChartData;
	},
	updateAxis: function() {
		var self = this;

		var xAxis = d3.svg.axis()
		    .scale(self.barXScale)
		    .orient("bottom");
		var yAxis = d3.svg.axis()
		    .scale(self.barYScale)
		    .ticks(5)
		    .orient("left");

		self.barGroupSvg.select(".x-axis")
			.attr("transform", "translate(0, " + self.barGroupHeight + ")")
	      	.call(xAxis)
	      	.selectAll("text")
		    .attr("y", 0)
		    .attr("x", 9)
		    .attr("dy", ".35em")
		    .attr("transform", "rotate(90)")
		    .style("text-anchor", "start");
		self.barGroupSvg.select(".y-axis")
	      	.call(yAxis);

	    // shorten y axis text and add a class to it
   		self.barGroupSvg.selectAll(".x-axis text")
   			.each(function() {
   				var oldText = d3.select(this).text();
   				var parseDate = d3.time.format("%Y-%m").parse;
   				var format = d3.time.format("%b %y");

   				var newText = format(parseDate(oldText));

   				d3.select(this).classed("d" + oldText, true);
   				d3.select(this).text(newText);
   			});
	},
	updateBars: function() {
		var self = this;

		// * draw stacked bar group

   		// join
	    var stackedBars = self.barGroupSvg.selectAll(".stacked-bars")
	    	.data(self.barChartData);

	   	// enter
	   	stackedBars.enter()
	    	.append("g")
	    	.attr("class", "stacked-bars")
	    	.style("cursor", "pointer");

	    // update
	    self.barGroupSvg.selectAll(".stacked-bars")
	    	.attr("date", function(d) {
	    		return d.date;
	    	})
	    	.attr("transform", function(d) {
	    		return "translate(" + d.xTranslate + ",0)";
	    	})

	    // exit
	    stackedBars.exit().remove();

		// * draw bar chart

		// join
		var bars = stackedBars.selectAll(".bar")
			.data(function(d) {
				return d.barData;
			});

		// enter
		bars.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("width", self.barXScale.rangeBand())
			.style("fill-opacity", 0.3)
			.style("stroke-width", 2)
			.on("mouseover", onMouseOverBarSegment)
			.on("mouseout", onMouseOutBarSegment);

		// update
		stackedBars.selectAll(".bar")
			.attr("y", function(d) {
				return d.y;
			})
			.attr("height", function(d) {
				return d.height;
			})
			.attr("event", function(d) {
				return d.eventName;
			})
			.style("fill", function(d) {
				return d.colour;
			})
			.style("stroke", function(d) {
				return d.colour;
			});

		// exit
		bars.exit().remove();

		function onMouseOverBarSegment() {
			var eventName = d3.select(this).attr("event");
			var eventColour = d3.select(this).style("fill");

			d3.select(this)
				.style("fill-opacity", 1);

			// draw event tag
			var eventTag = self.barGroupSvg.append("g")
				.attr("class", "event-tag");
			eventTag.append("circle")
				.attr("r", 5)
				.attr("cx", 0)
				.attr("cy", -30)
				.style("fill", eventColour)
				.style("stroke", "black");
			eventTag.append("text")
				.attr("x", 15)
				.attr("y", -30)
				.style("text-anchor", "start")
				.style("alignment-baseline", "central")
				.style("font-size", 12)
				.text(eventName);
		}

		function onMouseOutBarSegment() {
			d3.select(this)
				.style("fill-opacity", 0.3);

			// remove event tag
			self.barGroupSvg.selectAll(".event-tag").remove();
		}
	}
}