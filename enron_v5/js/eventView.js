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
	addEventToView: function(eventName) {
		var self = this;
		var radius = 5;
		var className = eventName.split(" ").join("-");
		var tagWidth = eventViewWidth - self.margin.left - self.margin.right;
		var tagHeight = radius * 5;

		var eventGroup = self.eventPanelSvg.append("g")
			.attr("class", function() {
				return "event-tag " + className;
			})
			.attr("name", eventName)
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
		eventGroup.append("circle")
			.attr("r", radius)
			.attr("cx", 10)
			.attr("cy", 0)
			.style("fill", self.colours(self.event2Index[eventName]))
			.style("stroke", "black");

		eventGroup.append("text")
			.attr("x", 25)
			.attr("y", 0)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("font-size", 12)
			.text(eventName);

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
	}
}