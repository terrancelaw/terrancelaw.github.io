$(function(){
	var svgWidth = 950;
	var flowSvgHeight = 460;
	var timelineSvgHeight = 40;

	// create layout
	$("#content").css("width", 1280)

	$("#table-view").css("display", "inline-block")
						.css("width", 250)
						.css("vertical-align", "top")
						.addClass("ui-widget-content ui-corner-all noselection");

	$("#flow-view").css("display", "inline-block")
						.css("width", svgWidth)
						.css("height", flowSvgHeight + timelineSvgHeight + 50);

	$("#flow-wrapper").css("display", "inline-block")
						.addClass("ui-widget-content ui-corner-all noselection");

	$("#all-flows-wrapper").css("width", svgWidth)
							.css("height", flowSvgHeight + 50) // to prevent y overflow at the beginning, svg height is less
							.css("overflow-y", "auto")
							.css("overflow-x", "hidden");

	// add timeline svg and all flow svg
	$("#timeline-wrapper").append("<svg id='timeline'></svg>");
	$("#all-flows-wrapper").append("<svg id='chart'></svg>");
	
	d3.select("#timeline")
		.attr("width", svgWidth)
		.attr("height", timelineSvgHeight);	

	d3.select("#chart")
		.attr("width", svgWidth)
		.attr("height", flowSvgHeight);

	Table.init();
	TimeLine.init();
	FlowFactory.init(svgWidth, flowSvgHeight);
});
