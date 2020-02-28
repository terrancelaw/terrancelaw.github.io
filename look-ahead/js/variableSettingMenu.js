const VariableSettingMenu = {
	currentMenuTop: null,
	currentMenuLeft: null,
	currentCapsuleData: null,

	init: function() {
		const self = this;

		self.installVariableTypeButtonsBehaviour();
		self.installFunctionButtonsBehaviour();
		self.installTimeUnitButtonsBehaviour();

		self.installButtonTooltip();
		self.installConfirmButtonBehaviour();
		self.installCreateButtonBehaviour();
		self.installCancelButtonBehaviour();
		self.installRestoreButtonBehaviour();
	},
	show: function(top, left, currentCapsuleData) {
		const self = this;

		self.storeData(top, left, currentCapsuleData);
		self.changeMenuType();
		self.displayBlock();
		self.adjustFooterHeight();
		self.moveTo(top, left);
	},
	hide: function() {
		$('#dimension-pane .content .capsule').removeClass('selected');
		$('#measure-pane .content .capsule').removeClass('selected');
		$('#variable-setting-menu').css('display', '');
	},
	getMaxBins: function() {
		let maxbins = $('#variable-setting-menu .function-menu .bin.button input').val();
		let isNoInput = (maxbins === '');
		let isMaxbinsNumber =!isNaN(maxbins);

		if (isMaxbinsNumber && !isNoInput)
			maxbins = +maxbins;
		if (!isMaxbinsNumber || isNoInput)
			maxbins = 'none';

		return maxbins;
	},

	// menu buttons
	installVariableTypeButtonsBehaviour: function() {
		const self = this;

		$('#variable-setting-menu .variable-type-menu .button')
			.on('click', clickVariableTypeMenuButton);

		function clickVariableTypeMenuButton() {
			let variableButtonSelector = '#variable-setting-menu .variable-type-menu .button';
			let clickedButtonEl = this;
			let isClickedButtonSelected = $(clickedButtonEl).hasClass('selected');
			let isClickedButtonDisabled = $(clickedButtonEl).hasClass('disabled');
			let clickedAttributeType = $(clickedButtonEl).attr('value');
			let capsuleAttributeAggregate = self.currentCapsuleData.aggregate;
			let capsuleAttributeTimeUnit = self.currentCapsuleData.timeUnit;
			let top = self.currentMenuTop, left = self.currentMenuLeft;

			if (isClickedButtonSelected || isClickedButtonDisabled)
				return;

			$(variableButtonSelector).removeClass('selected');
			$(clickedButtonEl).addClass('selected');
			self.showFunctionOrTimeUnitMenu(clickedAttributeType);
			self.selectOptions(clickedAttributeType, capsuleAttributeAggregate, capsuleAttributeTimeUnit);
			self.adjustFooterHeight();
			self.moveTo(top, left);
		}
	},
	installFunctionButtonsBehaviour: function() {
		const self = this;

		$('#variable-setting-menu .function-menu .button')
			.on('click', clickFunctionMenuButton);

		function clickFunctionMenuButton() {
			let isClickedButtonSelected = $(this).hasClass('selected');

			if (!isClickedButtonSelected)
				selectClickedButton(this);
		}

		function selectClickedButton(clickedEl) {
			$('#variable-setting-menu .function-menu .button').removeClass('selected');
			$(clickedEl).addClass('selected');
		}
	},
	installTimeUnitButtonsBehaviour: function() {
		const self = this;

		$('#variable-setting-menu .time-unit-menu .button')
			.on('click', clickTimeUnitMenuButton);

		function clickTimeUnitMenuButton() {
			let isClickedButtonSelected = $(this).hasClass('selected');

			if (!isClickedButtonSelected)
				selectClickedButton(this);
		}

		function selectClickedButton(clickedEl) {
			$('#variable-setting-menu .time-unit-menu .button').removeClass('selected');
			$(clickedEl).addClass('selected');
		}
	},

	// footer buttons

	installButtonTooltip: function() {
		$('#variable-setting-menu .footer .button')
			.on('mouseenter', onMouseEnterButton)
			.on('mouseleave', onMouseLeaveButton);

		function onMouseEnterButton() { Tooltip.show(this, 1, -4); }
		function onMouseLeaveButton() { Tooltip.remove(); }
	},
	installConfirmButtonBehaviour: function() {
		const self = this;

		$('#variable-setting-menu .footer .confirm.button')
			.on('click', onClickConfirmButton);

		function onClickConfirmButton() {
			let capsuleLocation = self.currentCapsuleData.capsuleLocation;
			let capsuleAttributeType = self.currentCapsuleData.type;
			let capsuleAttributeAggregate = self.currentCapsuleData.aggregate;
			let capsuleAttributeTimeUnit = self.currentCapsuleData.timeUnit;
			let capsuleAttributeMaxbins = self.currentCapsuleData.maxbins;

			let selectedAttributeType = $('#variable-setting-menu .variable-type-menu .button.selected').attr('value');
			let selectedAttributeAggregate = $('#variable-setting-menu .function-menu .button.selected').attr('value');
			let selectedAttributeTimeUnit = $('#variable-setting-menu .time-unit-menu .button.selected').attr('value');
			let selectedAttributeMaxbins = self.getMaxBins();

			let stopApplyingConstriants = false;
			let isAttributeTemporalNoTimeUnit = (selectedAttributeType == 'temporal' && selectedAttributeTimeUnit == 'none');
			let isAttributeNominalOrOrdinal = (selectedAttributeType == 'ordinal' || selectedAttributeType == 'nominal');
			let optionChanged = (selectedAttributeType != capsuleAttributeType) ||
								(selectedAttributeAggregate != capsuleAttributeAggregate) ||
								(selectedAttributeTimeUnit != capsuleAttributeTimeUnit) || 
								(selectedAttributeMaxbins != capsuleAttributeMaxbins);

			if (optionChanged) {
				self.currentCapsuleData.type = selectedAttributeType;
				self.currentCapsuleData.aggregate = isAttributeNominalOrOrdinal ? 'none' : selectedAttributeAggregate;
				self.currentCapsuleData.timeUnit = isAttributeNominalOrOrdinal ? 'none' : selectedAttributeTimeUnit;
				self.currentCapsuleData.maxbins = isAttributeNominalOrOrdinal ? 'none' : selectedAttributeMaxbins;
				stopApplyingConstriants = isAttributeTemporalNoTimeUnit ? true : false; // check out why it is needed later
			}

			if ((capsuleLocation == 'dimensionPane' || capsuleLocation == 'measurePane') && optionChanged) {
				DimensionMeasurePane.refreshAttributes();
				DimensionMeasurePane.renderDimensionCapsules();
				DimensionMeasurePane.renderMeasureCapsules();
				DimensionMeasurePane.adjustHeight();
				DimensionMeasurePane.adjustAttributeNameWidth();
				DimensionMeasurePaneCapsules.installTooltips();
				DimensionMeasurePaneCapsules.installDragBehaviour();
				DimensionMeasurePaneCapsules.installClickButtonsBehaviour();
				LookAheadEventHandler.listenEvent(forceUpdate = true);
			}

			if (capsuleLocation == 'shelf' && optionChanged) {
				Shelves.refreshCapsules();
				ShowMe.tryUnlockDensityPlot();
				ShowMe.tryUnlockTrendLines();
				VisualizationPane.showLoader();
				VisualizationPane.allowUpdating();
				VegaliteGenerator.generateSpecification(resize = null, stopApplyingConstriants); // may block vis update
				VisualizationPane.tryUpdating();
				LookAheadEventHandler.listenEvent(forceUpdate = true);
			}

			self.hide();
		}
	},
	installCreateButtonBehaviour: function() {
		const self = this;

		$('#variable-setting-menu .footer .create.button')
			.on('click', onClickCreateButton);

		function onClickCreateButton() {
			let copiedCapsuleData = $.extend(true, {}, self.currentCapsuleData);
			let selectedAttributeType = $('#variable-setting-menu .variable-type-menu .button.selected').attr('value');
			let selectedAttributeAggregate = $('#variable-setting-menu .function-menu .button.selected').attr('value');
			let selectedAttributeTimeUnit = $('#variable-setting-menu .time-unit-menu .button.selected').attr('value');

			copiedCapsuleData.type = selectedAttributeType;
			copiedCapsuleData.aggregate = selectedAttributeAggregate;
			copiedCapsuleData.timeUnit = selectedAttributeTimeUnit;
			copiedCapsuleData.isAddedByUser = true;

			if (selectedAttributeType == 'nominal' ||
				selectedAttributeType == 'ordinal' ||
				selectedAttributeType == 'temporal')
				DimensionMeasurePane.dimensions.push(copiedCapsuleData);

			if (selectedAttributeType == 'quantitative')
				DimensionMeasurePane.measures.push(copiedCapsuleData);

			DimensionMeasurePane.renderDimensionCapsules();
			DimensionMeasurePane.renderMeasureCapsules();
			DimensionMeasurePane.adjustHeight();
			DimensionMeasurePane.adjustAttributeNameWidth();

			DimensionMeasurePaneCapsules.installTooltips();
			DimensionMeasurePaneCapsules.installDragBehaviour();
			DimensionMeasurePaneCapsules.installClickButtonsBehaviour();

			self.hide();
		}
	},
	installCancelButtonBehaviour: function() {
		const self = this;

		$('#variable-setting-menu .footer .cancel.button')
			.on('click', onClickCancelButton);

		function onClickCancelButton() {
			self.hide();
		}
	},
	installRestoreButtonBehaviour: function() {
		const self = this;
		
		$('#variable-setting-menu .footer .restore.button')
			.on('click', onClickRestoreButton);

		function onClickRestoreButton() {
			let capsuleAttributeName = self.currentCapsuleData.attributeName;
			let restoredAttributeType = Database.attributeMetadata[capsuleAttributeName].type;
			let restoredAttributeAggregate = Database.attributeMetadata[capsuleAttributeName].aggregate;
			let restoredAttributeTimeUnit = Database.attributeMetadata[capsuleAttributeName].timeUnit;
			let restoredAreAllValuesDates = Database.attributeMetadata[capsuleAttributeName].areAllValuesDates;
			let top = self.currentMenuTop, left = self.currentMenuLeft;

			self.setVariableTypeMenuConstraints(restoredAttributeType, restoredAreAllValuesDates);
			self.showFunctionOrTimeUnitMenu(restoredAttributeType);
			self.selectOptions(restoredAttributeType, restoredAttributeAggregate, restoredAttributeTimeUnit);
			self.adjustFooterHeight();
			self.moveTo(top, left);
		}
	},

	// show

	storeData: function(top, left, currentCapsuleData) {
		const self = this;

		self.currentMenuTop = top;
		self.currentMenuLeft = left;
		self.currentCapsuleData = currentCapsuleData;
	},
	displayBlock: function() {
		$('#variable-setting-menu')
			.css('display', 'none')
			.fadeTo(150, 1)
	},
	moveTo: function(top, left) {
		let menuHeight = $('#variable-setting-menu').height();
		let windowHeight = window.innerHeight;
		let menuHidden = (top + menuHeight > windowHeight);
		
		if (menuHidden)
			$('#variable-setting-menu')
				.css('top', top - menuHeight - 4)
				.css('left', left);

		if (!menuHidden)
			$('#variable-setting-menu')
				.css('top', top)
				.css('left', left);
	},
	changeMenuType: function() {
		const self = this;
		let attributeName = self.currentCapsuleData.attributeName;
		let originalAttributeType = Database.attributeMetadata[attributeName].type;
		let areAllValuesDates = self.currentCapsuleData.areAllValuesDates;

		let attributeType = self.currentCapsuleData.type;
		let attributeAggregate = self.currentCapsuleData.aggregate;
		let attributeTimeUnit = self.currentCapsuleData.timeUnit;
		let attributeMaxbins = self.currentCapsuleData.maxbins;

		self.setVariableTypeMenuConstraints(originalAttributeType, areAllValuesDates);
		self.showFunctionOrTimeUnitMenu(attributeType);
		self.selectOptions(attributeType, attributeAggregate, attributeTimeUnit);
		self.setMaxbins(attributeMaxbins);
	},
	setVariableTypeMenuConstraints: function(originalAttributeType, areAllValuesDates) {
		$('#variable-setting-menu .variable-type-menu .button').removeClass('disabled');

		if (originalAttributeType == 'quantitative' && areAllValuesDates) {
			$('#variable-setting-menu .variable-type-menu .ordinal.button').addClass('disabled');
		}
		if (originalAttributeType == 'quantitative' && !areAllValuesDates) {
			$('#variable-setting-menu .variable-type-menu .ordinal.button').addClass('disabled');
			$('#variable-setting-menu .variable-type-menu .temporal.button').addClass('disabled');
		}
		if (originalAttributeType == 'temporal') {
			$('#variable-setting-menu .variable-type-menu .nominal.button').addClass('disabled');
			$('#variable-setting-menu .variable-type-menu .ordinal.button').addClass('disabled');
			$('#variable-setting-menu .variable-type-menu .quantitative.button').addClass('disabled');
		}
		if (originalAttributeType == 'ordinal' && areAllValuesDates) {
			$('#variable-setting-menu .variable-type-menu .nominal.button').addClass('disabled');
		}
		if (originalAttributeType == 'ordinal' && !areAllValuesDates) {
			$('#variable-setting-menu .variable-type-menu .nominal.button').addClass('disabled');
			$('#variable-setting-menu .variable-type-menu .temporal.button').addClass('disabled');
		}
	},
	showFunctionOrTimeUnitMenu: function(attributeType) {
		if (attributeType == 'quantitative') {
			$('#variable-setting-menu .function-menu').css('display', 'none').fadeTo(100, 1);
			$('#variable-setting-menu .time-unit-menu').css('display', 'none');
		}
		if (attributeType == 'temporal') {
			$('#variable-setting-menu .function-menu').css('display', 'none');
			$('#variable-setting-menu .time-unit-menu').css('display', 'none').fadeTo(100, 1);
		}
		if (attributeType == 'ordinal') {
			$('#variable-setting-menu .function-menu').css('display', 'none');
			$('#variable-setting-menu .time-unit-menu').css('display', 'none');
		}
		if (attributeType == 'nominal') {
			$('#variable-setting-menu .function-menu').css('display', 'none');
			$('#variable-setting-menu .time-unit-menu').css('display', 'none');
		}
	},
	selectOptions: function(attributeType, attributeAggregate, attributeTimeUnit) {
		$('#variable-setting-menu .variable-type-menu .button').removeClass('selected');
		$('#variable-setting-menu .function-menu .button').removeClass('selected');
		$('#variable-setting-menu .time-unit-menu .button').removeClass('selected');

		$('#variable-setting-menu .variable-type-menu .' + attributeType + '.button').addClass('selected');
		$('#variable-setting-menu .function-menu .' + attributeAggregate + '.button').addClass('selected');
		$('#variable-setting-menu .time-unit-menu .' + attributeTimeUnit + '.button').addClass('selected');
	},
	setMaxbins: function(attributeMaxbins) {
		if (attributeMaxbins == 'none')
			$('#variable-setting-menu .function-menu .bin.button input').val('');
		if (attributeMaxbins != 'none')
			$('#variable-setting-menu .function-menu .bin.button input').val(attributeMaxbins);
	},
	adjustFooterHeight: function() {
		let leftPaneHeight = $('#variable-setting-menu .left-pane').height();

		$('#variable-setting-menu .right-pane')
			.css('height', leftPaneHeight);
	}
}