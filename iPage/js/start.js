$(function() {
	Body.init();
	MenuBar.init();
	LoadDataWindow.init();

	d3.csv('csv/cars.csv').then(function(data) {
		Loader.show();

		setTimeout(function() {
			Database.load(data);
			Database.preprocess();
			Database.storeFileName('cars.csv');
			InsightHandler.run();
			Loader.hide();
		}, 100);
	});
});