const ClickEvents = {
	clickFilterBar: {
		targetSelectorArray: [
			'#filter-bar .filter-input-container .input-box input'
		],
		notApplicableElSelectorArray: [
			'#filter-menu'
		],
		onClick: function(event) {
			let filterMenuIsOpened = $('#filter-menu').css('display') == 'block';
			let filterInputBoxEl = $('#filter-bar .filter-input-container .input-box input')[0];
			let filterInputBoxPosition = $(filterInputBoxEl).offset();
			let filterInputBoxTop = filterInputBoxPosition.top;
			let filterInputBoxLeft = filterInputBoxPosition.left;
			let filterInputBoxHeight = $(filterInputBoxEl).height();

			let filterMenuTop = filterInputBoxTop + filterInputBoxHeight + 8;
			let filterMenuLeft = filterInputBoxLeft - 8;
			let currentInput = $('#filter-bar .filter-input-container .input-box input').val();

			if (filterMenuIsOpened)
				return;

			FilterBar.InputBox.highlight();
			FilterMenu.show(filterMenuTop, filterMenuLeft);
			FilterMenu.showBasedOnInput(currentInput);
		},
		onNotClick: function(event) {
			FilterBar.InputBox.removeHighlight();
			FilterMenu.hide();
		}
	}
}