const TimeSeriesHandler = {
	svgWidth: 170,
	svgHeight: 50,
	timeSeriesWidth: 100,
	timeSeriesHeight: 35,

	drawHTML: function(groupByMode) {
		const self = this;
		let listHTML = '';
		let interestingTimeSeries = TimeSeriesOperator.interestingTimeSeries;
		let measuresForEachCategory = self.convertToMeasuresForEachCategory(interestingTimeSeries);
		let categoriesForEachMeasure = self.convertToCategoriesForEachMeasure(interestingTimeSeries);

		if (groupByMode == 'dimension')
			listHTML = self.generateInsightHTMLByDimension(measuresForEachCategory);
		if (groupByMode == 'measure')
			listHTML = self.generateInsightHTMLByMeasure(categoriesForEachMeasure);

		$('#vis-pane .content').html(listHTML);
	},
	drawTimeSeries: function() {
		const self = this;

		$('#vis-pane .content .insight').each(function() {
			let category = $(this).attr('category');
			let measure = $(this).attr('measure');
			let timeSeriesGroupLeft = (self.svgWidth - self.timeSeriesWidth) / 2;
			let timeSeriesGroupTop = (self.svgHeight - self.timeSeriesHeight) / 2;
			let data = {
				SVGEl: $(this).find('.plot svg')[0],
				translateString: 'translate(' + timeSeriesGroupLeft + ',' + timeSeriesGroupTop + ')',
				timeSeries: TimeSeriesOperator.timeSeriesForEachCategory[category][measure].data
			};

			self.renderLineChart(data);
			self.renderFirstValue(data);
			self.renderLastValue(data);
		});
	},
	drawDescriptions: function() {
		const self = this;

		$('#vis-pane .content .insight').each(function() {
			let category = $(this).attr('category');
			let measure = $(this).attr('measure');
			let isIncreasing = TimeSeriesOperator.timeSeriesForEachCategory[category][measure].isIncreasing;
			let isDecreasing = TimeSeriesOperator.timeSeriesForEachCategory[category][measure].isDecreasing;
			let descriptionDivEl = $(this).find('.description')[0];

			self.renderOneDescription(category, measure, isIncreasing, descriptionDivEl);
		});
	},

	// drawHTML

	convertToMeasuresForEachCategory: function(interestingTimeSeries) {
		let measuresForEachCategory = {};

		for (let i = 0; i < interestingTimeSeries.length; i++) {
			let currentMeasure = interestingTimeSeries[i].measure;
			let currentCategory = interestingTimeSeries[i].category;

			if (!(currentCategory in measuresForEachCategory))
				measuresForEachCategory[currentCategory] = [];

			measuresForEachCategory[currentCategory].push(currentMeasure);
		}

		return measuresForEachCategory;
	},
	convertToCategoriesForEachMeasure: function(interestingTimeSeries) {
		let categoriesForEachMeasure = {};

		for (let i = 0; i < interestingTimeSeries.length; i++) {
			let currentMeasure = interestingTimeSeries[i].measure;
			let currentCategory = interestingTimeSeries[i].category;

			if (!(currentMeasure in categoriesForEachMeasure))
				categoriesForEachMeasure[currentMeasure] = [];

			categoriesForEachMeasure[currentMeasure].push(currentCategory);
		}

		return categoriesForEachMeasure;
	},
	generateInsightHTMLByDimension: function(measuresForEachCategory) {
		const self = this;
		let dimension = DimensionPane.selectedAttribute;
		let listHTML = '';

		for (let category in measuresForEachCategory) {
			if (measuresForEachCategory[category].length != 0)
				listHTML += '<div class="title">' + dimension + ' = ' + category + '</div>';

			for (let i = 0; i < measuresForEachCategory[category].length; i++) {
				let measure = measuresForEachCategory[category][i];
				let currentInsightHTML = '<div class="insight" category="' + category + '" measure="' + measure + '">' +
											'<span class="plot" style="width:' + self.svgWidth + 'px;height:' + self.svgHeight + 'px">' + 
												'<svg></svg>' +
											'</span>' +
											'<span class="description" style="width:calc(100% - ' + self.svgWidth + 'px)"></span>' +
					   					 '</div>';

				listHTML += currentInsightHTML;
			}
		}

		if (listHTML == '')
			listHTML = '<div class="nothing-to-show">Nothing to show</div>';

		return listHTML;
	},
	generateInsightHTMLByMeasure: function(categoriesForEachMeasure) {
		const self = this;
		let listHTML = '';

		for (let measure in categoriesForEachMeasure) {
			if (categoriesForEachMeasure[measure].length != 0)
				listHTML += '<div class="title">' + measure + '</div>';

			for (let i = 0; i < categoriesForEachMeasure[measure].length; i++) {
				let category = categoriesForEachMeasure[measure][i];
				let currentInsightHTML = '<div class="insight" category="' + category + '" measure="' + measure + '">' +
											'<span class="plot" style="width:' + self.svgWidth + 'px;height:' + self.svgHeight + 'px">' + 
												'<svg></svg>' +
											'</span>' +
											'<span class="description" style="width:calc(100% - ' + self.svgWidth + 'px)"></span>' +
					   					 '</div>';

				listHTML += currentInsightHTML;
			}
		}

		if (listHTML == '')
			listHTML = '<div class="nothing-to-show">Nothing to show</div>';

		return listHTML;
	},

	// drawTimeSeries

	renderLineChart: function(data) {
		const self = this;
		let SVGEl = data.SVGEl;
		let timeSeries = data.timeSeries;
		let translateString = data.translateString;

		let xScale = d3.scaleLinear()
			.domain([ 0, timeSeries.length - 1 ])
			.range([ 0, self.timeSeriesWidth  ]);
		let yScale = d3.scaleLinear()
			.domain(d3.extent(timeSeries))
			.range([ self.timeSeriesHeight - 2, 0 ]);
		let lineFunction = d3.line()
			.x(function(d, i) { return xScale(i); })
			.y(function(d) { return yScale(d); })
			.curve(d3.curveMonotoneX);

		d3.select(SVGEl).append('g')
			.attr('transform', translateString);
		d3.select(SVGEl).select('g')
			.append('path')
			.attr('d', lineFunction(timeSeries))
			.style('fill', 'none')
			.style('stroke', 'steelblue')
			.style('opacity', 0.8);
	},
	renderFirstValue: function(data) {
		const self = this;
		let SVGEl = data.SVGEl;
		let timeSeries = data.timeSeries;
		let firstValue = timeSeries[0];
		let roundedFirstValue = Math.round(firstValue * 100) / 100;

		let xScale = d3.scaleLinear()
			.domain([ 0, timeSeries.length - 1 ])
			.range([ 0, self.timeSeriesWidth  ]);
		let yScale = d3.scaleLinear()
			.domain(d3.extent(timeSeries))
			.range([ self.timeSeriesHeight - 2, 0 ]);

		d3.select(SVGEl).select('g')
			.append('circle')
			.attr('cx', xScale(0))
			.attr('cy', yScale(timeSeries[0]))
			.attr('r', 2)
			.style('fill', 'steelblue')
			.style('opacity', 0.8);
		d3.select(SVGEl).select('g')
			.append('text')
			.attr('x', xScale(0) - 8)
			.attr('y', yScale(timeSeries[0]))
			.style('fill', 'steelblue')
			.style('alignment-baseline', 'middle')
			.style('text-anchor', 'end')
			.style('font-size', 9)
			.text(roundedFirstValue);
	},
	renderLastValue: function(data) {
		const self = this;
		let SVGEl = data.SVGEl;
		let timeSeries = data.timeSeries;
		let lastValue = timeSeries[timeSeries.length - 1];
		let roundedLastValue = Math.round(lastValue * 100) / 100;

		let xScale = d3.scaleLinear()
			.domain([ 0, timeSeries.length - 1 ])
			.range([ 0, self.timeSeriesWidth  ]);
		let yScale = d3.scaleLinear()
			.domain(d3.extent(timeSeries))
			.range([ self.timeSeriesHeight - 2, 0 ]);

		d3.select(SVGEl).select('g')
			.append('circle')
			.attr('cx', xScale(timeSeries.length - 1))
			.attr('cy', yScale(timeSeries[timeSeries.length - 1]))
			.attr('r', 2)
			.style('fill', 'steelblue')
			.style('opacity', 0.8);
		d3.select(SVGEl).select('g')
			.append('text')
			.attr('x', xScale(timeSeries.length - 1) + 8)
			.attr('y', yScale(timeSeries[timeSeries.length - 1]))
			.style('fill', 'steelblue')
			.style('alignment-baseline', 'middle')
			.style('text-anchor', 'start')
			.style('font-size', 9)
			.text(roundedLastValue);
	},

	// drawDescriptions

	renderOneDescription: function(category, measure, isIncreasing, descriptionDivEl) {
		let desriptionHTML = '';

		desriptionHTML += 'Trend of <span class="measure">' + measure + '</span> seems to be ';
		desriptionHTML += (isIncreasing) 
						? ('<span class="higher"><span class="fa fa-arrow-alt-circle-up"></span> INCREASING </span> for ') 
						: ('<span class="lower"><span class="fa fa-arrow-alt-circle-down"></span> DECREASING </span> for ');
		desriptionHTML += '<span class="category">' + category + '</span>';
		desriptionHTML += ' <span class="date">( between 2006 and 2017 )</span>';

		$(descriptionDivEl).html(desriptionHTML);
	}
}