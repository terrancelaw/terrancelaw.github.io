var Tooltip = {
	show: function(hoveredEl, dx = 0, dy = 0, dataTooltip = null, showLeft = false) {
		const self = this;
		let hoveredElHasNoTooltipClass = $(hoveredEl).hasClass('no-tooltip');
		let hoveredElPosition = $(hoveredEl).offset();
		let hoveredElHeight = $(hoveredEl).height();
		let hoveredElWidth = $(hoveredEl).width();
		let tooltipText = (dataTooltip !== null) ? dataTooltip : $(hoveredEl).attr('data-tooltip');

		if (hoveredElHasNoTooltipClass)
			$('#tooltip')
				.removeClass('show');

		if (!hoveredElHasNoTooltipClass && !showLeft)
			$('#tooltip')
				.attr('data-tooltip', tooltipText)
				.css('top', hoveredElPosition.top + hoveredElHeight / 2 + dy)
				.css('left', hoveredElPosition.left + hoveredElWidth + 8 + dx)
				.addClass('show')
				.removeClass('left')
				.addClass('right');

		if (!hoveredElHasNoTooltipClass && showLeft)
			$('#tooltip')
				.attr('data-tooltip', tooltipText)
				.css('top', hoveredElPosition.top + hoveredElHeight / 2 + dy)
				.css('left', hoveredElPosition.left + 8 + dx)
				.addClass('show')
				.removeClass('right')
				.addClass('left');
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