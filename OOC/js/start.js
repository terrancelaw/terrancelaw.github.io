var margin = 5;
var fullWidth = 1250;

// add together = 1100
var leftContentWidth = 300;
var rightContentWidth = 900;

// add together = 660 + 5
var listViewHeaderHeight = 25;
var listViewContentHeight = 270;

var OOCViewHeight = 70;

var featureViewHeaderHeight = 20;
var featureViewContentHeight = 245;
var featureViewFooterHeight = 30;

// add together = 660 + 5 x 2
var conceptMapHeight = 640 + margin;
var menuBarHeight = 20;

$(function() {
	// set body width so that the divs are fixed in place even on resize
	$("body")
		.css("width", fullWidth);

	// contents
	$("#left-content")
		.css("width", leftContentWidth)
		.css("margin-right", margin);
	$("#right-content")
		.css("width", rightContentWidth);

	// left contents
	$("#list-view")
		.css("width", leftContentWidth)
		.css("height", listViewHeaderHeight + listViewContentHeight)
		.css("margin-bottom", margin);
	$("#list-view .header")
		.css("width", leftContentWidth)
		.css("height", listViewHeaderHeight);
	$("#list-view .content")
		.css("width", leftContentWidth)
		.css("height", listViewContentHeight);

	$("#left-content .container")
		.css("width", leftContentWidth)
		.css("height", OOCViewHeight + featureViewHeaderHeight + featureViewContentHeight + featureViewFooterHeight);

	$("#OOC-view")
		.css("width", leftContentWidth)
		.css("height", OOCViewHeight);

	$("#feature-view")
		.css("width", leftContentWidth)
		.css("height", featureViewHeaderHeight + featureViewContentHeight + featureViewFooterHeight);
	$("#feature-view .header")
		.css("width", leftContentWidth)
		.css("height", featureViewHeaderHeight);
	$("#feature-view .content")
		.css("width", leftContentWidth)
		.css("height", featureViewContentHeight);
	$("#feature-view .footer")
		.css("width", leftContentWidth)
		.css("height", featureViewFooterHeight);

	// right contents
	$("#concept-map-view .ui-menu-bar")
		.css("width", rightContentWidth)
		.css("height", menuBarHeight);
	$("#concept-map")
		.css("width", rightContentWidth)
		.css("height", conceptMapHeight);

	// set svg
	d3.select("#list-view .header svg")
		.attr("width", leftContentWidth)
		.attr("height", listViewHeaderHeight);
	d3.select("#list-view .content svg")
		.attr("width", leftContentWidth)
		.attr("height", listViewContentHeight);
	
	d3.select("#OOC-view svg")
		.attr("width", leftContentWidth)
		.attr("height", OOCViewHeight);

	d3.select("#feature-view .header svg")
		.attr("width", leftContentWidth)
		.attr("height", featureViewHeaderHeight);
	d3.select("#feature-view .content svg")
		.attr("width", leftContentWidth)
		.attr("height", featureViewContentHeight - 10); // -10 to prevent overflow at the beginning
	d3.select("#feature-view .footer svg")
		.attr("width", leftContentWidth)
		.attr("height", featureViewFooterHeight);

	Database.getData();
});
