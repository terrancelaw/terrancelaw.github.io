var ConceptMapView = {
	margin: { top: 10, left: 10, bottom: 10, right: 10 },
	width: null,
	height: null,

	radius: { normal: 20, small: 10 },

	links: [],
	nodes: [],

	linkList: [], // for keeping tracking of what BETWEEN group relatioship were added
	adhocGroupList: [], // format: { root, children }, for keeping tracking of what WITHIN group relatioship were added

	svg: null,

	init: function() {
		var self = this;

		self.svg = d3.select("#concept-map-view svg")
			.append("g")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		self.width = rightContentWidth - self.margin.left - self.margin.right;
		self.height = conceptMapViewHeight - self.margin.top - self.margin.bottom;

		self.drawCloseButton();
		self.createForce();
	},
	drawCloseButton: function() {
		var self = this;

		self.svg.append("text")
			.attr("class", "close-btn")
			.attr("x", self.width)
			.attr("y", 0)
			.style("text-anchor", "end")
			.style("alignment-baseline", "hanging")
			.style("font-family", "FontAwesome")
			.style("font-size", "10px")
			.style("cursor", "pointer")
			.text("\uf00d")
			.on("click", clickRemoveMenuButton);

		function clickRemoveMenuButton() {
			self.svg.selectAll("*:not(.close-btn)").remove();
		}
	},
	createForce: function() {
		var self = this;

		self.force = d3.layout.force()
			.nodes(self.nodes)
			.links(self.links)
			.size([self.width, self.height])
			.linkDistance(function(d) {
				if (d.show)
					return 140;
				if (!d.show)
					return 20;
			})
			.linkStrength(0.9)
			.charge(function(d) {
				if (d.show && d.small || !d.show)
					return 0;
				if (d.show && !d.small)
					return -500;
			})
			.gravity(0.1)
			.on("tick", tick);

		function tick() {
			// collision detection
			var q = d3.geom.quadtree(self.nodes);
  			self.nodes.forEach(function(node) {
  				q.visit(collide(node));
  			});

			// updating the convex hull
			self.svg.selectAll(".convex-hull")
				.attr("d", function(d) {
					var hullData = [];
					for (var i = 0; i < d.children.length; i++)
						hullData.push([ d.children[i].x, d.children[i].y ]);

					// need more than two points for drawing hull, add fake points if there are only two nodes
					if (hullData.length == 2) {
				        var dx = (hullData[1][0] - hullData[0][0]) * 0.00001;
				        var dy = (hullData[1][1] - hullData[0][1]) * 0.00001;
				        var mx = (hullData[0][0] + hullData[1][0]) * 0.5;
				        var my = (hullData[0][1] + hullData[1][1]) * 0.5;

				        hullData.push([mx + dy, my - dx]);
				        hullData.push([mx - dy, my + dx]);
				    }

					var hullPathString = "M" + d3.geom.hull(hullData).join("L") + "Z";
					return hullPathString;
				});

			// updating the nodes and text
			self.svg.selectAll(".node-group")
				.attr("transform", function(d) {
					return "translate(" + d.x + ", " + d.y + ")";
				});

			// updating the links and text
			self.svg.selectAll(".link-group")
				.each(function(d) {
					// text and rect
					var xDiff = d.target.x - d.source.x;
					var yDiff = d.target.y - d.source.y;
					var rotationAngle = Math.atan(yDiff / xDiff) / Math.PI * 180;
					var linkCentreX = d.source.x + xDiff / 2;
					var linkCentreY = d.source.y + yDiff / 2;
					var rectWidth = parseFloat(d3.select(this).select("rect").attr("width"));
					var rectHeight = parseFloat(d3.select(this).select("rect").attr("height"));

					var translateRectCentreToOrigin = "translate(" + (-rectWidth / 2) + "," + (-rectHeight / 2) + ")";
					var rotate = "rotate(" + rotationAngle + ")";
					var translateCentreToLinkCentre = "translate(" + linkCentreX + "," + linkCentreY + ")";

					d3.select(this).select("text")
						.attr("transform", translateCentreToLinkCentre + " " + rotate);
					d3.select(this).select("rect")
						.attr("transform", translateCentreToLinkCentre + " " + rotate + " " + translateRectCentreToOrigin);

					// path
					var sourceRadius = (!d.source.show) ? self.radius.normal + 10 : self.radius.normal; // create larger radius for adhoc groups
					var targetRadius = (!d.target.show) ? self.radius.normal + 10 : self.radius.normal;
					var linkLength = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

					var unitVector = { x: (d.source.x - d.target.x) / linkLength, y: (d.source.y - d.target.y) / linkLength };
					var startingPoint = { x: d.source.x - (sourceRadius + 5) * unitVector.x, y: d.source.y - (sourceRadius + 5) * unitVector.y };
					var endingPoint = { x: d.target.x + (targetRadius + 5) * unitVector.x, y: d.target.y + (targetRadius + 5) * unitVector.y };

					d3.select(this).select("path")
						.attr("d", "M" + startingPoint.x + "," + startingPoint.y + " L" + endingPoint.x + "," + endingPoint.y)
				});
		}
		function collide(node) {
			var r = self.getNodeRadius(node) + 16;
		    var nx1 = node.x - r, nx2 = node.x + r, ny1 = node.y - r, ny2 = node.y + r;

			return function(quad, x1, y1, x2, y2) {
				if (quad.point && (quad.point !== node)) {
					var x = node.x - quad.point.x, y = node.y - quad.point.y, l = Math.sqrt(x * x + y * y);
					var r = self.getNodeRadius(node) + self.getNodeRadius(quad.point);

					if (l < r) {
			      		l = (l - r) / l * .5;
			        	node.x -= x *= l;
			        	node.y -= y *= l;
			        	quad.point.x += x;
			        	quad.point.y += y;
			      	}
			    }

			    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			};
		}
	},
	update: function(report) {
		var self = this;
		var nodes = {};

		for (var i = 0; i < OOCView.shelfList.length; i++) {
			var currentShelf = OOCView.shelfList[i];

			// new adhoc group (process the nodes)
			if (OOCView.shelf[currentShelf].attr("adhoc-group-index") == null && OOCView.groupsOnShelves[currentShelf].length == 2)
				self.newAdhocGroupUpdate(nodes, currentShelf);
			
			// old adhoc group (process the nodes)
			else if (OOCView.shelf[currentShelf].attr("adhoc-group-index") != null)
				self.oldAdhocGroupUpdate(nodes, currentShelf);
			
			// not adhoc group (process the nodes)
			else if (OOCView.shelf[currentShelf].attr("adhoc-group-index") == null && OOCView.groupsOnShelves[currentShelf].length == 1)
				self.nonAdhocGroupUpdate(nodes, currentShelf);
		}

		self.createLinkBetweenShelves(nodes, report); // use the nodes
		self.updateNetwork();
	},
	newAdhocGroupUpdate: function(nodes, currentShelf) {
		var self = this;

		// 1. assign index to the adhoc group
		var adhocGroupIndex = self.adhocGroupList.length;
		var adhocGroupName = "AdhocGroup" + adhocGroupIndex;

		OOCView.shelf[currentShelf]
			.attr("adhoc-group-index", adhocGroupIndex);

		// 2. create adhoc group node
		var newAdhocGroupRootNode = self.createNewNode(adhocGroupName, false, false);
		nodes[currentShelf] = newAdhocGroupRootNode;
		self.nodes.push(newAdhocGroupRootNode);

		// 3. create children nodes
		var childrenNodeList = [];
		for (var j = 0; j < OOCView.groupsOnShelves[currentShelf].length; j++) {
			var groupKey = OOCView.groupsOnShelves[currentShelf][j].groupKey;
			var groupName = OOCView.groupsOnShelves[currentShelf][j].groupName;
			var nodeID = adhocGroupName + ":" + groupKey + ":" + groupName;

			var newChildrenNode = self.createNewNode(nodeID, true, true);
			self.nodes.push(newChildrenNode);
			childrenNodeList.push(newChildrenNode);
		}

		// 4. store the adhoc group
		var adhocGroup = {
			root: newAdhocGroupRootNode,
			children: childrenNodeList
		}
		self.adhocGroupList.push(adhocGroup);

		// 5. create link for the root and children
		for (var j = 0; j < childrenNodeList.length; j++) {
			var newWithinGroupLink = self.createNewLink(newAdhocGroupRootNode, childrenNodeList[j], false, "");
			self.links.push(newWithinGroupLink);
		}
	},
	oldAdhocGroupUpdate: function(nodes, currentShelf) {
		var self = this;

		// 1. retrieve adhoc group index
		var adhocGroupIndex = OOCView.shelf[currentShelf].attr("adhoc-group-index");
		var adhocGroupName = "AdhocGroup" + adhocGroupIndex;

		// 2. retrieve adhoc group root node
		var adhocGroup = self.adhocGroupList[adhocGroupIndex];
		nodes[currentShelf] = adhocGroup.root;

		// 3. store new child to both adhoc group and node list (TODO: remove nodes which do not exist)
		var newChildrenNodeList = [];
		for (var j = 0; j < OOCView.groupsOnShelves[currentShelf].length; j++) {
			var currentGroupKey = OOCView.groupsOnShelves[currentShelf][j].groupKey;
			var currentGroupName = OOCView.groupsOnShelves[currentShelf][j].groupName;
			var nodeID = adhocGroupName + ":" + currentGroupKey + ":" + currentGroupName;

			var allIDInAdhocGroup = [];
			for (var k = 0; k < adhocGroup.children.length; k++)
				allIDInAdhocGroup.push(adhocGroup.children[k].id);

			if ($.inArray(nodeID, allIDInAdhocGroup) == -1) {
				var newChildrenNode = self.createNewNode(nodeID, true, true);
				self.nodes.push(newChildrenNode);
				adhocGroup.children.push(newChildrenNode);
				newChildrenNodeList.push(newChildrenNode);
			}
		}

		// 4. create a new link for the children
		for (var j = 0; j < newChildrenNodeList.length; j++) {
			var newWithinGroupLink = self.createNewLink(adhocGroup.root, newChildrenNode, false, "");
			self.links.push(newWithinGroupLink);
		}
	},
	nonAdhocGroupUpdate: function(nodes, currentShelf) {
		var self = this;

		// 1. create id
		var currentGroupKey = OOCView.groupsOnShelves[currentShelf][0].groupKey;
		var currentGroupName = OOCView.groupsOnShelves[currentShelf][0].groupName;
		var currentNodeID = currentGroupKey + ":" + currentGroupName;
		
		// 2. check if the node exists. if yes, store it
		var found = false;
		for (var j = 0; j < self.nodes.length; j++) {
			if (self.nodes[j].id == currentNodeID) {
				nodes[currentShelf] = self.nodes[j];
				found = true;
				break;
			}
		}

		// 3. if not, create and store it
		if (!found) {
			var newNode = self.createNewNode(currentNodeID, true, false);
			nodes[currentShelf] = newNode;
			self.nodes.push(newNode);
		}
	},
	createLinkBetweenShelves: function(nodes, report) {
		var self = this;

		// 1. check if the link already exists
		var found = false;
		for (var i = 0; i < self.linkList.length; i++) {
			if (nodes["top"].id == self.linkList[i][0].id && nodes["bottom"].id == self.linkList[i][1].id)
				found = true;
		}

		// 2. if the link does not exist, create and store the link to linkList and self.links
		if (!found) {
			var newLink = self.createNewLink(nodes["top"], nodes["bottom"], true, report.result[0].featureName);
			self.links.push(newLink);
			self.linkList.push([nodes["top"], nodes["bottom"]]);
		}
	},
	createNewNode: function(id, show, small) {
		var self = this;

		var newNode = {
			id: id,
			x: self.width / 2 + Math.floor((Math.random() * 20) - 10),
			y: self.height / 2 + Math.floor((Math.random() * 20) - 10),
			show: show,
			small: small
		};

		return newNode;
	},
	createNewLink: function(source, target, show, featureName) {
		var self = this;

		var newLink = {
			source: source,
			target: target,
			show: show,
			featureName: featureName,
		};

		return newLink;
	},
	updateNetwork: function() {
		var self = this;

		self.updateConvexHull();
		self.updateLinks();
		self.updateNodes();
		self.force.start();
	},
	updateConvexHull: function() {
		var self = this;

		var hull = self.svg.selectAll(".convex-hull")
			.data(self.adhocGroupList);

		// enter
		var hullEnter = hull.enter()
			.append("path")
			.attr("class", "convex-hull")
			.style("stroke", "steelblue")
			.style("fill", "steelblue")
			.style("opacity", 0.2)
			.style("stroke-linejoin", "round")
			.style("stroke-width", 35);

		// update
		self.svg.selectAll(".convex-hull")
			.attr("class", function(d, i) {
				return "convex-hull adhoc-group" + (i + 1);
			});

		// exit
		hull.exit().remove();
	},
	updateLinks: function() {
		var self = this;

		var linkToBeDrawn = [];
		for (var i = 0; i < self.links.length; i++) {
			if (self.links[i].show)
				linkToBeDrawn.push(self.links[i]);
		}

		// enter
		var link = self.svg.selectAll(".link-group")
			.data(linkToBeDrawn);

		var linkEnter = link.enter()
			.append("g")
			.attr("class", "link-group")
			.attr("cursor", "pointer")
			.on("mouseenter", mouseenterLink)
			.on("mouseleave", mouseleaveLink);

		linkEnter.append("path")
			.style("stroke", "gray")
			.style("stroke-width", 2);
		linkEnter.append("rect")
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "white");
		linkEnter.append("text")
			.style("text-anchor","middle")
			.style("alignment-baseline", "middle")
			.style("fill", "gray");

		// update
		self.svg.selectAll(".link-group").each(function(d) {
			var text = d3.select(this).select("text")
				.text(DataTransformationHandler.createShortString(d.featureName, 8));

			var bbox = text.node().getBBox();
			d3.select(this).select("rect")
				.attr("width", bbox.width + 6)
				.attr("height", bbox.height + 4);
		});

		// exit
		link.exit().remove();

		function mouseenterLink(d) {
			var mouseX = event.clientX;
			var mouseY = event.clientY;
			var viewLeft = $("#right-content").position().left;

			var tooltipText = self.svg.append("text")
				.attr("class", "tool-tip")
				.attr("x", mouseX - viewLeft - 8 + 15)
				.attr("y", mouseY - 8 - 15)
				.text(d.featureName);

			var bbox = tooltipText.node().getBBox();
			self.svg.insert("rect", "text.tool-tip")
				.attr("class", "tool-tip")
				.attr("x", bbox.x - 3)
				.attr("y", bbox.y - 2)
				.attr("width", bbox.width + 6)
				.attr("height", bbox.height + 4)
				.attr("rx", 5)
				.attr("ry", 5)
				.style("fill", "white")
				.style("stroke", "gray");
		}
		function mouseleaveLink(d) {
			self.svg.selectAll(".tool-tip").remove();
		}
	},
	updateNodes: function() {
		var self = this;

		var node = self.svg.selectAll(".node-group")
			.data(self.nodes);

		// enter
		var nodeEnter = node.enter()
			.append("g")
			.attr("class", "node-group")
			.attr("cursor", "pointer")
			.call(self.force.drag);

		nodeEnter.each(function(d) {
			d3.select(this).append("circle")
				.style("fill", "steelblue")
				.style("stroke", "steelblue")
				.style("stroke-width", 3)
				.style("fill-opacity", 0.3);

			// append both lines for easy updating
			self.appendTextWithShadow(d3.select(this), "first-line", 0);
			self.appendTextWithShadow(d3.select(this), "second-line", 0);
		});

		// update
		self.svg.selectAll(".node-group")
			.attr("class", function(d) {
				if (!d.show)
					return "not-shown node-group"
				else
					return "node-group"
			});

		self.svg.selectAll(".node-group").each(function(d) {
			d3.select(this).select("circle")
				.attr("r", self.getNodeRadius(d));

			var firstLineY = (d.show && !d.small) ? -6 : 0;
			var secondLineY = (d.show && !d.small) ? 6 : 0;

			if (d.show && !d.small) { // large
				var featureNameWithoutID = DataTransformationHandler.returnFeatureNameWithoutID(d.id.split(":")[0]);
				var shortFeatureName = DataTransformationHandler.createShortString(featureNameWithoutID, 20);
				var firstLine = shortFeatureName + ":";
				var secondLine = d.id.split(":")[1];

				d3.select(this).selectAll(".first-line")
					.attr("y", firstLineY)
					.text(firstLine);
				d3.select(this).selectAll(".second-line")
					.attr("y", secondLineY)
					.text(secondLine);
			}

			if (d.show && d.small) { // small
				d3.select(this).selectAll(".first-line")
					.text("");
				d3.select(this).selectAll(".second-line")
					.text("");
			}

			if (!d.show) { // not show
				var firstLine = d.id;

				d3.select(this).selectAll(".first-line")
					.attr("y", firstLineY)
					.text(firstLine);
				d3.select(this).selectAll(".second-line")
					.text("");
			}
		});

		// exit
		node.exit().remove();
		
		// move the text to the front
	    self.svg.selectAll(".not-shown.node-group")
	    	.moveToFront();
	},
	appendTextWithShadow: function(appendTo, className, y) {
		var textShadow = appendTo.append("text")
			.attr("class", className + " text-shadow")
			.attr("y", y)
			.style("stroke", "white")
			.style("stroke-width", 3)
			.style("text-anchor", "middle")
			.style("fill", "white")
			.style("alignment-baseline", "middle");

		var text = appendTo.append("text")
			.attr("y", y)
			.attr("class", className)
			.style("fill", "steelblue")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle");
	},
	getNodeRadius: function(node) {
		var self = this;

		if (!node.show)
			return 0;
		if (node.show && !node.small)
			return self.radius.normal;
		if (node.show && node.small)
			return self.radius.small;
	}
}

// move things to the front
d3.selection.prototype.moveToFront = function() {  
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};