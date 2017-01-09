var AttributePointEventHandler = { // mostly for handling event edit behavior
	currentEventName: null,
	currentNumberOfEvents: null,
	currentPosition: null,
	isMax: null,

	isAdded: null,
	isFull: null,
	newEventColour: null,
	addButtonText: null,
	addButtonXTranslate: null,

	positionsToBeAddedOnAllClicked: [], // the position are used to construct events {position} is max in the network

	init: function(name, isMax) { // for defining the "states"
		var self = this;

		self.currentEventName = name + " in the network";
		self.currentNumberOfEvents = Object.keys(EventView.event2Index).length;

		self.currentPosition = name;
		self.isMax = isMax;
	},
	createEventEdit: function(name, isMax = false) {
		var self = this;

		// remove previous events
		EventView.eventEditSvg.selectAll("*").remove();

		// initialization
		self.init(name, isMax); // name is passed for eventName construction
		self.determineCurrentEventAddedColourAndFull();

		// draw the options if max
		if (isMax) self.createOptions();

		// draw circle, text and the add button
		self.createMainContent();
	},
	createOptions: function() {
		var self = this;

		EventView.eventEditSvg.append("text")
			.attr("x", 5)
			.attr("y", EventView.optionY)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("font-size", 14)
			.text("Option: ");

		// create max button
		var maxButton = EventView.eventEditSvg.append("g")
			.attr("class", "max-button")
			.attr("transform", "translate(" + 70 + ", " + EventView.optionY + ")")
			.attr("cursor", "pointer")
			.on("click", onClickMaxButton);

		var maxButtonSvgText = maxButton.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "central")
			.style("font-size", 15)
			.text("Max");

		var bbox = maxButtonSvgText[0][0].getBBox()
		maxButton.insert("rect", "text")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2)
			.style("rx", 5)
			.style("ry", 5)
			.style("fill", "#e5e5e5");

		// create all button
		var allButton = EventView.eventEditSvg.append("g")
			.attr("class", "all-button")
			.attr("transform", "translate(" + 105 + ", " + EventView.optionY + ")")
			.style("display", "none")
			.attr("cursor", "pointer")
			.on("click", onClickAllButton);

		var allButtonSvgText = allButton.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "central")
			.style("font-size", 15)
			.text("All");

		var bbox = allButtonSvgText[0][0].getBBox()
		allButton.insert("rect", "text")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2)
			.style("rx", 5)
			.style("ry", 5)
			.style("fill", "#e5e5e5");

		function onClickMaxButton() {
			// must update event text, circle add button
			if (!d3.select(this).classed("selected")) {
				// add the class
				d3.select(this).classed("selected", true);

				// hightlight the max button
				d3.select(this)
					.select("rect")
					.style("fill", "yellow");

				// show all button
				EventView.eventEditSvg.select(".all-button")
					.style("display", null);

				// update event text, circle and add button
				self.currentEventName = self.currentPosition + " is Max in the network";
				self.determineCurrentEventAddedColourAndFull();
				self.updateEventEdit();
			}
			else {
				// remove the class
				d3.select(this).classed("selected", false);

				// remove the hightlight of the max button
				d3.select(this)
					.select("rect")
					.style("fill", "#e5e5e5");

				// remove all button
				EventView.eventEditSvg.select(".all-button")
					.style("display", "none");

				// update event text, circle and add button
				self.currentEventName = self.currentPosition + " in the network";
				self.determineCurrentEventAddedColourAndFull();
				self.updateEventEdit();

				// * in case all is selected and max is unselected

				// remove the class
				EventView.eventEditSvg.select(".all-button")
					.classed("selected", false);

				// remove the hightlight of the all button
				EventView.eventEditSvg.select(".all-button")
					.select("rect")
					.style("fill", "#e5e5e5");

				// update current eventName and display it
				EventView.eventEditSvg.select(".event-colour")
					.style("fill", self.newEventColour);
			}
		}

		function onClickAllButton() {
			// must update event text, circle and add button
			if (!d3.select(this).classed("selected")) {
				// clean up the items in the position array (initialization)
				self.positionsToBeAddedOnAllClicked = [];

				// add the class
				d3.select(this)
					.classed("selected", true);

				// hightlight the all button
				d3.select(this)
					.select("rect")
					.style("fill", "yellow");

				// update current eventName and circle colour
				EventView.eventEditSvg.select(".event-name")
					.text("Event: {Position} is Max in the network");
				EventView.eventEditSvg.select(".event-colour")
					.style("fill", "white");

				// check if number of events will exceed the limit after adding
				// return a list of events which should be added on add button clicked
				// update the add button
				self.determineFullOnAllClicked();
			}
			else {
				// remove the class
				d3.select(this)
					.classed("selected", false);

				// remove the hightlight of the all button
				d3.select(this)
					.select("rect")
					.style("fill", "#e5e5e5");

				// update current event name, circle colour and add button
				self.determineCurrentEventAddedColourAndFull();
				self.updateEventEdit();
			}
		}
	},
	createMainContent: function() {
		var self = this;

		EventView.eventEditSvg.append("circle")
			.attr("class", "event-colour")
			.attr("r", 5)
			.attr("cx", 10)
			.attr("cy", EventView.eventY)
			.style("stroke", "black")
			.style("fill", self.newEventColour);

		EventView.eventEditSvg.append("text")
			.attr("class", "event-name")
			.attr("x", 25)
			.attr("y", EventView.eventY)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("font-size", 12)
			.text("Event: " + self.currentEventName);

		var addButton = EventView.eventEditSvg.append("g")
			.attr("class", "add-button")
			.attr("transform", "translate(" + self.addButtonXTranslate + ", " + EventView.eventY + ")")
			.attr("cursor", "pointer")
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

		function onClickAddButton() {
			if (!self.isFull && !self.isAdded) {
				var maxClicked = false, allClicked = false;

				if (self.isMax) {
					maxClicked = EventView.eventEditSvg.select(".max-button")
						.classed("selected");
					allClicked = EventView.eventEditSvg.select(".all-button")
						.classed("selected");
				}

				if (!maxClicked && !allClicked) {
					// register the new event
					EventView.event2Index[self.currentEventName] = EventView.nextEventIndex;
					EventView.updateNextEventIndex();

					// adding new event
					for (email in Database.attributeDict) {
						var positionArray = Database.attributeDict[email]; // array containing position contacted at each time

						for (var t = 0; t < positionArray.length; t++) {
							for (var i = 0; i < positionArray[t].length; i++) {
								var positionContacted = positionArray[t][i].position;

								if (positionContacted == self.currentPosition) {
									Database.appendEvent(self.currentEventName, positionArray[t][i].date, null, email);
									break; // the same postion appears only once at each time step
								}
							}
						}
					}

					// add the event to the view
					EventView.eventEditSvg.selectAll("*").remove();
					EventView.addEventToView(self.currentEventName);
				}
				else if (maxClicked && !allClicked) {
					// register the new event
					EventView.event2Index[self.currentEventName] = EventView.nextEventIndex;
					EventView.updateNextEventIndex();

					// adding new event
					for (email in Database.attributeDict) {
						var positionArray = Database.attributeDict[email];

						for (var t = 0; t < positionArray.length; t++) {
							for (var i = 0; i < positionArray[t].length; i++) {
								var maxFrequencyAtT = positionArray[t][0].frequency;

								if (positionArray[t][i].frequency == maxFrequencyAtT) {
									var maxPositionContacted = positionArray[t][i].position;

									if (maxPositionContacted == self.currentPosition) {
										Database.appendEvent(self.currentEventName, positionArray[t][i].date, null, email);
										break; // the same postion appears only once at each time step
									}
								}
							}
						}
					}

					// add the event to the view
					EventView.eventEditSvg.selectAll("*").remove();
					EventView.addEventToView(self.currentEventName);
				}
				else if (maxClicked && allClicked) {
					var eventNameList = [];

					for (var i = 0; i < self.positionsToBeAddedOnAllClicked.length; i++) {
						var currentPosition = self.positionsToBeAddedOnAllClicked[i];

						// register the new event
						self.currentEventName = currentPosition + " is Max in the network";
						eventNameList.push(self.currentEventName);
						EventView.event2Index[self.currentEventName] = EventView.nextEventIndex;
						EventView.updateNextEventIndex();

						// adding new event
						for (email in Database.attributeDict) {
							var positionArray = Database.attributeDict[email];

							for (var t = 0; t < positionArray.length; t++) {
								for (var j = 0; j < positionArray[t].length; j++) {
									var maxFrequencyAtT = positionArray[t][0].frequency;

									if (positionArray[t][j].frequency == maxFrequencyAtT) {
										var maxPositionContacted = positionArray[t][j].position;

										if (maxPositionContacted == currentPosition) {
											Database.appendEvent(self.currentEventName, positionArray[t][j].date, null, email);
											break; // the same postion appears only once at each time step
										}
									}
								}
							}
						}
					}

					// add the event to the view
					EventView.eventEditSvg.selectAll("*").remove();
					for (var i = 0; i < eventNameList.length; i++) {
						EventView.addEventToView(eventNameList[i]);
					}
				}

				// updating the events in the table view
				Table.updateEvents();
			}
		}
	},
	updateEventEdit: function() {
		var self = this;

		// update the text
		EventView.eventEditSvg.select(".event-name")
			.text("Event: " + self.currentEventName);

		// update the circle
		EventView.eventEditSvg.select(".event-colour")
			.style("fill", self.newEventColour);

		// update the add button
		var addButton = EventView.eventEditSvg.select(".add-button")
			.attr("transform", "translate(" + self.addButtonXTranslate + ", " + EventView.eventY + ")");

		var addButtonSvgText = addButton.select("text")
			.text(self.addButtonText);

		var bbox = addButtonSvgText[0][0].getBBox()
		EventView.eventEditSvg.select(".add-button rect")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2);
	},
	determineCurrentEventAddedColourAndFull: function() {
		var self = this;

		// determine if is added
		self.isAdded = self.currentEventName in EventView.event2Index;

		if (self.isAdded) {
			self.newEventColour = EventView.colours(EventView.event2Index[self.currentEventName]);
			self.addButtonText = "Added";
			self.addButtonXTranslate = eventViewWidth - 50;
		}
		else {
			self.newEventColour = EventView.colours(EventView.nextEventIndex);
			self.addButtonText = "Add";
			self.addButtonXTranslate = eventViewWidth - 40;
		}

		// determine if is full or will be full
		var isFullAlready = self.currentNumberOfEvents >= EventView.maxNumberOfEvents;

		if (isFullAlready) {
			self.newEventColour = EventView.colours(EventView.maxNumberOfEvents);
			self.addButtonText = "Full";
			self.addButtonXTranslate = eventViewWidth - 40;
			self.isFull = true;
		}
		else {
			self.isFull = false;
		}
	},
	determineFullOnAllClicked: function() { // a special treatment only for selecting all button
		var self = this;

		// determine if the number of event exceeds limit after adding
		// construct an array of events to be added for adding later
		var positionList = Object.keys(Database.position2Index);
		var currentEventList = Object.keys(EventView.event2Index);

		for (var i = 0; i < positionList.length; i++) {
			var eventName = positionList[i] + " is Max in the network";

			if ($.inArray(eventName, currentEventList) == -1) // event not added
				self.positionsToBeAddedOnAllClicked.push(positionList[i]);
		}

		// change the state depending on if limit will be exceed
		var willExceedLimitAfterAdding = self.positionsToBeAddedOnAllClicked.length + self.currentNumberOfEvents > EventView.maxNumberOfEvents;

		if (willExceedLimitAfterAdding) {
			self.addButtonText = "Full";
			self.addButtonXTranslate = eventViewWidth - 40;
			self.isFull = true;
		}
		else {
			self.addButtonXTranslate = eventViewWidth - 40;
			self.isFull = false;
			self.isAdded = false;
			self.addButtonText = "Add";
		}

		// update the add button
		var addButton = EventView.eventEditSvg.select(".add-button")
			.attr("transform", "translate(" + self.addButtonXTranslate + ", " + EventView.eventY + ")");

		var addButtonSvgText = addButton.select("text")
			.text(self.addButtonText);

		var bbox = addButtonSvgText[0][0].getBBox()
		EventView.eventEditSvg.select(".add-button rect")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2);
	}
}