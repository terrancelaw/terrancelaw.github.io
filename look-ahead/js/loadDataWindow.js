const LoadDataWindow = {
	init: function() {
		const self = this;

		self.initSampleDataButton('cars.csv', 403);
		self.initSampleDataButton('superstore.csv', 9994);
		self.initSampleDataButton('county_set_1.csv', 15675);
		self.initSampleDataButton('county_set_2.csv', 15675);
		self.initSampleDataButton('colleges.csv', 17185);
		self.initClickBackgroundBehaviour();
		self.initClickUploadButtonBehaviour();
	},
	show: function() {
		$('#load-data-window')
			.css('display', 'block');
	},
	hide: function() {
		$('#load-data-window')
			.css('display', 'none');
	},

	// init

	initSampleDataButton: function(fileName, numberOfRows) {
		const self = this;

		$('#load-data-window .sample-data-content')
			.append('<div class="button" file-name="' + fileName + '">' + fileName + ' (' + numberOfRows + ' rows)</div>')
		$('#load-data-window .button').last()
			.on('click', clickSampleDataButton);

		function clickSampleDataButton() {
			let fileName = $(this).attr('file-name');
			let location = 'csv/' + fileName;

			// remove old
			self.hide();
			LookAheadPane.clear();
			VisualizationPane.clearChart();
			Shelves.emptyAll();
			Filters.emptyAll();
			ShowMe.setToDefault();
			DataColumn.showLoader();

			// process data
			d3.csv(location).then(function(data) {
				Database.load(data);
				Database.processMissingValues();
				Database.attributeTyping();
				Database.addYearAndMonthVariable();
				LookAheadDatabase.init();
				DataPane.updateFileName(fileName);

				DimensionMeasurePane.copyAttributesFromDatabase();
				DimensionMeasurePane.renderDimensionCapsules();
				DimensionMeasurePane.renderMeasureCapsules();
				DimensionMeasurePane.adjustHeight();
				DimensionMeasurePane.adjustAttributeNameWidth();

				DimensionMeasurePaneCapsules.installTooltips();
				DimensionMeasurePaneCapsules.installDragBehaviour();
				DimensionMeasurePaneCapsules.installClickButtonsBehaviour();

				DataColumn.hideLoader();
			});
		}
	},
	initClickBackgroundBehaviour: function() {
		const self = this;

		$('#load-data-window .background')
			.on('click', clickBackground);

		function clickBackground() {
			self.hide();
		}
	},
	initClickUploadButtonBehaviour: function() {
		let fileSelectorEl = $("#load-data-window #file-selector")[0];
		let reader = new FileReader();

		// file reader setting
		reader.onload = function(e) {
			let contents = e.target.result;

			// remove old capsules and chart, and show loader
			LookAheadPane.clear();
			VisualizationPane.clearChart();
			Shelves.emptyAll();
			Filters.emptyAll();
			ShowMe.setToDefault();
			DataColumn.showLoader();

			// data processing and create capsules
			setTimeout(function() {
				Database.loadFromText(contents);
				Database.processMissingValues();
				Database.attributeTyping(); // file name changed below
				Database.addYearAndMonthVariable();
				LookAheadDatabase.init();

				DimensionMeasurePane.copyAttributesFromDatabase();
				DimensionMeasurePane.renderDimensionCapsules();
				DimensionMeasurePane.renderMeasureCapsules();
				DimensionMeasurePane.adjustHeight();
				DimensionMeasurePane.adjustAttributeNameWidth();

				DimensionMeasurePaneCapsules.installTooltips();
				DimensionMeasurePaneCapsules.installDragBehaviour();
				DimensionMeasurePaneCapsules.installClickButtonsBehaviour();
				DataColumn.hideLoader();
			}, 10);
	  	};

	  	// highlight the label on click
	  	fileSelectorEl.onclick = function() {
			$('#load-data-window .load-data-content .load-button')
				.addClass("selected");
		}

		// remove label highlight on return focus to document
		document.body.onfocus = function() {
			$('#load-data-window .load-data-content .load-button')
				.removeClass("selected");
		}

		// when load button is clicked
		fileSelectorEl.onchange = function(e) {
			let fileName = e.target.value.split( '\\' ).pop();

			// trigger load event and change file name
			if (fileName !== "") {
				LoadDataWindow.hide();
				reader.readAsText(this.files[0]);
				DataPane.updateFileName(fileName);
			}
		}
	}
}