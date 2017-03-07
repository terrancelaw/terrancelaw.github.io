var topPadding = 10;

var fullWidth = 1600;

// add together = 1500
var flowViewSvgWidth = 1110;
var eventViewWidth = 390;

// add together = 1500
var tableViewWidth = 1110;
var eventSummaryViewWidth = 390;

// add together = 450
var flowSvgHeight = 390;
var timelineSvgHeight = 40;
var menuBarHeight = 20;

var eventWrapperHeight = 450 - menuBarHeight;

// add together = 400
var tableViewHeight = 400;
var tableLegendHeight = 30;

var eventSummaryViewHeight = 400;

$(function() {
	// contents
	$("#upper-content")
		.css("width", fullWidth);
	$("#lower-content")
		.css("width", fullWidth)
		.css("padding-top", topPadding);

	// upper contents
	$("#flow-view")
		.css("width", flowViewSvgWidth)
		.css("height", flowSvgHeight + timelineSvgHeight + menuBarHeight);
	$("#flow-wrapper")
		.css("width", flowViewSvgWidth)
		.css("height", flowSvgHeight);

	$("#event-view")
		.css("width", eventViewWidth)
		.css("height", eventWrapperHeight + menuBarHeight)
		.css("margin-left", 3);

	// lower contents
	$("#table-view")
		.css("width", tableViewWidth)
		.css("height", tableViewHeight);
	$("#table-wrapper")
		.css("width", tableViewWidth)
		.css("height", tableViewHeight - tableLegendHeight);

	$("#event-summary-view")
		.css("width", eventSummaryViewWidth)
		.css("height", eventSummaryViewHeight);

	// set svg
	d3.select(".control")
		.attr("width", flowViewSvgWidth - 190)
		.attr("height", menuBarHeight);
	d3.select("#timeline")
		.attr("width", flowViewSvgWidth)
		.attr("height", timelineSvgHeight);	
	d3.select("#chart")
		.attr("width", flowViewSvgWidth)
		.attr("height", flowSvgHeight - 10); // -10 to prevent y overflow at the beginning

	d3.select("#event-editor")
		.attr("width", eventViewWidth)
		.attr("height", eventWrapperHeight);

	d3.select("#table-legend")
		.attr("width", tableViewWidth)
		.attr("height", tableLegendHeight);
	d3.select("#table")
		.attr("width", tableViewWidth)
		.attr("height", tableViewHeight);

	d3.select("#event-summary")
		.attr("width", eventSummaryViewWidth)
		.attr("height", eventSummaryViewHeight);

	Database.getData();
});
