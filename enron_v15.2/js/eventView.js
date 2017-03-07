var EventView = { // mostly for handling main event panel
	margin: { top: 30, left: 10, bottom: 10, right: 10 },

	eventPanelSvg: null,
	eventEditSvg: null,
	eventPanelHeight: 280,
	eventEditHeight: 150,
	eventEditHeightMinusPadding: null,
	eventEditWidthMinusPadding: null,
	eventEditStrokeWidth: 15,

	maxNumberOfEvents: 9,
	event2Index: {}, // for determining the colour of an event
	colours: d3.scale.category10(),

	nextY: 5,
	nextEventIndex: 0,

	eventY: null,
	optionY: null,
	firstRowY: null,
	secondRowY: null,

	// for handling event combinations
	eventCombinationNextX: 20, // needs to be updated
	numberOfEventCombined: 0, // needs to be updated
	eventCombinationY: 30,
	maxEventCombination: 5,
	paddingBetweenEvents: null,

	// for managing event edit
	currentEventName: null,
	isInterval: null,
	
	isAdded: null,
	isFull: null,
	newEventColour: null,
	addButtonXTranslate: null,
	addButtonText: null,

	init: function() {
		var self = this;

		self.eventY = self.eventEditHeight - 50;
		self.optionY = self.eventEditHeight - 80;
		self.firstRowY = self.eventEditHeight - 128;
		self.secondRowY = self.eventEditHeight - 95;
		self.eventEditWidthMinusPadding = eventViewWidth - self.margin.left - self.margin.right;
		self.eventEditHeightMinusPadding = self.eventEditHeight - self.margin.top - self.margin.bottom;
		self.paddingBetweenEvents = (self.eventEditWidthMinusPadding - self.eventCombinationNextX * 2) / (self.maxEventCombination - 1);

		// event panel
		self.eventPanelSvg = d3.select("#event-editor")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");
		self.eventPanelSvg.append("text")
			.attr("x", 0)
			.attr("y", -15)
			.style("font-weight", "bold")
			.text("Event Categories");

		// event edit
		self.eventEditSvg = d3.select("#event-editor")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + (self.eventPanelHeight + self.margin.top) + ")");
		self.eventEditSvg.append("rect")
			.attr("id", "event-edit-highlight")
			.attr("x", 0)
			.attr("y", -self.eventEditStrokeWidth * 2)
			.attr("width", self.eventEditWidthMinusPadding - 3)
			.attr("height", self.eventEditHeightMinusPadding + self.eventEditStrokeWidth * 2)
			.style("fill", "none")
			.style("stroke", "none")
			.style("stroke-width", self.eventEditStrokeWidth);
		self.eventEditSvg.append("text")
			.attr("x", 0)
			.attr("y", -self.eventEditStrokeWidth)
			.style("font-weight", "bold")
			.text("Event Editor");
	},
	addEventToView: function() {
		var self = this;
		
		var radius = 5;
		var className = self.currentEventName.split(" ").join("-");
		var tagWidth = eventViewWidth - self.margin.left - self.margin.right;
		var tagHeight = radius * 4 + 2;

		var eventGroup = self.eventPanelSvg.append("g")
			.attr("class", function() {
				return "event-tag " + className;
			})
			.attr("name", self.currentEventName)
			.attr("cursor", "pointer")
			.attr("transform", "translate(0, " + self.nextY + ")")
			.on("mouseenter", onMouseEnterEventTag)
			.on("mouseleave", onMouseLeaveEventTag)
			.on("dblclick", onDBLClickEventTag);

		// create a rectangle for hovering
		eventGroup.append("rect")
			.attr("width", tagWidth)
			.attr("height", tagHeight)
			.attr("x", 0)
			.attr("y", -tagHeight / 2)
			.style("rx", 5)
			.style("ry", 5)
			.style("fill", "white");

		// create the instruction text
		eventGroup.append("text")
			.attr("class", "instruction-text")
			.attr("x", tagWidth / 2)
			.attr("y", -7)
			.style("text-anchor", "middle")
			.style("fill", "gray")
			.style("display", "none")
			.text("Double click to remove");

		// create the real content
		if (!self.isInterval) {
			eventGroup.append("circle")
				.attr("class", "event-symbol")
				.attr("r", radius)
				.attr("cx", 10)
				.attr("cy", 0)
				.style("fill", self.colours(self.event2Index[self.currentEventName]))
				.style("stroke", "black");
		}
		else {
			eventGroup.append("rect")
				.attr("class", "event-symbol")
				.attr("x", 10 - radius)
				.attr("y", 0 - radius)
				.attr("width", radius * 2)
				.attr("height", radius * 2)
				.style("fill", self.colours(self.event2Index[self.currentEventName]))
				.style("stroke", "black");

			// only allow drag for interval events
			var dragEventTag = d3.behavior.drag()
				.on("dragstart", onDragStartEventTag)
				.on("drag", onDragEventTag)
				.on("dragend", onDragEndEventTag);

			eventGroup.call(dragEventTag);
		}
		
		eventGroup.append("text")
			.attr("x", 25)
			.attr("y", 0)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("font-size", 12)
			.text(self.currentEventName);

		self.nextY += tagHeight;

		function onMouseEnterEventTag() {
			d3.select(this)
				.select("rect")
				.style("fill", "#FFFFEE");

			d3.select(this)
				.selectAll(".instruction-text")
				.style("display", null);

			// highlight event editor
			if (!d3.select(this).select("rect.event-symbol").empty()) {
				self.eventEditSvg.append("text")
				.attr("class", "instruction-text")
				.attr("x", self.eventEditWidthMinusPadding / 2)
				.attr("y", -30)
				.text("Drag into event editor to combine")
				.style("fill", "gray")
				.style("text-anchor", "middle")
				.style("alignment-baseline", "central");

				self.eventEditSvg.select("#event-edit-highlight")
					.style("stroke", "#FFFFEE");
			}
		}

		function onMouseLeaveEventTag() {
			d3.select(this)
				.select("rect")
				.style("fill", "white");

			d3.select(this)
				.selectAll(".instruction-text")
				.style("display", "none");

			// remove highlight in event editor
			self.eventEditSvg.selectAll(".instruction-text").remove();
			self.eventEditSvg.select("#event-edit-highlight").style("stroke", "none");
		}

		function onDBLClickEventTag() {
			var eventName = d3.select(this).attr("name");
			var newEvents = [];

			for (var i = 0; i < Database.events.length; i++) {
				if (Database.events[i].name != eventName)
					newEvents.push(Database.events[i]);
			}

			// remove events
			Database.events = newEvents;
			delete self.event2Index[eventName];
			self.updateNextEventIndex();

			// remove the tag and shift the tag below up
			var removedTagTranslateY = d3.transform(d3.select(this).attr("transform")).translate[1];

			d3.select(this).remove();

			d3.selectAll(".event-tag")
				.each(function() {
					var currentTranslateY = d3.transform(d3.select(this).attr("transform")).translate[1];

					if (currentTranslateY > removedTagTranslateY) {
						currentTranslateY -= tagHeight;
						d3.select(this)
							.transition()
							.attr("transform", "translate(0, " + currentTranslateY + ")")
					}
				});

			self.nextY -= tagHeight;

			// update event edit if needed (may change from full/ added to add)
			if (self.currentEventName) { // if there is something in the event view
				var isAllSelected = false;
				if (!EventView.eventEditSvg.select(".all-button").empty())
					isAllSelected = EventView.eventEditSvg.select(".all-button").classed("selected");

				if (isAllSelected) { // special case
					AttributePointEventHandler.determineFullOnAllClicked();
				}
				else {
					self.determineCurrentEventAddedColourAndFull();
					self.updateEventEdit();
				}
			}
			
			// update
			Table.updateEvents();
			ComparisonHandler.updateListOfSimialarGraphs();
			EventSummaryView.updateBarChart();
		}

		function onDragStartEventTag() {
			var x = d3.select(this).select(".event-symbol").attr("x");
			var y = d3.select(this).select(".event-symbol").attr("y");
			var width = d3.select(this).select(".event-symbol").attr("width");
			var height = d3.select(this).select(".event-symbol").attr("height");
			var fill = d3.select(this).select(".event-symbol").style("fill")
			var translate = d3.select(this).attr("transform");

			self.eventPanelSvg.append("rect")
				.attr("class", "duplicate-event-symbol")
				.attr("x", x)
				.attr("y", y)
				.attr("width", width)
				.attr("height", height)
				.attr("transform", translate)
				.style("fill", fill)
				.style("cursor", "pointer")
				.style("stroke", "black");
		}

		function onDragEventTag() {
			var x = d3.mouse(this)[0];
			var y = d3.mouse(this)[1];
			var width = d3.select(this).select(".event-symbol").attr("width");
			var height = d3.select(this).select(".event-symbol").attr("height");

			self.eventPanelSvg.select(".duplicate-event-symbol")
				.attr("x", x - width / 2)
				.attr("y", y - height / 2);

			// if the editor is not hightlighted, highlight it
			if (self.eventEditSvg.select(".instruction-text").empty()) {
				self.eventEditSvg.append("text")
					.attr("class", "instruction-text")
					.attr("x", self.eventEditWidthMinusPadding / 2)
					.attr("y", -30)
					.text("Drag into event editor to combine")
					.style("fill", "gray")
					.style("text-anchor", "middle")
					.style("alignment-baseline", "central");

				self.eventEditSvg.select("#event-edit-highlight")
						.style("stroke", "yellow");
			}
		}

		function onDragEndEventTag() {
			var y = d3.mouse(this)[1];
			var targetY = self.eventPanelHeight - d3.transform(d3.select(this).attr("transform")).translate[1] - self.margin.top;

			if (y > targetY) {
				// add the symbol to event editor
				if (self.numberOfEventCombined < self.maxEventCombination) {
					var width = d3.select(this).select(".event-symbol").attr("width");
					var height = d3.select(this).select(".event-symbol").attr("height");
					var fill = d3.select(this).select(".event-symbol").style("fill");
					var name = d3.select(this).attr("name");

					// remove contents in event view
					// add the event tag
					if (self.numberOfEventCombined == 0) {
						self.removeEventEdit();
						self.storeEventName("Combined interval event")
						self.determineCurrentEventAddedColourAndFull();
						self.addEventTagToEventEdit(addEventToDatabase, true);

						self.eventEditSvg.select(".add-button")
							.style("display", "none");
					}

					// draw symbol
					var dragCombinedEventSymbol = d3.behavior.drag()
						.on("dragstart", onDragStartCombinedEventSymbol)
						.on("drag", onDragCombinedEventSymbol)
						.on("dragend", onDragEndCombinedEventSymbol);

					self.eventEditSvg.append("rect")
						.attr("class", "combined-event")
						.attr("x", self.eventCombinationNextX - width / 2)
						.attr("y", self.eventCombinationY)
						.attr("height", height)
						.attr("width", width)
						.attr("name", name)
						.style("fill", fill)
						.style("stroke", "black")
						.style("cursor", "pointer")
						.on("mouseover", onMouseOverCombinedEventSymbol)
						.on("mouseout", onMouseOutCombinedEventSymbol)
						.call(dragCombinedEventSymbol);

					// add the number of time periods in between
					if (self.numberOfEventCombined > 0) {
						self.eventEditSvg.select(".add-button")
							.style("display", null);

						self.eventEditSvg.append("text")
							.attr("class", "combined-event-interval")
							.attr("x", self.eventCombinationNextX - self.paddingBetweenEvents / 2)
							.attr("y", self.eventCombinationY + height / 2)
							.style("text-anchor", "middle")
							.style("alignment-baseline", "central")
							.style("cursor", "pointer")
							.text("<= 0 month")
							.on("click", onClickIntervalText);
					}

					// change the next x position
					self.eventCombinationNextX += self.paddingBetweenEvents;
					self.numberOfEventCombined++;
				}
			}

			// remove the visual elements
			self.eventPanelSvg.select(".duplicate-event-symbol").remove();
			self.eventEditSvg.selectAll(".instruction-text").remove();
			self.eventEditSvg.select("#event-edit-highlight").style("stroke", "none");

			function onClickIntervalText() {
				var textNode = this;
				var width = this.getBBox().width;
				var text = d3.select(this).text().split(" ")[1];

				var x = parseFloat(d3.select(this).attr("x")) - width / 2;
				var y = parseFloat(d3.select(this).attr("y")) - 5; // hacky way of alignment, font-size = 10

				self.createTextEdit(x, y, width, text, function(textInput) {
					var newText = "";
					var month = parseInt(textInput);

					if (month == 0 || month == 1)
						newText = "<= " + month + " month"
					else if (month > 1 && month <= 23)
						newText = "<= " + month + " months";
					else
						newText = d3.select(textNode).text();

					// change text
					d3.select(textNode).text(newText);
				});
			}

			function addEventToDatabase() {
				// retrieve event name and the interval in between
				var eventsToBeCombined = [];
				var intervalsBetweenEvents = [];

				self.eventEditSvg.selectAll(".combined-event")
					.each(function() {
						eventsToBeCombined.push(d3.select(this).attr("name"));
					});
				self.eventEditSvg.selectAll(".combined-event-interval")
					.each(function() {
						var interval = parseInt(d3.select(this).text().split(" ")[1]);
						intervalsBetweenEvents.push(interval);
					});

				// create combined events
				var eventsByEmailAndName = d3.nest()
					.key(function(d) { return d.email; })
					.key(function(d) { return d.name; })
					.key(function(d) { return d.startDate; })
					.map(Database.events);

				for (var email in eventsByEmailAndName) {
					for (var startDate in eventsByEmailAndName[email][eventsToBeCombined[0]]) {
						var currentAnchorRecord = eventsByEmailAndName[email][eventsToBeCombined[0]][startDate][0]; // no overlapping, safe to use [0]
						var currentAnchorRecordEndDate = currentAnchorRecord.endDate;
						var checkingEventIndex = 1;
						var checkingEvent = eventsToBeCombined[checkingEventIndex];

						var parseDate = d3.time.format("%Y-%m").parse;
						var lastTimeStep = Database.networkDict[Database.emailList[0]][Database.numberOfTimeSteps - 1].date;
						var currentDate = parseDate(currentAnchorRecordEndDate);
						var stopDate = parseDate(currentAnchorRecordEndDate);
						stopDate = new Date(stopDate.setMonth(stopDate.getMonth() + intervalsBetweenEvents[0]));
						var lastDate = parseDate(lastTimeStep);
						var startDateListOfCheckingEvent;
						var eventCombinationCount = 1;

						// the currently checking event may not exist in a person's event list
						if (checkingEvent in eventsByEmailAndName[email])
							startDateListOfCheckingEvent = Object.keys(eventsByEmailAndName[email][checkingEvent]);
						else
							break;

						// check if the start date list contains the current end date
						while (currentDate <= lastDate) {
							// not found
							if (currentDate > stopDate)
								break;

							// get currentDate string
							var year = currentDate.getYear() + 1900;
							var month = currentDate.getMonth() + 1;
							if (month < 10)
								month = "0" + month.toString();
							else
								month = month.toString();
							var currentDateString = year + "-" + month;

							// target found, update current date, stop date, currentEvent and start date list
							if ($.inArray(currentDateString, startDateListOfCheckingEvent) != -1) {
								// store the found combination if needed
								currentAnchorRecord = eventsByEmailAndName[email][checkingEvent][currentDateString][0]; // no overlapping, safe to use [0]
								currentAnchorRecordEndDate = currentAnchorRecord.endDate;
								eventCombinationCount++;

								if (eventCombinationCount == eventsToBeCombined.length) {
									Database.appendEvent(self.currentEventName, startDate, currentAnchorRecordEndDate, email);
									break;
								}

								// update others
								checkingEventIndex++;
								checkingEvent = eventsToBeCombined[checkingEventIndex];

								currentDate = parseDate(currentAnchorRecordEndDate);
								stopDate = parseDate(currentAnchorRecordEndDate);
								stopDate = new Date(stopDate.setMonth(stopDate.getMonth() + intervalsBetweenEvents[eventCombinationCount - 1]));
								
								if (checkingEvent in eventsByEmailAndName[email])
									startDateListOfCheckingEvent = Object.keys(eventsByEmailAndName[email][checkingEvent]);
								else
									break;

								// current date updated already, don't update currentDate again
								continue;
							}
							
							currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
						}
					}
				}

				return [self.currentEventName]; // only added one event
			}

			function onMouseOverCombinedEventSymbol() {
				// add instruction
				self.eventEditSvg.append("text")
					.attr("class", "instruction-text")
					.attr("x", self.eventEditWidthMinusPadding / 2)
					.attr("y", -self.eventEditStrokeWidth * 2)
					.text("Drag out of event editor to remove")
					.style("fill", "gray")
					.style("text-anchor", "middle")
					.style("alignment-baseline", "central");

				// highlight the box
				self.eventEditSvg.select("#event-edit-highlight")
					.style("stroke", "#FFFFEE");
			}

			function onMouseOutCombinedEventSymbol() {
				// remove instruction and highlight
				self.eventEditSvg.selectAll(".instruction-text").remove();
				self.eventEditSvg.select("#event-edit-highlight").style("stroke", "none");
			}

			function onDragStartCombinedEventSymbol() {
				var originalX = d3.select(this).attr("x");

				d3.select(this)
					.attr("original-x", originalX);
			}

			function onDragCombinedEventSymbol() {
				var x = d3.mouse(this)[0];
				var y = d3.mouse(this)[1];
				var width = d3.select(this).attr("width");
				var height = d3.select(this).attr("height");

				d3.select(this)
					.attr("x", x - width / 2)
					.attr("y", y - height / 2);

				if (self.eventEditSvg.selectAll(".instruction-text").empty())
					self.eventEditSvg.append("text")
					.attr("class", "instruction-text")
					.attr("x", self.eventEditWidthMinusPadding / 2)
					.attr("y", -self.eventEditStrokeWidth * 2)
					.text("Drag out of event editor to remove")
					.style("fill", "gray")
					.style("text-anchor", "middle")
					.style("alignment-baseline", "central");
				if (self.eventEditSvg.select("#event-edit-highlight").style("stroke") != "yellow")
					self.eventEditSvg.select("#event-edit-highlight").style("stroke", "yellow");
			}

			function onDragEndCombinedEventSymbol() {
				var y = d3.mouse(this)[1];
				var symbolWidth = parseInt(d3.select(this).attr("width"));
				var thisSymbolOriginalX = parseInt(d3.select(this).attr("original-x"));
				var previousSymbolOriginalX = -999;
				var maxX = -999;

				if (y > -self.eventEditStrokeWidth * 2) { // rectangle translate by -self.eventEditStrokeWidth * 2
					// restore original position
					d3.select(this)
						.attr("x", thisSymbolOriginalX)
						.attr("y", self.eventCombinationY);
				}
				else {
					// remove combined-event
					d3.select(this).remove();

					// shift other symbols
					d3.selectAll(".combined-event")
						.each(function() {
							var currentSymbolX = parseInt(d3.select(this).attr("x"));

							// for removing interval
							if (currentSymbolX < thisSymbolOriginalX && currentSymbolX > previousSymbolOriginalX)
								previousSymbolOriginalX = currentSymbolX;

							// shift
							if (currentSymbolX > thisSymbolOriginalX) {
								d3.select(this)
									.transition()
									.attr("x", currentSymbolX - self.paddingBetweenEvents);

								currentSymbolX = currentSymbolX - self.paddingBetweenEvents;
							}							

							// determine maxX for restoring eventCombinationNextX
							if (currentSymbolX > maxX)
								maxX = currentSymbolX;
						});

					// remove combined-event interval
					// if previousSymbolOriginalX == -999, the leftmost one was removed, no interval is removed
					if (previousSymbolOriginalX != -999) {
						d3.selectAll(".combined-event-interval")
							.each(function() {
								var currentIntervalX = parseInt(d3.select(this).attr("x"));

								if (currentIntervalX > previousSymbolOriginalX && currentIntervalX < thisSymbolOriginalX) {
									d3.select(this).remove();
								}
								else if (currentIntervalX > thisSymbolOriginalX) {
									// shift the ones to the right
									d3.select(this)
										.transition()
										.attr("x", currentIntervalX - self.paddingBetweenEvents)
								}
							});
					}
					else {
						// remove first one and shift the others
						d3.select(".combined-event-interval").remove();

						d3.selectAll(".combined-event-interval")
							.each(function() {
								var currentIntervalX = parseInt(d3.select(this).attr("x"));

								d3.select(this)
									.transition()
									.attr("x", currentIntervalX - self.paddingBetweenEvents);
							});
					}

					// restore parameters
					self.eventCombinationNextX = maxX + symbolWidth / 2 + self.paddingBetweenEvents;
					self.numberOfEventCombined--;
				}

				// remove instruction and highlight
				self.eventEditSvg.selectAll(".instruction-text").remove();
				self.eventEditSvg.select("#event-edit-highlight").style("stroke", "none");
			}
		}
	},
	updateNextEventIndex: function() { // should be called every time event2Index changes
		var self = this;

		// some events in the middle from 0 to 6 may be deleted, need to fill in the gap
		var isFilledArray = [];
		for (var i = 0; i < self.maxNumberOfEvents; i++)
			isFilledArray.push(false);

		for (event in self.event2Index)
			isFilledArray[self.event2Index[event]] = true;

		for (var i = 0; i < isFilledArray.length; i++) {
			if (isFilledArray[i] == false) {
				self.nextEventIndex = i;
				break;
			}
		}
	},
	addEventTagToEventEdit: function(addEventToDatabase, isInterval) {
		var self = this;

		if (!self.isInterval) {
			// draw circle
			self.eventEditSvg.append("circle")
				.attr("class", "event-colour")
				.attr("r", 5)
				.attr("cx", 10)
				.attr("cy", self.eventY)
				.style("stroke", "black")
				.style("fill", self.newEventColour);
		}
		else {
			// draw rect
			self.eventEditSvg.append("rect")
				.attr("class", "event-colour")
				.attr("width", 10)
				.attr("height", 10)
				.attr("x", 10 - 5)
				.attr("y", self.eventY - 5)
				.style("stroke", "black")
				.style("fill", self.newEventColour);
		}

		// draw text
		self.eventEditSvg.append("text")
			.attr("class", "event-name")
			.attr("x", 25)
			.attr("y", self.eventY)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("font-size", 12)
			.style("cursor", "pointer")
			.text(self.currentEventName)
			.on("click", onClickText);

		// draw button
		var addButton = self.eventEditSvg.append("g")
			.attr("class", "add-button")
			.attr("transform", "translate(" + self.addButtonXTranslate + ", " + self.eventY + ")")
			.style("cursor", "pointer")
			.on("click", onClickAddButton);

		var addButtonSvgText = addButton.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "central")
			.style("font-size", 15)
			.text(self.addButtonText);

		var bbox = addButtonSvgText[0][0].getBBox()
		addButton.insert("rect", "text")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2)
			.style("rx", 5)
			.style("ry", 5)
			.style("fill", "#e5e5e5");

		function onClickText() {
			var x = 25;
			var y = self.eventY - 6; // hacky way of alignment, font-size = 12
			var width = eventViewWidth - self.margin.right - self.margin.left - 100;
			var text = self.currentEventName;

			self.createTextEdit(x, y, width, text, function(textInput) {
				self.eventEditSvg.select("text.event-name").text(textInput);
				self.storeEventName(textInput);
			});
		}

		function onClickAddButton() {
			if (!self.isFull && !self.isAdded) {
				var eventsAddedToDatabase = addEventToDatabase();

				for (var i = 0; i < eventsAddedToDatabase.length; i++) {
					self.currentEventName = eventsAddedToDatabase[i];
					self.registerNewEvent();
					self.addEventToView();
				}

				EventSummaryView.updateBarChart();
				ComparisonHandler.updateListOfSimialarGraphs();
				self.removeEventEdit();
				Table.updateEvents();
			}
		}
	},
	updateEventEdit: function() {
		var self = this;

		// update the text
		self.eventEditSvg.select(".event-name")
			.text(self.currentEventName);

		// update the circle
		self.eventEditSvg.select(".event-colour")
			.style("fill", self.newEventColour);

		// update the add button
		var addButton = self.eventEditSvg.select(".add-button")
			.attr("transform", "translate(" + self.addButtonXTranslate + ", " + self.eventY + ")");

		var addButtonSvgText = addButton.select("text")
			.text(self.addButtonText);

		var bbox = addButtonSvgText[0][0].getBBox()
		self.eventEditSvg.select(".add-button rect")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2);
	},
	removeEventEdit: function() {
		var self = this;

		self.eventEditSvg.selectAll("*").remove();
		self.currentEventName = null; // no event in the view!
		self.brush = {};

		// reset them (may change from combining some events to adding interval event, next time adding bug)
		self.eventCombinationNextX = 20;
		self.numberOfEventCombined = 0;

		// add the title and highlight rect back
		self.eventEditSvg.append("rect")
			.attr("id", "event-edit-highlight")
			.attr("x", 0)
			.attr("y", -self.eventEditStrokeWidth * 2)
			.attr("width", self.eventEditWidthMinusPadding - 3)
			.attr("height", self.eventEditHeightMinusPadding + self.eventEditStrokeWidth * 2)
			.style("fill", "none")
			.style("stroke", "none")
			.style("stroke-width", self.eventEditStrokeWidth);
		self.eventEditSvg.append("text")
			.attr("x", 0)
			.attr("y", -self.eventEditStrokeWidth)
			.style("font-weight", "bold")
			.text("Event Editor");
	},
	determineCurrentEventAddedColourAndFull: function() {
		var self = this;

		// determine if is added
		self.isAdded = self.currentEventName in self.event2Index;

		if (self.isAdded) {
			self.newEventColour = self.colours(self.event2Index[self.currentEventName]);
			self.addButtonText = "Added";
			self.addButtonXTranslate = eventViewWidth - 50;
		}
		else {
			self.newEventColour = self.colours(self.nextEventIndex);
			self.addButtonText = "Add";
			self.addButtonXTranslate = eventViewWidth - 40;
		}

		// determine if is full or will be full
		var currentNumberOfEvents = Object.keys(self.event2Index).length;
		var isFullAlready = currentNumberOfEvents >= self.maxNumberOfEvents;

		if (isFullAlready) {
			self.newEventColour = self.colours(self.maxNumberOfEvents);
			self.addButtonText = "Full";
			self.addButtonXTranslate = eventViewWidth - 40;
			self.isFull = true;
		}
		else {
			self.isFull = false;
		}
	},
	storeEventName: function(newEventName) { // for checking if the event name is duplicated
		var self = this;

		// find the max event id for the event with the same name
		var maxEventID = -1;
		var currentEventList = Object.keys(EventView.event2Index);
		
		for (var i = 0; i < currentEventList.length; i++) {
			// found, get the id of that event
			var foundIndex = currentEventList[i].indexOf(newEventName);
			if (foundIndex != -1) {
				if (currentEventList[i].indexOf("#") == -1) { // not found
					maxEventID = 1;
				}
				else {
					var eventID = parseInt(currentEventList[i].split("#")[1]);
					if (eventID > maxEventID)
						maxEventID = eventID;
				}
			}
		}

		// append event id to the event name
		if (maxEventID == -1) // not found
			EventView.currentEventName = newEventName;
		else
			EventView.currentEventName = newEventName + " #" + (maxEventID + 1);
	},
	createTextEdit: function(x, y, width, text, useTextInput) {
		var self = this;

		var textInput;

		// create text edit div
		var textEditDiv = self.eventEditSvg.append("foreignObject")
			.attr("width", width)
			.attr("height", "100%")
			.attr("transform", "translate(" + x + "," + y + ")")
			.append("xhtml:body")
			.style("margin", "0px")
			.append("div")
			.attr("contentEditable", true)
			.attr("width", "auto")
			.style("font-size", "12px")
			.style("background-color", "white")
			.text(text);

		// height the text on click
		var range = document.createRange();
	    range.selectNodeContents(textEditDiv[0][0]);
	    var sel = window.getSelection();
	    sel.removeAllRanges();
	    sel.addRange(range);
		textEditDiv[0][0].focus();

		textEditDiv
			.on("keydown", function() { // on enter the name
				if (d3.event.keyCode == 13) {
					// change the current text and currentEventName
					var textInput = d3.select(this).text();
					useTextInput(textInput);

					// upon removal, blur is called again to cause error
					// remove both blur and text edit
					d3.select(this).on("blur", null);
					d3.select(this.parentNode.parentNode).remove();
				}
			})
			.on("blur", function() { // remove text edit on blur
				d3.select(this.parentNode.parentNode).remove();
			});
	},
	registerNewEvent: function() {
		var self = this;

		self.event2Index[self.currentEventName] = self.nextEventIndex;
		self.updateNextEventIndex();
	}
}