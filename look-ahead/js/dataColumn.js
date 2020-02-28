const DataColumn = {
	showLoader: function() {
		$('#data-column .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#data-column .loader')
			.css('display', '');
	}
}