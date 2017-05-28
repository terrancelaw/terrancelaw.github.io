var ChangeColumnMenu = {
	contentMargin: { top: 15, left: 20, bottom: 15, right: 10 },
	footerMargin: { top: 5, left: 10, bottom: 5, right: 10 },

	featureHeight: 20,
	contentWidth: null,
	footerSVGWidth: null,
	footerRectHeight: 15,
	footerRectWidth: null,
	footerMiddleY: null,

	// for drawing footer dynamic content
	footerXScale: null,
	selectedFeatureValueArray: [],
	footerScaleColour: "#435e69",
	partition: null, // for storing the range of different groups when switch is pressed

	view: null,
	headerSVG: null,
	contentSVG: null,
	footerSVG: null,

	selectedNewFeature: null,
	selectedColumnGroup: null,
	selectedColumnFeature: null,

	init: function() {
		var self = this;

		self.contentWidth = leftContentWidth - self.contentMargin.left - self.contentMargin.right;
		self.footerSVGWidth = changeColumnMenuFooterSVGWidth - self.footerMargin.left - self.footerMargin.right;
		self.footerRectWidth = self.footerSVGWidth - 20 - 25;
		self.footerMiddleY = changeColumnMenuFooterHeight /  2 - self.footerMargin.top + 3;

		self.view = $("#list-view .menu");
		self.headerSVG = d3.select("#list-view .menu .header svg"); // no need to shift
		self.contentSVG = d3.select("#list-view .menu .content svg").append("g")
			.attr("transform", "translate(" + self.contentMargin.left + ", " + self.contentMargin.top + ")");
		self.footerSVG = d3.select("#list-view .menu .footer svg").append("g")
			.attr("transform", "translate(" + self.footerMargin.left + ", " + self.footerMargin.top + ")");

		self.initHeader();
		self.initFooter();
	},
	initHeader: function() {
		var self = this;
		var headerWidth = self.headerSVG.attr("width");
		var headerHeight = self.headerSVG.attr("height");

		self.headerSVG.append("text")
			.attr("x", 10)
			.attr("y", headerHeight / 2)
			.style("text-anchor", "start")
			.style("alignment-baseline", "middle")
			.style("font-size", "10px")
			.style("fill", "#435e69")
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
			.style("fill", "#435e69")
			.on("click", clickRemoveMenuButton);

		function clickRemoveMenuButton() {
			// restore table
			$("#list-view .table").css("height", listViewHeaderHeight + listViewContentHeight);
			$("#list-view .table .content").css("height", listViewContentHeight);
			$("#list-view .table").removeClass("ui-bottom-border");

			// restore footer
			$("#list-view .menu .footer").css("display", "none");
			$("#list-view .menu .content").css("height", changeColumnMenuContentHeight);
			self.view.css("display", "");

			// remove properties
			self.selectedNewFeature = null;
			self.selectedColumnGroup = null;
			self.selectedColumnFeature = null;
		}
	},
	initFooter: function() {
		var self = this;
		var numberOfGroups = parseInt($("#list-view .menu .footer  select option:selected").val());

		// set group selector
		$("#group-selector").on("change", changeGroupSelector);

		// draw switch button
		self.footerSVG.append("text")
			.attr("class", "switch-btn")
			.attr("x", self.footerSVGWidth - 15)
			.attr("y", self.footerMiddleY)
			.style("text-anchor", "end")
			.style("alignment-baseline", "middle")
			.text("\uf0ec")
			.style("font-family", "FontAwesome")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.style("fill", "#435e69")
			.on("click", clickSwitchButton);

		// draw apply button
		self.footerSVG.append("text")
			.attr("class", "apply-btn")
			.attr("x", self.footerSVGWidth)
			.attr("y", self.footerMiddleY)
			.style("text-anchor", "end")
			.style("alignment-baseline", "middle")
			.text("\uf00c")
			.style("font-family", "FontAwesome")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.style("fill", "#435e69")
			.on("click", clickApplyButton);

		function changeGroupSelector() {
			var numberOfGroups = parseInt($("#group-selector option:selected").val());

			self.footerSVG.select(".switch-btn").classed("uneven", false);
			self.drawTextBox(numberOfGroups);
			self.drawIntervals(numberOfGroups);
			self.drawNumbers(numberOfGroups);
		}

		function clickSwitchButton() {
			var numberOfGroups = parseInt($("#group-selector option:selected").val());
			if (d3.select(this).classed("uneven")) {
				self.drawTextBox(numberOfGroups);
				self.drawIntervals(numberOfGroups);
				self.drawNumbers(numberOfGroups);

				// unmark the change
				d3.select(this).classed("uneven", false);
				return;
			}

			var numberInOneGroup = Math.ceil(self.selectedFeatureValueArray.length / numberOfGroups);
			var numbersToBeDrawn = [];
			for (var i = 0; i <= numberOfGroups; i++) {
				var minIndex = 0; // first time, get from index = 0
				var getValueFromIndex = (i == numberOfGroups) ? self.selectedFeatureValueArray.length - 1 : minIndex + numberInOneGroup * i; // make sure that it covers the whole range
				numbersToBeDrawn.push(self.selectedFeatureValueArray[getValueFromIndex]);

				if (numbersToBeDrawn.length > 1) {
					var previousValueStored = numbersToBeDrawn[numbersToBeDrawn.length - 2];
					var nextValueStored = numbersToBeDrawn[numbersToBeDrawn.length - 1];

					// try to remove duplicate
					if (previousValueStored >= nextValueStored) {
						for (var j = getValueFromIndex + 1; j < self.selectedFeatureValueArray.length; j++) {
							if (!(previousValueStored >= self.selectedFeatureValueArray[j])) {
								numbersToBeDrawn[numbersToBeDrawn.length - 1] = self.selectedFeatureValueArray[j];
								break;
							}
						}
					}

					// allow duplicate only in the last two values
					var previousValueStored = numbersToBeDrawn[numbersToBeDrawn.length - 2];
					var nextValueStored = numbersToBeDrawn[numbersToBeDrawn.length - 1];
					if (previousValueStored > nextValueStored) { // if still less than previous, no values is larger than previous
						numbersToBeDrawn[numbersToBeDrawn.length - 1] = previousValueStored;
						break;
					}
					if (previousValueStored == nextValueStored) // if still the same, break
						break;
				}
			}

			// draw the numbers and intervals
			var numberOfGroups = numbersToBeDrawn.length; // may change
			$("#group-selector").val(numberOfGroups - 1);
			self.drawTextBox(numberOfGroups - 1, numbersToBeDrawn);
			self.drawIntervals(numberOfGroups - 1, numbersToBeDrawn);
			self.drawNumbers(numberOfGroups - 1, numbersToBeDrawn);

			// store the partition
			numbersToBeDrawn.pop();
			self.partition = numbersToBeDrawn;

			// mark the change
			d3.select(this).classed("uneven", true);
		}

		function clickApplyButton() {
			var numberOfGroups = parseInt($("#group-selector option:selected").val());

			// restore table
			$("#list-view .table").css("height", listViewHeaderHeight + listViewContentHeight);
			$("#list-view .table .content").css("height", listViewContentHeight);
			$("#list-view .table").removeClass("ui-bottom-border");

			// restore footer
			$("#list-view .menu .footer").css("display", "none");
			$("#list-view .menu .content").css("height", changeColumnMenuContentHeight);
			self.view.css("display", "");

			// get and set group name
			var newGroupNames = [];
			d3.selectAll("#list-view .menu .footer .textbox").each(function(d, i) {
				var groupName = d3.select(this).select("text").attr("group-name");
				var isEmpty = d3.select(this).select("text").text() == "";

				if (!isEmpty && !isNaN(groupName.charAt(0)))
					groupName = "Group" + groupName;
				if (isEmpty)
					groupName = "Group" + (i + 1);

				newGroupNames.push(groupName);
			});
			DataTransformationHandler.setGroupNames(newGroupNames);

			// change data and update table
			var newFeatureName = DataTransformationHandler.partitionQuantitativeFeature(self.selectedNewFeature, numberOfGroups, self.partition);
			DataTransformationHandler.removeDerivedFeatureFromDatabase(self.selectedColumnFeature);
			ListView.changeColumn(self.selectedColumnGroup, newFeatureName);

			// remove properties
			self.selectedNewFeature = null;
			self.selectedColumnGroup = null;
			self.selectedColumnFeature = null;
		}
	},
	showHeader: function(thisColumnFeature) {
		var self = this;

		self.headerSVG.select("text")
			.text("Change Column: " + thisColumnFeature);
	},
	showContent: function(thisColumnFeature) {
		var self = this;
		var featureListToBeShown = [];

		// remove previous
		self.contentSVG.selectAll(".feature").remove();

		// find all features except current, id and derived (has # = derived)
		for (var key in Database.data[0]) {
			if (key != Database.idKey && key != thisColumnFeature && key.indexOf("#") == -1)
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
				.style("fill", self.footerScaleColour)
				.style("font-weight", "bold")
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
			.attr("height", self.featureHeight * featureListToBeShown.length + 5);

		function mouseenterFeatureGroup() {
			d3.select(this).select("rect")
				.style("fill", "#ffffe5");
		}
		function mouseleaveFeatureGroup() {
			d3.select(this).select("rect")
				.style("fill", "white");
		}
		function clickFeatureGroup() {
			self.selectedNewFeature = d3.select(this).select("text").text(); // store selected attribute for use later

			// change rect before the text
			d3.select(this.parentNode).selectAll(".feature rect")
				.style("stroke", "none");
			d3.select(this).select("rect")
				.style("stroke", "gray")
				.style("stroke-dasharray", "2, 2");

			self.showFooter(self.selectedNewFeature);
		}
	},
	showFooter: function(featureName) {
		var self = this;

		// init
		self.partition = null;
		self.footerSVG.select(".switch-btn").classed("uneven", false);
		$("#group-selector").val("3"); // reset the dropdown menu

		// change height of the feature list
		$("#list-view .menu .footer").css("display", "flex");
		$("#list-view .menu .content").css("height", changeColumnMenuContentHeight - changeColumnMenuFooterHeight);

		self.preprocessDataOnShowFooter(featureName)
		self.drawTextBox(3);
		self.drawIntervals(3);
		self.drawNumbers(3);
	},
	preprocessDataOnShowFooter: function(featureName) {
		var self = this;

		// create array of value
		var valueArray = [];
		for (var i = 0; i < Database.data.length; i++)
			valueArray.push(Database.data[i][featureName]);
		valueArray.sort();

		// create scale
		var xScale = d3.scale.linear()
			.domain(d3.extent(valueArray))
			.range([0, self.footerRectWidth]);

		// store the results
		self.footerXScale = xScale;
		self.selectedFeatureValueArray = valueArray;
	},
	drawTextBox: function(numberOfGroups, numbersToBeDrawn = null) {
		var self = this;

		// remove previous
		self.footerSVG.selectAll(".textbox").remove();

		// if numbersToBeDrawn not provided, create it
		if (!numbersToBeDrawn) {
			var minValue = d3.min(self.footerXScale.domain());
			var maxValue = d3.max(self.footerXScale.domain());
			numbersToBeDrawn = DataTransformationHandler.returnBoundariesOfIntervals(minValue, maxValue, numberOfGroups);
		}

		// find xArray
		var xArray = [];
		var isLastItemDuplicated = numbersToBeDrawn[numbersToBeDrawn.length - 1] == numbersToBeDrawn[numbersToBeDrawn.length - 2];
		for (var i = 0; i < numbersToBeDrawn.length - 1; i++) {
			var interval = self.footerXScale(numbersToBeDrawn[i + 1]) - self.footerXScale(numbersToBeDrawn[i]);
			var xPosition = self.footerXScale(numbersToBeDrawn[i]) + interval / 2;

			if (isLastItemDuplicated && i == numbersToBeDrawn.length - 2)
				xPosition += 5; // dummy length = 10

			xArray.push(xPosition);
		}

		// draw new ones
		var textboxWidth = 15;
		var textboxHeight = 10;
		for (var i = 0; i < numberOfGroups; i++) {
			var textBoxGroup = self.footerSVG.append("g")
				.attr("class", "textbox")
				.style("cursor", "text")
				.on("click", clickTextBox);

			var rect = textBoxGroup.append("rect")
				.attr("x", xArray[i] - textboxWidth / 2)
				.attr("y", self.footerMiddleY - self.footerRectHeight / 2 - textboxHeight - 5)
				.attr("width", textboxWidth)
				.attr("height", textboxHeight)
				.attr("rx", 5)
				.attr("ry", 5)
				.style("fill", "white")
				.style("stroke", self.footerScaleColour);

			var text = textBoxGroup.append("text")
				.attr("x", xArray[i])
				.attr("y", self.footerMiddleY - self.footerRectHeight / 2 - textboxHeight / 2 - 5)
				.style("fill", self.footerScaleColour)
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle");
		}

		function clickTextBox() {
			var thisTextBox = this;

			var footerSVGTop = $("#list-view .menu .footer svg").position().top;
			var footerSVGLeft = $("#list-view .menu .footer svg").position().left;
			var footerSVGTranslateX = self.footerMargin.left;
			var footerSVGTranslateY = self.footerMargin.top;
			var rectX = parseFloat(d3.select(thisTextBox).select("rect").attr("x"));
			var rectY = parseFloat(d3.select(thisTextBox).select("rect").attr("y"));

			var textInside = d3.select(thisTextBox).select("text").attr("group-name");

			// append the text box
			$("body").append("<input type='text' id='category-name-editor'></input>")

			// edit the text box
			var isSafari = navigator.userAgent.indexOf("Safari") > -1 && !(navigator.userAgent.indexOf('Chrome') > -1);
			var editorLeft = footerSVGLeft + footerSVGTranslateX + rectX - 2;
			var editorTop = footerSVGTop + footerSVGTranslateY + rectY - 2;
			if (isSafari) { // adjust position for safari
				editorLeft += 8;
				editorTop += 8;
			}
			$("#category-name-editor")
				.css("left", editorLeft)
				.css("top", editorTop)
				.css("height", textboxHeight + 2)
				.css("width", textboxWidth * 2)
				.css("padding", "0px 0px 0px 3px")
				.css("border-radius", "5px")
				.css("border-style", "solid")
				.css("border-color", self.footerScaleColour)
				.css("border-width", "1px")
				.on("blur", blurTextBox)
				.on("keydown", keydownTextBox)
				.val(textInside)
				.focus();

			function blurTextBox() {
				var textInside = $(this).val();
				var shortTextInside = (textInside.length <= 2) ? textInside : textInside.substring(0, 1) + "..";

				d3.select(thisTextBox).select("text")
					.attr("group-name", textInside)
					.text(shortTextInside);

				$(this).remove();
			}

			function keydownTextBox() {
				var e = event || evt; // for trans-browser compatibility
			    var charCode = e.which || e.keyCode;
			    
			    // if press on tab
			    if (charCode == 9) {
			    	// find the next textbox
			    	var nextTextBox;
			    	if (!d3.select(thisTextBox.nextSibling).empty() && d3.select(thisTextBox.nextSibling).classed("textbox"))
			    		nextTextBox = thisTextBox.nextSibling;
			    	else
			    		nextTextBox = d3.select(thisTextBox.parentNode).select(".textbox").node();

			    	// remove current textbox and focus on the next one
			    	$("#category-name-editor").blur();
			        var clickEvent = new MouseEvent("click");
			        nextTextBox.dispatchEvent(clickEvent);

			        return false; // overwrite default behaviour
			    }

			    // if press on enter
			    if (charCode == 13) {
			    	$("#category-name-editor").blur();

			    	return false;
			    }
			    
			    return true;
			}
		}
	},
	drawIntervals: function(numberOfGroups, numbersToBeDrawn = null) {
		var self = this;

		// remove previous
		self.footerSVG.selectAll(".interval").remove();

		// if numbersToBeDrawn not provided, create it
		if (!numbersToBeDrawn) {
			var minValue = d3.min(self.footerXScale.domain());
			var maxValue = d3.max(self.footerXScale.domain());
			numbersToBeDrawn = DataTransformationHandler.returnBoundariesOfIntervals(minValue, maxValue, numberOfGroups);
		}

		// create data
		var rectData = [];
		var isLastItemDuplicated = numbersToBeDrawn[numbersToBeDrawn.length - 1] == numbersToBeDrawn[numbersToBeDrawn.length - 2];
		for (var i = 0; i < numbersToBeDrawn.length - 1; i++) {
			// find number of data points between the range
			var count = 0;
			var lowerBound = numbersToBeDrawn[i];
			var upperBound = numbersToBeDrawn[i + 1];
			for (var j = 0; j < self.selectedFeatureValueArray.length; j++) {
				var greaterThanLowerBound = self.selectedFeatureValueArray[j] >= lowerBound;
				var smallerThanUpperBound = (i == numbersToBeDrawn.length - 1) ? self.selectedFeatureValueArray[j] <= upperBound : self.selectedFeatureValueArray[j] < upperBound;
				if (greaterThanLowerBound && smallerThanUpperBound)
					count++;
			}

			// create array
			var dummyLength = (isLastItemDuplicated && i == numbersToBeDrawn.length - 2) ? 10 : 0;

			rectData.push({
				x: self.footerXScale(numbersToBeDrawn[i]),
				y: self.footerMiddleY - self.footerRectHeight / 2,
				width: self.footerXScale(numbersToBeDrawn[i + 1]) - self.footerXScale(numbersToBeDrawn[i]) + dummyLength,
				height: self.footerRectHeight,
				opacity: count / self.selectedFeatureValueArray.length
			});
		}

		// create rectangle
		var interval = self.footerSVG.selectAll(".interval")
			.data(rectData)
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; })
			.style("fill-opacity", function(d) { return d.opacity; });

		interval.enter()
			.append("rect")
			.attr("class", "interval")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; })
			.style("fill-opacity", function(d) { return d.opacity; })
			.style("fill", "#435e69")
			.style("stroke", "white")
			.style("stroke-width", 2);

		interval.exit()
			.remove();
	},
	drawNumbers: function(numberOfGroups, numbersToBeDrawn = null) {
		var self = this;

		// remove previous
		self.footerSVG.selectAll(".number").remove();
		self.footerSVG.selectAll(".number-rect").remove();

		// if numbersToBeDrawn not provided, create it
		if (!numbersToBeDrawn) {
			var minValue = d3.min(self.footerXScale.domain());
			var maxValue = d3.max(self.footerXScale.domain());
			numbersToBeDrawn = DataTransformationHandler.returnBoundariesOfIntervals(minValue, maxValue, numberOfGroups);
		}

		// draw the numbers
		for (var i = 0; i < numbersToBeDrawn.length; i++) {
			var text = self.footerSVG.append("text")
				.attr("class", "number")
				.attr("x", self.footerXScale(numbersToBeDrawn[i]))
				.attr("y", self.footerMiddleY + self.footerRectHeight / 2 + 5)
				.style("text-anchor", "middle")
				.style("alignment-baseline", "middle")
				.style("fill", self.footerScaleColour)
				.style("font-size", 8)
				.text(numbersToBeDrawn[i]);

			var bbox = text.node().getBBox();
			var rect = self.footerSVG.insert("rect", ".number")
				.attr("class", "number-rect")
				.attr("x", bbox.x - 2)
				.attr("y", bbox.y - 1)
				.attr("width", bbox.width + 4)
				.attr("height", bbox.height + 2)
				.attr("rx", 3)
				.attr("ry", 3)
				.style("fill", "white")
				.style("stroke", self.footerScaleColour);

			var isLastItemDuplicated = numbersToBeDrawn[numbersToBeDrawn.length - 1] == numbersToBeDrawn[numbersToBeDrawn.length - 2]
			if (i == numbersToBeDrawn.length - 1 && isLastItemDuplicated) {
				text.attr("x", self.footerXScale(numbersToBeDrawn[i]) + 10);
				rect.attr("x", bbox.x - 2 + 10);
			}
		}
	},
	show: function(thisColumnFeature, thisColumnGroup) {
		var self = this;

		$("#list-view .table").css("height", (listViewHeaderHeight + listViewContentHeight - 1) / 2); // 1 is the bottom margin
		$("#list-view .table .content").css("height", (listViewHeaderHeight + listViewContentHeight - 1) / 2 - listViewHeaderHeight);
		$("#list-view .table").addClass("ui-bottom-border");
		self.view.css("display", "block");

		self.showHeader(thisColumnFeature);
		self.showContent(thisColumnFeature);
		self.selectedColumnGroup = thisColumnGroup;
		self.selectedColumnFeature = thisColumnFeature;
	}
}