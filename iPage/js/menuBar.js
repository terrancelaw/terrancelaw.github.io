const MenuBar = {
	init: function() {
		const self = this;

		self.initClickLoadButton();
		self.initClickInsightButton();
		self.initClickDashboardButton();
		self.initClickAddTextButton();
		self.initClickExportButton();
	},
	showDashboardButtons: function() {
		$('#menu-bar .add-text.button').css('display', 'block');
		$('#menu-bar .export.button').css('display', 'block');
	},
	hideDashboardButtons: function() {
		$('#menu-bar .add-text.button').css('display', '');
		$('#menu-bar .export.button').css('display', '');
	},

	// init

	initClickLoadButton: function() {
		$('#menu-bar > .load-data.button')
			.on('click', clickLoadDataButton);

		function clickLoadDataButton() {
			LoadDataWindow.show();
		}
	},
	initClickInsightButton: function() {
		$('#menu-bar > .quick-insights.button')
			.on('click', clickInsightButton);

		function clickInsightButton() {
			$('#menu-bar > .button').removeClass('selected');
			$(this).addClass('selected');
			Loader.show();

			setTimeout(function() {
				DashboardView.hide();
				InsightView.show();
				MenuBar.hideDashboardButtons();
				Loader.hide();
			}, 100);
		}
	},
	initClickDashboardButton: function() {
		$('#menu-bar > .dashboard.button')
			.on('click', clickDashboardButton);

		function clickDashboardButton() {
			$('#menu-bar > .button').removeClass('selected');
			$(this).addClass('selected');
			Loader.show();

			setTimeout(function() {
				InsightView.hide();
				DashboardView.show();
				DashboardView.updateContent();
				MenuBar.showDashboardButtons();
				Loader.hide();
			}, 100);
		}
	},
	initClickAddTextButton: function() {
		$('#menu-bar > .add-text.button')
			.on('click', clickAddTextButton);

		function clickAddTextButton() {
			DashboardHandler.addToObjectList({
				objectType: 'text', width: 300, height: 40, 
				content: '', fontSize: 18, insightSpec: null, 
				isInitiallyOverflowY: null, dataID: null
			});
			DashboardView.updateContent();
		}
	},
	initClickExportButton: function() {
		$('#menu-bar > .export.button')
			.on('click', clickExportButton);

		function clickExportButton(event) {
			ExportHandler.export();
		}
	}
}