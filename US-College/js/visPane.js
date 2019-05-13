const VisPane = {
	init: function() {
		const self = this;

		self.installClickGroupByButtonBehaviour();
		self.installClickComparisonButtonBehaviour();
		self.installClickFooterButtonBehaviour();
	},
	update: function() {
		const self = this;
		let visType = $('#vis-pane .footer .button.selected').attr('type');
		let groupByMode = $('#vis-pane .header .grouping .button.selected').attr('mode');
		let comparisonMode = $('#vis-pane .header .comparison .button.selected').attr('mode');

		let categories = DimensionPane.selectedCategories;
		let dimension = DimensionPane.selectedAttribute;
		let measures = MeasurePane.selectedMeasures;

		if (visType == 'comparison' && comparisonMode == 'relative')
			self.updateRelativeComparison(categories, dimension, measures, groupByMode);
		if (visType == 'comparison' && comparisonMode == 'cms')
			self.updateCMSComparison(categories, dimension, measures, groupByMode);
		if (visType == 'comparison' && comparisonMode == 'peer')
			self.updatePeerComparison(categories, dimension, measures, groupByMode);
		if (visType == 'timeSeries')
			self.updateTimeSeries(categories, dimension, measures, groupByMode);
	},
	showComparisonMode: function() {
		$('#vis-pane .header .comparison')
			.css('display', '');
	},
	hideComparisonMode: function() {
		$('#vis-pane .header .comparison')
			.css('display', 'none');
	},
	showLoader: function() {
		$('#vis-pane .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#vis-pane .loader')
			.css('display', '');
	},

	// init

	installClickGroupByButtonBehaviour: function() {
		const self = this;
		
		$('#vis-pane .header .grouping .button')
			.on('click', onClickGroupByButton);

		function onClickGroupByButton() {
			$('#vis-pane .header .grouping .button').removeClass('selected');
			$(this).addClass('selected');
			self.showLoader();

			setTimeout(function() {
				self.update();
				self.hideLoader();
			}, 50);
		}
	},
	installClickComparisonButtonBehaviour: function() {
		const self = this;
		
		$('#vis-pane .header .comparison .button')
			.on('click', onClickComparisonButton);

		function onClickComparisonButton() {
			$('#vis-pane .header .comparison .button').removeClass('selected');
			$(this).addClass('selected');
			self.showLoader();

			setTimeout(function() {
				self.update();
				self.hideLoader();
			}, 50);
		}
	},
	installClickFooterButtonBehaviour: function() {
		const self = this;

		$('#vis-pane .footer .button')
			.on('click', onClickFooterButton);

		function onClickFooterButton() {
			$('#vis-pane .footer .button').removeClass('selected');
			$(this).addClass('selected');
			self.showLoader();

			setTimeout(function() {
				self.update();
				self.hideLoader();
			}, 50);
		}
	},

	// update

	updateRelativeComparison: function(categories, dimension, measures, groupByMode) {
		const self = this;

		self.showComparisonMode();
		ComparisonOperator.ObjectPairs.getData(dimension, categories);
		ComparisonOperator.ObjectPairs.generateMeans(measures);
		ComparisonOperator.ObjectPairs.generateDifferentMeasures();
		ComparisonOperator.ObjectPairs.generateNumberArrays();
		ComparisonOperator.ObjectPairs.generateProbabilityDistributions();
		ComparisonHandler.ObjectPairs.drawHTML(groupByMode);
		ComparisonHandler.ObjectPairs.drawDensityPlots();
		ComparisonHandler.ObjectPairs.drawDescriptions();
	},
	updateCMSComparison: function(categories, dimension, measures, groupByMode) {
		const self = this;

		self.showComparisonMode();
		ComparisonOperator.Objects.meanType = 'cmsMean';
		ComparisonOperator.Objects.getData(dimension, categories);
		ComparisonOperator.Objects.generateMeans(measures);
		ComparisonOperator.Objects.generateDifferentMeasures();
		ComparisonOperator.Objects.generateNumberArrays();
		ComparisonOperator.Objects.generateProbabilityDistributions();
		ComparisonHandler.Objects.drawHTML(groupByMode);
		ComparisonHandler.Objects.drawDensityPlots();
		ComparisonHandler.Objects.drawDescriptions();
	},
	updatePeerComparison: function(categories, dimension, measures, groupByMode) {
		const self = this;

		self.showComparisonMode();
		ComparisonOperator.Objects.meanType = 'peerMean';
		ComparisonOperator.Objects.getData(dimension, categories);
		ComparisonOperator.Objects.generateMeans(measures);
		ComparisonOperator.Objects.generateDifferentMeasures();
		ComparisonOperator.Objects.generateNumberArrays();
		ComparisonOperator.Objects.generateProbabilityDistributions();
		ComparisonHandler.Objects.drawHTML(groupByMode);
		ComparisonHandler.Objects.drawDensityPlots();
		ComparisonHandler.Objects.drawDescriptions();
	},
	updateTimeSeries: function(categories, dimension, measures, groupByMode) {
		const self = this;

		self.hideComparisonMode();
		TimeSeriesOperator.getDataForEachCategory(dimension, categories);
		TimeSeriesOperator.computeMeansForEachPeriod(measures);
		TimeSeriesOperator.generateTimeSeriesForEachCategory(measures);
		TimeSeriesOperator.interpolateForMissingValues();
		TimeSeriesOperator.detectTrendForEachTimeSeries();
		TimeSeriesHandler.drawHTML(groupByMode);
		TimeSeriesHandler.drawTimeSeries();
		TimeSeriesHandler.drawDescriptions();
	}
}