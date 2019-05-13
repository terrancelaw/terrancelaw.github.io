const DimensionHightlightPane = {
	svgWidth: 100,
	svgHeight: 20,

	update: function() {
		const self = this;
		let dimension = DimensionPane.selectedAttribute;
		let categories = DimensionPane.selectedCategories;
		let measures = self.getMeasuresBetweenZeroAndOne(MeasurePane.selectedMeasures);
		let measureMeansForEachCategory = MeanOperator.measureMeansForEachCategory;
		let topMeasuresForEachCategory = self.initTopMeasuresForEachCategory(categories, measures, measureMeansForEachCategory);

		self.sort(topMeasuresForEachCategory);
		self.drawHTML(topMeasuresForEachCategory);
		self.drawBars(topMeasuresForEachCategory);
		self.installClickTitleBehaviour();
		self.installMouseEnterTitleBehaviour();
		self.installMouseEnterTopMeasureBehaviour();
	},
	showLoader: function() {
		$('#dimension-highlight-pane .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#dimension-highlight-pane .loader')
			.css('display', '');
	},

	// update

	getMeasuresBetweenZeroAndOne: function(allMeasures) {
		let measuresBetweenZeroAndOne = [];

		for (let i = 0; i < allMeasures.length; i++) {
			let currentMeasure = allMeasures[i];
			[ min, max ] = FilterHandler.getMinMaxValues(currentMeasure);

			if (min >= 0 && min <= 1 && max >= 0 && max <= 1)
				measuresBetweenZeroAndOne.push(currentMeasure);
		}

		return measuresBetweenZeroAndOne;
	},
	initTopMeasuresForEachCategory: function(categories, measures, measureMeansForEachCategory) {
		let topMeasuresForEachCategory = {};

		for (let i = 0; i < categories.length; i++) {
			let category = categories[i];
			topMeasuresForEachCategory[category] = [];

			for (let j = 0; j < measures.length; j++) {
				let measure = measures[j];
				let measureMean = measureMeansForEachCategory[category].yes[measure];
				let meanIsNumber = !isNaN(measureMean);

				if (meanIsNumber)
					topMeasuresForEachCategory[category].push({
						measure: measure, 
						measureMean: measureMean
					});
			}
		}

		return topMeasuresForEachCategory;
	},
	sort: function(topMeasuresForEachCategory) {
		for (let category in topMeasuresForEachCategory)
			topMeasuresForEachCategory[category].sort(function(a, b){
				return b.measureMean - a.measureMean;
			});
	},
	drawHTML: function(topMeasuresForEachCategory) {
		const self = this;
		let dimension = DimensionPane.selectedAttribute;
		let listHTML = '';

		for (let category in topMeasuresForEachCategory) {
			let count = 0;

			if (topMeasuresForEachCategory[category].length != 0)
				listHTML += '<div class="title" key="' + category + '">' + 
								'<span class="title-text">' + dimension + ' = ' + category + '</span>' + 
								'<span class="fa fa-angle-down"></span>' + 
							'</div>';

			for (let i = 0; i < topMeasuresForEachCategory[category].length; i++) {
				let measure = topMeasuresForEachCategory[category][i].measure;
				let measureMean = topMeasuresForEachCategory[category][i].measureMean;
				let className = (count >= 3) ? 'top-measure hidden' : 'top-measure';
				let currentTopMeasureHTML = '<div class="' + className + '" mean="' + measureMean + '" key="' + category + '">' +
												'<span class="bar" style="width:' + self.svgWidth + 'px;height:' + self.svgHeight + 'px">' + 
													'<svg></svg>' +
												'</span>' +
												'<span class="measure">' + measure + '</span>' +
					   					 	'</div>';

				listHTML += currentTopMeasureHTML;
				count++;
			}
		}

		if (listHTML == '')
			listHTML = '<div class="nothing-to-show">Nothing to show</div>';

		$('#dimension-highlight-pane .content').html(listHTML);
	},
	drawBars: function(topMeasuresForEachCategory) {
		const self = this;
		let topBottomGap = 4;
		let leftPadding = 10;
		let rectHeight = self.svgHeight - topBottomGap * 2;
		let widthScale = d3.scaleLinear()
			.domain([ 0, 1 ])
			.range([ 0, self.svgWidth - leftPadding ]);

		$('#dimension-highlight-pane .content .top-measure').each(function() {
			let measureMean = +$(this).attr('mean');
			let roundedMean = Math.round(measureMean * 1000) / 1000;

			d3.select(this).select('svg')
				.append('rect')
				.attr('x', self.svgWidth - widthScale(measureMean))
				.attr('y', topBottomGap)
				.attr('rx', 1)
				.attr('ry', 1)
				.attr('width', widthScale(measureMean))
				.attr('height', rectHeight)
				.style('fill', 'steelblue')
				.style('opacity', 0.2);

			d3.select(this).select('svg')
				.append('text')
				.attr('x', self.svgWidth - 3)
				.attr('y', self.svgHeight / 2 + 1)
				.attr('text-anchor', 'end')
				.attr('alignment-baseline', 'middle')
				.style('fill', 'steelblue')
				.text(roundedMean);
		});
	},
	installClickTitleBehaviour: function() {
		$('#dimension-highlight-pane .content .title')
			.on('click', clickTitle);

		function clickTitle() {
			let key = $(this).attr('key');
			let isExpanded = $(this).hasClass('expanded');

			if (isExpanded) {
				$(this).removeClass('expanded');
				$(this).find('.fa').removeClass('fa-angle-up');
				$(this).find('.fa').addClass('fa-angle-down');
				$('.top-measure.hidden[key="' + key + '"]')
					.css('display', '');
			}

			if (!isExpanded) {
				$(this).addClass('expanded');
				$(this).find('.fa').removeClass('fa-angle-down');
				$(this).find('.fa').addClass('fa-angle-up');
				$('.top-measure.hidden[key="' + key + '"]')
					.css('display', 'none')
					.fadeTo(200, 1);
			}
		}
	},
	installMouseEnterTitleBehaviour: function() {
		$('#dimension-highlight-pane .content .title')
			.on('mouseenter', mouseenterTitle)
			.on('mouseleave', mouseleaveTitle);

		function mouseenterTitle() {
			let titleTextEl = $(this).find('.title-text')[0];
			let isTitleTextOverflow = Helpers.isXOverflow(titleTextEl);
			let tooltipText = $(titleTextEl).html();

			if (isTitleTextOverflow)
				Tooltip.show(this, -50, -8, tooltipText, true);
		}

		function mouseleaveTitle() {
			Tooltip.remove();
		}
	},
	installMouseEnterTopMeasureBehaviour: function() {
		$('#dimension-highlight-pane .content .top-measure')
			.on('mouseenter', mouseenterTopMeasure)
			.on('mouseleave', mouseleaveTopMeasure);

		function mouseenterTopMeasure() {
			let topMeasureEl = $(this).find('.measure')[0];
			let isTopMeasureOverflow = Helpers.isXOverflow(topMeasureEl);
			let tooltipText = $(topMeasureEl).html();

			if (isTopMeasureOverflow)
				Tooltip.show(this, -50, -8, tooltipText, true);
		}

		function mouseleaveTopMeasure() {
			Tooltip.remove();
		}
	}
}