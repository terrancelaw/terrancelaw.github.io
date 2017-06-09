var margin = 5;
var fullWidth = 1250;

// add together = 1100
var leftContentWidth = 300;
var rightContentWidth = 900;

// add together = 660 + 5
var listViewHeaderHeight = 25;
var listViewContentHeight = 270;
var listViewFooterHeight = 25;

var OOCViewHeight = 70;

var featureViewHeaderHeight = 20;
var featureViewContentHeight = 245;
var featureViewFooterHeight = 30;

// add together = 660 + 5
var conceptMapHeight = 640 + margin;
var menuBarHeight = 20;

// change column height (add together = (295 - 1) / 2)
var changeColumnMenuHeaderHeight = 25;
var changeColumnMenuContentHeight = 122;
var changeColumnMenuCateFooterHeight = 25;
var changeColumnMenuQuantFooterHeight = 50;
var changeColumnMenuQuantFooterSVGWidth = leftContentWidth / 3 * 2 + 10;

// change group height
var changeGroupMenuHeaderHeight = 25;
var changeGroupMenuContentHeight = 70;

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
	$("#list-view .table")
		.css("width", leftContentWidth)
		.css("height", listViewHeaderHeight + listViewContentHeight);
	$("#list-view .table .header")
		.css("width", leftContentWidth)
		.css("height", listViewHeaderHeight);
	$("#list-view .table .content")
		.css("width", leftContentWidth)
		.css("height", listViewContentHeight);
	$("#list-view .table .footer")
		.css("width", leftContentWidth / 3)
		.css("height", listViewFooterHeight);

	$("#list-view .menu")
		.css("width", leftContentWidth)
		.css("height", (listViewHeaderHeight + listViewContentHeight - 1) / 2);
	$("#list-view .menu .header")
		.css("width", leftContentWidth)
		.css("height", changeColumnMenuHeaderHeight);
	$("#list-view .menu .content")
		.css("width", leftContentWidth)
		.css("height", changeColumnMenuContentHeight);
	$("#list-view .menu .footer.quant")
		.css("width", leftContentWidth)
		.css("height", changeColumnMenuQuantFooterHeight);
	$("#list-view .menu .footer.cate")
		.css("width", leftContentWidth)
		.css("height", changeColumnMenuCateFooterHeight);

	$("#left-content .container")
		.css("width", leftContentWidth)
		.css("height", OOCViewHeight + featureViewHeaderHeight + featureViewContentHeight + featureViewFooterHeight);

	$("#OOC-view")
		.css("width", leftContentWidth)
		.css("height", OOCViewHeight);

	$("#change-group-menu")
		.css("width", leftContentWidth)
		.css("height", changeGroupMenuHeaderHeight + changeGroupMenuContentHeight);
	$("#change-group-menu .header")
		.css("width", leftContentWidth)
		.css("height", changeGroupMenuHeaderHeight);
	$("#change-group-menu .content")
		.css("width", leftContentWidth)
		.css("height", changeGroupMenuContentHeight);

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
	d3.select("#list-view .table .header svg")
		.attr("width", leftContentWidth)
		.attr("height", listViewHeaderHeight);
	d3.select("#list-view .table .content svg")
		.attr("width", leftContentWidth)
		.attr("height", listViewContentHeight);
	d3.select("#list-view .table .footer svg")
		.attr("width", leftContentWidth / 3)
		.attr("height", listViewFooterHeight);

	d3.select("#list-view .menu .header svg")
		.attr("width", leftContentWidth)
		.attr("height", changeColumnMenuHeaderHeight);
	d3.select("#list-view .menu .content svg")
		.attr("width", leftContentWidth)
		.attr("height", changeColumnMenuContentHeight - 5);
	d3.select("#list-view .menu .footer.quant svg")
		.attr("width", changeColumnMenuQuantFooterSVGWidth)
		.attr("height", changeColumnMenuQuantFooterHeight); // consider the height of dropdown as well
	d3.select("#list-view .menu .footer.cate svg")
		.attr("width", leftContentWidth)
		.attr("height", changeColumnMenuCateFooterHeight); 
	
	d3.select("#OOC-view svg")
		.attr("width", leftContentWidth)
		.attr("height", OOCViewHeight);

	d3.select("#change-group-menu .header svg")
		.attr("width", leftContentWidth)
		.attr("height", changeGroupMenuHeaderHeight);
	d3.select("#change-group-menu .content svg")
		.attr("width", leftContentWidth)
		.attr("height", changeGroupMenuContentHeight - 2);

	d3.select("#feature-view .header svg")
		.attr("width", leftContentWidth)
		.attr("height", featureViewHeaderHeight);
	d3.select("#feature-view .content svg")
		.attr("width", leftContentWidth)
		.attr("height", featureViewContentHeight - changeGroupMenuHeaderHeight - changeGroupMenuContentHeight - 5); // -5 to prevent overflow
	d3.select("#feature-view .footer svg")
		.attr("width", leftContentWidth)
		.attr("height", featureViewFooterHeight);

	d3.select("#table-view #data-table svg")
		.attr("width", (rightContentWidth + leftContentWidth + margin) * 0.8 - 5) // -5 to prevent overflow at the beginning
		.attr("height", (conceptMapHeight + menuBarHeight) * 0.8 - 5); // -5 to prevent overflow at the beginning

	Database.getData();
});
