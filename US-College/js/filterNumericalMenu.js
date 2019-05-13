const FilterNumericalMenu = {
	init: function() {
		const self = this;
		let sliderSelector = '#filter-menu .menu .range.content #filter-menu-slider';
		let sliderParentSelector = '#filter-menu .menu .range.content';
		let sliderRangeEditorSelector = '#filter-menu-range-editor';
		let sliderID = 'filter-menu-slider';

		self.Slider = new Slider(sliderSelector, sliderParentSelector, sliderRangeEditorSelector, sliderID);
		self.Slider.changeTitle = changeTitle;
		self.Slider.initSlider();
		self.Slider.initHandleValues();
		self.Slider.initDensityPlot();
		self.Slider.installDragSlider();

		function changeTitle(attributeName) {
			$('#filter-menu .numerical-attribute-value-pair.menu .range.header')
				.html('Range (' + attributeName + ')');
		}
	},
	show: function(fadeIn = true) {
		if (fadeIn) {
			$('#filter-menu .numerical-attribute-value-pair.menu')
				.css('display', 'none').fadeTo(200, 1);
			$('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected')
				.removeClass('selected');
		}

		if (!fadeIn) {
			$('#filter-menu .numerical-attribute-value-pair.menu')
				.css('display', 'block');
			$('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected')
				.removeClass('selected');
		}
	},
	hide: function() {
		$('#filter-menu .numerical-attribute-value-pair.menu')
			.css('display', 'none');
	},
	isOpened: function() {
		let filterMenuIsOpened = $('#filter-menu').css('display') == 'block';
		let filterNumericalMenuIsOpened = $('#filter-menu .numerical-attribute-value-pair.menu').css('display') == 'block';

		return filterMenuIsOpened && filterNumericalMenuIsOpened;
	},
	AttributeNameList: {
		show: function(fadeIn = true) {
			if (fadeIn)
				$('#filter-menu .numerical-attribute-value-pair.menu .attribute.content')
					.css('display', 'none')
					.fadeTo(200, 1);

			if (!fadeIn)
				$('#filter-menu .numerical-attribute-value-pair.menu .attribute.content')
					.css('display', 'block');
		},
		display: function() {
			let attributeNameList = FilterMenuHelpers.getNonExcludedAttributeNames();
			let attributeNameListHTML = FilterMenuHelpers.getAttributeNameListHTML(attributeNameList);

			$('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container')
				.html(attributeNameListHTML);
		},
		selectPrevious: function() {
			const self = FilterNumericalMenu
			let $selectedAttributeName = $('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected');
			let $lastAttributeName = $('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name').last();
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;

			if (hasSelectedAttributeName)
				$selectedAttributeName.prev().click();
			if (!hasSelectedAttributeName)
				$lastAttributeName.click();
		},
		selectNext: function() {
			const self = FilterNumericalMenu
			let $selectedAttributeName = $('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected');
			let $firstAttributeName = $('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name').first();
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;

			if (hasSelectedAttributeName)
				$selectedAttributeName.next().click();
			if (!hasSelectedAttributeName)
				$firstAttributeName.click();
		},
		getSelection: function() {
			let $selectedAttributeName = $('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected');
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;
			let selectedAttributeName = hasSelectedAttributeName  ? $selectedAttributeName.attr('attribute-name') : null;

			return selectedAttributeName;
		},
		highlight: function(attributeName) {
			let currentAttributeSelector = '#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name[attribute-name="' + attributeName + '"]';
			let allAttributeSelector = '#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name';

			$(allAttributeSelector).removeClass('selected');
			$(currentAttributeSelector).addClass('selected');
		},
		scrollTo: function(scrollTopValue) {
			let attributeNameContainerSelector = '#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container';
			
			$(attributeNameContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		scrollToItem: function(attributeName) {
		    let attributeNameContainerSelector = '#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container';
			let currentAttributeSelector = '#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name[attribute-name="' + attributeName + '"]';
			let scrollTopValue = $(attributeNameContainerSelector).scrollTop() + $(currentAttributeSelector).position().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		scrollToCurrentSelection: function() {
			let $selectedAttributeName = $('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected');
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;
			let selectedAttributeName = hasSelectedAttributeName  ? $selectedAttributeName.attr('attribute-name') : null;

			if (selectedAttributeName === null)
				return;

		    let attributeNameContainerSelector = '#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container';
			let currentAttributeSelector = '#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name[attribute-name="' + selectedAttributeName + '"]';
			let scrollTopValue = $(attributeNameContainerSelector).scrollTop() + $(currentAttributeSelector).position().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		installClick: function() {
			$('#filter-menu .numerical-attribute-value-pair.menu .attribute.content .container .attribute-name')
				.click(clickAttributeName);

			function clickAttributeName() {
				let isCurrentAttrAlreadySelected = $(this).hasClass('selected');
				let selectedAttrName = $(this).attr('attribute-name');
				let selectedAttrIsCategorical = Database.allAttributeMetadata[selectedAttrName].type == 'categorical';
				let scrollTopValue = $(this.parentNode).scrollTop();

				if (isCurrentAttrAlreadySelected)
					return;

				if (!selectedAttrIsCategorical) { // numerical
					FilterBar.InputBox.focus();
					FilterBar.InputBox.displayMenuSelection(selectedAttrName);

					FilterNumericalMenu.AttributeNameList.highlight(selectedAttrName);

					FilterNumericalMenu.Slider.show(fadeIn = true);
					FilterNumericalMenu.Slider.updateMinMax(selectedAttrName);
					FilterNumericalMenu.Slider.updateStep(selectedAttrName);
					FilterNumericalMenu.Slider.updateValues();
					FilterNumericalMenu.Slider.updateHandles(rangeSpecified = false);
					FilterNumericalMenu.Slider.updateMinMaxText();
					FilterNumericalMenu.Slider.changeTitle(selectedAttrName);
					FilterNumericalMenu.Slider.clearDensityPlot();
					FilterNumericalMenu.Slider.generateDensityPlotData(selectedAttrName);
					FilterNumericalMenu.Slider.drawDensityPlot(selectedAttrName);
				}

				if (selectedAttrIsCategorical) { // categorical
					FilterNumericalMenu.hide();
					FilterAttributeOnlyMenu.hide();
					FilterCategoricalMenu.show(fadeIn = false);
					FilterBar.InputBox.focus();
					FilterBar.InputBox.displayMenuSelection(selectedAttrName);

					FilterCategoricalMenu.AttributeNameList.display();
					FilterCategoricalMenu.AttributeNameList.scrollTo(scrollTopValue);
					FilterCategoricalMenu.AttributeNameList.highlight(selectedAttrName);
					FilterCategoricalMenu.AttributeNameList.installClick();

					FilterCategoricalMenu.AttributeValueList.show(fadeIn = true);
					FilterCategoricalMenu.AttributeValueList.changeTitle(selectedAttrName);
					FilterCategoricalMenu.AttributeValueList.display(selectedAttrName);
					FilterCategoricalMenu.AttributeValueList.installClick();
				}
			}
		}
	},
	Slider: {}
}