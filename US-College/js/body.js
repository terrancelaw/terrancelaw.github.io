const Body = {
	init: function() {
		const self = this;

		self.initClickBehaviour();
		self.initPressKeyBehaviour();
	},
	initClickBehaviour: function() {
		const self = this;

		$('body').on('click', function(event) {
			for (let currentEventID in ClickEvents) {
				let currentTargetSelectors = ClickEvents[currentEventID].targetSelectorArray;
				let currentNotApplicableElSelectors = ClickEvents[currentEventID].notApplicableElSelectorArray;
				let isClickedElOneOfTargets = clickedElInSelectorArray(event.target, currentTargetSelectors);
				let isClickedElOneOfNotApplicableEl = clickedElInSelectorArray(event.target, currentNotApplicableElSelectors);

				if (!isClickedElOneOfNotApplicableEl && isClickedElOneOfTargets)
					ClickEvents[currentEventID].onClick(event);
				if (!isClickedElOneOfNotApplicableEl && !isClickedElOneOfTargets)
					ClickEvents[currentEventID].onNotClick(event);
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
	},
	initPressKeyBehaviour: function() {
		const self = this;

		$("body").keydown(function(event) {
			let pressedEnter = (event.keyCode === 13);
			let pressedUp = (event.keyCode === 38);
			let pressedDown = (event.keyCode === 40);
			let isFilterMenuOpened = $("#filter-menu").css("display") == "block";

			if (pressedEnter && isFilterMenuOpened) {
				let capsuleAdded = FilterBar.Capsule.addFromMenuSelection();

				if (capsuleAdded) {
					DimensionPane.showLoader();
					VisPane.showLoader();
					DimensionHightlightPane.showLoader();
					MeasureHighlightPane.showLoader();
					FilterBar.Capsule.installClickRemoveBehaviour();
					FilterBar.InputBox.removeHighlight();
					FilterBar.InputBox.clear();
					FilterBar.InputBox.blur();
					FilterMenu.hide();

					setTimeout(function() {
						FilterHandler.filterData();
						FilterBar.updateRecordNumber();
						DimensionPane.populate(keepSelection = true);
						DimensionPane.initEvents();

						MeanOperator.compute();
						VisPane.update();
						DimensionHightlightPane.update();
						MeasureHighlightPane.update();

						DimensionPane.hideLoader();
						VisPane.hideLoader();
						DimensionHightlightPane.hideLoader();
						MeasureHighlightPane.hideLoader();
					}, 50);
				}
				
				if (!capsuleAdded) {
					FilterBar.InputBox.removeHighlight();
					FilterBar.InputBox.blur();
					FilterMenu.hide();
				}
			}

			if (pressedUp && isFilterMenuOpened)
				FilterMenu.selectPreviousItem();

			if (pressedDown && isFilterMenuOpened)
				FilterMenu.selectNextItem();
		});
	}
}