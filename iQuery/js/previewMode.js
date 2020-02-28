const PreviewMode = {
	isOn: false,

	on: function() {
		const self = this;

		self.isOn = true;
	},
	off: function() {
		const self = this;

		self.isOn = false;
	},
	start: function(visSpec) {
		// store current state
		if (!PreviewMode.isOn) {
			PreviewMode.on();
			FilterShelf.saveState();
			Shelves.saveState();
			ShowMe.saveState();
		}

		// highlight in blue
		Shelves.preview(visSpec);
		FilterShelf.preview(visSpec);
		ShowMe.preview(visSpec);

		// draw chart (unlock is done in updateShowMe)
		VisualizationPane.showLoader();
		VisualizationPane.allowUpdating();
		VegaliteGenerator.generateSpecification(); // may block vis update
		VisualizationPane.tryUpdating();
	},
	confirm: function() {
		if (PreviewMode.isOn) {
			Shelves.endPreview();
			Filters.endPreview();
			ShowMe.endPreview();
			PreviewMode.off();
			DimensionMeasurePaneCapsules.clearAllSelection();
			LookAheadEventHandler.listenEvent();
		}
	},
	end: function() {
		if (PreviewMode.isOn) {
			// restore state
			PreviewMode.off();
			Shelves.restoreState();
			FilterShelf.restoreState();
			ShowMe.restoreState();

			// clear state
			Shelves.clearState();
			FilterShelf.clearState();
			ShowMe.clearState();

			// redraw chart using vega-lite
			ShowMe.tryUnlockDensityPlot();
			ShowMe.tryUnlockTrendLines();
			VisualizationPane.showLoader();
			VisualizationPane.allowUpdating();
			VegaliteGenerator.generateSpecification(); // may block vis update
			VisualizationPane.tryUpdating();
		}
	}
}