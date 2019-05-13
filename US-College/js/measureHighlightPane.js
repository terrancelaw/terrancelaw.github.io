const MeasureHighlightPane = {
	svgWidth: 100,
	svgHeight: 20,

	update: function() {
		const self = this;
		let dimension = DimensionPane.selectedAttribute;
		let categories = DimensionPane.selectedCategories;
		let measures = self.getMeasuresBetweenZeroAndOne(MeasurePane.selectedMeasures);
		let measureMeansForEachCategory = MeanOperator.measureMeansForEachCategory;
		let topCategoriesForEachMeasure = self.initTopCategoriesForEachMeasure(categories, measures, measureMeansForEachCategory);

		self.sort(topCategoriesForEachMeasure);
		self.drawHTML(topCategoriesForEachMeasure);
		self.drawBars(topCategoriesForEachMeasure);
		self.installClickTitleBehaviour();
		self.installMouseEnterTitleBehaviour();
		self.installMouseEnterTopCategoryBehaviour();
	},
	showLoader: function() {
		$('#measure-highlight-pane .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#measure-highlight-pane .loader')
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
	initTopCategoriesForEachMeasure: function(categories, measures, measureMeansForEachCategory) {
		let topCategoriesForEachMeasure = {};

		for (let i = 0; i < measures.length; i++) {
			let measure = measures[i];
			topCategoriesForEachMeasure[measure] = [];

			for (let j = 0; j < categories.length; j++) {
				let category = categories[j];
				let meanForCurrentCategory = measureMeansForEachCategory[category].yes[measure];
				let meanIsNumber = !isNaN(meanForCurrentCategory);

				if (meanIsNumber)
					topCategoriesForEachMeasure[measure].push({
						category: category,
						measureMean: meanForCurrentCategory
					});
			}
		}

		return topCategoriesForEachMeasure;
	},
	sort: function(topCategoriesForEachMeasure) {
		for (let measure in topCategoriesForEachMeasure)
			topCategoriesForEachMeasure[measure].sort(function(a, b){
				return b.measureMean - a.measureMean;
			});
	},
	drawHTML: function(topCategoriesForEachMeasure) {
		const self = this;
		let listHTML = '';

		for (let measure in topCategoriesForEachMeasure) {
			let count = 0;

			if (topCategoriesForEachMeasure[measure].length != 0)
				listHTML += '<div class="title" key="' + measure + '">' + 
								'<span class="title-text">' + measure + '</span>' + 
								'<span class="fa fa-angle-down"></span>' + 
							'</div>';

			for (let i = 0; i < topCategoriesForEachMeasure[measure].length; i++) {
				let category = topCategoriesForEachMeasure[measure][i].category;
				let measureMean = topCategoriesForEachMeasure[measure][i].measureMean;
				let className = (count >= 3) ? 'top-category hidden' : 'top-category';
				let currentTopCategoryHTML = '<div class="' + className + '" mean="' + measureMean + '" key="' + measure + '">' +
												'<span class="bar" style="width:' + self.svgWidth + 'px;height:' + self.svgHeight + 'px">' + 
													'<svg></svg>' +
												'</span>' +
												'<span class="category">' + category + '</span>' +
					   					 	'</div>';

				listHTML += currentTopCategoryHTML;
				count++;
			}
		}

		if (listHTML == '')
			listHTML = '<div class="nothing-to-show">Nothing to show</div>';

		$('#measure-highlight-pane .content').html(listHTML);
	},
	drawBars: function(topCategoriesForEachMeasure) {
		const self = this;
		let topBottomGap = 4;
		let leftPadding = 15;
		let rectHeight = self.svgHeight - topBottomGap * 2;
		let widthScale = d3.scaleLinear()
			.domain([ 0, 1 ])
			.range([ 0, self.svgWidth - leftPadding ]);

		$('#measure-highlight-pane .content .top-category').each(function() {
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
		$('#measure-highlight-pane .content .title')
			.on('click', clickTitle);

		function clickTitle() {			
			let key = $(this).attr('key');
			let isExpanded = $(this).hasClass('expanded');

			if (isExpanded) {
				$(this).removeClass('expanded');
				$(this).find('.fa').removeClass('fa-angle-up');
				$(this).find('.fa').addClass('fa-angle-down');
				$('.top-category.hidden[key="' + key + '"]')
					.css('display', '');
			}

			if (!isExpanded) {
				$(this).addClass('expanded');
				$(this).find('.fa').removeClass('fa-angle-down');
				$(this).find('.fa').addClass('fa-angle-up');
				$('.top-category.hidden[key="' + key + '"]')
					.css('display', 'none')
					.fadeTo(200, 1);
			}
		}
	},
	installMouseEnterTitleBehaviour: function() {
		$('#measure-highlight-pane .content .title')
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
	installMouseEnterTopCategoryBehaviour: function() {
		$('#measure-highlight-pane .content .top-category')
			.on('mouseenter', mouseenterTopMeasure)
			.on('mouseleave', mouseleaveTopMeasure);

		function mouseenterTopMeasure() {
			let topMeasureEl = $(this).find('.category')[0];
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