const FilterCategoricalMenu = {
	show: function(fadeIn = true) {
		if (fadeIn) {
			$('#filter-menu .categorical-attribute-value-pair.menu')
				.css('display', 'none').fadeTo(200, 1);
			$('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected')
				.removeClass('selected');
			$('#filter-menu .categorical-attribute-value-pair.menu .value.content .container .attribute-value.selected')
				.removeClass('selected');
		}

		if (!fadeIn) {
			$('#filter-menu .categorical-attribute-value-pair.menu')
				.css('display', 'block');
			$('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected')
				.removeClass('selected');
			$('#filter-menu .categorical-attribute-value-pair.menu .value.content .container .attribute-value.selected')
				.removeClass('selected');
		}
	},
	hide: function() {
		$('#filter-menu .categorical-attribute-value-pair.menu')
			.css('display', 'none');
	},
	isOpened: function() {
		let filterMenuIsOpened = $('#filter-menu').css('display') == 'block';
		let filterCategoricalMenuIsOpened = $('#filter-menu .categorical-attribute-value-pair.menu').css('display') == 'block';

		return filterMenuIsOpened && filterCategoricalMenuIsOpened;
	},
	AttributeNameList: {
		show: function(fadeIn = true) {
			if (fadeIn)
				$('#filter-menu .categorical-attribute-value-pair.menu .attribute.content')
					.css('display', 'none')
					.fadeTo(200, 1);

			if (!fadeIn)
				$('#filter-menu .categorical-attribute-value-pair.menu .attribute.content')
					.css('display', 'block');
		},
		display: function() {
			let attributeNameList = FilterMenuHelpers.getNonExcludedAttributeNames();
			let attributeNameListHTML = FilterMenuHelpers.getAttributeNameListHTML(attributeNameList);

			$('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container')
				.html(attributeNameListHTML);
		},
		selectPrevious: function() {
			const self = FilterCategoricalMenu;
			let $selectedAttributeName = $('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected');
			let $lastAttributeName = $('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name').last();
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;

			if (hasSelectedAttributeName)
				$selectedAttributeName.prev().click();
			if (!hasSelectedAttributeName)
				$lastAttributeName.click();
		},
		selectNext: function() {
			const self = FilterCategoricalMenu;
			let $selectedAttributeName = $('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected');
			let $firstAttributeName = $('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name').first();
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;

			if (hasSelectedAttributeName)
				$selectedAttributeName.next().click();
			if (!hasSelectedAttributeName)
				$firstAttributeName.click();
		},
		getSelection: function() {
			let $selectedAttributeName = $('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected');
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;
			let selectedAttributeName = hasSelectedAttributeName  ? $selectedAttributeName.attr('attribute-name') : null;

			return selectedAttributeName;
		},
		highlight: function(attributeName) {
			let currentAttributeSelector = '#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name[attribute-name="' + attributeName + '"]';
			let allAttributeSelector = '#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name';

			$(allAttributeSelector).removeClass('selected');
			$(currentAttributeSelector).addClass('selected');
		},
		scrollTo: function(scrollTopValue) {
			let attributeNameContainerSelector = '#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container';

			$(attributeNameContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		scrollToItem: function(attributeName) {
			let attributeNameContainerSelector = '#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container';
			let currentAttributeSelector = '#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name[attribute-name="' + attributeName + '"]';
			let scrollTopValue = $(attributeNameContainerSelector).scrollTop() + $(currentAttributeSelector).position().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		scrollToCurrentSelection: function() {
			let $selectedAttributeName = $('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected');
			let hasSelectedAttributeName = $selectedAttributeName.length > 0;
			let selectedAttributeName = hasSelectedAttributeName  ? $selectedAttributeName.attr('attribute-name') : null;

			if (selectedAttributeName === null)
				return;

		    let attributeNameContainerSelector = '#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container';
			let currentAttributeSelector = '#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name[attribute-name="' + selectedAttributeName + '"]';
			let scrollTopValue = $(attributeNameContainerSelector).scrollTop() + $(currentAttributeSelector).position().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		installClick: function() {
			$('#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name')
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
					FilterBar.InputBox.focus();
					FilterBar.InputBox.displayMenuSelection(selectedAttrName);

					FilterCategoricalMenu.AttributeNameList.highlight(selectedAttrName);

					FilterCategoricalMenu.AttributeValueList.show(fadeIn = true);
					FilterCategoricalMenu.AttributeValueList.changeTitle(selectedAttrName);
					FilterCategoricalMenu.AttributeValueList.display(selectedAttrName);
					FilterCategoricalMenu.AttributeValueList.installClick();
				}
			}
		}
	},
	AttributeValueList: {
		show: function(fadeIn = true) {
			if (fadeIn)
				$('#filter-menu .categorical-attribute-value-pair.menu .value.content')
					.css('display', 'none')
					.fadeTo(200, 1);

			if (!fadeIn)
				$('#filter-menu .categorical-attribute-value-pair.menu .value.content')
					.css('display', 'block');
		},
		display: function(attributeName = null) {
			const self = FilterCategoricalMenu;
			let attributeValueList = FilterHandler.getUniqueValues(attributeName);
			let attributeValueHTMLArray = FilterMenuHelpers.getAttributeValueHTMLArray(attributeValueList);

			$('#filter-menu .categorical-attribute-value-pair.menu .value.content .container')
				.html(attributeValueHTMLArray);
		},
		getSelection: function() {
			let $selectedAttributeValue = $('#filter-menu .categorical-attribute-value-pair.menu .value.content .container .attribute-value.selected');
			let hasSelectedAttributeValue = $selectedAttributeValue.length > 0;
			let selectedAttributeValue = hasSelectedAttributeValue  ? $selectedAttributeValue.attr('attribute-value') : null;

			return selectedAttributeValue;
		},
		changeTitle: function(attributeName) {
			$('#filter-menu .categorical-attribute-value-pair.menu .value.header')
				.html('Attribute Values (' + attributeName + ')');
		},
		highlight: function(attributeValue) {
			let currentAttributeValueSelector = '#filter-menu .categorical-attribute-value-pair.menu .value.content .container .attribute-value[attribute-value="' + attributeValue + '"]';
			let allAttributeValueSelector = '#filter-menu .categorical-attribute-value-pair.menu .value.content .container .attribute-value';

			$(allAttributeValueSelector).removeClass('selected');
			$(currentAttributeValueSelector).addClass('selected');
		},
		scrollTo: function(attributeValue) {
			let attributeValueContainerSelector = '#filter-menu .categorical-attribute-value-pair.menu .value.content .container';
			
			$(attributeValueContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		scrollToItem: function(attributeValue) {
			let attributeValueContainerSelector = '#filter-menu .categorical-attribute-value-pair.menu .value.content .container';
			let currentAttributeValueSelector = '#filter-menu .categorical-attribute-value-pair.menu .value.content .container .attribute-value[attribute-value="' + attributeValue + '"]';
			let scrollTopValue = $(attributeValueContainerSelector).scrollTop() + $(currentAttributeValueSelector).position().top;

		    $(attributeValueContainerSelector)
		    	.scrollTop(scrollTopValue);
		},
		installClick: function() {
			const self = FilterCategoricalMenu;

			$('#filter-menu .categorical-attribute-value-pair.menu .value.content .container .attribute-value')
				.on('click', clickAttributeValue);

			function clickAttributeValue() {
				let currentAttributeNameSelector = '#filter-menu .categorical-attribute-value-pair.menu .attribute.content .container .attribute-name.selected';
				let selectedAttrName = $(currentAttributeNameSelector).attr('attribute-name');
				let selectedAttrValue = $(this).attr('attribute-value');
				let attributeValueObject = { category: selectedAttrValue };

				FilterBar.InputBox.focus();
				FilterBar.InputBox.displayMenuSelection(selectedAttrName, attributeValueObject);
				self.AttributeValueList.highlight(selectedAttrValue);
			}
		}
	}
}