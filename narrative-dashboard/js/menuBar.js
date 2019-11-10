const MenuBar = {
	init: function() {
		const self = this;

		self.initClickLoadButton();
	},
	setFileName: function() {
		let fileName = Database.fileName;

		$('#menu-bar > .file-name')
			.html(fileName);
	},

	// init

	initClickLoadButton: function() {
		$('#menu-bar > .load-data.button')
			.on('click', clickLoadDataButton);

		function clickLoadDataButton() {
			LoadDataWindow.show();
		}
	}
}