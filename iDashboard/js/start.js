$(function() {
	Body.init();
	MenuBar.init();
	LoadDataWindow.init();

	d3.csv('data/college.csv').then(function(data) {
		MapView.showLoader();
		LeftTrendView.showLoader();
		RightTrendView.showLoader();
		NarrativeView.showLoader();

		Database.storeFileName('college.csv');
		MenuBar.setFileName();

		setTimeout(function() {
			Database.load(data);
			Database.preprocess();

			MapView.draw(isInitialization=true);
			LeftTrendView.draw(isInitialization=true);
			MiddleTrendView.draw(isInitialization=true);
			RightTrendView.draw(isInitialization=true);
			NarrativeView.draw();

			MapView.hideLoader();
			LeftTrendView.hideLoader();
			MiddleTrendView.hideLoader();
			RightTrendView.hideLoader();
			NarrativeView.hideLoader();
		}, 50);
	});
});