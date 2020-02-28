const ClickEvents = {
	clickDashboardObject: {
		targetSelectorArray: [ '#dashboard-view .object' ],
		notApplicableElSelectorArray: [],
		onClick: function(event) {},
		onNotClick: function(event) {
			$('#dashboard-view > .object').css('z-index', '');
			$('#dashboard-view > .object').css('border', '');
			$('#dashboard-view > .object > .button').css('display', '');
			$('#dashboard-view > .object > .buttons').css('display', '');
			$('#dashboard-view > .object > .ui-resizable-handle').css('visibility', '');
		}
	}
}