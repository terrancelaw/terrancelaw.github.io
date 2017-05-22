var ListView = {
	margin: { top: 10, left: 0, bottom: 10, right: 5 }, // no left padding as the scroll bar already takes some space
	width: null,
	rowHeight: 25,

	contentSVG: null,
	headerSVG: null,
	footerSVG: null,

	init: function() {
		var self = this;

		self.width = leftContentWidth - self.margin.left - self.margin.right;

		self.headerSVG = d3.select("#list-view .table .header svg");
		self.contentSVG = d3.select("#list-view .table .content svg")
			.attr("height", Database.data.length * self.rowHeight)
			.append("g");
		self.footerSVG = d3.select("#list-view .table .footer svg");

		// drag on a group
		var dragGroup = d3.behavior.drag()
			.on("dragstart", function() {
				var mouseXRelativeToPage = event.clientX;
				var mouseYRelativeToPage = event.clientY;

				var groupKey = d3.select(this).attr("group-key");
				var groupName = d3.select(this).attr("group-name");
				var textInside = (groupKey == "") ? groupName : groupKey + ": " + groupName;

				var tagLeft = mouseXRelativeToPage - OOCView.shelfWidth / 2;
				var tagRight = mouseYRelativeToPage - OOCView.shelfHeight / 2

				self.createTag(textInside);
				self.moveTagTo(tagLeft, tagRight);
				
				// handle states
				OOCView.handleStateTransitionOnDragstart();
			})
			.on("drag", function() {
				// change tag position
				var mouseXRelativeToPage = event.clientX;
				var mouseYRelativeToPage = event.clientY;
				var tagLeft = mouseXRelativeToPage - OOCView.shelfWidth / 2;
				var tagRight = mouseYRelativeToPage - OOCView.shelfHeight / 2;
				self.moveTagTo(tagLeft, tagRight);

				// handle states
				var currentShelf = OOCView.onWhichShelf(mouseXRelativeToPage, mouseYRelativeToPage);
				var textOnTag = d3.select("#draggable-tag svg text").text();
				OOCView.handleStateTransitionOnDrag(currentShelf, textOnTag);
			})
			.on("dragend", function() {
				var mouseXRelativeToPage = event.clientX;
				var mouseYRelativeToPage = event.clientY;

				// handle states
				var currentShelf = OOCView.onWhichShelf(mouseXRelativeToPage, mouseYRelativeToPage);
				var textOnTag = d3.select("#draggable-tag svg text").text();
				OOCView.handleStateTransitionOnDragEnd(currentShelf, textOnTag);

				// remove tag
				var isTagPlacedOnShelf = (currentShelf != "none");
				self.removeTag(isTagPlacedOnShelf);
			});

		self.drawHeader();
		self.drawContent(dragGroup);
		self.drawFooter(dragGroup);
	},
	drawHeader: function() {
		var self = this;

		// first column
		var firstColumnHeader = self.headerSVG.append("g");

		var firstColumnTitle = firstColumnHeader.append("text")
			.attr("x", self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("City");

		var bbox = firstColumnTitle.node().getBBox();
		var idText = firstColumnHeader.append("text")
			.attr("x", self.width / 3 / 2 + bbox.width / 2 + 10)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("ID")
			.style("class", "id-icon")
			.style("font-size", "9px");

		var bbox = idText.node().getBBox();
		firstColumnHeader.insert("rect", ".id-icon")
			.attr("x", bbox.x - 3)
			.attr("y", bbox.y - 1)
			.attr("width", bbox.width + 6)
			.attr("height", bbox.height  + 2)
			.attr("rx", 3)
			.attr("ry", 3)
			.style("fill", "gray")
			.style("opacity", 0.3);

		// second column
		var secondColumnHeader = self.headerSVG.append("g")
			.attr("transform", "translate(" + self.width / 3 + ", 0)");

		var secondColumnTitle = secondColumnHeader.append("text")
			.attr("x", self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("Country");
		
		var bbox = secondColumnTitle.node().getBBox();
		var changeButtonText = secondColumnHeader.append("text")
			.attr("x", self.width / 3 / 2 + bbox.width / 2 + 8)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("\uf00b")
			.style("font-family", "FontAwesome")
			.style("class", "change-icon1")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.on("click", clickChangeButton);

		// third column
		var thirdColumnHeader = self.headerSVG.append("g")
			.attr("transform", "translate(" + self.width / 3 * 2 + ", 0)");

		var thirdColumnTitle = thirdColumnHeader.append("text")
			.attr("x", self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("Continent");
		
		var bbox = thirdColumnTitle.node().getBBox();
		var changeButtonText = thirdColumnHeader.append("text")
			.attr("x", self.width / 3 / 2 + bbox.width / 2 + 8)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("\uf00b")
			.style("font-family", "FontAwesome")
			.style("class", "change-icon2")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.on("click", clickChangeButton);

		function clickChangeButton() {
			var thisColumnFeature = d3.select(this.parentNode).select("text").text();
			ChangeColumnMenu.show(thisColumnFeature);
		}
	},
	drawContent: function(dragGroup) {
		var self = this;

		// create rows
		var row = self.contentSVG.selectAll(".row")
			.data(Database.data)
			.enter()
			.append("g")
			.attr("class", function(d, i) {
				if (i % 2 == 0)
					return "row " + "even";
				else
					return "row " + "odd";
			})
			.attr("transform", function(d, i) {
				return "translate(0," + i * self.rowHeight + ")";
			});

		// create rect for hovering
		row.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.width)
			.attr("height", self.rowHeight);

		// create id
		var id = row.append("g")
			.attr("class", function(d) {
				var groupName = d["City"].split(" ").join("-");
				return "id " + groupName;
			})
			.attr("group-name", function(d) {
				var groupName = d["City"];
				return groupName;
			})
			.attr("group-key", "City")
			.style("cursor", "all-scroll")
			.on("mouseenter", mouseenterGroup)
			.on("mouseleave", mouseleaveGroup)
			.call(dragGroup);
		id.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.width / 3)
			.attr("height", self.rowHeight)
			.style("fill", "white")
			.style("opacity", 0);
		id.append("text")
			.attr("x", self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text(function(d) {
				return d["City"];
			});

		// create group 1
		var group1 = row.append("g")
			.attr("class", function(d) {
				var groupName = d["Country"].split(" ").join("-");
				return "group1 " + groupName;
			})
			.attr("group-name", function(d) {
				var groupName = d["Country"];
				return groupName;
			})
			.attr("group-key", "Country")
			.style("cursor", "all-scroll")
			.on("mouseenter", mouseenterGroup)
			.on("mouseleave", mouseleaveGroup)
			.call(dragGroup);
		group1.append("rect")
			.attr("x", self.width / 3)
			.attr("y", 0)
			.attr("width", self.width / 3)
			.attr("height", self.rowHeight)
			.style("fill", "white")
			.style("opacity", 0);
		group1.append("text")
			.attr("x", self.width / 3 + self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text(function(d) {
				return d["Country"];
			});

		// create group 2
		var group2 = row.append("g")
			.attr("class", function(d) {
				var groupName = d["Continent"].split(" ").join("-");
				return "group2 " + groupName;
			})
			.attr("group-name", function(d) {
				var groupName = d["Continent"];
				return groupName;
			})
			.attr("group-key", "Continent")
			.style("cursor", "all-scroll")
			.on("mouseenter", mouseenterGroup)
			.on("mouseleave", mouseleaveGroup)
			.call(dragGroup);
		group2.append("rect")
			.attr("x", self.width / 3 * 2)
			.attr("y", 0)
			.attr("width", self.width / 3)
			.attr("height", self.rowHeight)
			.style("fill", "white")
			.style("opacity", 0);
		group2.append("text")
			.attr("x", self.width / 3 * 2 + self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text(function(d) {
				return d["Continent"];
			});

		function mouseenterGroup() {
			var mouseX = d3.mouse(this)[0];
			var mouseoverGroupName = d3.select(this).attr("group-name").split(" ").join("-");

			// remove previous background
			d3.selectAll(".background-on-hover")
				.remove();

			// highlight related group
			d3.selectAll(".row ." + mouseoverGroupName)
				.each(function() {
					var bbox = d3.select(this).select("text").node()
						.getBBox();

					d3.select(this)
						.insert("rect", "text")
						.attr("class", "background-on-hover")
						.attr("x", bbox.x - 5)
						.attr("y", bbox.y - 3)
						.attr("width", bbox.width + 10)
						.attr("height", bbox.height  + 6)
						.attr("rx", 3)
						.attr("ry", 3)
						.style("fill", "gray")
						.style("opacity", 0.3);
				});
		}

		function mouseleaveGroup() {
			// remove background
			d3.selectAll(".background-on-hover")
				.remove();
		}
	},
	drawFooter: function(dragGroup) {
		var self = this;
		var footerWidth = self.footerSVG.attr("width");

		var group = self.footerSVG.append("g")
			.attr("class", "everything-else")
			.attr("group-name", "Everything Else")
			.attr("group-key", "")
			.style("cursor", "all-scroll")
			.on("mouseenter", mouseenterEverythingElse)
			.on("mouseleave", mouseleaveEverythingElse)
			.call(dragGroup);
		var text = group.append("text")
			.attr("x", footerWidth - 15)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "end")
			.style("alignment-baseline", "middle")
			.style("opacity", 0.3)
			.text("Everything Else");

		var bbox = text.node().getBBox();
		group.insert("rect", "text")
			.attr("x", bbox.x - 5)
			.attr("y", bbox.y - (self.rowHeight - bbox.height) / 2)
			.attr("width", bbox.width + 10)
			.attr("height", self.rowHeight)
			.style("fill", "white")
			.style("opacity", 0);
		group.insert("rect", "text")
			.attr("class", "background")
			.attr("x", bbox.x - 5)
			.attr("y", bbox.y - 3)
			.attr("width", bbox.width + 10)
			.attr("height", bbox.height  + 6)
			.attr("rx", 3)
			.attr("ry", 3)
			.style("fill", "gray")
			.style("opacity", 0.1);

		function mouseenterEverythingElse() {
			d3.select(this).select("rect.background")
				.style("opacity", 0.3);
			d3.select(this).select("text")
				.style("opacity", 1);
		}

		function mouseleaveEverythingElse() {
			d3.select(this).select("rect.background")
				.style("opacity", 0.1);
			d3.select(this).select("text")
				.style("opacity", 0.3);
		}
	},
	createTag: function(textInside) {
		var self = this;

		// append the tag
		$("body").append("<div id='draggable-tag'><svg></svg></div>");

		// create tag
		var tagSVG = d3.select("#draggable-tag svg");

		tagSVG.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", OOCView.shelfWidth)
			.attr("height", OOCView.shelfHeight)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "gray")
			.style("opacity", 0.3);

		tagSVG.append("text")
			.attr("x", OOCView.shelfWidth / 2)
			.attr("y", OOCView.shelfHeight / 2)
			.style("fill", "black")
			.style("opacity", 0.3)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.style("font-size", "11px")
			.text(textInside);

		// Everything else tag can only appear once
		if (textInside == "Everything Else") {
			$("#list-view .table .footer")
				.css("display", "none");
		}
	},
	removeTag: function(isTagPlacedOnShelf) { // need to handle the everything else icon as well
		var self = this;
		var textInside = $("#draggable-tag").text();

		// remove tag
		$("#draggable-tag").remove();

		// Everything else tag appears again
		if (textInside == "Everything Else" && !isTagPlacedOnShelf) {
			$("#list-view .table .footer")
				.css("display", "");
		}
	},
	moveTagTo: function(left, top) {
		$("#draggable-tag")
			.css("left", left)
			.css("top", top);
	}
}