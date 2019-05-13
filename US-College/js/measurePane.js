let MeasurePane = {
	selectedMeasures: [],

	init: function() {
		const self = this;

		self.installClickSelectAllButtonBehaviour();
		self.installClickSelectNoneButtonBehaviour();
	},
	populate: function() {
		const self = this;
		let measurePaneContentHTML = '';
		let selectedMeasures = [];

		for (let attributeName in Database.allAttributeMetadata) {
			let attributeIsNumerical = (Database.allAttributeMetadata[attributeName].type == 'numerical');
			let currentAttributeHTML = '<div class="attribute selected">' + 
											'<span>' + attributeName + '</span>' +
									   '</div>';

			if (attributeIsNumerical) {
				measurePaneContentHTML += currentAttributeHTML;
				selectedMeasures.push(attributeName);
			}
		}

		// save
		self.selectedMeasures = selectedMeasures;
		$('#measure-pane .content')
			.html(measurePaneContentHTML);
	},
	initEvents: function() {
 		const self = this;

 		self.initHoverAttriuteBehaviour();
 		self.initClickAttributeBehaviour();
	},
	showLoader: function() {
		$('#measure-pane .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#measure-pane .loader')
			.css('display', '');
	},
	updateSelectedMeasures: function() {
		const self = this;
		let selectedMeasures = [];

		$('#measure-pane .content .attribute.selected').each(function() {
			let attributeName = $(this).text();
			selectedMeasures.push(attributeName);
		});

		self.selectedMeasures = selectedMeasures;
	},

	// init

	installClickSelectAllButtonBehaviour: function() {
		const self = this;

		$('#measure-pane .footer .select-none.button')
			.on('click', onClickSelectNoneButton);

		function onClickSelectNoneButton() {
			$('#measure-pane .content .attribute')
				.removeClass('selected');

			VisPane.showLoader();
			DimensionHightlightPane.showLoader();
			MeasureHighlightPane.showLoader();
			self.updateSelectedMeasures();

			setTimeout(function() {
				MeanOperator.compute();
				VisPane.update();
				DimensionHightlightPane.update();
				MeasureHighlightPane.update();

				VisPane.hideLoader();
				DimensionHightlightPane.hideLoader();
				MeasureHighlightPane.hideLoader();
			}, 50);
		}
	},
	installClickSelectNoneButtonBehaviour: function() {
		const self = this;
		
		$('#measure-pane .footer .select-all.button')
			.on('click', onClickSelectAllButton);

		function onClickSelectAllButton() {
			$('#measure-pane .content .attribute')
				.addClass('selected');

			VisPane.showLoader();
			DimensionHightlightPane.showLoader();
			MeasureHighlightPane.showLoader();
			self.updateSelectedMeasures();

			setTimeout(function() {
				MeanOperator.compute();
				VisPane.update();
				DimensionHightlightPane.update();
				MeasureHighlightPane.update();

				VisPane.hideLoader();
				DimensionHightlightPane.hideLoader();
				MeasureHighlightPane.hideLoader();
			}, 50);
		}
	},

	// initEvents

	initHoverAttriuteBehaviour: function() {
		$('#measure-pane .content .attribute span')
			.on('mouseenter', onMouseenterAttribute)
			.on('mouseleave', onMouseleaveAttribute);

		function onMouseenterAttribute() {
			let isAttributeNameOverflow = Helpers.isXOverflow(this);
			let tooltipText = $(this).html();

			if (isAttributeNameOverflow)
				Tooltip.show(this, 26, -9, tooltipText);
		}

		function onMouseleaveAttribute() {
			Tooltip.remove();
		}
	},
	initClickAttributeBehaviour: function() {
		const self = this;

		$('#measure-pane .content .attribute')
			.on('click', onClickAttribute);

		function onClickAttribute() {
			let attributeName = $(this).text();
			let currentAttributeIsSelected = $(this).hasClass('selected');

			if (currentAttributeIsSelected)
				$(this).removeClass('selected');
			if (!currentAttributeIsSelected)
				$(this).addClass('selected');

			VisPane.showLoader();
			DimensionHightlightPane.showLoader();
			MeasureHighlightPane.showLoader();
			self.updateSelectedMeasures();
			
			setTimeout(function() {
				MeanOperator.compute();
				VisPane.update();
				DimensionHightlightPane.update();
				MeasureHighlightPane.update();
				
				VisPane.hideLoader();
				DimensionHightlightPane.hideLoader();
				MeasureHighlightPane.hideLoader();
			}, 50);
		}
	}
}