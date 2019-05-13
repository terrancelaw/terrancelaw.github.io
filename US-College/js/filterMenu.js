const FilterMenu = {
	init: function() {
		const self = this;

		FilterNumericalMenu.init();
		self.hide(); // rendering numerical menu require no hiding
	},
	show: function(top, left) {
		$('#filter-menu')
			.css('display', 'block')
			.css('top', top)
			.css('left', left);
	},
	hide: function() {
		$('#filter-menu')
			.css('display', 'none');
	},
	selectPreviousItem: function() {
		if (FilterAttributeOnlyMenu.isOpened())
			FilterAttributeOnlyMenu.AttributeNameList.selectPrevious();
		else if (FilterNumericalMenu.isOpened())
			FilterNumericalMenu.AttributeNameList.selectPrevious();
		else if (FilterCategoricalMenu.isOpened())
			FilterCategoricalMenu.AttributeNameList.selectPrevious();

		if (FilterAttributeOnlyMenu.isOpened())
			FilterAttributeOnlyMenu.AttributeNameList.scrollToCurrentSelection();
		else if (FilterNumericalMenu.isOpened())
			FilterNumericalMenu.AttributeNameList.scrollToCurrentSelection();
		else if (FilterCategoricalMenu.isOpened())
			FilterCategoricalMenu.AttributeNameList.scrollToCurrentSelection();
	},
	selectNextItem: function() {
		if (FilterAttributeOnlyMenu.isOpened())
			FilterAttributeOnlyMenu.AttributeNameList.selectNext();
		else if (FilterNumericalMenu.isOpened())
			FilterNumericalMenu.AttributeNameList.selectNext();
		else if (FilterCategoricalMenu.isOpened())
			FilterCategoricalMenu.AttributeNameList.selectNext();

		if (FilterAttributeOnlyMenu.isOpened())
			FilterAttributeOnlyMenu.AttributeNameList.scrollToCurrentSelection();
		else if (FilterNumericalMenu.isOpened())
			FilterNumericalMenu.AttributeNameList.scrollToCurrentSelection();
		else if (FilterCategoricalMenu.isOpened())
			FilterCategoricalMenu.AttributeNameList.scrollToCurrentSelection();
	},
	getCurrentAttributeName: function() {
		if (FilterAttributeOnlyMenu.isOpened())
			return FilterAttributeOnlyMenu.AttributeNameList.getSelection();

		if (FilterNumericalMenu.isOpened())
			return FilterNumericalMenu.AttributeNameList.getSelection();

		if (FilterCategoricalMenu.isOpened())
			return FilterCategoricalMenu.AttributeNameList.getSelection();
	},
	getCurrentAttributeValueObject: function() {
		if (FilterAttributeOnlyMenu.isOpened())
			return null;

		if (FilterNumericalMenu.isOpened()) {
			let range = FilterNumericalMenu.Slider.getSelection();
			if (range !== null) return { lowerValue: range[0], upperValue: range[1] };
			if (range === null) return null;
		}

		if (FilterCategoricalMenu.isOpened()) {
			let category = FilterCategoricalMenu.AttributeValueList.getSelection();
			if (category !== null) return { category: category };
			if (category === null) return null;
		}
	},
	showBasedOnInput: function(input) {
		const self = this;
		[ sortedAttributeNames, mostSimilarAttribute, attributeValueObject ] = FilterMenuHelpers.extractInformationFromInput(input);
		let inputIsEmpty = (input == '');
		let mostSimilarAttributeIsNumerical = (Database.allAttributeMetadata[mostSimilarAttribute].type == 'numerical');

		if (!inputIsEmpty && mostSimilarAttributeIsNumerical) {
			let attributeList = sortedAttributeNames;
			let selectedAttribute = mostSimilarAttribute;
			let lowerValue = attributeValueObject.lowerValue;
			let upperValue = attributeValueObject.upperValue;

			FilterAttributeOnlyMenu.hide();
			FilterCategoricalMenu.hide();
			FilterNumericalMenu.show(fadeIn = false);
			
			FilterNumericalMenu.AttributeNameList.display();
			FilterNumericalMenu.AttributeNameList.scrollToItem(selectedAttribute);
			FilterNumericalMenu.AttributeNameList.highlight(selectedAttribute);
			FilterNumericalMenu.AttributeNameList.installClick();

			if (lowerValue === null || upperValue === null) {
				FilterNumericalMenu.Slider.updateMinMax(selectedAttribute);
				FilterNumericalMenu.Slider.updateStep(selectedAttribute);
				FilterNumericalMenu.Slider.updateValues();
				FilterNumericalMenu.Slider.updateHandles(rangeSpecified = false);
				FilterNumericalMenu.Slider.updateMinMaxText();
				FilterNumericalMenu.Slider.changeTitle(selectedAttribute);
				FilterNumericalMenu.Slider.clearDensityPlot();
				FilterNumericalMenu.Slider.generateDensityPlotData(selectedAttribute);
				FilterNumericalMenu.Slider.drawDensityPlot(selectedAttribute);
			}

			if (lowerValue !== null && upperValue !== null) {
				FilterNumericalMenu.Slider.updateMinMax(selectedAttribute);
				FilterNumericalMenu.Slider.updateStep(selectedAttribute);
				FilterNumericalMenu.Slider.updateValues([ lowerValue, upperValue ]);
				FilterNumericalMenu.Slider.updateHandles(rangeSpecified = true);
				FilterNumericalMenu.Slider.updateMinMaxText();
				FilterNumericalMenu.Slider.changeTitle(selectedAttribute);
				FilterNumericalMenu.Slider.clearDensityPlot();
				FilterNumericalMenu.Slider.generateDensityPlotData(selectedAttribute);
				FilterNumericalMenu.Slider.drawDensityPlot(selectedAttribute);
			}
		}

		if (!inputIsEmpty && !mostSimilarAttributeIsNumerical) {
			let attributeList = sortedAttributeNames;
			let selectedAttribute = mostSimilarAttribute;
			let categoryList = attributeValueObject.sortedCategories;
			let selectedCategory = attributeValueObject.mostSimilarCategory;

			FilterAttributeOnlyMenu.hide();
			FilterNumericalMenu.hide();
			FilterCategoricalMenu.show(fadeIn = false);
			
			FilterCategoricalMenu.AttributeNameList.display();
			FilterCategoricalMenu.AttributeNameList.scrollToItem(selectedAttribute);
			FilterCategoricalMenu.AttributeNameList.highlight(selectedAttribute);
			FilterCategoricalMenu.AttributeNameList.installClick();

			if (selectedCategory === null) {
				FilterCategoricalMenu.AttributeValueList.changeTitle(selectedAttribute);
				FilterCategoricalMenu.AttributeValueList.display(selectedAttribute);
				FilterCategoricalMenu.AttributeValueList.installClick();
			}

			if (selectedCategory !== null) {
				FilterCategoricalMenu.AttributeValueList.changeTitle(selectedAttribute);
				FilterCategoricalMenu.AttributeValueList.display(selectedAttribute);
				FilterCategoricalMenu.AttributeValueList.scrollToItem(selectedCategory);
				FilterCategoricalMenu.AttributeValueList.highlight(selectedCategory);
				FilterCategoricalMenu.AttributeValueList.installClick();
			}
		}

		if (inputIsEmpty) {
			FilterNumericalMenu.hide();
			FilterCategoricalMenu.hide();
			FilterAttributeOnlyMenu.show(fadeIn = false);

			FilterAttributeOnlyMenu.AttributeNameList.display();
			FilterAttributeOnlyMenu.AttributeNameList.installClick();
		}
	}
}