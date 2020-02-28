const LoadDataWindow = {
	init: function() {
		const self = this;

		self.installSampleDataButton('cars.csv', 403);
		self.installSampleDataButton('superstore.csv', 9994);
		self.installSampleDataButton('county_set_1.csv', 15675);
		self.installSampleDataButton('county_set_2.csv', 15675);
		self.installSampleDataButton('colleges.csv', 17185);
		self.installClickBackground();
		self.installClickUploadButton();
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
			let location = 'csv/' + fileName;

			LoadDataWindow.hide();

			d3.csv(location).then(function(data) {
				Loader.show();

				setTimeout(function() {
					Database.load(data);
					Database.preprocess();
					Database.storeFileName(fileName);
					InsightHandler.run();
					Loader.hide();
				}, 100);
			});
		}
	},
	installClickBackground: function() {
		$('#load-data-window .background')
			.on('click', clickBackground);

		function clickBackground() {
			LoadDataWindow.hide();
		}
	},
	installClickUploadButton: function() {
		let fileSelectorEl = $("#load-data-window #file-selector")[0];
		let reader = new FileReader();

		// file reader setting
		reader.onload = function(e) {
			let contents = e.target.result;

			Loader.show();

			setTimeout(function() {
				Database.loadFromText(contents);
				Database.preprocess();
				InsightHandler.run();
				Loader.hide();
			}, 100);
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
				Database.storeFileName(fileName);
				reader.readAsText(this.files[0]);
			}
		}
	}
}