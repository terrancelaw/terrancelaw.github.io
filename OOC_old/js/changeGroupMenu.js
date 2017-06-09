var ChangeGroupMenu = {
	contentMargin: { top: 10, left: 10, bottom: 10, right: 10 },
	height: null,

	viewHightlightColour: "#ffffc1",

	view: null,
	headerSVG: null,
	contentSVG: null,

	selectedShelfName: null,

	init: function() {
		var self = this;

		self.height = changeGroupMenuHeaderHeight + changeGroupMenuContentHeight;

		self.view = $("#change-group-menu");
		self.headerSVG = d3.select("#change-group-menu .header svg");
		self.contentSVG = d3.select("#change-group-menu .content svg").append("g")
			.attr("transform", "translate(" + self.contentMargin.left + ", " + self.contentMargin.top + ")");

		self.initHeader();
	},
	initHeader: function() {
		var self = this;
		var headerWidth = self.headerSVG.attr("width");
		var headerHeight = self.headerSVG.attr("height");

		// title
		self.headerSVG.append("text")
			.attr("x", 10)
			.attr("y", headerHeight / 2)
			.style("text-anchor", "start")
			.style("alignment-baseline", "middle")
			.style("font-size", "10px")
			.text("Create Ad-hoc Group");

		// clear
		var clearText = self.headerSVG.append("text")
			.attr("class", "clear-menu-btn")
			.attr("x", headerWidth - 25)
			.attr("y", headerHeight / 2)
			.style("text-anchor", "end")
			.style("alignment-baseline", "middle")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.text("Clear")
			.on("click", clickClearMenuButton);

		// close
		self.headerSVG.append("text")
			.attr("x", headerWidth - 10)
			.attr("y", headerHeight / 2)
			.style("text-anchor", "end")
			.style("alignment-baseline", "middle")
			.style("font-family", "FontAwesome")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.text("\uf00d")
			.on("click", clickRemoveMenuButton);

		function clickClearMenuButton() {
			OOCView.clearGroupsFromShelf(self.selectedShelfName);
			OOCView.removeOccupyShelf(self.selectedShelfName);
			OOCView.restoreShelfToNormal(self.selectedShelfName);
			self.updateTags();
			FeatureView.clear();
		}

		function clickRemoveMenuButton() {
			self.removeView();
		}
	},
	showHeader: function(shelfName) {
		var self = this;

		self.view.find(".header")
			.css("background", OOCView.shelfColors[shelfName].pale);
		self.headerSVG
			.selectAll("text").style("fill", OOCView.shelfColors[shelfName].deep)
		self.headerSVG.select("text")
			.text("Create Ad-hoc Group: " + shelfName.charAt(0).toUpperCase() + shelfName.slice(1) + " Shelf");
	},
	showView: function(shelfName) {
		var self = this;

		// store the current state
		self.selectedShelfName = shelfName;

		// show the view
		var featureViewHeight = featureViewHeaderHeight + featureViewContentHeight + featureViewFooterHeight;
		$("#feature-view").css("height", featureViewHeight - self.height - 1); // 1 is the bottom margin
		$("#feature-view .content").css("height", featureViewContentHeight - self.height - 1);
		self.view.css("display", "block");

		// change header and content
		self.showHeader(shelfName);
		self.updateTags();
	},
	removeView: function() {
		var self = this;

		var featureViewHeight = featureViewHeaderHeight + featureViewContentHeight + featureViewFooterHeight;
		$("#feature-view").css("height", featureViewHeight);
		$("#feature-view .content").css("height", featureViewContentHeight);
		self.view.css("display", "");

		// remove the current state
		self.selectedShelfName = null;
	},

	// START: ACTIONS IN DIFFERENT STATES

	highlightView: function(shelfName) {
		var self = this;

		// the rect should be a bit larger than the view
		var rectHeight = changeGroupMenuContentHeight - self.contentMargin.top - self.contentMargin.bottom + 5;
		var rectWidth = leftContentWidth - self.contentMargin.top - self.contentMargin.bottom + 10;

		if (self.contentSVG.select(".view-hightlight").empty()) {
			var viewHighLight = self.contentSVG
				.append("g")
				.attr("class", "view-hightlight")
				.attr("transform", "translate(0, " +  $("#change-group-menu .content").scrollTop() + ")");

			viewHighLight.append("rect")
				.attr("class", "container-rect")
				.attr("x", -5)
				.attr("y", -5)
				.attr("width", rectWidth)
				.attr("height", rectHeight)
				.style("fill", self.viewHightlightColour)
				.style("fill-opacity", 0.2)
				.style("stroke", OOCView.shelfColors[shelfName].medium)
				.style("stroke-dasharray", "2, 2");

			var text = viewHighLight.append("text")
				.attr("x", (rectWidth - 10) / 2)
				.attr("y", rectHeight - 5)
				.style("fill", OOCView.shelfColors[shelfName].medium)
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle")
				.style("font-size", 8)
				.text("Drop Here");
			var bbox = text.node().getBBox();
			viewHighLight.insert("rect", "text")
				.attr("class", "bg-rect")
				.attr("x", bbox.x - 3)
				.attr("y", bbox.y - 2)
				.attr("width", bbox.width + 6)
				.attr("height", bbox.height + 4)
				.attr("rx", 5)
				.attr("ry", 5)
				.style("stroke", OOCView.shelfColors[shelfName].medium)
				.style("fill", OOCView.shelfColors[shelfName].pale);
		}
		else {
			// fill is the only thing which will be changed
			self.contentSVG.select(".view-hightlight .container-rect")
				.style("stroke", OOCView.shelfColors[shelfName].medium)
				.style("fill-opacity", 0.2);

			self.contentSVG.select(".view-hightlight .bg-rect")
				.style("stroke", OOCView.shelfColors[shelfName].medium)
				.style("fill", OOCView.shelfColors[shelfName].pale);

			self.contentSVG.select(".view-hightlight text")
				.style("fill", OOCView.shelfColors[shelfName].medium);
		}
	},
	doubleHighlightView: function(shelfName) {
		var self = this;

		// assuming that the highlights are already there
		self.contentSVG.select(".view-hightlight .container-rect")
			.style("stroke", OOCView.shelfColors[shelfName].deep)
			.style("fill-opacity", 0.7);

		self.contentSVG.select(".view-hightlight .bg-rect")
			.style("stroke", OOCView.shelfColors[shelfName].deep)
			.style("fill", "white");

		self.contentSVG.select(".view-hightlight text")
			.style("fill", OOCView.shelfColors[shelfName].deep);
	},
	removeHighlight: function() {
		var self = this;

		self.contentSVG.select(".view-hightlight").remove();
	},
	addTagToView: function(groupKey, groupName) {
		var self = this;

		var storedSuccessfully = OOCView.storeGroupToShelf(self.selectedShelfName, groupKey, groupName);
		if (storedSuccessfully)
			self.updateTags();
	},
	removeTagFromView: function(groupKey, groupName) {
		var self = this;

		var removedSuccessfully = OOCView.removeGroupFromShelf(self.selectedShelfName, groupKey, groupName);
		if (removedSuccessfully)
			self.updateTags();
	},
	updateTags: function() {
		var self = this;

		var isViewOpened = self.selectedShelfName != null;
		if (!isViewOpened)
			return;

		// drag on the tag to remove
		var dragTag = d3.behavior.drag()
			.on("dragstart", function() {
				var groupKey = d3.select(this).attr("group-key");
				var groupName = d3.select(this).attr("group-name");

				self.removeTagFromView(groupKey, groupName);
				
				// if there is on groups on shelf, remove the shelf and clear feature view
				OOCView.changeStateOfShelfBasedOnGroups(self.selectedShelfName);
				OOCView.restoreShelfToNormal(self.selectedShelfName);

				// if there is group on shelf after the removal, trigger feaature selection
				if (ComparisonHandler.areBothShelvesOccupied())
					ComparisonHandler.startFeatureSelection();
				else
					FeatureView.clear();

				DragTagHandler.handleDragStart(groupKey, groupName);
			})
			.on("drag", DragTagHandler.handleDrag)
			.on("dragend", DragTagHandler.handleDragEnd);

		// join
		var tagGroup = self.contentSVG.selectAll(".tag")
			.data(OOCView.groupsOnShelves[self.selectedShelfName]);

		// enter
		var tagEnterGroup = tagGroup.enter()
			.append("g")
			.attr("class", "tag")
			.style("cursor", "all-scroll")
			.call(dragTag);

		tagEnterGroup.append("text")
			.style("font-size", 11)
			.style("alignment-baseline", "middle");

		tagEnterGroup.insert("rect", "text");

		// update
		var allTags = self.contentSVG.selectAll(".tag")
			.attr("transform", function(d, i) {
				return "translate(0, " + ((10 + OOCView.shelfHeight) * i + OOCView.shelfHeight / 2) + ")";
			})
			.attr("group-key", function(d) {
				return d.groupKey;
			})
			.attr("group-name", function(d) {
				return d.groupName;
			});

		allTags.each(function(d) {
			
			// update text
			var isGroupKeyShort = d.groupKey.length <= 20;
			var textX = isGroupKeyShort ? OOCView.shelfWidth / 2 : 15;
			var textAnchor = isGroupKeyShort ? "middle" : "start";

			var text = d3.select(this).select("text")
				.attr("x",  textX)
				.style("text-anchor", textAnchor)
				.style("fill", OOCView.shelfColors[self.selectedShelfName].deep)
				.text(function() {
					var groupKeyWithoutID = DataTransformationHandler.returnFeatureNameWithoutID(d.groupKey);
					var textOnTag = (groupKeyWithoutID == "") ? d.groupName : groupKeyWithoutID + ": " + d.groupName;
					
					return textOnTag;
				});

			// update rect
			var bbox = d3.select(this).select("text").node().getBBox();
			var rectX = isGroupKeyShort ? bbox.x - (OOCView.shelfWidth - bbox.width) / 2 : 0;
			var rectWidth = isGroupKeyShort ? OOCView.shelfWidth : bbox.width + 15 + 15;

			d3.select(this).select("rect")
				.attr("x", rectX)
				.attr("y", bbox.y - (OOCView.shelfHeight - bbox.height) / 2)
				.attr("width", rectWidth)
				.attr("height", OOCView.shelfHeight)
				.attr("rx", 5)
				.attr("ry", 5)
				.style("fill", OOCView.shelfColors[self.selectedShelfName].pale)
				.style("stroke", OOCView.shelfColors[self.selectedShelfName].deep);
		});

		// exit
		tagGroup.exit().remove();

		// update height of svg
		self.updateContentSVGHeight();
	},
	updateContentSVGHeight: function() {
		var self = this;
		var numberOfTags = OOCView.groupsOnShelves[self.selectedShelfName].length;
		var newHeight = numberOfTags * (10 + OOCView.shelfHeight) + 10;
		newHeight = (newHeight > changeGroupMenuContentHeight - 2) ? newHeight : changeGroupMenuContentHeight - 2;

		d3.select("#change-group-menu .content svg")
			.attr("height", newHeight);
	},

	// END: ACTIONS IN DIFFERENT STATES

	// START: STATE HANDLER

	handleStateTransitionOnDragstart: function() {
		var self = this;
		var isViewOpened = self.selectedShelfName != null;

		if (isViewOpened)
			self.highlightView(self.selectedShelfName);
	},
	handleStateTransitionOnDrag: function(mouseXRelativeToPage, mouseYRelativeToPage) {
		var self = this;
		var isViewOpened = self.selectedShelfName != null;

		if (isViewOpened) {
			if (self.isOnView(mouseXRelativeToPage, mouseYRelativeToPage))
				self.doubleHighlightView(self.selectedShelfName);
			else
				self.highlightView(self.selectedShelfName);
		}
	},
	handleStateTransitionOnDragEnd: function(mouseXRelativeToPage, mouseYRelativeToPage, groupKey, groupName) {
		var self = this;
		var isViewOpened = self.selectedShelfName != null;

		if (isViewOpened) {
			if (self.isOnView(mouseXRelativeToPage, mouseYRelativeToPage)) {

				// try to add the groups to shelf
				self.addTagToView(groupKey, groupName);
				OOCView.changeStateOfShelfBasedOnGroups(self.selectedShelfName);
				self.removeHighlight();

				// restore the visual appearance based on state
				for (var i = 0; i < OOCView.shelfList.length; i++)
					OOCView.restoreShelfToNormal(OOCView.shelfList[i]);

				// check if need to start feature selection
				if (ComparisonHandler.areBothShelvesOccupied())
					ComparisonHandler.startFeatureSelection();
			}
			else {
				self.removeHighlight();
			}
		}
	},

	// END: STATE HANDLER

	isOnView: function(clientX, clientY) {
		var self = this;

		var topEdgeY = $("#change-group-menu .content").position().top + 8; // 8 is the margin
		var bottomEdgeY = topEdgeY + changeGroupMenuContentHeight;
		var leftEdgeX = $("#change-group-menu .content").position().left + 8;
		var rightEdgeX = leftEdgeX + leftContentWidth;

		if (clientX >= leftEdgeX && clientX <= rightEdgeX && clientY >= topEdgeY && clientY <= bottomEdgeY)
			return true;
		else
			return false;
	}
}