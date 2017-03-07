var AttributePointEventHandler = { // mostly for handling event edit behavior
	currentPosition: null,
	isMax: null,

	positionsToBeAddedOnAllClicked: [], // the position are used to construct events {position} appears the most in the network

	init: function(name, parameters) { // for defining the "states"
		var self = this;

		// remove the previous widgets
		EventView.removeEventEdit();

		// initialization
		self.currentPosition = name;
		self.isMax = parameters.isMax;

		EventView.isInterval = false;
		EventView.currentEventName = name + " in the network";
		EventView.determineCurrentEventAddedColourAndFull();
	},
	createEventEdit: function(name, parameters) {
		var self = this;

		// initialization
		self.init(name, parameters); // name is passed for eventName construction

		// draw the options if max
		if (self.isMax) self.createOptions();

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
				EventView.currentEventName = self.currentPosition + " appears the most in the network";
				EventView.determineCurrentEventAddedColourAndFull();
				EventView.updateEventEdit();
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
				EventView.currentEventName = self.currentPosition + " in the network";
				EventView.determineCurrentEventAddedColourAndFull();
				EventView.updateEventEdit();

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
					.style("fill", EventView.newEventColour);
			}
		}

		function onClickAllButton() {
			// must update event text, circle and add button
			if (!d3.select(this).classed("selected")) {
				// add the class
				d3.select(this)
					.classed("selected", true);

				// hightlight the all button
				d3.select(this)
					.select("rect")
					.style("fill", "yellow");

				// update current eventName and circle colour
				EventView.eventEditSvg.select(".event-name")
					.text("{Position} appears the most in the network");
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
				EventView.determineCurrentEventAddedColourAndFull();
				EventView.updateEventEdit();
			}
		}
	},
	createMainContent: function() {
		var self = this;

		EventView.addEventTagToEventEdit(addEventToDatabase, false);

		function addEventToDatabase() {
			var maxClicked = false, allClicked = false;

			if (self.isMax) {
				maxClicked = EventView.eventEditSvg.select(".max-button")
					.classed("selected");
				allClicked = EventView.eventEditSvg.select(".all-button")
					.classed("selected");
			}

			// adding new event (a position is in the network)
			var eventsAddedToDatabase = [];

			if (!maxClicked && !allClicked) {
				// storing the event added
				eventsAddedToDatabase.push(EventView.currentEventName);

				// adding new event
				for (email in Database.attributeDict) {
					var positionArray = Database.attributeDict[email]; // array containing position contacted at each time

					for (var t = 0; t < positionArray.length; t++) {
						for (var i = 0; i < positionArray[t].length; i++) {
							var positionContacted = positionArray[t][i].position;

							if (positionContacted == self.currentPosition) {
								Database.appendEvent(EventView.currentEventName, positionArray[t][i].date, null, email);
								break; // the same postion appears only once at each time step
							}
						}
					}
				}
			}

			// adding new event (a position appears the most in the network)
			else if (maxClicked && !allClicked) {
				// storing the event added
				eventsAddedToDatabase.push(EventView.currentEventName);

				// adding new event
				for (email in Database.attributeDict) {
					var positionArray = Database.attributeDict[email];

					for (var t = 0; t < positionArray.length; t++) {
						for (var i = 0; i < positionArray[t].length; i++) {
							var maxFrequencyAtT = positionArray[t][0].frequency;

							if (positionArray[t][i].frequency == maxFrequencyAtT) {
								var maxPositionContacted = positionArray[t][i].position;

								if (maxPositionContacted == self.currentPosition) {
									Database.appendEvent(EventView.currentEventName, positionArray[t][i].date, null, email);
									break; // the same postion appears only once at each time step
								}
							}
						}
					}
				}
			}

			// adding new events ({position} appears the most in the network)
			else if (maxClicked && allClicked) {
				for (var i = 0; i < self.positionsToBeAddedOnAllClicked.length; i++) {
					// storing the events added
					var currentPosition = self.positionsToBeAddedOnAllClicked[i];
					EventView.currentEventName = currentPosition + " appears the most in the network";
					eventsAddedToDatabase.push(EventView.currentEventName);

					// adding new event
					for (email in Database.attributeDict) {
						var positionArray = Database.attributeDict[email];

						for (var t = 0; t < positionArray.length; t++) {
							for (var j = 0; j < positionArray[t].length; j++) {
								var maxFrequencyAtT = positionArray[t][0].frequency;

								if (positionArray[t][j].frequency == maxFrequencyAtT) {
									var maxPositionContacted = positionArray[t][j].position;

									if (maxPositionContacted == currentPosition) {
										Database.appendEvent(EventView.currentEventName, positionArray[t][j].date, null, email);
										break; // the same postion appears only once at each time step
									}
								}
							}
						}
					}
				}
			}

			return eventsAddedToDatabase;
		}
	},
	determineFullOnAllClicked: function() { // a special treatment only for selecting all button
		var self = this;

		// determine if the number of event exceeds limit after adding
		// construct an array of events to be added for adding later
		var positionList = Object.keys(Database.position2Index);
		var currentEventList = Object.keys(EventView.event2Index);
		self.positionsToBeAddedOnAllClicked = [];
		
		for (var i = 0; i < positionList.length; i++) {
			var eventName = positionList[i] + " appears the most in the network";

			if ($.inArray(eventName, currentEventList) == -1) // event not added
				self.positionsToBeAddedOnAllClicked.push(positionList[i]);
		}

		// change the state depending on if limit will be exceed
		var currentNumberOfEvents = Object.keys(EventView.event2Index).length;
		var willExceedLimitAfterAdding = self.positionsToBeAddedOnAllClicked.length + currentNumberOfEvents > EventView.maxNumberOfEvents;

		if (willExceedLimitAfterAdding) {
			EventView.addButtonText = "Full";
			EventView.addButtonXTranslate = eventViewWidth - 40;
			EventView.isFull = true;
		}
		else {
			EventView.addButtonXTranslate = eventViewWidth - 40;
			EventView.isFull = false;
			EventView.isAdded = false;
			EventView.addButtonText = "Add";
		}

		// update the add button
		var addButton = EventView.eventEditSvg.select(".add-button")
			.attr("transform", "translate(" + EventView.addButtonXTranslate + ", " + EventView.eventY + ")");

		var addButtonSvgText = addButton.select("text")
			.text(EventView.addButtonText);

		var bbox = addButtonSvgText[0][0].getBBox()
		EventView.eventEditSvg.select(".add-button rect")
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 4)
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 2);
	}
}