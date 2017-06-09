var DragTagHandler = { // call on drag tag
	handleDragStart: function(groupKey, groupName) { // pass in groupKey and groupName for creating tag
		var mouseXRelativeToPage = event.clientX;
		var mouseYRelativeToPage = event.clientY;

		// handle states
		OOCView.handleStateTransitionOnDragstart();
		ChangeGroupMenu.handleStateTransitionOnDragstart();
		ListView.handleStateTransitionOnDragstart(mouseXRelativeToPage, mouseYRelativeToPage, groupKey, groupName);
	},
	handleDrag: function() {
		var mouseXRelativeToPage = event.clientX;
		var mouseYRelativeToPage = event.clientY;
		var groupKey = $("#draggable-tag").attr("group-key");
		var groupName = $("#draggable-tag").attr("group-name");

		// handle states
		OOCView.handleStateTransitionOnDrag(mouseXRelativeToPage, mouseYRelativeToPage, groupKey, groupName);
		ChangeGroupMenu.handleStateTransitionOnDrag(mouseXRelativeToPage, mouseYRelativeToPage);
		ListView.handleStateTransitionOnDrag(mouseXRelativeToPage, mouseYRelativeToPage);
	},
	handleDragEnd: function() {
		var mouseXRelativeToPage = event.clientX;
		var mouseYRelativeToPage = event.clientY;
		var groupKey = $("#draggable-tag").attr("group-key");
		var groupName = $("#draggable-tag").attr("group-name");

		// handle states
		OOCView.handleStateTransitionOnDragEnd(mouseXRelativeToPage, mouseYRelativeToPage, groupKey, groupName);
		ChangeGroupMenu.handleStateTransitionOnDragEnd(mouseXRelativeToPage, mouseYRelativeToPage, groupKey, groupName);
		ListView.handleStateTransitionOnDragEnd(mouseXRelativeToPage, mouseYRelativeToPage);
	}
}