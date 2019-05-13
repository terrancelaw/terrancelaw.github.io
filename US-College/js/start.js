const margin = 8;
const full = '100%';

const bodyWidth = 'calc(100% - ' + (margin * 2) + 'px)';
const bodyHeight = 'calc(100% - ' + (margin * 2) + 'px)';

// outer containers
const mainViewHeight = 'calc(100% - 50px - 10px)'; // 10 is margin
const selectionPaneWidth = 230;
const highlightPaneWidth = 300;

// filter bar
const filterBarHeight = 50;
const filterBarFilterInputContainerWidth = 300;
const filterBarFilterCapsuleContainerWidth = 'calc(100% - 331px)';
const filterBarFilterCapsuleContainerHeight = 'calc(100% - 24px)'; // 24 is padding

// filter menu
const filterMenuWidth = 205 + 7 + 2; // 7 + 2 = padding + border
const filterMenuHeaderLineHeight = 30 + 'px';
const filterMenuHeaderHeight = 25;
const filterMenuAttributeContentContainerWidth = 'calc(100% - 20px)';
const filterMenuAttributeContentContainerHeight = 80;
const filterMenuValueContentContainerWidth = 'calc(100% - 20px)';
const filterMenuValueContentContainerHeight = 80;
const filterMenuRangeContentHeight = 80;
const filterMenuRangeContentSliderWidth = 'calc(100% - 70px)';
const filterMenuRangeContentSVGHeight = 20;

// dimension pane
const dimensionPaneHeight = 'calc((100% - 10px) / 2)'; // 10 is margin
const dimensionPaneHeaderHeight = 35;
const dimensionPaneFooterHeight = 25;

// measure pane
const measurePaneHeight = 'calc((100% - 10px) / 2)'; // 10 is margin
const measurePaneHeaderHeight = 35;
const measurePaneContentHeight = 'calc(100% - 60px)';
const measurePaneFooterHeight = 25;

// vis pane
const visPaneWidth = 'calc(100% - 230px - 300px - 10px - 10px)'; // 10 is margin
const visPaneHeaderHeight = 25;
const visPaneContentHeight = 'calc(100% - 60px)';
const visPaneContentWidth = 'calc(100% - 10px)';
const visPaneFooterHeight = 35;

// dimension highlight pane
const dimensionHighlightPaneHeight = 'calc((100% - 10px) / 2)'; // 10 is margin
const dimensionHighlightPaneHeaderHeight = 35;
const dimensionHighlightPaneContentHeight = 'calc(100% - 35px - 10px)'; // 10 is padding

// measure highlight pane
const measureHighlightPaneHeight = 'calc((100% - 10px) / 2)'; // 10 is margin
const measureHighlightPaneHeaderHeight = 35;
const measureHighlightPaneContentHeight = 'calc(100% - 35px - 10px)'; // 10 is padding

$(function() {
	$('html')
		.css('width', full)
		.css('height', full);
	$('body')
		.css('width', bodyWidth)
		.css('height', bodyHeight);

	// outer containers
	$('#main-view')
		.css('width', full)
		.css('height', mainViewHeight);
	$('#selection-pane')
		.css('width', selectionPaneWidth)
		.css('height', full)
		.css('margin-right', margin + 2);
	$('#highlight-pane')
		.css('width', highlightPaneWidth)
		.css('height', full)
		.css('margin-left', margin);

	// filter bar
	$('#filter-bar')
		.css('width', full)
		.css('height', filterBarHeight)
		.css('margin-bottom', margin);
	$('#filter-bar .filter-input-container')
		.css('width', filterBarFilterInputContainerWidth)
		.css('height', full);
	$('#filter-bar .filter-capsule-container')
		.css('width', filterBarFilterCapsuleContainerWidth)
		.css('height', filterBarFilterCapsuleContainerHeight);

	// filter menu
	$('#filter-menu')
		.css('width', filterMenuWidth);
	$('#filter-menu .header')
		.css('line-height', filterMenuHeaderLineHeight)
		.css('height', filterMenuHeaderHeight);

	$('#filter-menu .menu .attribute.content .container')
		.css('width', filterMenuAttributeContentContainerWidth)
		.css('height', filterMenuAttributeContentContainerHeight);

	$('#filter-menu .menu .value.content .container')
		.css('width', filterMenuValueContentContainerWidth)
		.css('height', filterMenuValueContentContainerHeight);

	$('#filter-menu .menu .range.content')
		.css('height', filterMenuRangeContentHeight);
	$('#filter-menu .menu .range.content #filter-menu-slider')
		.css('width', filterMenuRangeContentSliderWidth);
	$('#filter-menu .menu .range.content svg')
		.css('height', filterMenuRangeContentSVGHeight);

	// dimension pane
	$('#dimension-pane')
		.css('width', full)
		.css('height', dimensionPaneHeight)
		.css('margin-bottom', margin);
	$('#dimension-pane .header')
		.css('height', dimensionPaneHeaderHeight)
		.css('line-height', dimensionPaneHeaderHeight + 'px');
	$('#dimension-pane .footer')
		.css('height', dimensionPaneFooterHeight)
		.css('line-height', dimensionPaneFooterHeight + 'px');

	// measure pane
	$('#measure-pane')
		.css('width', full)
		.css('height', measurePaneHeight);
	$('#measure-pane .header')
		.css('height', measurePaneHeaderHeight)
		.css('line-height', measurePaneHeaderHeight + 'px');
	$('#measure-pane .content')
		.css('height', measurePaneContentHeight);
	$('#measure-pane .footer')
		.css('height', measurePaneFooterHeight)
		.css('line-height', measurePaneFooterHeight + 'px');

	// vis pane
	$('#vis-pane')
		.css('width', visPaneWidth)
		.css('height', full);
	$('#vis-pane .header')
		.css('height', visPaneHeaderHeight)
		.css('line-height', visPaneHeaderHeight + 'px');
	$('#vis-pane .content')
		.css('width', visPaneContentWidth)
		.css('height', visPaneContentHeight);
	$('#vis-pane .footer')
		.css('height', visPaneFooterHeight)
		.css('line-height', visPaneFooterHeight + 'px');

	// dimension highlight pane
	$('#dimension-highlight-pane')
		.css('width', full)
		.css('height', dimensionHighlightPaneHeight)
		.css('margin-bottom', margin);
	$('#dimension-highlight-pane .header')
		.css('height', dimensionHighlightPaneHeaderHeight)
		.css('line-height', dimensionPaneHeaderHeight + 'px');
	$('#dimension-highlight-pane .content')
		.css('height', dimensionHighlightPaneContentHeight);

	// measure highlight pane
	$('#measure-highlight-pane')
		.css('width', full)
		.css('height', measureHighlightPaneHeight);
	$('#measure-highlight-pane .header')
		.css('height', measureHighlightPaneHeaderHeight)
		.css('line-height', measurePaneHeaderHeight + 'px');
	$('#measure-highlight-pane .content')
		.css('height', measureHighlightPaneContentHeight);

	Body.init();
	VisPane.init();
	FilterBar.init();
	FilterMenu.init();
	MeasurePane.init();
	DimensionPane.init();
	Database.load();
});

Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}