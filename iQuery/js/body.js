let Body = {
	resizeTimer: null,

	init: function() {
		const self = this;

		self.initResizeBehaviour();
		self.initPressKeyBehaviour();
		self.initClickBehaviour();
	},
	initResizeBehaviour: function() {
		const self = this;

		$(window).on('resize', function(event){
			let isResizingLookAheadAndShelfPanes = $(event.target).hasClass('ui-resizable');

			// update vis after resizing is done
			if (!isResizingLookAheadAndShelfPanes) {
				DimensionMeasurePane.adjustHeight();
				clearTimeout(self.resizeTimer);
				self.resizeTimer = setTimeout(onResizeWindow, 300);
			}
		});

		function onResizeWindow() {
			let isShowingViz = !Shelves.areEmpty();

			if (isShowingViz) {
				VisualizationPane.showLoader();
				VisualizationPane.allowUpdating();
		   		VegaliteGenerator.generateSpecification(); // may block vis update
		    	VisualizationPane.tryUpdating();
			}
		}
	},
	initPressKeyBehaviour: function() {
		const self = this;

		$("body").keydown(function(event) {
			let pressedEnter = (event.keyCode === 13);
			let pressedUp = (event.keyCode === 38);
			let pressedDown = (event.keyCode === 40);

			let isPreviewingRecommendation = PreviewMode.isOn;
			let isVariableSettingMenuOpened = $("#variable-setting-menu").css("display") == "block";
			let isLookAheadSelectMetricMenuOpened = $("#look-ahead-select-metric-menu").css("display") == "block";

			if (pressedEnter) {
				if (!isVariableSettingMenuOpened && !isLookAheadSelectMetricMenuOpened && isPreviewingRecommendation)
					PreviewMode.confirm();
				if (isLookAheadSelectMetricMenuOpened && isPreviewingRecommendation)
					PreviewMode.end();
				if (isVariableSettingMenuOpened)
					$("#variable-setting-menu .footer .confirm.button").click();
				if (isLookAheadSelectMetricMenuOpened)
					$("#look-ahead-select-metric-menu .footer .confirm.button").click();
			}

			if (pressedUp) {
				if (isVariableSettingMenuOpened)
					$('#variable-setting-menu').css('display', 'none');
				if (isLookAheadSelectMetricMenuOpened)
					$('#look-ahead-select-metric-menu').css('display', 'none');

				LookAheadPane.selectPrevious();
				event.preventDefault();
			}

			if (pressedDown) {
				if (isVariableSettingMenuOpened)
					$('#variable-setting-menu').css('display', 'none');
				if (isLookAheadSelectMetricMenuOpened)
					$('#look-ahead-select-metric-menu').css('display', 'none');
				
				LookAheadPane.selectNext();
				event.preventDefault();
			}
		});
	},
	initClickBehaviour: function() {
		const self = this;

		$('body').on('click', function(event) {
			for (let currentEventID in ClickEventListener.clickEvents) {
				let currentTargetSelectors = ClickEventListener.clickEvents[currentEventID].targetSelectorArray;
				let currentNotApplicableElSelectors = ClickEventListener.clickEvents[currentEventID].notApplicableElSelectorArray;
				let isClickedElOneOfTargets = clickedElInSelectorArray(event.target, currentTargetSelectors);
				let isClickedElOneOfNotApplicableEl = clickedElInSelectorArray(event.target, currentNotApplicableElSelectors);

				if (!isClickedElOneOfNotApplicableEl && isClickedElOneOfTargets)
					ClickEventListener.clickEvents[currentEventID].onClick(event);
				if (!isClickedElOneOfNotApplicableEl && !isClickedElOneOfTargets)
					ClickEventListener.clickEvents[currentEventID].onNotClick(event);
			}
		});

		function clickedElInSelectorArray(clickedEl, selectorArray) {
			for (let i = 0; i < selectorArray.length; i++) {
				let currentSelector = selectorArray[i];
				let isClickedElInSelectorArray = $(clickedEl).closest(currentSelector).length > 0;

				if (isClickedElInSelectorArray)
					return true;
			}

			return false;
		}
	}
}