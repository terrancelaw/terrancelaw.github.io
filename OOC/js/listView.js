var ListView = {
	margin: { top: 10, left: 0, bottom: 10, right: 5 }, // no left padding as the scroll bar already takes some space
	width: null,
	rowHeight: 25,

	contentSVG: null,
	headerSVG: null,

	init: function() {
		var self = this;

		self.width = leftContentWidth - self.margin.left - self.margin.right;

		self.headerSVG = d3.select("#list-view .header svg");
		self.contentSVG = d3.select("#list-view .content svg")
			.attr("height", Database.data.length * self.rowHeight)
			.append("g");

		self.drawTable();
	},
	drawTable: function() {
		var self = this;

		// drag on a group
		var dragGroup = d3.behavior.drag()
			.on("dragstart", function() {
				var mouseXRelativeToPage = event.clientX;
				var mouseYRelativeToPage = event.clientY;

				var groupKey = d3.select(this).attr("group-key");
				var groupName = d3.select(this).attr("group-name");
				var textInside = groupKey + ": " + groupName;

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
				$("#draggable-tag").remove();
			});

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

		// create group for hovering
		row.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.width)
			.attr("height", self.rowHeight);

		// create name
		row.append("text")
			.attr("class", "name")
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

		// create header
		self.headerSVG.append("text")
			.attr("x", self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("City");
		self.headerSVG.append("text")
			.attr("x", self.width / 3 + self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("Country");
		self.headerSVG.append("text")
			.attr("x", self.width / 3 * 2 + self.width / 3 / 2)
			.attr("y", self.rowHeight / 2)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("Continent");

		function mouseenterGroup() {
			var mouseX = d3.mouse(this)[0];
			var mouseoverGroupName = d3.select(this).attr("group-name").split(" ").join("-");

			// remove previous background
			d3.selectAll(".background-on-hover")
				.remove();

			// highlight related group
			d3.selectAll(".row ." + mouseoverGroupName)
				.each(function() {
					var bbox = d3.select(this).select("text")[0][0]
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
	},
	moveTagTo: function(left, top) {
		$("#draggable-tag")
			.css("left", left)
			.css("top", top);
	}
}