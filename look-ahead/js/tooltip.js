var Tooltip = {
	show: function(hoveredEl, dx = 0, dy = 0, dataTooltip = null) {
		const self = this;
		let hoveredElHasNoTooltipClass = $(hoveredEl).hasClass('no-tooltip');
		let hoveredElPosition = $(hoveredEl).offset();
		let hoveredElHeight = $(hoveredEl).height();
		let hoveredElWidth = $(hoveredEl).width();
		let tooltipText = (dataTooltip !== null) ? dataTooltip : $(hoveredEl).attr('data-tooltip');

		if (hoveredElHasNoTooltipClass)
			$('#tooltip')
				.removeClass('show');

		if (!hoveredElHasNoTooltipClass)
			$('#tooltip')
				.attr('data-tooltip', tooltipText)
				.css('top', hoveredElPosition.top + hoveredElHeight / 2 + dy)
				.css('left', hoveredElPosition.left + hoveredElWidth + 8 + dx)
				.addClass('show')
				.addClass('right');
	},
	refresh: function(dataTooltip = null) {
		let tooltipText = (dataTooltip !== null) ? dataTooltip : $(hoveredEl).attr('data-tooltip');

		$('#tooltip')
			.removeClass('show');

		setTimeout(function() {
			$('#tooltip')
				.attr('data-tooltip', tooltipText)
				.addClass('show');
		}, 200)
	},
	remove: function() {
		$('#tooltip')
			.removeClass('show');
	}
}