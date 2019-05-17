const ComparisonHandler = {
	svgWidth: 180,
	svgHeight: 50,
	densityPlotWidth: 100,
	densityPlotHeight: 40,

	ObjectPairs: {
		drawHTML: function(groupByMode) {
			const self = ComparisonHandler;
			let measuresForEachCategory = ComparisonOperator.ObjectPairs.metadata.differentMeasures;
			let categoriesForEachMeasure = self.Helpers.convertToCategoriesForEachMeasure(measuresForEachCategory);
			let listHTML = '';

			if (groupByMode == 'dimension')
				listHTML = self.Helpers.generateInsightHTMLByDimension(measuresForEachCategory);
			if (groupByMode == 'measure')
				listHTML = self.Helpers.generateInsightHTMLByMeasure(categoriesForEachMeasure);
			
			$('#vis-pane .content').html(listHTML);
		},
		drawDensityPlots: function() {
			const self = ComparisonHandler;

			$('#vis-pane .content .insight').each(function() {
				let category = $(this).attr('category');
				let measure = $(this).attr('measure');
				let yesProbabilityDistribution = ComparisonOperator.ObjectPairs.metadata.pobabilityDistributions[category].yes[measure];
				let noProbabilityDistribution = ComparisonOperator.ObjectPairs.metadata.pobabilityDistributions[category].no[measure];
				let yesMean = ComparisonOperator.ObjectPairs.metadata.means[category].yes[measure];
				let noMean = ComparisonOperator.ObjectPairs.metadata.means[category].no[measure];
				let yesNumberArray = ComparisonOperator.ObjectPairs.metadata.numberArrays[category].yes[measure];
				let noNumberArray = ComparisonOperator.ObjectPairs.metadata.numberArrays[category].no[measure];
				let allNumbers = yesNumberArray.concat(noNumberArray);
				let densityPlotGroupLeft = (self.svgWidth - self.densityPlotWidth) / 2;
				let densityPlotGroupTop = (self.svgHeight - self.densityPlotHeight);
				let data = {
					SVGEl: $(this).find('.plot svg')[0],
					min: d3.min(allNumbers), max: d3.max(allNumbers),
					translateString: 'translate(' + densityPlotGroupLeft + ',' + densityPlotGroupTop + ')',
					maxProbability: d3.max(yesProbabilityDistribution.concat(noProbabilityDistribution)),
					meanGreaterThanReference: (yesMean > noMean)
				};

				if (noNumberArray.length == 1) {
					self.ObjectPairs.renderNoMeanLine(noMean, data);
					self.ObjectPairs.renderNoMeanText(noMean, data);
				}
				if (noNumberArray.length > 1) {
					self.ObjectPairs.renderNoPlot(noProbabilityDistribution, data);
					self.ObjectPairs.renderNoMeanLine(noMean, data);
					self.ObjectPairs.renderNoMeanText(noMean, data);
				}
				if (yesNumberArray.length == 1) {
					self.ObjectPairs.renderYesMeanLine(yesMean, data);
					self.ObjectPairs.renderYesMeanText(yesMean, data);
				}
				if (yesNumberArray.length > 1) {
					self.ObjectPairs.renderYesPlot(yesProbabilityDistribution, data);
					self.ObjectPairs.renderYesMeanLine(yesMean, data);
					self.ObjectPairs.renderYesMeanText(yesMean, data);
				}
			});
		},
		drawDescriptions: function() {
			const self = ComparisonHandler;

			$('#vis-pane .content .insight').each(function() {
				let category = $(this).attr('category');
				let measure = $(this).attr('measure');
				let yesMean = ComparisonOperator.ObjectPairs.metadata.means[category].yes[measure];
				let noMean = ComparisonOperator.ObjectPairs.metadata.means[category].no[measure];
				let descriptionDivEl = $(this).find('.description')[0];

				self.ObjectPairs.renderOneDescription(category, measure, yesMean, noMean, descriptionDivEl);
			});
		},

		// drawDensityPlots

		renderNoPlot: function(noProbabilityDistribution, data) {
			const self = ComparisonHandler;

			self.Helpers.renderDensityPlot(noProbabilityDistribution, data, 'no-plot')
				.style('fill', 'gray')
				.style('opacity', 0.15);
		},
		renderNoMeanLine: function(noMean, data) {
			const self = ComparisonHandler;
			let meanLineGroup = self.Helpers.renderMeanLine(noMean, data, 'no-line');

			meanLineGroup.line.style('stroke', '#d3d3d3');
			meanLineGroup.dot.style('fill', '#d3d3d3');
		},
		renderNoMeanText: function(noMean, data) {
			const self = ComparisonHandler;
			let meanGreaterThanReference = data.meanGreaterThanReference;
			let textAnchor = meanGreaterThanReference ? 'end' : 'start';
			let xOffset = meanGreaterThanReference ? -8 : 8;

			self.Helpers.renderMeanText(noMean, data, 'no-text')
				.attr('dx', xOffset)
				.attr('text-anchor', textAnchor)
				.style('fill', '#d3d3d3');
		},
		renderYesPlot: function(yesProbabilityDistribution, data) {
			const self = ComparisonHandler;

			self.Helpers.renderDensityPlot(yesProbabilityDistribution, data, 'yes-plot')
				.style('fill', 'steelblue')
				.style('opacity', 0.5);;
		},
		renderYesMeanLine: function(yesMean, data) {
			const self = ComparisonHandler;
			let meanLineGroup = self.Helpers.renderMeanLine(yesMean, data, 'yes-line');

			meanLineGroup.line.style('stroke', 'steelblue');
			meanLineGroup.dot.style('fill', 'steelblue');
		},
		renderYesMeanText: function(yesMean, data) {
			const self = ComparisonHandler;
			let meanGreaterThanReference = data.meanGreaterThanReference;
			let textAnchor = meanGreaterThanReference ? 'start' : 'end';
			let xOffset = meanGreaterThanReference ? 8 : -8;

			self.Helpers.renderMeanText(yesMean, data, 'yes-text')
				.attr('dx', xOffset)
				.attr('text-anchor', textAnchor)
				.style('fill', 'steelblue');
		},

		// drawDescriptions

		renderOneDescription: function(category, measure, yesMean, noMean, descriptionDivEl) {
			let desriptionHTML = '';

			yesMean = Math.round(yesMean * 100) / 100;
			noMean = Math.round(noMean * 100) / 100;
			desriptionHTML += '<span class="category">' + category + '</span> has ';
			desriptionHTML += (yesMean > noMean) 
							? ('<span class="higher"><span class="fa fa-arrow-alt-circle-up"></span> HIGHER</span> <span class="measure">' + measure + '</span>') 
							: ('<span class="lower"><span class="fa fa-arrow-alt-circle-down"></span> LOWER</span> <span class="measure">' + measure + '</span>');
			desriptionHTML += ' when compared to other records';

			$(descriptionDivEl).html(desriptionHTML);
		}
	},
	Objects: {
		drawHTML: function(groupByMode) {
			const self = ComparisonHandler;
			let measuresForEachCategory = ComparisonOperator.Objects.metadata.differentMeasures;
			let categoriesForEachMeasure = self.Helpers.convertToCategoriesForEachMeasure(measuresForEachCategory);
			let listHTML = '';

			if (groupByMode == 'dimension')
				listHTML = self.Helpers.generateInsightHTMLByDimension(measuresForEachCategory);
			if (groupByMode == 'measure')
				listHTML = self.Helpers.generateInsightHTMLByMeasure(categoriesForEachMeasure);

			$('#vis-pane .content').html(listHTML);
		},
		drawDensityPlots: function() {
			const self = ComparisonHandler;

			$('#vis-pane .content .insight').each(function() {
				let category = $(this).attr('category');
				let measure = $(this).attr('measure');
				let probabilityDistribution = ComparisonOperator.Objects.metadata.pobabilityDistributions[category][measure];
				let mean = ComparisonOperator.Objects.metadata.means[category][measure];
				let meanType = ComparisonOperator.Objects.meanType;
				let reference = Database.allAttributeMetadata[measure][meanType];
				let numberArray = ComparisonOperator.Objects.metadata.numberArrays[category][measure];
				let densityPlotGroupLeft = (self.svgWidth - self.densityPlotWidth) / 2;
				let densityPlotGroupTop = (self.svgHeight - self.densityPlotHeight);
				[ min, max ] = FilterHandler.getMinMaxValues(measure);
				let data = {
					SVGEl: $(this).find('.plot svg')[0],
					min: min, max: max,
					translateString: 'translate(' + densityPlotGroupLeft + ',' + densityPlotGroupTop + ')',
					maxProbability: d3.max(probabilityDistribution),
					meanGreaterThanReference: (mean > reference)
				};

				if (numberArray.length == 1) {
					self.Objects.renderPlotMeanLine(mean, data);
					self.Objects.renderPlotMeanText(mean, data);
					self.Objects.renderReferenceLine(reference, data);
					self.Objects.renderReferenceText(reference, data);
				}
				if (numberArray.length > 1) {
					self.Objects.renderPlot(probabilityDistribution, data);
					self.Objects.renderPlotMeanLine(mean, data);
					self.Objects.renderPlotMeanText(mean, data);
					self.Objects.renderReferenceLine(reference, data);
					self.Objects.renderReferenceText(reference, data);
				}
			});
		},
		drawDescriptions: function() {
			const self = ComparisonHandler;

			$('#vis-pane .content .insight').each(function() {
				let category = $(this).attr('category');
				let measure = $(this).attr('measure');
				let mean = ComparisonOperator.Objects.metadata.means[category][measure];
				let meanType = ComparisonOperator.Objects.meanType;
				let reference = Database.allAttributeMetadata[measure][meanType];
				let descriptionDivEl = $(this).find('.description')[0];
				let meanString = (meanType == 'cmsMean') ? 'CMS average' : 'Registry peer average'

				self.Objects.renderOneDescription(category, measure, mean, reference, meanString, descriptionDivEl);
			});
		},

		// drawDensityPlots

		renderPlot: function(probabilityDistribution, data) {
			const self = ComparisonHandler;

	      	self.Helpers.renderDensityPlot(probabilityDistribution, data, 'plot')
	      		.style('fill', 'steelblue')
				.style('opacity', 0.5);;
		},
		renderPlotMeanLine: function(mean, data) {
			const self = ComparisonHandler;
			let meanLineGroup = self.Helpers.renderMeanLine(mean, data, 'plot-line');

			meanLineGroup.line
				.style('stroke', 'steelblue');
			meanLineGroup.dot
				.style('fill', 'steelblue');
		},
		renderPlotMeanText: function(mean, data) {
			const self = ComparisonHandler;
			let meanGreaterThanReference = data.meanGreaterThanReference;
			let textAnchor = meanGreaterThanReference ? 'start' : 'end';
			let xOffset = meanGreaterThanReference ? 8 : -8;

			self.Helpers.renderMeanText(mean, data, 'plot-text')
				.attr('dx', xOffset)
				.attr('text-anchor', textAnchor)
				.style('fill', 'steelblue');
		},
		renderReferenceLine: function(reference, data) {
			const self = ComparisonHandler;
			let meanLineGroup = self.Helpers.renderMeanLine(reference, data, 'reference-line');

			meanLineGroup.line.style('stroke', '#d3d3d3');
			meanLineGroup.dot.style('fill', '#d3d3d3');
		},
		renderReferenceText: function(reference, data) {
			const self = ComparisonHandler;
			let meanGreaterThanReference = data.meanGreaterThanReference;
			let textAnchor = meanGreaterThanReference ? 'end' : 'start';
			let xOffset = meanGreaterThanReference ? -8 : 8;

			self.Helpers.renderMeanText(reference, data, 'reference-text')
				.attr('dx', xOffset)
				.attr('text-anchor', textAnchor)
				.style('fill', '#d3d3d3');
		},

		// drawDescriptions

		renderOneDescription: function(category, measure, mean, reference, meanString, descriptionDivEl) {
			let desriptionHTML = '';			

			mean = Math.round(mean * 100) / 100;
			desriptionHTML += '<span class="category">' + category + '</span> has ';
			desriptionHTML += (mean > reference) 
							? ('<span class="higher"><span class="fa fa-arrow-alt-circle-up"></span> HIGHER</span> <span class="measure">' + measure + '</span>') 
							: ('<span class="lower"><span class="fa fa-arrow-alt-circle-down"></span> LOWER</span> <span class="measure">' + measure + '</span>');
			desriptionHTML += ' when compared to ' + meanString;

			$(descriptionDivEl).html(desriptionHTML);
		}
	},
	Helpers: {
		generateInsightHTMLByDimension: function(measuresForEachCategory) {
			const self = ComparisonHandler;
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
			const self = ComparisonHandler;
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
		convertToCategoriesForEachMeasure: function(measuresForEachCategory) {
			let categoriesForEachMeasure = {};
			let allMeasures = MeasurePane.selectedMeasures;

			// init
			for (let i = 0; i < allMeasures.length; i++) {
				let measure = allMeasures[i];
				categoriesForEachMeasure[measure] = []
			}

			// create
			for (category in measuresForEachCategory)
				for (let i = 0; i < measuresForEachCategory[category].length; i++) {
					let measure = measuresForEachCategory[category][i];

					categoriesForEachMeasure[measure].push(category);
				}

			return categoriesForEachMeasure;
		},
		renderDensityPlot: function(probabilityDistribution, data, className) {
			const self = ComparisonHandler;
			let SVGEl = data.SVGEl;
			let translateString = data.translateString;
			let maxProbability = data.maxProbability;

			let xScale = d3.scaleLinear()
				.domain([ 0, probabilityDistribution.length - 1 ])
				.range([ 0, self.densityPlotWidth ]);
			let yScale = d3.scaleLinear()
				.domain([ 0, maxProbability ])
				.range([ self.densityPlotHeight - 2, 0 ]);
			let areaFunction = d3.area()
	      		.x(function(d, i) { return xScale(i); })
	      		.y0(self.densityPlotHeight - 2)
	      		.y1(function(d) { return yScale(d); })
	      		.curve(d3.curveMonotoneX);
	      	let curveFunction = d3.line()
	    		.x(function(d, i) { return xScale(i); })
	    		.y(function(d) { return yScale(d); })
	    		.curve(d3.curveMonotoneX);

			d3.select(SVGEl)
				.append('g')
				.attr('class', className)
				.attr('transform', translateString);
	      	return d3.select(SVGEl).select('.' + className)
	      		.append('path')
	      		.attr('d', areaFunction(probabilityDistribution));
		},
		renderMeanLine: function(mean, data, className) {
			const self = ComparisonHandler;
			let SVGEl = data.SVGEl;
			let min = data.min, max = data.max;
			let binNumber = ComparisonOperator.binNumber;
			let translateString = data.translateString;

			let xScale = d3.scaleLinear()
				.domain([ min , max ])
				.range([ 0, self.densityPlotWidth ]);

			let lineGroup = d3.select(SVGEl)
				.append('g')
				.attr('class', className)
				.attr('transform', translateString);
			let line = d3.select(SVGEl).select('.' + className)
				.append('line')
				.attr('x1', xScale(mean))
				.attr('x2', xScale(mean))
				.attr('y1', -3)
				.attr('y2', self.densityPlotHeight - 2)
				.style('stroke-dasharray', 4)
				.style('stroke', '#d3d3d3');
			let dot = d3.select(SVGEl).select('.' + className)
				.append('circle')
				.attr('r', 2)
				.attr('cx', xScale(mean))
				.attr('cy', self.densityPlotHeight - 2)
				.style('fill', '#d3d3d3');

			return { line: line, dot: dot };
		},
		renderMeanText: function(mean, data, className) {
			const self = ComparisonHandler;
			let SVGEl = data.SVGEl;
			let min = data.min, max = data.max;
			let binNumber = ComparisonOperator.binNumber;
			let translateString = data.translateString;
			let roundedMean = Math.round(mean * 100) / 100;

			let xScale = d3.scaleLinear()
				.domain([ min , max ])
				.range([ 0, self.densityPlotWidth ]);

			return d3.select(SVGEl)
				.append('text')
				.attr('class', className)
				.attr('x', xScale(mean))
				.attr('y', 5)
				.attr('transform', translateString)
				.text(roundedMean);
		}
	}
}