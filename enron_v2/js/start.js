var fullWidth = 1600;
var tableViewWidth = 400;
var flowViewSvgWidth = 1100;

var tableViewHeight = 500;
var tableLegendHeight = 30;
var flowSvgHeight = 460;
var timelineSvgHeight = 40;
var menuBarHeight = 20;

$(function() {
	// create layout
	$("#content").css("width", fullWidth);

	$("#table-view").css("width", tableViewWidth)
					.css("height", tableViewHeight);

	$("#flow-view").css("width", flowViewSvgWidth)
					.css("height", flowSvgHeight + timelineSvgHeight);
	$("#flow-wrapper").css("width", flowViewSvgWidth)
						.css("height", flowSvgHeight + 50); // to prevent y overflow at the beginning

	// set svg
	d3.select("#timeline")
		.attr("width", flowViewSvgWidth)
		.attr("height", timelineSvgHeight);	

	d3.select("#chart")
		.attr("width", flowViewSvgWidth)
		.attr("height", flowSvgHeight);

	d3.select(".control")
		.attr("width", flowViewSvgWidth - 100)
		.attr("height", menuBarHeight);

	d3.select("#table")
		.attr("width", tableViewWidth)
		.attr("height", tableViewHeight);

	d3.select("#table-legend")
		.attr("width", tableViewWidth - 15)
		.attr("height", tableLegendHeight);

	Database.getData();
});
