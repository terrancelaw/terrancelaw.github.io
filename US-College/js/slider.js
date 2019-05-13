function Slider(selector, parentSelector, sliderRangeEditorSelector, id) {
	this.el = null;
	this.binNumber = 15;
	this.densityPlot = { group: null, width: null, height: null, data: null };
	this.selector = selector;
	this.parentSelector = parentSelector;
	this.sliderRangeEditorSelector = sliderRangeEditorSelector;
	this.id = id; // no #
}

Slider.prototype.show = show;
Slider.prototype.changeTitle = function() {};

Slider.prototype.initSlider = initSlider;
Slider.prototype.initHandleValues = initHandleValues;
Slider.prototype.initDensityPlot = initDensityPlot;

Slider.prototype.installDragSlider = installDragSlider;
Slider.prototype.getSelection = getSelection;

Slider.prototype.clearDensityPlot = clearDensityPlot;
Slider.prototype.generateDensityPlotData = generateDensityPlotData;
Slider.prototype.drawDensityPlot = drawDensityPlot;

Slider.prototype.updateMinMax = updateMinMax;
Slider.prototype.updateStep = updateStep;
Slider.prototype.updateValues = updateValues;
Slider.prototype.updateHandles = updateHandles;
Slider.prototype.updateMinMaxText = updateMinMaxText;

//-- functions --//

function show(fadeIn = true) {
	const self = this;

	if (fadeIn)
		$(self.parentSelector) 
			.css('display', 'none')
			.fadeTo(200, 1);

	if (!fadeIn)
		$(self.parentSelector)
			.css('display', 'block');
}

function initSlider() {
	const self = this;

	self.el = $(self.selector)
		.bootstrapSlider({
			tooltip: 'hide',
			min: 0,
			max: 10,
			value: [2, 8]
		});
}

function initHandleValues() {
	const self = this;
	var minHandleLeft = $(self.selector + ' .min-slider-handle').position().left;
	var minHandleValue = self.el.bootstrapSlider('getValue')[0];
	var maxHandleLeft = $(self.selector + ' .max-slider-handle').position().left;
	var maxHandleValue = self.el.bootstrapSlider('getValue')[1];

	// add the lines and the values
	$(self.selector).prepend('<div class="min-handle-line"></div>');
	$(self.selector).prepend('<div class="max-handle-line"></div>');
	$(self.selector).prepend('<span class="min-handle-text"></span>');
	$(self.selector).prepend('<span class="max-handle-text"></span>');

	// init position
	$(self.parentSelector + ' .min-handle-line').css('left', minHandleLeft);
	$(self.parentSelector + ' .max-handle-line').css('left', maxHandleLeft);
	$(self.parentSelector + ' .min-handle-text').css('left', minHandleLeft);
	$(self.parentSelector + ' .max-handle-text').css('left', maxHandleLeft);

	// init values
	$(self.parentSelector + ' .max-handle-text').html(maxHandleValue);
	$(self.parentSelector + ' .min-handle-text').html(minHandleValue);
}

function initDensityPlot() {
	const self = this;
	let sliderPosition = $(self.parentSelector + ' div#' + self.id).position();
	let sliderWidth = $(self.parentSelector + ' div#' + self.id).width();
	let sliderTrackPosition = $(self.selector + ' .slider-track').position();
	let sliderTrackHeight = $(self.selector + ' .slider-track').height();
	let svgWidth = sliderWidth;
	let svgLeft = sliderPosition.left + sliderTrackPosition.left;
	let svgTop = sliderPosition.top + sliderTrackPosition.top - filterMenuRangeContentSVGHeight - sliderTrackHeight / 2 + 1;

	$(self.parentSelector + ' svg')
		.css('left', svgLeft)
		.css('top', svgTop)
		.css('width', svgWidth);

	self.densityPlot.group = d3.select(self.parentSelector + ' svg g');
	self.densityPlot.width = svgWidth;
	self.densityPlot.height = filterMenuRangeContentSVGHeight;	
}

function installDragSlider() {
	const self = this;

	self.el.bootstrapSlider('on', 'change', function(data) {
		let minHandleValue = self.el.bootstrapSlider('getValue')[0];
		let maxHandleValue = self.el.bootstrapSlider('getValue')[1];

		let selectedAttrName = $('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected').attr('attribute-name');
		let attributeValueObject = { lowerValue: minHandleValue, upperValue: maxHandleValue };

		// change handles and save rule
		self.updateHandles();
		FilterBar.InputBox.focus();
		FilterBar.InputBox.displayMenuSelection(selectedAttrName, attributeValueObject);
	});
}

function getSelection() {
	const self = this;
	let minHandleValue = self.el.bootstrapSlider('getValue')[0];
	let maxHandleValue = self.el.bootstrapSlider('getValue')[1];
	let noSelection = $(self.parentSelector + ' .min-handle-text').html() == 'NULL';

	if (noSelection) return null;
	if (!noSelection) return [ minHandleValue, maxHandleValue ];
}

function clearDensityPlot() {
	const self = this;

	self.densityPlot.data = null;
	self.densityPlot.group.selectAll('*').remove();
}

function generateDensityPlotData(attributeName) {
	const self = this;
	let binNumber = self.binNumber;
	let densityPlotData = FilterHandler.getProbabilityDistribution(attributeName, binNumber);

	self.densityPlot.data = densityPlotData;
}

function drawDensityPlot(attributeName) {
	const self = this;
	let binNumber = self.binNumber;
	let densityPlot = self.densityPlot;
	let maxCount = d3.max(densityPlot.data);

	let xScale = d3.scaleLinear()
		.domain([ 0, binNumber - 1 ])
		.range([ 0, densityPlot.width ]);
	let heightScale = d3.scaleLinear()
		.domain([ 0, maxCount ])
		.range([ 0, densityPlot.height ]);
	let area = d3.area()
  		.x(function(d, i) { return xScale(i); })
  		.y0(function(d) { return densityPlot.height - heightScale(d); })
  		.y1(densityPlot.height)
  		.curve(d3.curveMonotoneX);

	densityPlot.group.append('path')
		.attr('d', area(densityPlot.data))
		.style('fill', '#DAE6F0');
}

function updateMinMax(attributeName) {
	const self = this;
	[ min, max ] = FilterHandler.getMinMaxValues(attributeName);

	self.el.bootstrapSlider('setAttribute', 'min', min);
	self.el.bootstrapSlider('setAttribute', 'max', max);
}

function updateStep(attributeName) {
	const self = this;
	let numberOfDecimals = FilterHandler.getNumberOfDecimals(attributeName);
	let step = 1 / Math.pow(10, numberOfDecimals);

	self.el.bootstrapSlider('setAttribute', 'step', step);
}

function updateValues(range = null) {
	const self = this;

	if (range === null) {
		let min = self.el.bootstrapSlider('getAttribute', 'min');
		let max = self.el.bootstrapSlider('getAttribute', 'max');
		range = [ min, max ];
	}

	self.el.bootstrapSlider('setValue', range);
}

function updateHandles(rangeSpecified = true) {
	const self = this;
	var minHandleLeft = $(self.selector + ' .min-slider-handle').position().left;
	var minHandleValue = self.el.bootstrapSlider('getValue')[0];
	var maxHandleLeft = $(self.selector + ' .max-slider-handle').position().left;
	var maxHandleValue = self.el.bootstrapSlider('getValue')[1];

	$(self.parentSelector + ' .min-handle-line').css('left', minHandleLeft);
	$(self.parentSelector + ' .max-handle-line').css('left', maxHandleLeft);
	$(self.parentSelector + ' .min-handle-text').css('left', minHandleLeft);
	$(self.parentSelector + ' .max-handle-text').css('left', maxHandleLeft);

	if (rangeSpecified) {
		$(self.parentSelector + ' .min-handle-text').html(minHandleValue);
		$(self.parentSelector + ' .max-handle-text').html(maxHandleValue);
	}
	if (!rangeSpecified) {
		$(self.parentSelector + ' .min-handle-text').html('NULL');
		$(self.parentSelector + ' .max-handle-text').html('NULL');
	}
}

function updateMinMaxText() {
	const self = this;
	let min = self.el.bootstrapSlider('getAttribute', 'min');
	let max = self.el.bootstrapSlider('getAttribute', 'max');

	$(self.parentSelector + ' .min-text').html(min);
	$(self.parentSelector + ' .max-text').html(max);
}
