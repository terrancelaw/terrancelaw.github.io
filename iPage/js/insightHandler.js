const InsightHandler = {
	visList: [], // { insightSpec, VLSpec, description, score }

	init: function() {
		const self = this;

		self.visList = [];
	},
	run: function() {
		DashboardView.hide();
		InsightView.show();
		$('#menu-bar > .button').removeClass('selected');
		$('#menu-bar > .quick-insights.button').addClass('selected');
		InsightHandler.init();

		for (let moduleName in InsightModules) {
			InsightModules[moduleName].search();
			InsightModules[moduleName].generateVis();
			InsightModules[moduleName].storeVis();
		}

		InsightHandler.rank();
		InsightView.updateHeader();
		InsightView.updateContent();
	},
	rank: function() {
		const self = this;

		self.visList.sort(function(x, y) {
			return d3.descending(x.score, y.score);
		});
	}
}