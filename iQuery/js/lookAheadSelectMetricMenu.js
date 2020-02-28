const LookAheadSelectMetricMenu = {
	init: function() {
		const self = this;

		self.installClickConfirmButtonBehaviour();
		self.installClickCancelButtonBehaviour();

		self.installRestoreButtonTooltip();
		self.installSelectAllButtonTooltip();
		self.installSelectNoneButtonTooltip();

		self.installClickRestoreButtonBehaviour();
		self.installClickSelectAllButtonBehaviour();
		self.installClickSelectNoneButtonBehaviour();
	},
	show: function(top, left) {
		const self = this;

		$('#look-ahead-pane .select-metrics.button')
			.addClass('selected');
		$('#look-ahead-pane .detail.button')
			.addClass('transparent');
		$('.ui-resizable-handle')
			.css('pointer-events', 'none');

		self.populateContent();
		self.displayBlock();
		self.adjustFooterHeight();
		self.moveTo(top, left);
	},
	hide: function() {
		$('#look-ahead-pane .select-metrics.button')
			.removeClass('selected');
		$('#look-ahead-pane .detail.button')
			.removeClass('transparent');
		$('#look-ahead-select-metric-menu')
			.css('display', '');
		$('.ui-resizable-handle')
			.css('pointer-events', '');
	},

	// footer buttons

	installClickConfirmButtonBehaviour: function() {
		const self = this;

		$('#look-ahead-select-metric-menu .footer .confirm.button')
			.on('click', onClickConfirmButton);

		function onClickConfirmButton() {
			let selectedKnowledgeBaseIDList = getSelectedKnowledgeBaseIDList();

			for (let currentKnowledgeBaseID in LookAheadKnowledgeBase) {
				let currentIDInSelectedList = selectedKnowledgeBaseIDList.indexOf(currentKnowledgeBaseID) != -1;

				if (currentIDInSelectedList)
					LookAheadKnowledgeBase[currentKnowledgeBaseID].active = true;
				if (!currentIDInSelectedList)
					LookAheadKnowledgeBase[currentKnowledgeBaseID].active = false;
			}

			LookAheadEventHandler.listenEvent(forceUpdate = true);
			self.hide();
		}

		function getSelectedKnowledgeBaseIDList() {
			let selectedKnowledgeBaseIDList = [];

			$('#look-ahead-select-metric-menu .quality-metric-menu .content .category').each(function() {
				let isCurrentCheckboxChecked = $(this).find('input[type="checkbox"]').is(':checked');
				let currentCheckboxValue = $(this).find('input[type="checkbox"]').val();

				if (isCurrentCheckboxChecked)
					selectedKnowledgeBaseIDList.push(currentCheckboxValue);
			});

			return selectedKnowledgeBaseIDList;
		}
	},
	installClickCancelButtonBehaviour: function() {
		const self = this;
		
		$('#look-ahead-select-metric-menu .footer .cancel.button')
			.on('click', onClickCancelButton);

		function onClickCancelButton() { self.hide(); }
	},
	installRestoreButtonTooltip: function() {
		$('#look-ahead-select-metric-menu .header .fa-undo')
			.on('mouseenter', onMouseEnterRestoreButton)
			.on('mouseleave', onMouseLeaveRestoreButton);

		function onMouseEnterRestoreButton() { Tooltip.show(this, -7, -9); }
		function onMouseLeaveRestoreButton() { Tooltip.remove(); }
	},
	installSelectAllButtonTooltip: function() {
		$('#look-ahead-select-metric-menu .header .fa-check-square')
			.on('mouseenter', onMouseEnterSelectAllButton)
			.on('mouseleave', onMouseLeaveSelectAllButton);

		function onMouseEnterSelectAllButton() { Tooltip.show(this, 10, -9); }
		function onMouseLeaveSelectAllButton() { Tooltip.remove(); }
	},
	installSelectNoneButtonTooltip: function() {
		$('#look-ahead-select-metric-menu .header .fa-square')
			.on('mouseenter', onMouseEnterSelectNoneButton)
			.on('mouseleave', onMouseLeaveSelectNoneButton);

		function onMouseEnterSelectNoneButton() { Tooltip.show(this, 27, -9); }
		function onMouseLeaveSelectNoneButton() { Tooltip.remove(); }
	},
	installClickRestoreButtonBehaviour: function() {
		$('#look-ahead-select-metric-menu .header .fa-undo')
			.on('click', clickRestoreButton);

		function clickRestoreButton() {
			$('#look-ahead-select-metric-menu .content .category').each(function() {
				$(this).find('input[type="checkbox"]').prop('checked', false);
			});

			$('#look-ahead-select-metric-menu .content .category:eq(0) input[type="checkbox"]').prop('checked', true);
			$('#look-ahead-select-metric-menu .content .category:eq(1) input[type="checkbox"]').prop('checked', true);
			$('#look-ahead-select-metric-menu .content .category:eq(2) input[type="checkbox"]').prop('checked', true);
		}
	},
	installClickSelectAllButtonBehaviour: function() {
		$('#look-ahead-select-metric-menu .header .fa-check-square')
			.on('click', clickSelectAllButton);

		function clickSelectAllButton() {
			$('#look-ahead-select-metric-menu .content .category').each(function() {
				$(this).find('input[type="checkbox"]').prop('checked', true);
			});
		}
	},
	installClickSelectNoneButtonBehaviour: function() {
		$('#look-ahead-select-metric-menu .header .fa-square')
			.on('click', clickSelectNoneButton);

		function clickSelectNoneButton() {
			$('#look-ahead-select-metric-menu .content .category').each(function() {
				$(this).find('input[type="checkbox"]').prop('checked', false);
			});
		}
	},

	// show

	populateContent: function() {
		let checkListHTML = '';

		for (let knowledgeBaseID in LookAheadKnowledgeBase) {
			let isCurrentQualityMetricActive = LookAheadKnowledgeBase[knowledgeBaseID].active;
			let currentQualityMetricNameHTML = '<span class="item-name">' + LookAheadKnowledgeBase[knowledgeBaseID].name + '</span>';
			let currentCheckBoxHTML = isCurrentQualityMetricActive 
									? '<input type="checkbox" value="' + knowledgeBaseID + '" checked>'
									: '<input type="checkbox" value="' + knowledgeBaseID + '">';

			checkListHTML += '<div class="category">' +
								'<label class="custom-checkbox">' +
									currentQualityMetricNameHTML +
									currentCheckBoxHTML +
									'<span class="checkmark"></span>' +
								'</label>' +
							 '</div>';
		}

		$('#look-ahead-select-metric-menu .quality-metric-menu .content')
			.html(checkListHTML);
	},
	displayBlock: function() {
		$('#look-ahead-select-metric-menu')
			.css('display', 'none')
			.fadeTo(150, 1)
	},
	adjustFooterHeight: function() {
		let leftPaneHeight = $('#look-ahead-select-metric-menu .left-pane').height();

		$('#look-ahead-select-metric-menu .right-pane')
			.css('height', leftPaneHeight);
	},
	moveTo: function(top, left) {
		$('#look-ahead-select-metric-menu')
			.css('top', top)
			.css('left', left);
	}
}