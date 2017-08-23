var topPadding = 4;
var fullWidth = 1600;

// add together = 1500
var mdsViewWidth = 410;
var flowViewSvgWidth = 1090;

// add together = 1500 - 5
var tableViewWidth = 675;
var eventViewWidth = 410;
var eventSummaryViewWidth = 410;

// add together = 450
var flowSvgHeight = 365 - 5;
var timelineSvgHeight = 40;
var menuBarHeight = 20;
var mdsViewHeight = 425;

// add together = 400
var tableViewHeight = 425;
var tableLegendHeight = 30;
var eventSummaryViewHeight = 425;
var eventViewHeight = 425;

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
		.css("height", flowSvgHeight + timelineSvgHeight + menuBarHeight + 5);
	$("#flow-wrapper")
		.css("width", flowViewSvgWidth)
		.css("height", flowSvgHeight);
	$("#mds-view")
		.css("width", mdsViewWidth)
		.css("height", mdsViewHeight);

	// lower contents
	$("#table-view")
		.css("width", tableViewWidth)
		.css("height", tableViewHeight);
	$("#table-wrapper")
		.css("width", tableViewWidth)
		.css("height", tableViewHeight - tableLegendHeight);
	$("#event-view")
		.css("width", eventViewWidth)
		.css("height", eventViewHeight);
	$("#event-summary-view")
		.css("width", eventSummaryViewWidth)
		.css("height", eventSummaryViewHeight);

	// set svg
	d3.select(".control")
		.attr("width", flowViewSvgWidth - 220)
		.attr("height", menuBarHeight);
	d3.select("#timeline")
		.attr("width", flowViewSvgWidth)
		.attr("height", timelineSvgHeight);	
	d3.select("#chart")
		.attr("width", flowViewSvgWidth)
		.attr("height", flowSvgHeight - 10); // -10 to prevent y overflow at the beginning

	d3.select("#event-editor")
		.attr("width", eventViewWidth)
		.attr("height", eventViewHeight);

	d3.select("#table-legend")
		.attr("width", tableViewWidth)
		.attr("height", tableLegendHeight);
	d3.select("#table")
		.attr("width", tableViewWidth)
		.attr("height", tableViewHeight - tableLegendHeight - 10);

	d3.select("#scatterplot")
		.attr("width", mdsViewWidth)
		.attr("height", mdsViewHeight);

	d3.select("#event-summary")
		.attr("width", eventSummaryViewWidth)
		.attr("height", eventSummaryViewHeight);

	Database.getData();
});