const ClickEvents = {
	clickHeaderAttribute: {
		targetSelectorArray: [
			'#map-view > .header > .attribute',
			'#trend-view > .view > .header > .attribute',
			'#drop-down-menu'
		],
		notApplicableElSelectorArray: [],
		onClick: function(event) {},
		onNotClick: function(event) {
			$('#map-view > .header > .attribute').removeClass('clicking');
			$('#trend-view > .view > .header > .attribute').removeClass('clicking');
			DropDownMenu.hide();
		}
	}
}