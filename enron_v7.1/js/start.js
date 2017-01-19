var topPadding = 10;

var fullWidth = 1600;

// add together = 1500
var flowViewSvgWidth = 1500;

// add together = 1490 (including padding between them which is 10px)
var tableViewWidth = 550;
var eventViewWidth = 390;
var learningViewWidth = 550;

// add together = 500
var flowSvgHeight = 440;
var timelineSvgHeight = 40;
var menuBarHeight = 20;

// add together = 350
var tableViewHeight = 350;
var tableLegendHeight = 30;

var eventViewHeight = 350;
var eventsWrapperHeight = 250;
var eventEditWrapperHeight = 100;

var learningViewHeight = 350;
var learningPanelHeight = 250;
var learningParametersHeight = 100;

$(function() {
	// contents
	$("#upper-content")
		.css("width", fullWidth);
	$("#lower-content")
		.css("width", fullWidth)
		.css("padding-top", topPadding);

	// upper contents
	$("#table-view")
		.css("width", tableViewWidth)
		.css("height", tableViewHeight);
	$("#table-wrapper")
		.css("width", tableViewWidth)
		.css("height", tableViewHeight - tableLegendHeight);

	$("#flow-view")
		.css("width", flowViewSvgWidth)
		.css("height", flowSvgHeight + timelineSvgHeight + menuBarHeight);
	$("#flow-wrapper")
		.css("width", flowViewSvgWidth)
		.css("height", flowSvgHeight);

	// lower contents
	$("#event-view")
		.css("width", eventViewWidth)
		.css("height", eventViewHeight);
	$("#events-wrapper")
		.css("width", eventViewWidth)
		.css("height", eventsWrapperHeight);
	$("#event-edit-wrapper")
		.css("width", eventViewWidth)
		.css("height", eventEditWrapperHeight);

	$("#learning-view")
		.css("width", learningViewWidth)
		.css("height", learningViewHeight);
	$("#learning-panel-wrapper")
		.css("width", learningViewWidth)
		.css("height", learningPanelHeight);
	$("#learning-parameters-wrapper")
		.css("width", learningViewWidth)
		.css("height", learningParametersHeight);

	// set svg
	d3.select("#timeline")
		.attr("width", flowViewSvgWidth)
		.attr("height", timelineSvgHeight);	
	d3.select("#chart")
		.attr("width", flowViewSvgWidth)
		.attr("height", flowSvgHeight - 10); // -10 to prevent y overflow at the beginning
	d3.select(".control")
		.attr("width", flowViewSvgWidth - 100)
		.attr("height", menuBarHeight);

	d3.select("#table")
		.attr("width", tableViewWidth)
		.attr("height", tableViewHeight);
	d3.select("#table-legend")
		.attr("width", tableViewWidth)
		.attr("height", tableLegendHeight);

	d3.select("#event-panel")
		.attr("width", eventViewWidth)
		.attr("height", eventsWrapperHeight);
	d3.select("#event-edit")
		.attr("width", eventViewWidth)
		.attr("height", eventEditWrapperHeight);

	d3.select("#learning-panel")
		.attr("width", learningViewWidth)
		.attr("height", learningPanelHeight);
	d3.select("#learning-parameters")
		.attr("width", learningViewWidth)
		.attr("height", learningParametersHeight);

	Database.getData();
});
