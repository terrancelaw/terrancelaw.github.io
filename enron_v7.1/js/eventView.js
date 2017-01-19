var EventView = { // mostly for handling main event panel
	margin: { top: 20, left: 10, bottom: 10, right: 10 },

	eventPanelSvg: null,
	eventEditSvg: null,

	maxNumberOfEvents: 9,
	event2Index: {}, // for determining the colour of an event
	colours: d3.scale.category10(),

	nextY: 0,
	nextEventIndex: 0,

	eventY: null,
	optionY: null,

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

		self.eventY = eventEditWrapperHeight - 40;
		self.optionY = eventEditWrapperHeight - 70;

		self.eventPanelSvg = d3.select("#event-panel")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		self.eventEditSvg = d3.select("#event-edit")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");
	},
	addEventToView: function() {
		var self = this;
		
		var radius = 5;
		var className = self.currentEventName.split(" ").join("-");
		var tagWidth = eventViewWidth - self.margin.left - self.margin.right;
		var tagHeight = radius * 5;

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

		// create the remove text
		eventGroup.append("text")
			.attr("class", "remove-text")
			.attr("x", tagWidth / 2)
			.attr("y", -9)
			.style("text-anchor", "middle")
			.style("fill", "gray")
			.style("display", "none")
			.text("Double click to remove");

		// create the real content
		if (!self.isInterval) {
			eventGroup.append("circle")
				.attr("r", radius)
				.attr("cx", 10)
				.attr("cy", 0)
				.style("fill", self.colours(self.event2Index[self.currentEventName]))
				.style("stroke", "black");
		}
		else {
			eventGroup.append("rect")
				.attr("x", 10 - radius)
				.attr("y", 0 - radius)
				.attr("width", radius * 2)
				.attr("height", radius * 2)
				.style("fill", self.colours(self.event2Index[self.currentEventName]))
				.style("stroke", "black");
		}
		
		eventGroup.append("text")
			.attr("x", 25)
			.attr("y", 0)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("font-size", 12)
			.text(self.currentEventName);

		self.nextY += radius * 5; // 5 (= radius) is padding

		function onMouseEnterEventTag() {
			d3.select(this)
				.select("rect")
				.style("fill", "#FFFFEE");

			d3.select(this)
				.select(".remove-text")
				.style("display", null);
		}

		function onMouseLeaveEventTag() {
			d3.select(this)
				.select("rect")
				.style("fill", "white");

			d3.select(this)
				.select(".remove-text")
				.style("display", "none");
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
			
			// update table
			Table.updateEvents();
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
	addEventTagToEventEdit: function(isInterval) {
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
			.text("Event: " + self.currentEventName);

		// draw button
		var addButton = self.eventEditSvg.append("g")
			.attr("class", "add-button")
			.attr("transform", "translate(" + self.addButtonXTranslate + ", " + self.eventY + ")")
			.attr("cursor", "pointer");

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
	},
	updateEventEdit: function() {
		var self = this;

		// update the text
		self.eventEditSvg.select(".event-name")
			.text("Event: " + self.currentEventName);

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
	}
}