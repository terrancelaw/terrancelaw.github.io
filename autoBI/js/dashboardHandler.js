const DashboardHandler = {
	nextID: -1,
	objectList: [], // { ID, objectType, x, y, width, height, content (spec or text), vegaView (chart only), fontSize (text only), isInitiallyOverflowY, isOverflowY, insightSpec }

	init: function() {
		const self = this;

		self.nextID = -1;
		self.objectList = [];
	},
	addToObjectList: function(data) {
		const self = this;

		self.objectList.push({
			ID: self.getNextID(), objectType: data.objectType,
			x: self.getXPos(), y: self.getYPos(), width: data.width, height: data.height,
			content: data.content, insightSpec: data.insightSpec,
			datasetSize: Database.data.length, dataID: data.dataID, fontSize: data.fontSize,
			isInitiallyOverflowY: data.isInitiallyOverflowY, isOverflowY: false
		});
	},
	removeFromObjectList: function(objectData) {
		const self = this;
		let objectIndex = self.objectList.indexOf(objectData);

		self.objectList.splice(objectIndex, 1);
	},
	getNextID: function() {
		const self = this;
		self.nextID++;
		return self.nextID;
	},
	getXPos: function() {
		const self = this;
		let objectList = self.objectList;
		let currentX = 100;
		let needToCheck = true;

		while (needToCheck) {
			needToCheck = false;

			for (let i = 0; i < objectList.length; i++)
				if (objectList[i].x == currentX) {
					currentX += 10;
					needToCheck = true;
				}
		}

		return currentX;
	},
	getYPos: function() {
		const self = this;
		let objectList = self.objectList;
		let currentY = 100;
		let needToCheck = true;

		while (needToCheck) {
			needToCheck = false;

			for (let i = 0; i < objectList.length; i++)
				if (objectList[i].y == currentY) {
					currentY += 10;
					needToCheck = true;
				}
		}

		return currentY;
	}
}