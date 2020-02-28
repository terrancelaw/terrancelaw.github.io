const Loader = {
	show: function() {
		$('body .loader')
			.css('display', 'block');
	},
	hide: function() {
		$('body .loader')
			.css('display', 'none');
	}
}