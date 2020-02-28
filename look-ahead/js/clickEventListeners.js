const ClickEventListener = {
	registerClickEvent: function(eventID, targetSelectorArray) {
		const self = this;

		for (let i = 0; i < targetSelectorArray.length; i++)
			self.clickEvents[eventID].targetSelectorArray.push(targetSelectorArray[i]);
	},

	// all click events

	clickEvents: {

		clickCapsule: {
			targetSelectorArray: [
				'#dimension-pane .content .capsule', 
				'#measure-pane .content .capsule'
			],
			notApplicableElSelectorArray: [
				'#dimension-pane .content .capsule .fa-cog',
				'#dimension-pane .content .capsule .fa-plus',
				'#dimension-pane .content .capsule .fa-times',
				'#measure-pane .content .capsule .fa-cog',
				'#measure-pane .content .capsule .fa-plus',
				'#measure-pane .content .capsule .fa-times',
				'.shelf.filter .container .capsule', // to prevent triggering for multiple times
				'#vis-column .showme .density-plot.button', // to prevent triggering for multiple times
				'#look-ahead-pane',
				'#look-ahead-select-metric-menu',
				'#variable-setting-menu',
				'#data-pane .content .load-button',
				'#load-data-window .background',
				'#visualization-pane .footer .swap-axes.button'
			],
			onClick: function(event) {
				let capsuleEl = $(event.target).closest('.capsule')[0];
				let pressedCommandButton = event.metaKey;
				let pressedControlButton = event.ctrlKey;
				let pressedShiftButton = event.shiftKey;
				let pressedModifierKey = (pressedCommandButton || pressedControlButton || pressedShiftButton);
				let alreadySelected = $(capsuleEl).hasClass('clicked');

				if (pressedModifierKey && alreadySelected) {
					$(capsuleEl).removeClass('clicked');
					ShowMe.tryUnlockDensityPlot();
					ShowMe.tryUnlockTrendLines();
					PreviewMode.end();
					LookAheadEventHandler.listenEvent();
					VariableSettingMenu.hide();
					LookAheadSelectMetricMenu.hide();
					Tooltip.remove();
				}

				if (pressedModifierKey && !alreadySelected) {
					$(capsuleEl).addClass('clicked');
					ShowMe.tryUnlockDensityPlot();
					ShowMe.tryUnlockTrendLines();
					PreviewMode.end();
					LookAheadEventHandler.listenEvent();
					VariableSettingMenu.hide();
					LookAheadSelectMetricMenu.hide();
					Tooltip.remove();
				}

				if (!pressedModifierKey) {
					DimensionMeasurePaneCapsules.clearAllSelection();
					$(capsuleEl).addClass('clicked');
					ShowMe.tryUnlockDensityPlot();
					ShowMe.tryUnlockTrendLines();
					PreviewMode.end();
					LookAheadEventHandler.listenEvent();
					VariableSettingMenu.hide();
					LookAheadSelectMetricMenu.hide();
					Tooltip.remove();
				}
			},
			onNotClick: function(event) {
				let isVariableSettingMenuOpened = $('#variable-setting-menu').css('display') == 'block';
				let isLookAheadSelectMetricMenuOpened = $('#look-ahead-select-metric-menu').css('display') == 'block';
				let isEitherMenuOpened = (isVariableSettingMenuOpened || isLookAheadSelectMetricMenuOpened);

				if (isEitherMenuOpened || PreviewMode.isOn)
					return;

				DimensionMeasurePaneCapsules.clearAllSelection();
				LookAheadEventHandler.listenEvent();
				ShowMe.tryUnlockDensityPlot();
				ShowMe.tryUnlockTrendLines();
			}
		},
		clickRecommendation: {
			targetSelectorArray: [
				'#look-ahead-pane .content .recommendation'
			],
			notApplicableElSelectorArray: [
				'.preview',
				'#look-ahead-pane .select-metrics.button',
				'#look-ahead-pane .detail.button',
				'#visualization-pane .increase-size.button',
				'#visualization-pane .decrease-size.button',
				'#visualization-pane .swap-axes.button',
				'#look-ahead-pane .content .recommendation .confirm.button',
				'#look-ahead-select-metric-menu',
				'#variable-setting-menu',
				'#data-pane .content .load-button',
				'#load-data-window .background',
				'.shelf .capsule'
			],
			onClick: function(event) {
				let isVariableSettingMenuOpened = $('#variable-setting-menu').css('display') == 'block';
				let isLookAheadSelectMetricMenuOpened = $('#look-ahead-select-metric-menu').css('display') == 'block';
				let isEitherMenuOpened = (isVariableSettingMenuOpened || isLookAheadSelectMetricMenuOpened);
				let recommendationEl = $(event.target).closest('.recommendation')[0];
				let isRecommendationSelected = $(recommendationEl).hasClass('selected');
				let isRecommendationVisualized = $(recommendationEl).hasClass('visualized');
				let specification = d3.select(recommendationEl).datum();

				if (isEitherMenuOpened)
					return;

				if (!isRecommendationSelected && !isRecommendationVisualized) {
					LookAheadPane.highlight(recommendationEl);
					PreviewMode.start(specification);
				}
			},
			onNotClick: function(event) {
				let isVariableSettingMenuOpened = $('#variable-setting-menu').css('display') == 'block';
				let isLookAheadSelectMetricMenuOpened = $('#look-ahead-select-metric-menu').css('display') == 'block';
				let isEitherMenuOpened = (isVariableSettingMenuOpened || isLookAheadSelectMetricMenuOpened);

				if (isEitherMenuOpened)
					return;

				LookAheadPane.removeHighlight();
				PreviewMode.end();
			}
		},

		// open menus

		clickCapsuleSettingButton: {
			targetSelectorArray: [
				'#dimension-pane .content .capsule .fa-cog', 
				'#measure-pane .content .capsule .fa-cog',
				'.shelf .capsule .fa-cog'
			],
			notApplicableElSelectorArray: [
				'#variable-setting-menu'
			],
			onClick: function(event) {
				let isDimensionaPaneCapsule = $(event.target).closest('#dimension-pane').length > 0;
				let isMeasurePaneCapsule = $(event.target).closest('#measure-pane').length > 0;
				let capsuleEl = $(event.target).closest('.capsule')[0];
				let capsuleContainerEl = $(event.target).closest('.container')[0];
				let capsuleData = d3.select(capsuleContainerEl).datum();

				let settingButtonPos = $(event.target).offset();
				let variableSettingMenuTop = settingButtonPos.top;
				let variableSettingMenuLeft = settingButtonPos.left;

				if (isDimensionaPaneCapsule || isMeasurePaneCapsule) {
					PreviewMode.confirm();
					$('#dimension-pane .content .capsule').removeClass('selected');
					$('#measure-pane .content .capsule').removeClass('selected');
					$(capsuleEl).addClass('selected');
					VariableSettingMenu.show(variableSettingMenuTop, variableSettingMenuLeft, capsuleData);
				}

				if (!isDimensionaPaneCapsule && !isMeasurePaneCapsule) {
					PreviewMode.confirm();
					$('#dimension-pane .content .capsule').removeClass('selected');
					$('#measure-pane .content .capsule').removeClass('selected');
					VariableSettingMenu.show(variableSettingMenuTop, variableSettingMenuLeft, capsuleData);
				}
			},
			onNotClick: function(event) {
				VariableSettingMenu.hide();
			}
		},
		clickLookAheadSettingButton: {
			targetSelectorArray: [
				'#look-ahead-pane .footer .select-metrics.button'
			],
			notApplicableElSelectorArray: [
				'#look-ahead-select-metric-menu'
			],
			onClick: function(event) {
				let isButtonAlreadySelected = $('#look-ahead-pane .select-metrics.button').hasClass('selected');
				let settingButtonPos = $('#look-ahead-pane .select-metrics.button .fa').offset();
				let menuTop = settingButtonPos.top;
				let menuLeft = settingButtonPos.left;

				if (!isButtonAlreadySelected)
					LookAheadSelectMetricMenu.show(menuTop, menuLeft);

				if (isButtonAlreadySelected)
					LookAheadSelectMetricMenu.hide();
			},
			onNotClick: function(event) {
				LookAheadSelectMetricMenu.hide();
			}
		}

	}
}