const Helpers = {

	// overflow

	isXOverflow: function(el) {
		return el.scrollWidth > el.clientWidth;
	},
	isYOverflow: function(el) {
		return el.scrollHeight > el.clientHeight;
	}
}