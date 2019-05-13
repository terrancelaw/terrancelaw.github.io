const FilterBar = {
	init: function() {
		const self = this;

		self.InputBox.init();
	},
	getFilters: function() {
		let filters = [];

		$('#filter-bar .filter-capsule-container .capsule').each(function() {
			let currentData = $(this).data();
			filters.push(currentData);
		});

		return filters;
	},
	updateRecordNumber: function() {
		let currentNumberOfRecords = FilterHandler.filteredData.length;

		$('#filter-bar .filter-capsule-container .record-number')
			.html('(' + currentNumberOfRecords + ' records)');
	},
	Capsule: {
		add: function(attributeName, attributeValueObject) {
			const self = FilterBar;
			let filterText = FilterMenuHelpers.generateRule(attributeName, attributeValueObject);
			let capsuleHTML = '<span class="capsule">' +
								'<span class="filter-text">' + filterText + '</span>' +
								'<span class="fa fa-times"></span>' +
							  '</span>';

			$('#filter-bar .filter-capsule-container')
				.append(capsuleHTML);
			$('#filter-bar .filter-capsule-container .capsule:last-child')
				.data({
					attributeName: attributeName,
					attributeValueObject: attributeValueObject
				});
		},
		addFromMenuSelection: function() {
			const self = FilterBar;
			let attributeName = FilterMenu.getCurrentAttributeName();
			let attributeValueObject = FilterMenu.getCurrentAttributeValueObject();
			let shouldNotAddCapsule = (attributeValueObject === null);
			let filterText = FilterMenuHelpers.generateRule(attributeName, attributeValueObject);
			let capsuleHTML = '<span class="capsule">' +
								'<span class="filter-text">' + filterText + '</span>' +
								'<span class="fa fa-times"></span>' +
							  '</span>';

			if (shouldNotAddCapsule)
				return false;
			
			$('#filter-bar .filter-capsule-container')
				.append(capsuleHTML);
			$('#filter-bar .filter-capsule-container .capsule:last-child')
				.data({
					attributeName: attributeName,
					attributeValueObject: attributeValueObject
				});

			return true;
		},
		installClickRemoveBehaviour: function() {
			$('#filter-bar .filter-capsule-container .capsule:last-child .fa-times')
				.on('click', onClickRemoveButton);

			function onClickRemoveButton() {
				DimensionPane.showLoader();
				VisPane.showLoader();
				DimensionHightlightPane.showLoader();
				MeasureHighlightPane.showLoader();
				$(this.parentNode).remove();

				setTimeout(function() {
					FilterHandler.filterData();
					FilterBar.updateRecordNumber();
					DimensionPane.populate(keepSelection = true);
					DimensionPane.initEvents();

					MeanOperator.compute();
					VisPane.update();
					DimensionHightlightPane.update();
					MeasureHighlightPane.update();
					
					DimensionPane.hideLoader();
					VisPane.hideLoader();
					DimensionHightlightPane.hideLoader();
					MeasureHighlightPane.hideLoader();
				}, 50);
			}
		}
	},
	InputBox: {
		init: function() {
			const self = FilterBar;

			self.InputBox.installInputBehaviour();
		},
		clear: function() {
			$('#filter-bar .filter-input-container .input-box input')
				.val('');
		},
		installInputBehaviour: function() {
			$('#filter-bar .filter-input-container .input-box input')
				.on('input', keyupInputBox); // input can detect long press

			function keyupInputBox() {
				let currentInput = $(this).val();

				FilterMenu.showBasedOnInput(currentInput);
			}
		},
		focus: function() {
			$('#filter-bar .filter-input-container .input-box .box')
				.focus();
		},
		blur: function() {
			$('#filter-bar .filter-input-container .input-box input')
				.blur();
		},
		highlight: function() {
			$('#filter-bar .filter-input-container .input-box .box')
				.css('border', 'solid #aef9c7 1px');
		},
		removeHighlight: function() {
			$('#filter-bar .filter-input-container .input-box .box')
				.css('border', '');
		},
		displayMenuSelection: function(attributeName, attributeValueObject = null) {
			let systemGeneratedInput = FilterMenuHelpers.generateRule(attributeName, attributeValueObject);

			$('#filter-bar .filter-input-container .input-box input')
				.val(systemGeneratedInput);
		}
	}
}