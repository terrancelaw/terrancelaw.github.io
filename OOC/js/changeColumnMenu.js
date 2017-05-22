var ChangeColumnMenu = {
	margin: { top: 15, left: 10, bottom: 15, right: 10 },

	featureHeight: 20,
	contentWidth: null,
	footerWidth: null,
	footerRectHeight: 20,

	view: null,
	headerSVG: null,
	contentSVG: null,
	footerSVG: null,

	init: function() {
		var self = this;

		self.contentWidth = leftContentWidth - self.margin.left - self.margin.right;
		self.footerWidth = changeColumnMenuFooterSVGWidth - self.margin.left - self.margin.right;

		self.view = $("#list-view .menu");
		self.headerSVG = d3.select("#list-view .menu .header svg"); // no need to shift
		self.contentSVG = d3.select("#list-view .menu .content svg").append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");
		self.footerSVG = d3.select("#list-view .menu .footer svg").append("g")
			.attr("transform", "translate(" + self.margin.left + ", 5)");

		self.drawHeader();
		self.drawFooter();
	},
	drawHeader: function() {
		var self = this;
		var headerWidth = self.headerSVG.attr("width");
		var headerHeight = self.headerSVG.attr("height");

		self.headerSVG.append("text")
			.attr("x", 10)
			.attr("y", headerHeight / 2)
			.style("text-anchor", "start")
			.style("alignment-baseline", "middle")
			.style("font-size", "12px")
			.text("Change Column");
		self.headerSVG.append("text")
			.attr("x", headerWidth - 10)
			.attr("y", headerHeight / 2)
			.style("text-anchor", "end")
			.style("alignment-baseline", "middle")
			.text("\uf00d")
			.style("font-family", "FontAwesome")
			.style("class", "remove-menu-icon")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.on("click", clickRemoveMenuButton);

		function clickRemoveMenuButton() {
			// restore table
			$("#list-view .table").css("height", listViewHeaderHeight + listViewContentHeight);
			$("#list-view .table .content").css("height", listViewContentHeight);
			$("#list-view .table").removeClass("ui-bottom-border");

			// restore footer
			$("#list-view .menu .footer").css("display", "none");
			$("#list-view .menu .content").css("height", changeColumnMenuContentHeight);
			
			self.view.css("height", 0);
		}
	},
	drawContent: function(thisColumnFeature) {
		var self = this;
		var featureListToBeShown = [];

		// remove previous
		self.contentSVG.selectAll(".feature").remove();

		// find all features except current and id
		for (var key in Database.data[0]) {
			if (key != Database.idKey && key != thisColumnFeature)
				featureListToBeShown.push(key);
		}
		featureListToBeShown.sort();

		// create list
		var featureGroup = self.contentSVG.selectAll(".feature")
			.data(featureListToBeShown)
			.enter()
			.append("g")
			.attr("class", "feature")
			.attr("transform", function(d, i) {
				return "translate(0, " + (i * self.featureHeight) + ")";
			})
			.style("cursor", "pointer")
			.on("mouseenter", mouseenterFeatureGroup)
			.on("mouseleave", mouseleaveFeatureGroup)
			.on("click", clickFeatureGroup)
		featureGroup.each(function(d) {
			var featureText = d3.select(this).append("text")
				.text(d);

			var bbox = featureText.node().getBBox();
			d3.select(this).insert("rect", "text")
				.attr("width", bbox.width + 12)
				.attr("height", bbox.height + 6)
				.attr("x", bbox.x - 6)
				.attr("y", bbox.y - 3)
				.attr("rx", 5)
				.attr("ry", 5)
				.style("fill", "white");
		});

		// change svg height
		d3.select("#list-view .menu .content svg")
			.attr("height", self.featureHeight * featureListToBeShown.length);

		function mouseenterFeatureGroup() {
			d3.select(this).select("rect")
				.style("fill", "#ffffe5");
		}
		function mouseleaveFeatureGroup() {
			d3.select(this).select("rect")
				.style("fill", "white");
		}
		function clickFeatureGroup() {
			// change height of the feature list
			$("#list-view .menu .footer").css("display", "flex");
			$("#list-view .menu .content").css("height", changeColumnMenuContentHeight - changeColumnMenuFooterHeight);
		}
	},
	drawFooter: function() {
		var self = this;
		var numberOfGroups = parseInt($("#list-view .menu .footer  select").val());

		// draw rect
		self.footerSVG.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.footerWidth - 20)
			.attr("height", self.footerRectHeight)
			.style("fill", "white")
			.style("stroke", "#e5e5e5");

		// draw divisor
		var segmentWidth = (self.footerWidth - 20) / 3;
		for (var i = 0; i < numberOfGroups -  1; i++) {
			self.footerSVG.append("line")
				.attr("x1", segmentWidth * (i + 1))
				.attr("x2", segmentWidth * (i + 1))
				.attr("y1", 0)
				.attr("y2", self.footerRectHeight)
				.style("stroke", "#e5e5e5")
				.style("cursor", "ew-resize")
				.on("mouseover", mouseoverDivisor)
				.on("mouseout", mouseoutDivisor);
		}

		// draw apply button
		self.footerSVG.append("text")
			.attr("x", self.footerWidth)
			.attr("y", self.footerRectHeight / 2)
			.style("text-anchor", "end")
			.style("alignment-baseline", "middle")
			.text("\uf00c")
			.style("font-family", "FontAwesome")
			.style("class", "apply-icon")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.on("click", clickApplyButton);

		function clickApplyButton() {
			// restore table
			$("#list-view .table").css("height", listViewHeaderHeight + listViewContentHeight);
			$("#list-view .table .content").css("height", listViewContentHeight);
			$("#list-view .table").removeClass("ui-bottom-border");

			// restore footer
			$("#list-view .menu .footer").css("display", "none");
			$("#list-view .menu .content").css("height", changeColumnMenuContentHeight);
			
			self.view.css("height", 0);
		}
		function mouseoverDivisor() {
			d3.select(this)
				.style("stroke-width", 3);
		}
		function mouseoutDivisor() {
			d3.select(this)
				.style("stroke-width", 1);
		}
	},
	show: function(thisColumnFeature) {
		var self = this;

		$("#list-view .table").css("height", (listViewHeaderHeight + listViewContentHeight) / 2);
		$("#list-view .table .content").css("height", (listViewHeaderHeight + listViewContentHeight) / 2 - listViewHeaderHeight);
		$("#list-view .table").addClass("ui-bottom-border");
		self.view.css("display", "block");

		self.drawContent(thisColumnFeature);
	}
}