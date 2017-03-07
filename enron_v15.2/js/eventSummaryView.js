var EventSummaryView = {
	textMargin: { top: 30, left: 10 },
	barMargin: { top: 60, left: 60, bottom: 40, right: 10 },
	glyphMargin: { top: 60, left: 55, bottom: 30, right: 35 },

	barGroupSvg: null,
	glyphGroupSvg: null,

	barGroupWidth: null,
	barGroupHeight: null,
	glyphGroupWidth: null,
	glyphGroupHeight: null,
	firstColumnWidth: null,
	secondColumnWidth: null,

	pieRadius: 10,
	glyphBarHeight: 8,
	heightOfGlyph: 25,

	beforeAfterDependence: {}, // input: event, output {after: {event, percentage}, before: {event, percentage}

	init: function() {
		var self = this;

		// dimensions
		self.firstColumnWidth = eventSummaryViewWidth / 2 + 30;
		self.secondColumnWidth = eventSummaryViewWidth / 2 - 30;
		self.barGroupHeight = eventSummaryViewHeight - self.barMargin.top - self.barMargin.bottom;
		self.barGroupWidth = self.firstColumnWidth - self.barMargin.left - self.barMargin.right;
		self.glyphGroupHeight = eventSummaryViewHeight - self.glyphMargin.top - self.glyphMargin.bottom;
		self.glyphGroupWidth =  self.secondColumnWidth - self.glyphMargin.left - self.glyphMargin.right;

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

	    // draw pointer triangle
	    var triangleWidth = 12;
	    self.barGroupSvg.append("path")
	    	.attr("class", "pointer")
	    	.attr("d", "M 0 " + triangleWidth / 2 + " L " + Math.sqrt(triangleWidth * triangleWidth - triangleWidth / 2 * triangleWidth / 2) + 
	    		" 0 L " + Math.sqrt(triangleWidth * triangleWidth - triangleWidth / 2 * triangleWidth / 2) + " " + triangleWidth + "z")
	    	.attr("fill", "#999999")
	    	.style("display", "none");

		// glyph
		self.glyphGroupSvg = d3.select("#event-summary")
			.append("g");		
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

		var data = self.preprocessBarChartData();
		self.updateAxis(data.barWidthScale, data.barYScale);
		self.updateBars(data.barWidthScale, data.barYScale, data.barChartData)
		self.computeBeforeAndAfterDependence();
	},
	preprocessBarChartData: function() {
		var self = this;

		var eventsByDateAndName = {};
		for (var i = 0; i < Database.events.length; i++) {
			var currentEventObject = Database.events[i];
			var startDateString = currentEventObject.startDate;
			var endDateString = currentEventObject.endDate;
			var eventName = currentEventObject.name;

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
					if (month < 10)
						month = "0" + month.toString();
					else
						month = month.toString();
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

		// create the data structure for rending stacked bar chart

		// * the max total number of events at a time step (for determining the x axis)
		var maxTotalNumberOfEventsInATimeStep = 0;
		for (var date in eventsByDateAndName) {
			var totalNumberOfEvents = 0;

			for (var eventName in eventsByDateAndName[date])
				totalNumberOfEvents += eventsByDateAndName[date][eventName].length;

			if (totalNumberOfEvents > maxTotalNumberOfEventsInATimeStep)
				maxTotalNumberOfEventsInATimeStep = totalNumberOfEvents;
		}

		// * set the axis
		var dateInOrder = Object.keys(eventsByDateAndName);
		dateInOrder.sort();

		var barYScale = d3.scale.ordinal()
			.domain(dateInOrder)
			.rangeBands([0, self.barGroupHeight], 0.3);
		var barWidthScale = d3.scale.linear()
			.domain([0, maxTotalNumberOfEventsInATimeStep])
			.range([0, self.barGroupWidth]);

		// * create bar chart data
		var barChartData = [];
		for (var i = 0; i < dateInOrder.length; i++) {
			var x = 0;
			var date = dateInOrder[i];
			var barChartDataAtEachTimeStep = {
				yTranslate: barYScale(date),
				date: date,
				barData: []
			};

			if (date in eventsByDateAndName) {
				for (var eventName in eventsByDateAndName[date]) {
					var numberOfEvents = eventsByDateAndName[date][eventName].length;
					var colour = EventView.colours(EventView.event2Index[eventName]);

					// store the result
					barChartDataAtEachTimeStep.barData.push({
						x: x,
						width: barWidthScale(numberOfEvents),
						colour: colour,
						eventName: eventName
					});

					x += barWidthScale(numberOfEvents);
				}
			}

			barChartData.push(barChartDataAtEachTimeStep);
		}

		return {
			barYScale: barYScale,
			barWidthScale: barWidthScale,
			barChartData: barChartData
		}
	},
	updateAxis: function(barWidthScale, barYScale) {
		var self = this;

		var xAxis = d3.svg.axis()
		    .scale(barWidthScale)
		    .ticks(5)
		    .orient("top");
		var yAxis = d3.svg.axis()
		    .scale(barYScale)
		    .orient("left");

		self.barGroupSvg.select(".x-axis")
	      	.call(xAxis);

		self.barGroupSvg.select(".y-axis")
	      	.call(yAxis);

	    // shorten y axis text and add a class to it
   		self.barGroupSvg.selectAll(".y-axis text")
   			.each(function() {
   				var oldText = d3.select(this).text();
   				newText = oldText.substring(2);

   				d3.select(this).classed("d" + oldText, true);
   				d3.select(this).text(newText);
   			});
	},
	updateBars: function(barWidthScale, barYScale, barChartData) {
		var self = this;

		// draw stacked bar group

   		// * update
	    var stackedBars = self.barGroupSvg.selectAll(".stacked-bars")
	    	.data(barChartData)
	    	.attr("date", function(d) {
	    		return d.date;
	    	})
	    	.attr("transform", function(d) {
	    		return "translate(0, " + d.yTranslate + ")";
	    	})
	    	.on("mouseenter", onMouseEnterBar)
	    	.on("mouseleave", onMouseLeaveBar);

	   	// * enter
	   	stackedBars
			.enter()
	    	.append("g")
	    	.attr("class", "stacked-bars")
	    	.attr("date", function(d) {
	    		return d.date;
	    	})
	    	.attr("transform", function(d) {
	    		return "translate(0, " + d.yTranslate + ")";
	    	})
	    	.style("cursor", "pointer")
	    	.on("mouseenter", onMouseEnterBar)
	    	.on("mouseleave", onMouseLeaveBar)
	    	.append("rect")
	    	.attr("class", "background")
	    	.attr("width", self.barGroupWidth)
	    	.attr("height", barYScale.rangeBand() / 0.7)
	    	.attr("x", 0)
	    	.attr("y", 0)
	    	.style("fill", "white");

	    // * exit
	    stackedBars.exit().remove();

		// draw bar chart

		// * join
		var bars = stackedBars.selectAll(".bar")
			.data(function(d) {
				return d.barData;
			});

		// * update
		bars
			.attr("width", function(d) {
				return d.width;
			})
			.attr("event", function(d) {
				return d.eventName;
			})
			.attr("height", barYScale.rangeBand())
			.attr("x", function(d) {
				return d.x;
			})
			.style("fill", function(d) {
				return d.colour;
			})
			.style("stroke", function(d) {
				return d.colour;
			})
			.on("mouseover", onMouseOverBarSegment)
			.on("mouseout", onMouseOutBarSegment);

		// * enter
		bars.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("event", function(d) {
				return d.eventName;
			})
			.attr("width", function(d) {
				return d.width;
			})
			.attr("height", barYScale.rangeBand())
			.attr("x", function(d) {
				return d.x;
			})
			.style("fill", function(d) {
				return d.colour;
			})
			.style("stroke", function(d) {
				return d.colour;
			})
			.style("fill-opacity", 0.3)
			.style("stroke-width", 2)
			.on("mouseover", onMouseOverBarSegment)
			.on("mouseout", onMouseOutBarSegment);

		// * exit
		bars.exit().remove();

		function onMouseEnterBar() {
			var indexDate = d3.select(this).attr("date");
			var transform = d3.transform(d3.select(this).attr("transform"));
			var y = parseInt(transform.translate[1]);

			// highlight the date
			self.barGroupSvg.selectAll(".y-axis text")
				.style("font-size", 10)
				.style("font-weight", null);
			self.barGroupSvg.select(".y-axis .d" + indexDate)
				.style("font-size", 12)
				.style("font-weight", "bold");

			// draw pointer
			self.barGroupSvg.select(".pointer")
				.attr("transform", "translate(" + (self.barGroupWidth + 20) + ", " + y + ")")
				.style("display", null);

			self.createPieGlyph(indexDate, y);
		}

		function onMouseLeaveBar() {
			// remove highlight
			self.barGroupSvg.selectAll(".y-axis text")
				.style("font-size", 10)
				.style("font-weight", null);

			// hide pointer
			self.barGroupSvg.select(".pointer")
				.style("display", "none");

			self.removePieGlyph();
		}

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
				.attr("cy", self.barGroupHeight + self.barMargin.bottom / 2)
				.style("fill", eventColour)
				.style("stroke", "black");

			eventTag.append("text")
				.attr("x", 15)
				.attr("y", self.barGroupHeight + self.barMargin.bottom / 2)
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
	},
	computeBeforeAndAfterDependence: function() {
		var self = this;

		self.beforeAfterDependence = {};

		// aggregate by email and date
		var eventsByEmailAndDate = d3.nest()
			.key(function(d) {
				return d.email;
			})
			.key(function(d) {
				return d.startDate;
			})
			.map(Database.events);

		// create event array for each person
		for (var email in eventsByEmailAndDate) {
			var dateInOrder = Object.keys(eventsByEmailAndDate[email]);
			dateInOrder.sort();

			var eventArray = [];
			for (var i = 0; i < dateInOrder.length; i++) {
				var currentDate = dateInOrder[i];

				eventArray.push(eventsByEmailAndDate[email][dateInOrder[i]]);
			}

			eventsByEmailAndDate[email] = eventArray;
		}

		// scan linearly each array to find the statistics
		var beforeAfterStatistics = {};
		for (var email in eventsByEmailAndDate) {
			var eventArray = eventsByEmailAndDate[email];

			for (var i = 0; i < eventArray.length; i++) {
				for (var j = 0; j < eventArray[i].length; j++) {
					var eventObject = eventArray[i][j];
					var eventName = eventObject.name;

					if (!(eventName in beforeAfterStatistics)) {
						beforeAfterStatistics[eventName] = {
							before: {},
							after: {}
						};
					}
					
					// has before, store before
					if (i != 0) {
						for (var k = 0; k < eventArray[i - 1].length; k++) {
							var beforeEventObject = eventArray[i - 1][k];
							var beforeEventName = beforeEventObject.name;

							if (!(beforeEventName in beforeAfterStatistics[eventName].before))
								beforeAfterStatistics[eventName].before[beforeEventName] = 1;
							else
								beforeAfterStatistics[eventName].before[beforeEventName]++;
						}
					}

					// has after
					if (i != eventArray.length - 1) {
						for (var k = 0; k < eventArray[i + 1].length; k++) {
							var afterEventObject = eventArray[i + 1][k];
							var afterEventName = afterEventObject.name;

							if (!(afterEventName in beforeAfterStatistics[eventName].after))
								beforeAfterStatistics[eventName].after[afterEventName] = 1;
							else
								beforeAfterStatistics[eventName].after[afterEventName]++;
						}
					}
				}
			}
		}

		// store max after and before to beforeAfterDependence
		for (var event in beforeAfterStatistics) {

			if (!(event in self.beforeAfterDependence))
				self.beforeAfterDependence[event] = {};

			// find most probable before event for this event
			var sum = 0;
			var currentMaxValue = 0;
			var currentMaxEventName = 0;
			for (var beforeEvent in beforeAfterStatistics[event].before) {
				var beforeEventCount = beforeAfterStatistics[event].before[beforeEvent];

				sum += beforeEventCount;

				if (beforeEventCount > currentMaxValue) {
					currentMaxValue = beforeEventCount;
					currentMaxEventName = beforeEvent;
				}
			}

			self.beforeAfterDependence[event].before = {
				mostProbableEvent: currentMaxEventName,
				probability: currentMaxValue / sum
			}

			// find most probable after event for this event
			var sum = 0;
			var currentMaxValue = 0;
			var currentMaxEventName = 0;
			for (var afterEvent in beforeAfterStatistics[event].after) {
				var afterEventCount = beforeAfterStatistics[event].after[afterEvent];

				sum += afterEventCount;

				if (afterEventCount > currentMaxValue) {
					currentMaxValue = afterEventCount;
					currentMaxEventName = afterEvent;
				}
			}

			self.beforeAfterDependence[event].after = {
				mostProbableEvent: currentMaxEventName,
				probability: currentMaxValue / sum
			}
		}
	},
	createPieGlyph: function(indexDate, y) {
		var self = this;

		var data = self.preprocessPieGlyphData(indexDate);
		self.createPieGlyphArea(data.areaArray);
		self.createPieGlyphBar(data.event2Index, data.barWidthScale, data.indexedEvents);
		self.createPieGlyphPie(data.event2Index, data.pieCharts);
		self.translatePieGlyph(y, data.indexedEvents.length);
	},
	preprocessPieGlyphData: function(indexDate) {
		var self = this;

		// aggregate by email and date
		var eventsByEmailAndDate = d3.nest()
			.key(function(d) {
				return d.email;
			})
			.key(function(d) {
				return d.startDate;
			})
			.map(Database.events);

		// create { event: count, before, after }
		var beforeAfterOfIndexedEvent = {};
		for (var email in eventsByEmailAndDate) {
			if (indexDate in eventsByEmailAndDate[email]) {
				// find the dates before and after the index date
				var sortedDates = Object.keys(eventsByEmailAndDate[email]);
				sortedDates.sort();

				var indexOfIndexDate = sortedDates.indexOf(indexDate);
				var dateBefore = (indexOfIndexDate == 0) ? null : sortedDates[indexOfIndexDate - 1];
				var dateAfter = (indexOfIndexDate == sortedDates.length - 1) ? null : sortedDates[indexOfIndexDate + 1];

				// process the indexed events
				var indexedEventArray = eventsByEmailAndDate[email][indexDate];
				for (var i = 0; i < indexedEventArray.length; i++) {
					var eventObject = indexedEventArray[i];
					var eventName = eventObject.name;

					// create object in beforeAfterOfIndexedEvent
					if (!(eventName in beforeAfterOfIndexedEvent)) {
						beforeAfterOfIndexedEvent[eventName] = {
							count: 1,
							before: {},
							after: {}
						}
					}
					else {
						beforeAfterOfIndexedEvent[eventName].count++;
					}

					// process the event before
					if (dateBefore) {
						var beforeEventArray = eventsByEmailAndDate[email][dateBefore];
						for (var j = 0; j < beforeEventArray.length; j++) {
							var beforeEventObject = beforeEventArray[j];
							var beforeEventName = beforeEventObject.name;

							if (!(beforeEventName in beforeAfterOfIndexedEvent[eventName].before))
								beforeAfterOfIndexedEvent[eventName].before[beforeEventName] = 1;
							else
								beforeAfterOfIndexedEvent[eventName].before[beforeEventName]++;
						}
					}

					// process the event after
					if (dateAfter) {
						var afterEventArray = eventsByEmailAndDate[email][dateAfter];
						for (var j = 0; j < afterEventArray.length; j++) {
							var afterEventObject = afterEventArray[j];
							var afterEventName = afterEventObject.name;

							if (!(afterEventName in beforeAfterOfIndexedEvent[eventName].after))
								beforeAfterOfIndexedEvent[eventName].after[afterEventName] = 1;
							else
								beforeAfterOfIndexedEvent[eventName].after[afterEventName]++;
						}
					}
				}
			}
		}

		// create pie chart array { array, before?, event }
		var pieCharts = [];
		for (var indexedEvent in beforeAfterOfIndexedEvent) {
			var beforeEvents = beforeAfterOfIndexedEvent[indexedEvent].before;
			var afterEvents = beforeAfterOfIndexedEvent[indexedEvent].after;

			// process before events
			var pieChartObject = {
				event: indexedEvent, // determine y
				before: true, // determine x
				values: []
			};
			for (var eventName in beforeEvents) {
				var eventIndex = EventView.event2Index[eventName];
				var colour = EventView.colours(eventIndex);

				pieChartObject.values.push({
					colour: colour,
					value: beforeEvents[eventName]
				});
			}

			// * insert dummy event if there is no before events
			if (Object.keys(beforeEvents).length == 0) {
				pieChartObject.values.push({
					colour: "#eaeaea",
					value: 1
				});
			}

			pieCharts.push(pieChartObject);

			// process after events
			var pieChartObject = {
				event: indexedEvent, // determine y
				before: false, // determine x
				values: []
			};
			for (var eventName in afterEvents) {
				var eventIndex = EventView.event2Index[eventName];
				var colour = EventView.colours(eventIndex);

				pieChartObject.values.push({
					colour: colour,
					value: afterEvents[eventName]
				});
			}

			// * insert dummy event if there is no before events
			if (Object.keys(afterEvents).length == 0) {
				pieChartObject.values.push({
					colour: "#eaeaea",
					value: 1
				});
			}

			pieCharts.push(pieChartObject);
		}

		// create array of indexed event
		var indexedEvents = [];
		for (var indexedEvent in beforeAfterOfIndexedEvent) {
			indexedEvents.push({
				event: indexedEvent,
				value: beforeAfterOfIndexedEvent[indexedEvent].count
			});
		}

		// create event2index and widthScale

		// * event2index
		var allIndexEventNames = Object.keys(beforeAfterOfIndexedEvent);
		var sortedEventNames = [];

		for (var i = 0; i < allIndexEventNames.length; i++) {
			sortedEventNames.push({
				event: allIndexEventNames[i],
				index: EventView.event2Index[allIndexEventNames[i]]
			});
		}
		sortedEventNames.sort(function(x, y){
		   return d3.ascending(x.index, y.index);
		})

		var event2Index = {};
		for (var i = 0; i < sortedEventNames.length; i++)
			event2Index[sortedEventNames[i].event] = i;

		// * widthScale
		var maxCount = 0;
		for (var indexedEvent in beforeAfterOfIndexedEvent) {
			if (beforeAfterOfIndexedEvent[indexedEvent].count > maxCount)
				maxCount = beforeAfterOfIndexedEvent[indexedEvent].count;
		}

		var barWidthScale = d3.scale.linear()
			.domain([0, maxCount])
			.range([0, self.glyphGroupWidth / 3]);

		// create array for the area charts
		var areaArray = [];
		for (var indexedEvent in beforeAfterOfIndexedEvent) {
			var count = beforeAfterOfIndexedEvent[indexedEvent].count;
			var currentAreaArray = [];

			// before
			currentAreaArray.push({
				x: 0,
				y0: event2Index[indexedEvent] * self.heightOfGlyph - self.pieRadius,
				y1: event2Index[indexedEvent] * self.heightOfGlyph + self.pieRadius
			});
			currentAreaArray.push({
				x: self.glyphGroupWidth / 2 - barWidthScale(count) / 2,
				y0: event2Index[indexedEvent] * self.heightOfGlyph - self.glyphBarHeight / 2,
				y1: event2Index[indexedEvent] * self.heightOfGlyph + self.glyphBarHeight / 2
			});

			var mostProbableBeforeEvent = self.beforeAfterDependence[indexedEvent].before.mostProbableEvent;
			var mostProbableBeforeEventColour = EventView.colours(EventView.event2Index[mostProbableBeforeEvent]);
			areaArray.push({
				areaColour: mostProbableBeforeEventColour,
				areaOpacity: self.beforeAfterDependence[indexedEvent].before.probability,
				data: currentAreaArray
			});

			// after
			currentAreaArray = [];
			currentAreaArray.push({
				x: self.glyphGroupWidth / 2 + barWidthScale(count) / 2,
				y0: event2Index[indexedEvent] * self.heightOfGlyph - self.glyphBarHeight / 2,
				y1: event2Index[indexedEvent] * self.heightOfGlyph + self.glyphBarHeight / 2
			});
			currentAreaArray.push({
				x: self.glyphGroupWidth,
				y0: event2Index[indexedEvent] * self.heightOfGlyph - self.pieRadius,
				y1: event2Index[indexedEvent] * self.heightOfGlyph + self.pieRadius
			});
			var mostProbableAfterEvent = self.beforeAfterDependence[indexedEvent].after.mostProbableEvent;
			var mostProbableAfterEventColour = EventView.colours(EventView.event2Index[mostProbableAfterEvent]);
			areaArray.push({
				areaColour: mostProbableAfterEventColour,
				areaOpacity: self.beforeAfterDependence[indexedEvent].after.probability,
				data: currentAreaArray
			});
		}

		return {
			event2Index: event2Index, // to prevent removing event2Index
			barWidthScale: barWidthScale,
			areaArray: areaArray,
			indexedEvents: indexedEvents,
			pieCharts: pieCharts
		}
	},
	createPieGlyphArea: function(areaArray) {
		var self = this;

		var area = d3.svg.area()
          .x(function(d) { return d.x; })
          .y0(function(d) { return d.y0; })
          .y1(function(d) { return d.y1; })
          .interpolate('basis');

		self.glyphGroupSvg.selectAll(".area")
			.data(areaArray)
			.enter()
			.append("path")
			.attr("class", "area")
			.attr("d", function(d) {
				return area(d.data);
			})
			.style("fill", function(d) {
				return d.areaColour;
			})
			.style("opacity", function(d) {
				return d.areaOpacity;
			});
	},
	createPieGlyphBar: function(event2Index, barWidthScale, indexedEvents) {
		var self = this;

		self.glyphGroupSvg.selectAll(".indexed-event")
			.data(indexedEvents)
			.enter()
			.append("rect")
			.attr("class", "indexed-event")
			.attr("x", function(d) {
				return self.glyphGroupWidth / 2 - barWidthScale(d.value) / 2;
			})
			.attr("y", function(d) {
				return event2Index[d.event] * self.heightOfGlyph - self.glyphBarHeight / 2;
			})
			.attr("height", self.glyphBarHeight)
			.attr("width", function(d) {
				return barWidthScale(d.value);
			})
			.style("fill", function(d) {
				var eventIndex = EventView.event2Index[d.event];
				var colour = EventView.colours(eventIndex);

				return colour;
			});
	},
	createPieGlyphPie: function(event2Index, pieCharts) {
		var self = this;

		var pie = d3.layout.pie()
		    .value(function(d) { return d.value; });
		var arc = d3.svg.arc()
		    .outerRadius(self.pieRadius)
		    .innerRadius(0);

		var pieChartGroup = self.glyphGroupSvg.selectAll(".g")
			.data(pieCharts)
			.enter()
			.append("g")
	      	.attr("class", "pie-chart")
	      	.attr("transform", function(d) {
	      		var xTranslate, yTranslate;

	      		if (d.before)
	      			xTranslate = 0;
	      		else
	      			xTranslate = self.glyphGroupWidth;

	      		yTranslate = event2Index[d.event] * self.heightOfGlyph;

	      		return "translate(" + xTranslate + ", " + yTranslate + ")";
	      	});

	    var pie = pieChartGroup.selectAll(".pie")
	    	.data(function(d) {
	    		return pie(d.values);
	    	})
	    	.enter()
	    	.append("g")
	    	.attr("class", "pie");

	    pie.append("path")
	    	.attr("d", arc)
	    	.style("fill", function(d) {
	    		var originalData = d3.select(this.parentNode).data()[0].data;

	    		return originalData.colour;
	    	});
	},
	translatePieGlyph: function(y, numberOfGlyphs) {
		var self = this;

		// translate the whole group
	    var heightOfGroup = self.heightOfGlyph * numberOfGlyphs;
	    var yTranslate = self.glyphMargin.top + y;

	    if (yTranslate + heightOfGroup > eventSummaryViewHeight - self.glyphMargin.bottom)
	    	yTranslate = eventSummaryViewHeight - self.glyphMargin.bottom - heightOfGroup;
	    
	    self.glyphGroupSvg
			.attr("transform", "translate(" + (self.firstColumnWidth + self.glyphMargin.left) + ", " + yTranslate + ")");
	},
	removePieGlyph: function() {
		var self = this;

		self.glyphGroupSvg.selectAll("*").remove();
	}
}