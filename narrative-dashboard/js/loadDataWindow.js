const LoadDataWindow = {
	init: function() {
		const self = this;

		self.installSampleDataButton('college.csv', 27034);
		self.installSampleDataButton('county.csv', 21945);
		self.installClickBackground();
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

	installSampleDataButton: function(fileName, numberOfRows) {
		$('#load-data-window .sample-data-content')
			.append('<div class="button" file-name="' + fileName + '">' + fileName + ' (' + numberOfRows + ' rows)</div>')
		$('#load-data-window .button').last()
			.on('click', clickSampleDataButton);

		function clickSampleDataButton() {
			let fileName = $(this).attr('file-name');
			let location = 'data/' + fileName;

			LoadDataWindow.hide();

			d3.csv(location).then(function(data) {
				NarrativeView.showLoader();
				MapView.showLoader();
				LeftTrendView.showLoader();
				MiddleTrendView.showLoader();
				RightTrendView.showLoader();
		
				Database.storeFileName(fileName);
				MenuBar.setFileName();

				setTimeout(function() {
					Database.load(data);
					Database.preprocess();

					MapView.draw(isInitialization=true);
					LeftTrendView.draw(isInitialization=true);
					MiddleTrendView.draw(isInitialization=true);
					RightTrendView.draw(isInitialization=true);
					NarrativeView.draw();

					NarrativeView.hideLoader();
					MapView.hideLoader();
					LeftTrendView.hideLoader();
					MiddleTrendView.hideLoader();
					RightTrendView.hideLoader();
				}, 50);
			});
		}
	},
	installClickBackground: function() {
		$('#load-data-window .background')
			.on('click', clickBackground);

		function clickBackground() {
			LoadDataWindow.hide();
		}
	}
}