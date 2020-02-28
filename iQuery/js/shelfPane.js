const ShelfPane = {	
	init: function() {
		const self = this;

		self.installClearButtonBehaviour();
		self.allowResizing();
	},
	installClearButtonBehaviour: function() {
		$('#shelf-pane .clear-all.button')
			.on('click', clickClearButton);

		function clickClearButton() {
			Shelves.emptyAll();
			Filters.emptyAll();

			// redraw chart
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
			VisualizationPane.showLoader();
			VisualizationPane.allowUpdating();
			VegaliteGenerator.generateSpecification(); // may block vis update
			VisualizationPane.tryUpdating();

			// look ahead
			LookAheadEventHandler.listenEvent();
		}
	},
	allowResizing: function() {
		$('#shelf-pane')
			.resizable({
				handles: 'n',
				create: createResizeHandle,
				resize: resizing
			});

		function createResizeHandle(event, ui) {
			$('.ui-resizable-n').css('cursor','ns-resize');
		}

		function resizing(event, ui) {
			let currentShelfPaneHeight = $('#shelf-pane').height();
			let newLookAheadPaneHeight = 'calc(100% - ' + (currentShelfPaneHeight + 10) + 'px)';
			$('#shelf-pane').css('top', 0);
			$('#look-ahead-pane').css('height', newLookAheadPaneHeight);
		}
	},
	scrollToBottom: function() {
		let shelfPaneHeight = $('#shelf-pane .content')[0].scrollHeight;

		$('#shelf-pane .content')
			.scrollTop(shelfPaneHeight);
	}
}