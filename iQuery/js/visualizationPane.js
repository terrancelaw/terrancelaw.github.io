const VisualizationPane = {
	canUpdate: false,

	init: function() {
		const self = this;

		self.installSwapAxesButtonBehaviour();
		self.installIncreaseSizeButtonBehaviour();
		self.installReduceSizeButtonBehaviour();
	},
	installSwapAxesButtonBehaviour: function() {
		$('#visualization-pane .footer .swap-axes.button')
			.on('click', onClickSwapAxesButton);

		function onClickSwapAxesButton() {
			let xAxisCapsuleData = Shelf.xAxis.getCapsuleData();
			let yAxisCapsuleData = Shelf.yAxis.getCapsuleData();

			// confirm if on preview
			PreviewMode.confirm();

			// swap x and y
			Shelf.xAxis.storeCapsuleData(yAxisCapsuleData);
			Shelf.yAxis.storeCapsuleData(xAxisCapsuleData);
			Shelf.xAxis.refreshCapsule();
			Shelf.yAxis.refreshCapsule();

			// draw chart using vega-lite
			VisualizationPane.showLoader();
			VisualizationPane.allowUpdating();
			VegaliteGenerator.generateSpecification(); // may block vis update
			VisualizationPane.tryUpdating();
		}
	},
	installIncreaseSizeButtonBehaviour: function() {
		$('#visualization-pane .footer .increase-size.button')
			.on('click', onClickIncreaseSizeButton);

		function onClickIncreaseSizeButton() {
			VisualizationPane.showLoader();
			VisualizationPane.allowUpdating();
			VegaliteGenerator.generateSpecification(resize = 'increase', stopApplyingConstraints = false); // may block vis update
			VisualizationPane.tryUpdating();
		}
	},
	installReduceSizeButtonBehaviour: function() {
		$('#visualization-pane .footer .decrease-size.button')
			.on('click', onClickReduceSizeButton);

		function onClickReduceSizeButton() {
			VisualizationPane.showLoader();
			VisualizationPane.allowUpdating();
			VegaliteGenerator.generateSpecification(resize = 'reduce', stopApplyingConstraints = false); // may block vis update
			VisualizationPane.tryUpdating();
		}
	},

	// chart update

	tryUpdating: function() {
		setTimeout(function() {
			if (VisualizationPane.canUpdateVis()) {
				VisualizationPane.draw();
				VisualizationPane.hideLoader();
			}
			if (!VisualizationPane.canUpdateVis())
				VisualizationPane.hideLoader();
		}, 10);
	},
	allowUpdating: function() {
		const self = this;

		self.canUpdate = true;
	},
	stopUpdating: function() {
		const self = this;

		self.canUpdate = false;
	},
	canUpdateVis: function() {
		const self = this;

		return self.canUpdate;
	},
	draw: function() {
		const self = this;
		let allShelvesAreEmpty = Shelves.areEmpty();
		let atLeaseOnShelfOccupied = !allShelvesAreEmpty;

		if (atLeaseOnShelfOccupied) {
			self.renderChart();
			self.adjustChartPositionBasedOnOverflow();
		}
		if (allShelvesAreEmpty)
			self.clearChart();
	},
	showLoader: function() {
		$('#vis-column .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#vis-column .loader')
			.css('display', '');
	},
	renderChart: function() {
		vegaEmbed('#visualization-pane .content .container', VegaliteGenerator.specification, { defaultStyle: true });
	},
	clearChart: function() {
		$('#visualization-pane .content .container').empty();
	},
	adjustChartPositionBasedOnOverflow: function() {
		let VisualizationPaneContentEl = $('#visualization-pane .content')[0];
		let isVisualizationPaneXOverflow = Helpers.isXOverflow(VisualizationPaneContentEl);
		let isVisualizationPaneYOverflow = Helpers.isYOverflow(VisualizationPaneContentEl);

		if (!isVisualizationPaneXOverflow && !isVisualizationPaneYOverflow)
			$('#visualization-pane .content .container')
				.removeClass('x-overflow')
				.removeClass('y-overflow');

		if (isVisualizationPaneXOverflow && !isVisualizationPaneYOverflow)
			$('#visualization-pane .content .container')
				.addClass('x-overflow')
				.removeClass('y-overflow');

		if (!isVisualizationPaneXOverflow && isVisualizationPaneYOverflow)
			$('#visualization-pane .content .container')
				.removeClass('x-overflow')
				.addClass('y-overflow');

		if (isVisualizationPaneXOverflow && isVisualizationPaneYOverflow)
			$('#visualization-pane .content .container')
				.addClass('x-overflow')
				.addClass('y-overflow');
	}
}