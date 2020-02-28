const margin = 8;
const full = '100%';
const headerHeight = 25;

const bodyWidth = 'calc(100% - ' + (margin * 2) + 'px)';
const bodyHeight = 'calc(100% - ' + (margin * 2) + 'px)';

const dataColumnWidth = 230;
const dataColumnHeight = 'calc(100% - 2px)';
const encodingColumnWidth = 280;
const encodingColumnHeight = 'calc(100% - 2px)';
const visColumnWidth = 'calc(100% - 530px)';
const visColumnHeight = 'calc(100% - 2px)';

const dataPaneContentHeight = 40;
const dimensionPaneContentMaxHeight = 'calc(100% - 25px - 5px)';
const measurePaneContentMaxHeight = 'calc(100% - 25px - 5px)';

const lookAheadPaneHeight = 'calc((100% - 10px) / 2 - 20px)';
const lookAheadPaneContentHeight = 'calc(100% - 45px)';
const lookAheadPaneFooterHeight = 25;

const shelfPaneHeight = 'calc((100% - 10px) / 2 + 20px)'; // 10 is margin and border
const shelfPaneContentHeaderHeight = 22;
const shelfPaneContentHeight = 'calc(100% - 18px)';
const shelfPaneFooterHeight = 25;

const visualizationContentHeight = 'calc(100% - 50px)';
const visualizationFooterHeight = 25;

const variableSettingMenuHeaderHeight = 25;
const variableSettingMenuLeftPaneWidth = 190;
const variableSettingMenuVariableTypeMenuContentColumnWidth = '50%';
const variableSettingMenuFunctionMenuContentColumnWidth = '50%';
const variableSettingMenuTimeUnitMenuContentColumnWidth = '50%';
const variableSettingMenuFooterHeight = 'calc(100% - 12px)';

const lookAheadSelectMetricMenuHeaderHeight = 25;
const lookAheadSelectMetricMenuLeftPaneWidth = 220;
const lookAheadSelectMetricMenuQualityMetricMenuContentHeight = 120;
const lookAheadSelectMetricMenuFooterHeight = 'calc(100% - 12px)';

const loadDataWindowMenuWidth = 300 - 20 - 20; // 20 is padding

$(function() {
	$('html')
		.css('width', full)
		.css('height', full);
	$('body')
		.css('width', bodyWidth)
		.css('height', bodyHeight);

	// outer containers
	$('#data-column')
		.css('width', dataColumnWidth)
		.css('height', dataColumnHeight);
	$('#encoding-column')
		.css('width', encodingColumnWidth)
		.css('height', encodingColumnHeight)
		.css('margin-left', margin)
		.css('margin-right', margin);
	$('#vis-column')
		.css('width', visColumnWidth)
		.css('height', visColumnHeight);

	// data pane
	$('#data-pane .header')
		.css('height', headerHeight);
	$('#data-pane .content')
		.css('height', dataPaneContentHeight);

	// dimension pane
	$('#dimension-pane .header')
		.css('height', headerHeight);
	$('#dimension-pane .content')
		.css('max-height', dimensionPaneContentMaxHeight);

	// measure pane
	$('#measure-pane .header')
		.css('height', headerHeight);
	$('#measure-pane .content')
		.css('max-height', measurePaneContentMaxHeight);

	// look ahead pane
	$('#look-ahead-pane')
		.css('height', lookAheadPaneHeight)
		.css('margin-bottom', margin);
	$('#look-ahead-pane .header')
		.css('height', headerHeight);
	$('#look-ahead-pane .content')
		.css('height', lookAheadPaneContentHeight);
	$('#look-ahead-pane .footer')
		.css('height', lookAheadPaneFooterHeight);

	// shelf pane
	$('#shelf-pane')
		.css('height', shelfPaneHeight);
	$('#shelf-pane .content .header')
		.css('height', shelfPaneContentHeaderHeight);
	$('#shelf-pane .content')
		.css('width', full)
		.css('height', shelfPaneContentHeight);
	$('#shelf-pane .footer')
		.css('height', shelfPaneFooterHeight);

	// visualization pane
	$('#visualization-pane')
		.css('width', full)
		.css('height', full);
	$('#visualization-pane .content')
		.css('width', full)
		.css('height', visualizationContentHeight);
	$('#visualization-pane .footer')
		.css('height', visualizationFooterHeight);

	// variable setting menu
	$('#variable-setting-menu .left-pane')
		.css('width', variableSettingMenuLeftPaneWidth);
	$('#variable-setting-menu .header')
		.css('height', variableSettingMenuHeaderHeight);
	$('#variable-setting-menu .variable-type-menu .content .column')
		.css('width', variableSettingMenuVariableTypeMenuContentColumnWidth);
	$('#variable-setting-menu .function-menu .content .column')
		.css('width', variableSettingMenuFunctionMenuContentColumnWidth);
	$('#variable-setting-menu .time-unit-menu .content .column')
		.css('width', variableSettingMenuTimeUnitMenuContentColumnWidth);
	$('#variable-setting-menu .footer')
		.css('height', variableSettingMenuFooterHeight);

	// look ahead select metric menu
	$('#look-ahead-select-metric-menu .left-pane')
		.css('width', lookAheadSelectMetricMenuLeftPaneWidth);
	$('#look-ahead-select-metric-menu .header')
		.css('height', lookAheadSelectMetricMenuHeaderHeight);
	$('#look-ahead-select-metric-menu .quality-metric-menu .content')
		.css('height', lookAheadSelectMetricMenuQualityMetricMenuContentHeight);	
	$('#look-ahead-select-metric-menu .footer')
		.css('height', lookAheadSelectMetricMenuFooterHeight);

	// load data window
	$('#load-data-window')
		.css('width', full)
		.css('height', full);
	$('#load-data-window .background')
		.css('width', full)
		.css('height', full);
	$('#load-data-window .menu')
		.css('width', loadDataWindowMenuWidth);

	Body.init();
	ShowMe.init();
	Shelves.init();
	DataPane.init();
	ShelfPane.init();
	LookAheadPane.init();
	LoadDataWindow.init();
	VisualizationPane.init();
	VariableSettingMenu.init();
	LookAheadSelectMetricMenu.init();

	d3.csv('csv/county_set_1.csv').then(function(data) {
		DataColumn.showLoader();

		// heavy operations
		setTimeout(function() {
			Database.load(data);
			Database.processMissingValues();
			Database.attributeTyping();
			Database.addYearAndMonthVariable();
			LookAheadDatabase.init();
			DataPane.updateFileName('county_set_1.csv');

			DimensionMeasurePane.copyAttributesFromDatabase();
			DimensionMeasurePane.renderDimensionCapsules();
			DimensionMeasurePane.renderMeasureCapsules();
			DimensionMeasurePane.adjustHeight();
			DimensionMeasurePane.adjustAttributeNameWidth();

			DimensionMeasurePaneCapsules.installTooltips();
			DimensionMeasurePaneCapsules.installDragBehaviour();
			DimensionMeasurePaneCapsules.installClickButtonsBehaviour();

			DataColumn.hideLoader();
		}, 10);
	});
});

Number.prototype.countDecimals = function () {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}