const Body = {
	init: function() {
		const self = this;

		self.installClickBehaviour();
	},

	// init

	installClickBehaviour: function() {
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
	}
}