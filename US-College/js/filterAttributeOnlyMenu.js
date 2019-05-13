const FilterAttributeOnlyMenu = {
	show: function(fadeIn = true) {
		if (fadeIn) {
			$('#filter-menu .attribute-only.menu')
				.css('display', 'none').fadeTo(200, 1);
			$('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name.selected')
				.removeClass('selected');
		}

		if (!fadeIn) {
			$('#filter-menu .attribute-only.menu')
				.css('display', 'block');
			$('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name.selected')
				.removeClass('selected');
		}
	},
	hide: function() {
		$('#filter-menu .attribute-only.menu')
			.css('display', 'none');
	},
	isOpened: function() {
		let filterMenuIsOpened = $('#filter-menu').css('display') == 'block';
		let filterAttributeOnlyMenuIsOpened = $('#filter-menu .attribute-only.menu').css('display') == 'block';

		return filterMenuIsOpened && filterAttributeOnlyMenuIsOpened;
	},
	AttributeNameList: {
		show: function(fadeIn = true) {
			if (fadeIn)
				$('#filter-menu .attribute-only.menu .value.content')
					.css('display', 'none')
					.fadeTo(200, 1);

			if (!fadeIn)
				$('#filter-menu .attribute-only.menu .value.content')
					.css('display', 'block');
		},
		display: function() {
			let attributeNameList = FilterMenuHelpers.getNonExcludedAttributeNames();
			let attributeNameListHTML = FilterMenuHelpers.getAttributeNameListHTML(attributeNameList);

			$('#filter-menu .attribute-only.menu .attribute.content .container')
				.html(attributeNameListHTML);
		},
		selectPrevious: function() {
			const self = FilterAttributeOnlyMenu;
			let $selectedAttributeName = $('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name.selected');
			let $lastAttributeName = $('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name').last();
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;

			if (hasSelectedAttributeName)
				$selectedAttributeName.prev().click();
			if (!hasSelectedAttributeName)
				$lastAttributeName.click();
		},
		selectNext: function() {
			const self = FilterAttributeOnlyMenu;
			let $selectedAttributeName = $('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name.selected');
			let $firstAttributeName = $('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name').first();
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;

			if (hasSelectedAttributeName)
				$selectedAttributeName.next().click();
			if (!hasSelectedAttributeName)
				$firstAttributeName.click();
		},
		getSelection: function() {
			let $selectedAttributeName = $('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name.selected');
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;
			let selectedAttributeName = hasSelectedAttributeName  ? $selectedAttributeName.attr('attribute-name') : null;

			return selectedAttributeName;
		},
		scrollToCurrentSelection: function() {
			let $selectedAttributeName = $('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name.selected');
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;
			let selectedAttributeName = hasSelectedAttributeName  ? $selectedAttributeName.attr('attribute-name') : null;

			if (selectedAttributeName === null)
				return;

		    let attributeNameContainerSelector = '#filter-menu .attribute-only.menu .attribute.content .container';
			let currentAttributeSelector = '#filter-menu .attribute-only.menu .attribute.content .container .attribute-name[attribute-name="' + selectedAttributeName + '"]';
			let scrollTopValue = $(attributeNameContainerSelector).scrollTop() + $(currentAttributeSelector).position().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		installClick: function() {
			$('#filter-menu .attribute-only.menu .attribute.content .container .attribute-name')
				.click(clickAttributeName);

			function clickAttributeName() {
				let isCurrentAttrAlreadySelected = $(this).hasClass('selected');
				let selectedAttrName = $(this).attr('attribute-name');
				let selectedAttrIsCategorical = Database.allAttributeMetadata[selectedAttrName].type == 'categorical';
				let scrollTopValue = $(this.parentNode).scrollTop();

				if (isCurrentAttrAlreadySelected)
					return;

				if (!selectedAttrIsCategorical) { // numerical
					FilterCategoricalMenu.hide();
					FilterAttributeOnlyMenu.hide();
					FilterNumericalMenu.show(fadeIn = false);
					FilterBar.InputBox.focus();
					FilterBar.InputBox.displayMenuSelection(selectedAttrName);

					FilterNumericalMenu.AttributeNameList.display();
					FilterNumericalMenu.AttributeNameList.scrollTo(scrollTopValue);
					FilterNumericalMenu.AttributeNameList.highlight(selectedAttrName);
					FilterNumericalMenu.AttributeNameList.installClick();

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
	}
}