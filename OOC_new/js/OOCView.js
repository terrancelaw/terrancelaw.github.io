var OOCView = {
	// dimension
	margin: { top: 10, left: 10, bottom: 10, right: 10 },
	shelfBackgroundPadding: { top: 2, left: 55, bottom: 2, right: 2 },

	shelfLeftPadding: 92,
	shelfTopPadding: { top: 1, bottom: 31 },
	shelfWidth: 160,
	shelfHeight: 18,

	// for managing states
	shelfList: [ "top", "bottom" ],
	isOccupied: { top: false, bottom: false },

	// group in different shelves
	groupsOnShelves: { top: [], bottom: [] },
	cachedGroupsOnShelf: [],
	cachedAdhocGroupIndex: 0,

	// colours
	shelfColors: {
		top: { deep: "#4d7ea8", medium: "#98BBD4", pale: "#e2f8ff" },
		bottom: { deep: "#db7093", medium: "#EDB1C4", pale: "#fff2f4" }
	},
	noTagShelfHighlightColour: "#fffff2",
	noTagShelfDoubleHighlightColour: "#ffffc1",

	// svg
	svg: null,
	shelf: { top: null, bottom: null },

	init: function() {
		var self = this;

		self.svg = d3.select("#OOC-view svg")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		self.drawShelfButton("top");
		self.drawShelfBackground("top")
		self.drawShelf("top");

		self.drawShelfButton("bottom");
		self.drawShelfBackground("bottom")
		self.drawShelf("bottom");

		self.drawFunctionSign();
	},
	drawShelfButton: function(shelfName) {
		var self = this;

		// draw button
		self.svg.append("text")
			.attr("class", "change-group-btn")
			.attr("shelf", shelfName)
			.attr("x", self.shelfLeftPadding + self.shelfWidth + 12)
			.attr("y", self.shelfTopPadding[shelfName] + self.shelfHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("fill", self.shelfColors[shelfName].deep)
			.text("\uf00b")
			.style("font-family", "FontAwesome")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.on("click", clickChangeGroupButton);

		function clickChangeGroupButton() {
			var changeGroupMenuOpened = ChangeGroupMenu.view.css("display") == "block";
			var shelfName = d3.select(this).attr("shelf");

			if (!changeGroupMenuOpened)
				ChangeGroupMenu.showView(shelfName);
			else if (changeGroupMenuOpened && ChangeGroupMenu.selectedShelfName != shelfName)
				ChangeGroupMenu.showView(shelfName);
			else if (changeGroupMenuOpened && ChangeGroupMenu.selectedShelfName == shelfName)
				ChangeGroupMenu.removeView();
		}
	},
	drawShelfBackground: function(shelfName) {
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
	},
	drawShelf: function(shelfName) {
		var self = this;

		// drag on the shelf to remove
		var dragShelf = d3.behavior.drag()
			.on("dragstart", function() {
				var shelfName =  d3.select(this).attr("class").split("-")[0];
				var groupKey = d3.select(this).attr("group-key");
				var groupName = d3.select(this).attr("group-name");

				if (self.isOccupied[shelfName]) {
					self.removeOccupyShelf(shelfName);
					ChangeGroupMenu.removeView();
					FeatureView.clear();

					DragTagHandler.handleDragStart(groupKey, groupName);
				}
			})
			.on("drag", function() {
				if ($("#draggable-tag").length > 0) // if the draggable-tag exists
					DragTagHandler.handleDrag();
			})
			.on("dragend", function() {
				if ($("#draggable-tag").length > 0)
					DragTagHandler.handleDragEnd();
			});

		// draw shelf
		self.shelf[shelfName] = self.svg.append("g")
			.attr("class", shelfName + "-shelf")
			.style("cursor", "all-scroll")
			.call(dragShelf)
			.on("mouseenter", mouseenterShelf)
			.on("mouseleave", mouseleaveShelf);
		self.shelf[shelfName].append("rect")
			.attr("class", "shelf")
			.attr("x", self.shelfLeftPadding)
			.attr("y", self.shelfTopPadding[shelfName])
			.attr("width", self.shelfWidth)
			.attr("height", self.shelfHeight)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "white")
			.style("stroke", self.shelfColors[shelfName].deep);

		function mouseenterShelf() {
			if (!d3.select(this).select(".config").empty()) {
				var textOnTag = d3.select(this).select(".config").text();

				if (textOnTag.indexOf("...") != -1) { // if some text is hidden, expand the shelf
					// change text
					var groupKey = DataTransformationHandler.returnFeatureNameWithoutID(d3.select(this).attr("group-key"));
					var groupName = d3.select(this).attr("group-name");
					var newText = groupKey + ": " + groupName;

					var textBBox = d3.select(this).select(".config").node().getBBox();
					var textLeftPadding = (self.shelfWidth - textBBox.width) / 2;
					var textNewX = self.shelfLeftPadding + textLeftPadding;

					var text = d3.select(this).select(".config")
						.attr("x", textNewX)
						.style("text-anchor", "start")
						.text(newText);

					// change rect
					textBBox = text.node().getBBox();
					var rectWidth = textBBox.width + textLeftPadding * 2;

					d3.select(this).select(".shelf")
						.attr("width", rectWidth);

					// change svg width
					d3.select("#OOC-view svg")
						.attr("width", self.shelfLeftPadding + rectWidth + 20)

					// mark the change
					d3.select(this).classed("expanded", true);
				}
			}
		}

		function mouseleaveShelf() {
			if (d3.select(this).classed("expanded")) {
				// change text
				var groupKey = DataTransformationHandler.returnFeatureNameWithoutID(d3.select(this).attr("group-key"));
				var groupName = d3.select(this).attr("group-name");
				groupKey = DataTransformationHandler.createShortString(groupKey, 20);
				var newText = groupKey + ": " + groupName;

				var textNewX = self.shelfLeftPadding + self.shelfWidth / 2;

				d3.select(this).select(".config")
					.attr("x", textNewX)
					.style("text-anchor", "middle")
					.text(newText);

				// change rect
				d3.select(this).select(".shelf")
					.attr("width", self.shelfWidth);

				// change svg width
				d3.select("#OOC-view svg")
					.attr("width", leftContentWidth)

				// unmark the change
				d3.select(this).classed("expanded", false);
			}
		}
	},
	drawFunctionSign: function(draw) {
		var self = this;

		var topShelfMiddleY = self.shelfTopPadding["top"] + self.shelfHeight / 2;
		var bottomShelfMiddleY = self.shelfTopPadding["bottom"] + self.shelfHeight / 2;
		var middleY = self.shelfTopPadding["top"] + self.shelfHeight / 2 + (self.shelfTopPadding["bottom"] - self.shelfTopPadding["top"]) / 2;
		var shelfX = self.shelfLeftPadding - self.shelfBackgroundPadding.left;
		var lineData = [ 
			{ "x": shelfX, "y": topShelfMiddleY },
			{ "x": shelfX - 15, "y": topShelfMiddleY + (middleY - topShelfMiddleY) / 2 },
			{ "x": shelfX - 20, "y": middleY },
			{ "x": shelfX - 15, "y": middleY + (middleY - topShelfMiddleY) / 2 },
			{ "x": shelfX, "y": bottomShelfMiddleY }
		];

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

		var signObject = self.svg.append("g")
			.attr("class", "function-sign")
			.style("cursor", "pointer")
			.on("click", clickFunctionSign);
		signObject.append("circle")
			.attr("cx", shelfX - 20)
			.style("cy", middleY)
			.style("r", 10)
			.style("fill", self.noTagShelfDoubleHighlightColour)
			.style("stroke", "gray")
			.style("stroke-width", 2);
		signObject.append("text")
			.attr("x", shelfX - 20)
			.attr("y", middleY)
			.style("fill", "gray")
			.style("font-size", 15)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("font-weight", "bold")
			.text("≠");

		function clickFunctionSign() {
			// change sign
			var sign = d3.select(this).select("text").text();
			var newSign = (sign == "≠") ? "~" : "≠";
			d3.select(this).select("text").text(newSign);

			// select feature
			if (self.areBothShelvesOccupied() && self.areBothShelvesDifferent()) {
				var report = ComparisonHandler.startFeatureSelection();
				FeatureView.populateView(report);
			}
		}
	},

	// START: ACTIONS IN DIFFERENT STATES

	occupyShelf: function(shelfName, groupKey, groupName) {
		var self = this;

		self.isOccupied[shelfName] = true;
		self.shelf[shelfName].attr("group-key", groupKey);
		self.shelf[shelfName].attr("group-name", groupName);
	},
	removeOccupyShelf: function(shelfName) {
		var self = this;

		self.isOccupied[shelfName] = false;
		self.shelf[shelfName].attr("group-key", null);
		self.shelf[shelfName].attr("group-name", null);
		self.shelf[shelfName].classed("expanded", false);

		// clear groups on shelf
		self.cacheGroupsOnShelf(shelfName);
		self.clearGroupsFromShelf(shelfName);
	},
	showNormalTextGuide: function(shelfName) {
		var self = this;

		if (self.shelf[shelfName].select(".text-guide").empty()) {
			var textGuide = self.shelf[shelfName].append("text")
				.attr("class", "text-guide " + shelfName + "-shelf")
				.attr("x", self.shelfLeftPadding - self.shelfBackgroundPadding.left / 2)
				.attr("y", self.shelfTopPadding[shelfName] + self.shelfHeight / 2)
				.style("fill", self.shelfColors[shelfName].medium)
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle")
				.style("font-size", "8px")
				.text("Drop Here");

			var bbox = textGuide.node().getBBox();
			self.shelf[shelfName].insert("rect", ".text-guide")
				.attr("class", "text-guide " + shelfName + "-shelf")
				.attr("x", bbox.x - 3)
				.attr("y", bbox.y - 2)
				.attr("width", bbox.width + 6)
				.attr("height", bbox.height + 4)
				.attr("rx", 5)
				.attr("ry", 5)
				.style("stroke", self.shelfColors[shelfName].deep)
				.style("fill", self.shelfColors[shelfName].pale);
		}
		else {
			self.shelf[shelfName].selectAll("text.text-guide")
				.style("fill", self.shelfColors[shelfName].medium);
			self.shelf[shelfName].selectAll("rect.text-guide")
				.style("fill", self.shelfColors[shelfName].pale);
		}
	},
	highlightTextGuide: function(shelfName) {
		var self = this;

		self.shelf[shelfName].selectAll("text.text-guide")
			.style("fill", self.shelfColors[shelfName].deep);
		self.shelf[shelfName].selectAll("rect.text-guide")
			.style("fill", "white");
	},
	removeTextGuide: function(shelfName) {
		var self = this;

		self.shelf[shelfName].selectAll(".text-guide")
			.remove();
	},
	highlightShelf: function(shelfName) {
		var self = this;
		var isShelfOccupied = self.isShelfOccupied(shelfName);

		if (isShelfOccupied) {
			self.shelf[shelfName].select(".config")
				.style("fill", self.shelfColors[shelfName].medium);
			self.shelf[shelfName].select(".shelf")
				.attr("width", self.shelfWidth)
				.style("fill", self.shelfColors[shelfName].pale);
			self.showNormalTextGuide(shelfName);
		}
		else {
			self.shelf[shelfName].select(".shelf")
				.attr("width", self.shelfWidth)
				.style("fill", self.noTagShelfHighlightColour);
			if (!self.shelf[shelfName].select(".config").empty())
				self.shelf[shelfName].select(".config").remove();
			self.showNormalTextGuide(shelfName);
		}
	},
	doubleHighlightShelf: function(shelfName) {
		var self = this;
		var isShelfOccupied = self.isShelfOccupied(shelfName);

		if (isShelfOccupied) {
			self.shelf[shelfName].select(".config")
				.style("fill", self.shelfColors[shelfName].pale);
			self.shelf[shelfName].select(".shelf")
				.attr("width", self.shelfWidth)
				.style("fill", "white");
			self.highlightTextGuide(shelfName);
		}
		else {
			self.shelf[shelfName].select(".shelf")
				.attr("width", self.shelfWidth)
				.style("fill", self.noTagShelfDoubleHighlightColour);
			if (!self.shelf[shelfName].select(".config").empty())
				self.shelf[shelfName].select(".config").remove();
			self.highlightTextGuide(shelfName);
		}
	},
	restoreShelfToNormal: function(shelfName) {
		var self = this;
		var isShelfOccupied = self.isShelfOccupied(shelfName);

		if (isShelfOccupied) {
			var groupKey = self.shelf[shelfName].attr("group-key");
			var groupName = self.shelf[shelfName].attr("group-name");

			self.addTagToShelf(shelfName, groupKey, groupName);
			self.removeTextGuide(shelfName);
		}
		else {
			self.shelf[shelfName].select(".shelf")
				.attr("width", self.shelfWidth)
				.style("fill", "white");
			if (!self.shelf[shelfName].select(".config").empty())
				self.shelf[shelfName].select(".config").remove();
			self.removeTextGuide(shelfName);
		}
	},
	changeStateOfShelfBasedOnGroups: function(shelfName) { // must do it after groups on shelves are changed
		var self = this;

		if (self.groupsOnShelves[shelfName].length == 0) {
			OOCView.removeOccupyShelf(shelfName);
		}
		if (self.groupsOnShelves[shelfName].length == 1) {
			var groupKey = self.groupsOnShelves[shelfName][0].groupKey;
			var groupName = self.groupsOnShelves[shelfName][0].groupName;
			self.occupyShelf(shelfName, groupKey, groupName);
		}
		if (self.groupsOnShelves[shelfName].length > 1) {
			var adHocGroupName = shelfName.charAt(0).toUpperCase() + shelfName.slice(1) + " Group";
			self.occupyShelf(shelfName, "", adHocGroupName);
		}
	},
	addTagToShelf: function(shelfName, groupKey, groupName) {
		var self = this;
		var groupKeyShown = DataTransformationHandler.returnFeatureNameWithoutID(groupKey);
		groupKeyShown = DataTransformationHandler.createShortString(groupKeyShown, 20);
		var textOnTag = (groupKeyShown == "") ? groupName : groupKeyShown + ": " + groupName;

		// change shelf color
		self.shelf[shelfName].select(".shelf")
			.attr("width", self.shelfWidth)
			.style("fill", self.shelfColors[shelfName].pale);

		// add text to the shelf
		self.shelf[shelfName].select(".config")
			.remove();

		self.shelf[shelfName].append("text")
			.attr("class", "config")
			.attr("x", self.shelfLeftPadding + self.shelfWidth / 2)
			.attr("y", self.shelfTopPadding[shelfName] + self.shelfHeight / 2)
			.style("fill", self.shelfColors[shelfName].deep)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("font-size", "11px")
			.text(textOnTag);
	},
	removeTagFromShelf: function() {
		var self = this;


	},

	// END: ACTIONS IN DIFFERENT STATES

	// START: STATE HANDLER

	handleStateTransitionOnDragstart: function() {
		var self = this;

		// check the states of the shelves to determine action
		for (var i = 0; i < self.shelfList.length; i++)
			self.highlightShelf(self.shelfList[i]);
	},
	handleStateTransitionOnDrag: function(mouseXRelativeToPage, mouseYRelativeToPage, groupKey, groupName) {
		var self = this;
		var currentShelf = self.onWhichShelf(mouseXRelativeToPage, mouseYRelativeToPage);

		if (currentShelf != "none")
			self.doubleHighlightShelf(currentShelf);
		if (currentShelf == "none")
			for (var i = 0; i < self.shelfList.length; i++)
				self.highlightShelf(self.shelfList[i]);
	},
	handleStateTransitionOnDragEnd: function(mouseXRelativeToPage, mouseYRelativeToPage, groupKey, groupName) {
		var self = this;
		var currentShelf = self.onWhichShelf(mouseXRelativeToPage, mouseYRelativeToPage);

		// try to add the groups to shelf
		if (currentShelf != "none") {
			var isAdHocGroup = groupKey == "" && groupName != "Everything Else";
			var isChangeGroupMenuOpened = ChangeGroupMenu.selectedShelfName != null;

			// change groups on shelf
			if (isAdHocGroup)
				self.restoreGroupsFromCache(currentShelf);
			if (!isAdHocGroup)
				self.storeGroupToShelf(currentShelf, groupKey, groupName);

			// change the group menu if it is opened
			if (isChangeGroupMenuOpened)
				ChangeGroupMenu.updateTags();

			// change the state and appearance of shelves
			self.changeStateOfShelfBasedOnGroups(currentShelf);
			for (var i = 0; i < self.shelfList.length; i++)
				self.restoreShelfToNormal(self.shelfList[i]);

			// draw the feature view and construct concept map
			if (self.areBothShelvesOccupied() && self.areBothShelvesDifferent()) {
				var report = ComparisonHandler.startFeatureSelection();
				FeatureView.populateView(report);
				ConceptMapView.update(report);
			}
		}
		if (currentShelf == "none") {
			for (var i = 0; i < self.shelfList.length; i++)
				self.restoreShelfToNormal(self.shelfList[i]);
		}
	},

	// END: STATE HANDLER

	onWhichShelf: function(clientX, clientY) {
		var self = this;

		for (var i = 0; i < self.shelfList.length; i++) {
			var shelfName = self.shelfList[i];

			if (isOnShelf(shelfName, clientX, clientY))
				return shelfName;
		}

		return "none"; // not on any shelves

		function isOnShelf(shelfName, clientX, clientY) {
			var topEdgeY = $("#OOC-view").position().top + self.margin.top + self.shelfTopPadding[shelfName] + 8; // 8 is the margin
			var bottomEdgeY = topEdgeY + self.shelfHeight;
			var leftEdgeX = $("#OOC-view").position().left + self.margin.left + self.shelfLeftPadding + 8;
			var rightEdgeX = leftEdgeX + self.shelfWidth;

			if (clientX >= leftEdgeX && clientX <= rightEdgeX && clientY >= topEdgeY && clientY <= bottomEdgeY)
				return true;
			else
				return false;
		}
	},
	isShelfOccupied: function(shelfName) {
		var self = this;

		return self.isOccupied[shelfName];
	},
	storeGroupToShelf: function(shelfName, groupKey, groupName) {
		var self = this;

		for (var i = 0; i < self.groupsOnShelves[shelfName].length; i++) {
			var alreadyExists = self.groupsOnShelves[shelfName][i].groupKey == groupKey && self.groupsOnShelves[shelfName][i].groupName == groupName;
			var hasEverythingElse = self.groupsOnShelves[shelfName][i].groupName == "Everything Else";
			
			// if there is everything else in the group, don't allow adding
			if (alreadyExists || hasEverythingElse)
				return false;
		}

		if (groupName == "Everything Else") {
			// remove all other things
			self.groupsOnShelves[shelfName] = [{ groupKey: groupKey, groupName: groupName }];
			self.updateAdhocGroupIndexOnShelf(shelfName, null);
		}
		else {
			self.groupsOnShelves[shelfName].unshift({ groupKey: groupKey, groupName: groupName });
		}

		return true;
	},
	removeGroupFromShelf: function(shelfName, groupKey, groupName) {
		var self = this;

		// search from the array
		var i = 0;
		for (; i < self.groupsOnShelves[shelfName].length; i++) {
			var alreadyExists = self.groupsOnShelves[shelfName][i].groupKey == groupKey && self.groupsOnShelves[shelfName][i].groupName == groupName;
			
			if (alreadyExists)
				break;
		}

		// remove from the array
		if (i < self.groupsOnShelves[shelfName].length) {
			self.groupsOnShelves[shelfName].splice(i, 1);

			if (self.groupsOnShelves[shelfName].length == 0)
				self.updateAdhocGroupIndexOnShelf(shelfName, null);

			return true;
		}
		else { // not found
			return false;
		}
	},
	cacheGroupsOnShelf: function(shelfName) {
		var self = this;

		self.cachedGroupsOnShelf = self.groupsOnShelves[shelfName];
		self.cachedAdhocGroupIndex = self.shelf[shelfName].attr("adhoc-group-index");
	},
	clearGroupsFromShelf: function(shelfName) {
		var self = this;

		self.groupsOnShelves[shelfName] = [];
		self.updateAdhocGroupIndexOnShelf(shelfName, null);
	},
	restoreGroupsFromCache: function(shelfName) {
		var self = this;

		self.groupsOnShelves[shelfName] = self.cachedGroupsOnShelf;
		self.cachedGroupsOnShelf = [];
		self.updateAdhocGroupIndexOnShelf(shelfName, self.cachedAdhocGroupIndex);
	},
	areBothShelvesOccupied(extraCondition = true) {
		var self = this;

		return self.isOccupied["top"] && self.isOccupied["bottom"] && extraCondition;
	},
	areBothShelvesDifferent: function() {
		var self = this;
		var sameGroupKey = self.shelf["top"].attr("group-key") == self.shelf["bottom"].attr("group-key");
		var sameGroupName = self.shelf["top"].attr("group-name") == self.shelf["bottom"].attr("group-name");
		
		if (sameGroupKey && sameGroupName)
			return false;
		else
			return true;
	},
	getGroupType: function(groupListOnShlef) {
		if (groupListOnShlef.length == 1 && groupListOnShlef.groupKey != "")
			return "attribute-defined";
		if (groupListOnShlef.length == 1 && groupListOnShlef.groupKey == "")
			return "everything-else";
		if (groupListOnShlef.length > 1)
			return "ad-hoc";
	},
	updateAdhocGroupIndexOnShelf: function(shelfName, index) {
		var self = this;

		self.shelf[shelfName].attr("adhoc-group-index", index);
	}
}