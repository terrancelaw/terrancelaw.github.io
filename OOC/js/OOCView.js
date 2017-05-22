var OOCView = {
	// dimension
	margin: { top: 10, left: 10, bottom: 10, right: 10 },
	shelfBackgroundPadding: { top: 2, left: 55, bottom: 2, right: 2 },
	width: null,
	height: null,
	shelfLeftPadding: 85,
	shelfTopPadding: {
		"top": 0,
		"bottom": 30
	},
	shelfWidth: 160,
	shelfHeight: 18,

	// for managing states
	shelfList: [ "top", "bottom" ],
	previousState: null,
	isOccupied: {
		"top": false,
		"bottom": false
	},
	textOnShelf: {
		"top": null,
		"bottom": null
	},

	// colours
	shelfColors: {
		"top": { deep: "#4d7ea8", medium: "#98BBD4", pale: "#e2f8ff" },
		"bottom": { deep: "#db7093", medium: "#EDB1C4", pale: "#fff2f4" }
	},
	noTagShelfHightlight: "#fffff2",
	noTagShelfDoubleHightlight: "#ffffc1",

	// svg
	svg: null,
	shelf: {
		"top": null,
		"bottom": null
	},

	init: function() {
		var self = this;

		self.width = leftContentWidth - self.margin.left - self.margin.right;
		self.height = OOCViewHeight - self.margin.top - self.margin.bottom;

		self.svg = d3.select("#OOC-view svg")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		// drag on the shelf to remove
		var dragShelf = d3.behavior.drag()
			.on("dragstart", function() {
				var shelfName =  d3.select(this).attr("class").split("-")[0];

				if (self.isOccupied[shelfName]) {
					var mouseXRelativeToPage = event.clientX;
					var mouseYRelativeToPage = event.clientY;

					var tagLeft = mouseXRelativeToPage - self.shelfWidth / 2;
					var tagRight = mouseYRelativeToPage - self.shelfHeight / 2;
					var textInside = d3.select(this).select(".group-name").text();

					ListView.createTag(textInside);
					ListView.moveTagTo(tagLeft, tagRight);

					self.removeOccupyShelf(shelfName);
					self.handleStateTransitionOnDragstart();
				}
			})
			.on("drag", function() {
				var shelfName =  d3.select(this).attr("class").split("-")[0];

				// if the draggable-tag exists
				if ($("#draggable-tag").length > 0) {
					// move the tag
					var mouseXRelativeToPage = event.clientX;
					var mouseYRelativeToPage = event.clientY;
					var tagLeft = mouseXRelativeToPage - self.shelfWidth / 2;
					var tagRight = mouseYRelativeToPage - self.shelfHeight / 2;
					ListView.moveTagTo(tagLeft, tagRight);

					// handle states
					var currentShelf = self.onWhichShelf(mouseXRelativeToPage, mouseYRelativeToPage);
					var textOnTag = d3.select("#draggable-tag svg text").text();
					self.handleStateTransitionOnDrag(currentShelf, textOnTag);
				}
			})
			.on("dragend", function() {
				if ($("#draggable-tag").length > 0) {
					var mouseXRelativeToPage = event.clientX;
					var mouseYRelativeToPage = event.clientY;

					// handle states
					var currentShelf = self.onWhichShelf(mouseXRelativeToPage, mouseYRelativeToPage);
					var textOnTag = d3.select("#draggable-tag svg text").text();
					self.handleStateTransitionOnDragEnd(currentShelf, textOnTag);

					// remove tag
					var isTagPlacedOnShelf = (currentShelf != "none"); // to determine if everything else should be restored
					ListView.removeTag(isTagPlacedOnShelf);
				}
			});

		self.drawShelf("top", dragShelf);
		self.drawShelf("bottom", dragShelf);
		self.drawContainer();
	},
	drawShelf: function(shelfName, dragShelf) {
		var self = this;

		// draw background
		self.svg.append("rect")
			.attr("class", "shelf-background")
			.attr("x", self.shelfLeftPadding - self.shelfBackgroundPadding.left)
			.attr("y", self.shelfTopPadding[shelfName] - self.shelfBackgroundPadding.top)
			.attr("width", self.shelfWidth + self.shelfBackgroundPadding.left + self.shelfBackgroundPadding.right)
			.attr("height", self.shelfHeight + self.shelfBackgroundPadding.top + self.shelfBackgroundPadding.bottom)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", self.shelfColors[shelfName].deep);
		self.svg.append("text")
			.attr("class", "shelf-background")
			.attr("x", self.shelfLeftPadding - self.shelfBackgroundPadding.left + 12)
			.attr("y", self.shelfTopPadding[shelfName] + self.shelfHeight / 2)
			.style("alignment-baseline", "middle")
			.style("fill", self.shelfColors[shelfName].pale)
			.style("font-size", 11)
			.text("Object");

		// draw shelf
		self.shelf[shelfName] = self.svg.append("g")
			.attr("class", shelfName + "-shelf")
			.style("cursor", "pointer")
			.call(dragShelf);
		self.shelf[shelfName].append("rect")
			.attr("class", "shelf")
			.attr("x", self.shelfLeftPadding)
			.attr("y", self.shelfTopPadding[shelfName])
			.attr("width", self.shelfWidth)
			.attr("height", self.shelfHeight)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "white")
			.style("stroke", "none");
	},
	drawContainer: function() {
		var self = this;

		// add container to indicate enclosure
		var shelfHeight = self.svg.node().getBBox().height;
		var shelfWidth = self.svg.select("rect.shelf-background").node().getBBox().width;

		var containerWidth = shelfWidth + 5;
		var containerHeight = shelfHeight + 5;
		var containerX = self.shelfLeftPadding - self.shelfBackgroundPadding.left + shelfWidth / 2 - containerWidth / 2;
		var containerY = self.shelfTopPadding["top"] - 2 + shelfHeight / 2 - containerHeight / 2;

		self.svg.insert("rect", ":first-child")
			.attr("class", "similar-container")
			.attr("x", containerX)
			.attr("y", containerY)
			.attr("width", containerWidth)
			.attr("height", containerHeight)
			.attr("rx", "5px")
			.attr("ry", "5px")
			.style("fill", "none")
			.style("stroke", "gray")
			.style("stroke-width", "1")
			.style("stroke-dasharray", "2,2")
			.style("opacity", 0);
	},
	drawFunctionSign: function(draw) {
		var self = this;

		self.removeFunctionSign();

		var topShelfMiddleY = self.shelfTopPadding["top"] + self.shelfHeight / 2;
		var bottomShelfMiddleY = self.shelfTopPadding["bottom"] + self.shelfHeight / 2;
		var middleY = self.shelfTopPadding["top"] + self.shelfHeight / 2 + (self.shelfTopPadding["bottom"] - self.shelfTopPadding["top"]) / 2;
		var shelfX = (draw == "similar") ? self.shelfLeftPadding - self.shelfBackgroundPadding.left - 3 : self.shelfLeftPadding - self.shelfBackgroundPadding.left;
		var lineData = [ 
			{ "x": shelfX, "y": topShelfMiddleY },
			{ "x": shelfX - 15, "y": topShelfMiddleY + (middleY - topShelfMiddleY) / 2 },
			{ "x": shelfX - 20, "y": middleY },
			{ "x": shelfX - 15, "y": middleY + (middleY - topShelfMiddleY) / 2 },
			{ "x": shelfX, "y": bottomShelfMiddleY }
		];
		var sign = (draw == "similar") ? "~" : "≠";

		var line = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("basis");
		self.svg.append("path")
			.attr("class", "function-sign")
			.attr("d", line(lineData))
			.style("stroke", "gray")
			.style("stroke-width", 2)
			.style("stroke-linecap", "round")
			.style("fill", "none");
		self.svg.append("circle")
			.attr("class", "function-sign")
			.attr("cx", shelfX - 20)
			.style("cy", middleY)
			.style("r", 10)
			.style("fill", self.noTagShelfDoubleHightlight)
			.style("stroke", "gray")
			.style("stroke-width", 2);
		self.svg.append("text")
			.attr("class", "function-sign")
			.attr("x", shelfX - 20)
			.attr("y", middleY)
			.style("fill", "gray")
			.style("font-size", 15)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("font-weight", "bold")
			.text(sign);
	},
	removeFunctionSign: function() {
		var self = this;

		self.svg.selectAll(".function-sign").remove();
	},

	// handling state transition

	// there are three possible states when mouseover on a shelf:
	// 1. nothing -> action: highlight
	// 2. occupied, another empty -> action: create dummy tag on another
	// 3. occupied, another not empty -> action: create dummy tag on another

	// there are three possible states when not mouseover on a shelf:
	// 1. previous nothing -> action: clean this shelf
	// 2. previous occupied, another empty -> action: clean another shelf
	// 3. previous occupied, another not empty -> action: restore tag on another shelf

	handleStateTransitionOnDragstart: function() {
		var self = this;

		// check the states of the shelves to determine action
		for (var i = 0; i < self.shelfList.length; i++) {
			var currentShelf = self.shelfList[i];
			var isCurrentShelfOccupied = self.isShelfOccupied(currentShelf);

			if (isCurrentShelfOccupied)
				self.highlightTaggedShelf(currentShelf);
			else
				self.highlightNoTagShelf(currentShelf);
		}
	},
	handleStateTransitionOnDrag: function(currentShelf, textOnTag) {
		var self = this;

		// if it is on a shelf
		if (currentShelf != "none") {
			var anotherShelf = self.getNameOfAnotherShelf(currentShelf);

			if (!self.isShelfOccupied(currentShelf) && !self.isShelfOccupied(anotherShelf)) {
				self.doubleHighlightNoTagShelf(currentShelf);
				self.previousState = currentShelf + ":currentEmpty";
				self.hideContainer();
				self.removeFunctionSign();
			}
			if (!self.isShelfOccupied(currentShelf) && self.isShelfOccupied(anotherShelf)) {
				self.doubleHighlightNoTagShelf(currentShelf);
				self.previousState = currentShelf + ":currentEmpty";
				self.hideContainer();
				self.drawFunctionSign("different");
			}
			if (self.isShelfOccupied(currentShelf) && !self.isShelfOccupied(anotherShelf)) {
				self.addTagToShelf(anotherShelf, textOnTag);
				self.highlightTaggedShelf(anotherShelf);
				self.showContainer();
				self.drawFunctionSign("similar");
				self.previousState = currentShelf + ":currentOccupiedAnotherEmpty";
			}
			if (self.isShelfOccupied(currentShelf) && self.isShelfOccupied(anotherShelf)) {
				self.addTagToShelf(anotherShelf, textOnTag);
				self.highlightTaggedShelf(anotherShelf);
				self.showContainer();
				self.drawFunctionSign("similar");
				self.previousState = currentShelf + ":currentOccupiedAnotherOccupied";
			}
		}

		// if it is not on a shelf
		else {
			var previosShelf = (self.previousState == null) ? null : self.previousState.split(":")[0];
			var previousState = (self.previousState == null) ? null : self.previousState.split(":")[1];
			self.previousState = null;

			if (previousState == "currentEmpty") {
				self.highlightNoTagShelf(previosShelf);
				self.hideContainer();
				self.removeFunctionSign();
			}
			if (previousState == "currentOccupiedAnotherEmpty") {
				var anotherShelf = self.getNameOfAnotherShelf(previosShelf);
				self.highlightNoTagShelf(anotherShelf);
				self.hideContainer();
				self.removeFunctionSign();
			}
			if (previousState == "currentOccupiedAnotherOccupied") {
				var anotherShelf = self.getNameOfAnotherShelf(previosShelf);
				self.restoreTaggedShelfToNormal(anotherShelf);
				self.highlightTaggedShelf(anotherShelf);
				self.hideContainer();
				self.removeFunctionSign();
			}
		}
	},
	handleStateTransitionOnDragEnd: function(currentShelf, textOnTag) {
		var self = this;
		var isCurrentShelfOccupied = (currentShelf != "none") ? self.isShelfOccupied(currentShelf) : false;

		// change the states
		if (currentShelf != "none") {
			var anotherShelf = self.getNameOfAnotherShelf(currentShelf);

			if (isCurrentShelfOccupied)
				self.occupyShelf(anotherShelf, textOnTag);
			else
				self.occupyShelf(currentShelf, textOnTag);
		}

		// restore the visual appearance
		for (var i = 0; i < self.shelfList.length; i++) {
			var shelfi = self.shelfList[i];
			var isShelfiOccupied = self.isShelfOccupied(shelfi);

			if (isShelfiOccupied)
				self.restoreTaggedShelfToNormal(shelfi);
			else
				self.restoreNoTagShelfToNormal(shelfi);
		}

		// check if need to start feature selection
		var needFeatureSelection = self.isOccupied["top"] && self.isOccupied["bottom"] && currentShelf != "none";
		var findDistinguishingFeatures = !isCurrentShelfOccupied; // need state of current at the beginning (if the current shelf is occupied, find non-distinguishing features)

		if (needFeatureSelection) {
			var topShelfText = self.shelf["top"].select("text").text();
			var bottomShelfText = self.shelf["bottom"].select("text").text();

			// assumming that users cannot put two everything else to shelves
			var	topShelfGroupKey = (topShelfText == "Everything Else") ? bottomShelfText.split(": ")[0] : topShelfText.split(": ")[0];
			var	topShelfGroupName = (topShelfText == "Everything Else") ? "!" + bottomShelfText.split(": ")[1] : topShelfText.split(": ")[1];
			var	bottomShelfGroupKey = (bottomShelfText == "Everything Else") ? topShelfText.split(": ")[0] : bottomShelfText.split(": ")[0];
			var	bottomShelfGroupName = (bottomShelfText == "Everything Else") ? "!" + topShelfText.split(": ")[1] : bottomShelfText.split(": ")[1];

			var group1 = { key: topShelfGroupKey, name: topShelfGroupName };
			var group2 = { key: bottomShelfGroupKey, name: bottomShelfGroupName };

			if (findDistinguishingFeatures) {
				var arrangeListInDescendingOrder = true;
				var report = ComparisonHandler.startFindingDistinguishingFeatures(group1, group2);
				FeatureView.populateView(report, arrangeListInDescendingOrder);
			}
			else {
				var arrangeListInDescendingOrder = false;
				var report = ComparisonHandler.startFindingSimilarFeatures(group1, group2);
				FeatureView.populateView(report, arrangeListInDescendingOrder);
			}
		}
	},

	// defining actions in different states

	occupyShelf: function(shelfName, textOnTag) {
		var self = this;

		self.isOccupied[shelfName] = true;
		self.textOnShelf[shelfName] = textOnTag;
		self.previousState = null; // ending state
	},
	removeOccupyShelf: function(shelfName) {
		var self = this;

		// starting state, no self.previousState = null;
		self.isOccupied[shelfName] = false;
		self.textOnShelf[shelfName] = null;

		// clean the feature view
		FeatureView.clear();
	},
	showContainer: function() {
		var self = this;

		self.svg.select(".similar-container")
			.style("opacity", 1);
	},
	hideContainer: function() {
		var self = this;

		self.svg.select(".similar-container")
			.style("opacity", 0);
	},
	restoreNoTagShelfToNormal: function(shelfName) {
		var self = this;

		self.shelf[shelfName].select(".shelf")
			.style("fill", "white");

		self.shelf[shelfName].select("text")
			.remove();
	},
	highlightNoTagShelf: function(shelfName) {
		var self = this;

		// shelf
		self.shelf[shelfName].select(".shelf")
			.style("fill", self.noTagShelfHightlight);

		// text guide
		if (self.shelf[shelfName].select(".text-guide").empty()) {
			self.shelf[shelfName].append("text")
				.attr("class", "text-guide " + shelfName + "-shelf")
				.attr("x", self.shelfLeftPadding + self.shelfWidth + 5)
				.attr("y", self.shelfTopPadding[shelfName] + self.shelfHeight / 2)
				.style("fill", "black")
				.style("opacity", 0.5)
				.style("alignment-baseline", "middle")
				.style("font-size", "8px")
				.text("Drop Here");
		}
		else {
			self.shelf[shelfName].select(".text-guide")
				.style("opacity", 0.5)
		}

		// group name
		if (!self.shelf[shelfName].select(".group-name").empty()) {
			self.shelf[shelfName].select(".group-name")
				.remove();
		}
	},
	doubleHighlightNoTagShelf: function(shelfName) {
		var self = this;

		// shelf
		self.shelf[shelfName].select(".shelf")
			.style("fill", self.noTagShelfDoubleHightlight);

		// assume that in order for shelf to be double highlighted, text-guide is already there
		self.shelf[shelfName].select(".text-guide")
			.style("opacity", "1");
	},
	addTagToShelf: function(shelfName, textOnTag) {
		var self = this;

		// change shelf color
		self.shelf[shelfName].select(".shelf")
			.style("fill", self.shelfColors[shelfName].pale);

		// add text to the shelf
		self.shelf[shelfName].selectAll("text")
			.remove();

		self.shelf[shelfName].append("text")
			.attr("class", "group-name " + shelfName + "-shelf")
			.attr("x", self.shelfLeftPadding + OOCView.shelfWidth / 2)
			.attr("y", self.shelfTopPadding[shelfName] + OOCView.shelfHeight / 2)
			.style("fill", self.shelfColors[shelfName].deep)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("font-size", "11px")
			.text(textOnTag);
	},
	restoreTaggedShelfToNormal: function(shelfName) {
		var self = this;
		var textOnTag = self.textOnShelf[shelfName];

		self.addTagToShelf(shelfName, textOnTag);
	},
	highlightTaggedShelf: function(shelfName) {
		var self = this;

		self.shelf[shelfName].select(".group-name")
			.style("fill", self.shelfColors[shelfName].medium);
		self.shelf[shelfName].selectAll(".shelf")
			.style("fill", "white");

		// text guide
		if (self.shelf[shelfName].select(".text-guide").empty()) {
			self.shelf[shelfName].append("text")
				.attr("class", "text-guide " + shelfName + "-shelf")
				.attr("x", self.shelfLeftPadding + self.shelfWidth + 5)
				.attr("y", self.shelfTopPadding[shelfName] + self.shelfHeight / 2)
				.style("fill", "black")
				.style("opacity", 0.5)
				.style("alignment-baseline", "middle")
				.style("font-size", "8px")
				.text("Drop Here");
		}
		else {
			self.shelf[shelfName].select(".text-guide")
				.style("opacity", "1")
		}
	},

	// for detecting states

	onWhichShelf: function(clientX, clientY) {
		var self = this;

		if (isOnTopShelf(clientX, clientY))
			return "top";
		else if (isOnBottomShelf(clientX, clientY))
			return "bottom";
		else
			return "none";

		function isOnTopShelf(clientX, clientY) {
			var topEdgeY = $("#OOC-view").position().top + self.margin.top + self.shelfTopPadding["top"];
			var bottomEdgeY = topEdgeY + self.shelfHeight;
			var leftEdgeX = $("#OOC-view").position().left + self.margin.left + self.shelfLeftPadding;
			var rightEdgeX = leftEdgeX + self.shelfWidth;

			if (clientX >= leftEdgeX && clientX <= rightEdgeX && clientY >= topEdgeY && clientY <= bottomEdgeY)
				return true;
			else
				return false;
		}

		function isOnBottomShelf(clientX, clientY) {
			var topEdgeY = $("#OOC-view").position().top + self.margin.top + self.shelfTopPadding["bottom"];
			var bottomEdgeY = topEdgeY + self.shelfHeight;
			var leftEdgeX = $("#OOC-view").position().left + self.margin.left + self.shelfLeftPadding;
			var rightEdgeX = leftEdgeX + self.shelfWidth;

			if (clientX >= leftEdgeX && clientX <= rightEdgeX && clientY >= topEdgeY && clientY <= bottomEdgeY)
				return true;
			else
				return false;
		}
	},
	getNameOfAnotherShelf: function(shelfName) {
		var self = this;

		// assume valid input
		return (shelfName == "top") ? "bottom" : "top";
	},
	isShelfOccupied: function(shelfName) {
		var self = this;

		return self.isOccupied[shelfName];
	}
}