const DropDownMenu = {
	focusedView: null,

	show: function(data) {
		const self = this;
		let attributeType = data.attributeType;
		let focusedView = data.focusedView;
		let top = data.top;
		let left = data.left;
		let isUpArrow = data.isUpArrow;

		self.focusedView = focusedView;
		self.updateContent(attributeType);
		self.changeArrow(isUpArrow);
		self.changePosition(top, left);
		self.installClickItemBehaviour();
		self.displayBlock();
	},
	hide: function() {
		$('#drop-down-menu')
			.removeClass('show');
	},

	// show

	updateContent: function(attributeType) {
		let listHTML = '';
		let list = (attributeType == 'quantitative') 
				 ? Database.getQuantitativeAttrList() 
				 : Database.getYearList().sort(function(a, b) { return b - a; });
		
		for (let i = 0; i < list.length; i++)
			listHTML += '<div class="item" value="' +  list[i] + '">' + list[i] + '</div>';

		$('#drop-down-menu > .container')
			.html(listHTML);
	},
	changeArrow: function(isUpArrow) {
		if (isUpArrow) $('#drop-down-menu').addClass('top-arrow').removeClass('bottom-arrow');
		if (!isUpArrow) $('#drop-down-menu').removeClass('top-arrow').addClass('bottom-arrow');
	},
	changePosition: function(top, left) {
		$('#drop-down-menu')
			.css('top', top)
			.css('left', left);
	},
	installClickItemBehaviour: function() {
		$('#drop-down-menu > .container > .item')
			.on('click', onClickItem);

		function onClickItem() {
			let value = $(this).attr('value');

			$('#map-view > .header > .attribute.clicking, ' +
			  '#trend-view > .view > .header > .attribute.clicking')
				.attr('value', value)
				.html(value);

			$('#map-view > .header > .attribute').removeClass('clicking');
			$('#trend-view > .view > .header > .attribute').removeClass('clicking');
			DropDownMenu.focusedView.showLoader();
			NarrativeView.showLoader();
			DropDownMenu.hide();

			setTimeout(function() {
				DropDownMenu.focusedView.draw(isInitialization=false);
				NarrativeView.draw();

				DropDownMenu.focusedView.hideLoader();
				NarrativeView.hideLoader();
			}, 50);
		}
	},
	displayBlock: function() {
		$('#drop-down-menu')
			.removeClass('show');

		setTimeout(function() {
			$('#drop-down-menu')
				.addClass('show');
		}, 100);
	}
}