let DataPane = {
	init: function() {
		const self = this;

		self.initLoadCSVButtonBehaviour();
	},
	initLoadCSVButtonBehaviour: function() {
		$('#data-pane .content .load-button')
			.on('click', clickLoadCSVButton);

		function clickLoadCSVButton() {
			LoadDataWindow.show();
		}
	},
	updateFileName: function(fileName) {
		$('#data-pane .content .file-name')
			.html(fileName);
	}
}