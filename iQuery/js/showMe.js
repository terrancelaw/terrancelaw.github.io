const ShowMe = {
	previousState: {
		densityPlotDisabled: null, densityPlotSelected: null,
		trendLinesDisabled: null, trendLinesSelected: null
	},

	init: function() {
		const self = this;

		self.installMouseEnterButtonBehaviour();
		self.installClickDensityPlotButtonBehaviour();
		self.installClickTrendLineButtonBehaviour();
	},
	setToDefault: function() {
		const self = this;

		self.clearState();
		self.endPreview();
		self.lockDensityPlot();
		self.lockTrendLines();
	},

	// state

	saveState: function() {
		const self = this;

		self.previousState.densityPlotDisabled = $('#vis-column .showme .density-plot.button').hasClass('disabled');
		self.previousState.densityPlotSelected = $('#vis-column .showme .density-plot.button').hasClass('selected');
		self.previousState.trendLinesDisabled = $('#vis-column .showme .trend-lines.button').hasClass('disabled');
		self.previousState.trendLinesSelected = $('#vis-column .showme .trend-lines.button').hasClass('selected');
	},
	clearState: function() {
		const self = this;

		self.previousState.densityPlotDisabled = null;
		self.previousState.densityPlotSelected = null;
		self.previousState.trendLinesDisabled = null;
		self.previousState.trendLinesSelected = null;
	},
	restoreState: function() {
		const self = this;

		if (self.previousState.densityPlotDisabled === null ||
			self.previousState.densityPlotSelected === null ||
			self.previousState.trendLinesDisabled === null ||
			self.previousState.trendLinesSelected === null)
			return;

		if (self.previousState.densityPlotDisabled)
			$('#vis-column .showme .density-plot.button').addClass('disabled');
		if (!self.previousState.densityPlotDisabled)
			$('#vis-column .showme .density-plot.button').removeClass('disabled');
		if (self.previousState.densityPlotSelected)
			$('#vis-column .showme .density-plot.button').addClass('selected');
		if (!self.previousState.densityPlotSelected)
			$('#vis-column .showme .density-plot.button').removeClass('selected');
		if (self.previousState.trendLinesDisabled)
			$('#vis-column .showme .trend-lines.button').addClass('disabled');
		if (!self.previousState.trendLinesDisabled)
			$('#vis-column .showme .trend-lines.button').removeClass('disabled');
		if (self.previousState.trendLinesSelected)
			$('#vis-column .showme .trend-lines.button').addClass('selected');
		if (!self.previousState.trendLinesSelected)
			$('#vis-column .showme .trend-lines.button').removeClass('selected');

		if (ShelfPane.inPreviewMode)
			self.startPreview();
		if (!ShelfPane.inPreviewMode)
			self.endPreview();
	},

	// preview

	preview: function(visSpec) {
		if (!('showMe' in visSpec)) {
			ShowMe.lockDensityPlot();
			ShowMe.lockTrendLines();
			return;
		}

		let selectDensityPlot = visSpec.showMe.type == 'density';
		let selectTrendLines = visSpec.showMe.type == 'trend';
		let isPreview = visSpec.showMe.added;

		if (selectDensityPlot) {
			ShowMe.lockTrendLines();
			ShowMe.unlockDensityPlot();
			ShowMe.selectDensityPlot();
		}

		if (selectTrendLines) {
			ShowMe.lockDensityPlot();
			ShowMe.unlockTrendLines();
			ShowMe.selectTrendLines();
		}

		if (isPreview)
			ShowMe.startPreview();
	},
	startPreview: function() {
		$('#vis-column .showme')
			.addClass('preview');
	},
	endPreview: function() {
		$('#vis-column .showme')
			.removeClass('preview');
	},

	// init

	installMouseEnterButtonBehaviour: function() {
		$('#vis-column .showme .density-plot.button')
			.on('mouseenter', onMouseEnterButton)
			.on('mouseleave', onMouseLeaveButton);
		$('#vis-column .showme .trend-lines.button')
			.on('mouseenter', onMouseEnterButton)
			.on('mouseleave', onMouseLeaveButton);

		function onMouseEnterButton() {
			let showMePosition = $('#vis-column .showme').position();
			let showMeWidth = $('#vis-column .showme').width();
			let showMeHeight = $('#vis-column .showme').height();
			let isCurrentButtonDensity = $(this).hasClass('density-plot');
			let description = '';

			// determine description
			if (isCurrentButtonDensity)
				description = '<div>For <span style="font-weight:bold">Density Plot</span>, you need at least:</div>' +
							  '<div>• A quantitative variable</div>' + 
							  '<div>• A nominal variable (optional)</div>';
			if (!isCurrentButtonDensity)
				description = '<div>To show <span style="font-weight:bold">Trend Lines</span>, you need at least:</div>' + 
							  '<div>• two quantitative / temporal variables</div>' +
							  '<div>• A nominal variable (optional)</div>';

			// show description
			$('#vis-column .showme-description')
				.css('top', showMePosition.top + showMeHeight + 10)
				.css('left', showMePosition.left)
				.css('width', showMeWidth - 20) // 20 is padding
				.html(description)

			$('#vis-column .showme-description')
				.css('display', 'none')
				.fadeTo(200, 1)
		}

		function onMouseLeaveButton() {
			$('#vis-column .showme-description')
				.css('display', 'none')
				.fadeOut(100);
		}
	},
	installClickDensityPlotButtonBehaviour: function() {
		$('#vis-column .showme .density-plot.button')
			.on('click', onClickButton);
		
		function onClickButton() {
			let isButtonEnabled = !$(this).hasClass('disabled');
			let isButtonSelected = $(this).hasClass('selected');

			if (isButtonEnabled && isButtonSelected) {
				if (PreviewMode.isOn) {
					Shelves.endPreview();
					Filters.endPreview();
					ShowMe.endPreview();
					PreviewMode.off();
				}
				
				$(this).removeClass('selected');
				VisualizationPane.showLoader();
				VisualizationPane.allowUpdating();
				VegaliteGenerator.generateSpecification(); // may block vis update
				VisualizationPane.tryUpdating();

				DimensionMeasurePaneCapsules.clearAllSelection();
				LookAheadEventHandler.listenEvent();
			}

			if (isButtonEnabled && !isButtonSelected) {
				if (PreviewMode.isOn) {
					Shelves.endPreview();
					Filters.endPreview();
					ShowMe.endPreview();
					PreviewMode.off();
				}
				
				$(this).addClass('selected');
				ShowMe.lockTrendLines(); // make sure not both on
				ShowMeHelpers.adjustSpecForDensityPlot();
				VisualizationPane.showLoader();
				VisualizationPane.allowUpdating();
				VegaliteGenerator.generateSpecification(); // may block vis update
				VisualizationPane.tryUpdating();

				DimensionMeasurePaneCapsules.clearAllSelection();
				LookAheadEventHandler.listenEvent();
			}
		}
	},
	installClickTrendLineButtonBehaviour: function() {
		$('#vis-column .showme .trend-lines.button')
			.on('click', onClickButton);

		function onClickButton() {
			let isButtonEnabled = !$(this).hasClass('disabled');
			let isButtonSelected = $(this).hasClass('selected');

			if (isButtonEnabled && isButtonSelected) {
				if (PreviewMode.isOn) {
					Shelves.endPreview();
					Filters.endPreview();
					ShowMe.endPreview();
					PreviewMode.off();
				}

				$(this).removeClass('selected');
				VisualizationPane.showLoader();
				VisualizationPane.allowUpdating();
				VegaliteGenerator.generateSpecification(); // may block vis update
				VisualizationPane.tryUpdating();

				DimensionMeasurePaneCapsules.clearAllSelection();
				LookAheadEventHandler.listenEvent();
			}

			if (isButtonEnabled && !isButtonSelected) {
				if (PreviewMode.isOn) {
					Shelves.endPreview();
					Filters.endPreview();
					ShowMe.endPreview();
					PreviewMode.off();
				}

				$(this).addClass('selected');
				ShowMe.lockDensityPlot(); // make sure not both on
				ShowMeHelpers.adjustSpecForTrendLines();
				VisualizationPane.showLoader();
				VisualizationPane.allowUpdating();
				VegaliteGenerator.generateSpecification(); // may block vis update
				VisualizationPane.tryUpdating();

				DimensionMeasurePaneCapsules.clearAllSelection();
				LookAheadEventHandler.listenEvent();
			}
		}
	},

	// density plot

	tryUnlockDensityPlot: function() {
		const self = this;
		let chosenAttrMatchesDensityPlotReq = ShowMeHelpers.areChosenAttrSatifyDensityPlotReq();
		let currentSpecMatchesDensityPlotTemplate = ShowMeHelpers.isCurrentSpecMatchesDensityPlotTemplate();
		let densityPlotButtonSelected = self.isDensityPlotSelected();

		if (densityPlotButtonSelected && currentSpecMatchesDensityPlotTemplate)
			return;
		if (chosenAttrMatchesDensityPlotReq)
			ShowMe.unlockDensityPlot();
		if (!chosenAttrMatchesDensityPlotReq)
			ShowMe.lockDensityPlot();
	},
	lockDensityPlot: function() {
		$('#vis-column .showme .density-plot.button')
			.removeClass('selected')
			.addClass('disabled');
	},
	unlockDensityPlot: function() {
		$('#vis-column .showme .density-plot.button')
			.removeClass('disabled');
		$('#vis-column .showme .density-plot.button')
			.removeClass('selected');
	},
	selectDensityPlot: function() {
		$('#vis-column .showme .density-plot.button')
			.addClass('selected');
	},
	isDensityPlotSelected: function() {
		let isButtonEnabled = !$('#vis-column .showme .density-plot.button').hasClass('disabled')
		let isButtonSelected = $('#vis-column .showme .density-plot.button').hasClass('selected')

		return isButtonEnabled && isButtonSelected;
	},

	// trend lines

	tryUnlockTrendLines: function() {
		const self = this;
		let hasSelectedCapsules = DimensionMeasurePaneCapsules.hasSelection();
		let chosenAttrMatchesTrendLineReq = ShowMeHelpers.areChosenAttrSatifyTrendLineReq();
		let currentSpecMatchesTrendLineTemplate = ShowMeHelpers.isCurrentSpecMatchesTrendLineTemplate();
		let trendLineButtonSelected = self.isTrendLinesSelected();

		if (trendLineButtonSelected && currentSpecMatchesTrendLineTemplate)
			return;
		if (chosenAttrMatchesTrendLineReq || (currentSpecMatchesTrendLineTemplate && !hasSelectedCapsules))
			ShowMe.unlockTrendLines();
		if (!chosenAttrMatchesTrendLineReq && !(currentSpecMatchesTrendLineTemplate && !hasSelectedCapsules))
			ShowMe.lockTrendLines();
	},
	lockTrendLines: function() {
		$('#vis-column .showme .trend-lines.button')
			.removeClass('selected')
			.addClass('disabled');
	},
	unlockTrendLines: function() {
		$('#vis-column .showme .trend-lines.button')
			.removeClass('disabled');
		$('#vis-column .showme .trend-lines.button')
			.removeClass('selected');
	},
	selectTrendLines: function() {
		$('#vis-column .showme .trend-lines.button')
			.addClass('selected');
	},
	isTrendLinesSelected: function() {
		let isButtonEnabled = !$('#vis-column .showme .trend-lines.button').hasClass('disabled')
		let isButtonSelected = $('#vis-column .showme .trend-lines.button').hasClass('selected')

		return isButtonEnabled && isButtonSelected;
	}
}