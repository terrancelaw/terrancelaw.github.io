var PageOne = {
	init: function() {
		var self = this;

		self.drawContent();
		self.drawButton();
	},
	drawContent: function() {
		var self = this;

		Database.svg.append("text")
			.attr("x", 600)
			.attr("y", 20)
			.style("font-weight", "bold")
			.style("font-size", 25)
			.style("text-anchor", "middle")
			.text("Which pair of groups are more distinguishing?");

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 200)
			.style("font-size", 25)
			.text("In each task, we are going to describe two pairs of groups. Your job is to decide which pair");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 230)
			.style("font-size", 25)
			.text("contains groups which are more distinguishing (i.e. you are able to tell the groups in the pair");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 260)
			.style("font-size", 25)
			.text("apart more easily).");

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 360)
			.style("font-size", 25)
			.text("Try to imagine how the groups are like while completing the tasks.");

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 460)
			.style("font-size", 25)
			.text("We will start with a short training session to get you familiarized with the task interface.");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 490)
			.style("font-size", 25)
			.text("Click the button below to continue with the training session.");
	},
	drawButton: function() {
		var self = this;

		var button = Database.svg.append("g")
			.style("cursor", "pointer")
			.on("click", function() {
				self.clear();
			});

		var buttonText = button.append("text")
			.attr("class", "button-text")
			.attr("x", 600)
			.attr("y", 760)
			.style("font-size", 25)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("Next");

		var bbox = buttonText.node().getBBox();
		button.insert("rect", ".button-text")
			.attr("x", bbox.x - 5)
			.attr("y", bbox.y - 2)
			.attr("width", bbox.width + 10)
			.attr("height", bbox.height + 4)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "#e8e8e8");
	},
	clear: function() {
		var self = this;

		Database.svg.selectAll("*").remove();
		PageTwo.init();
	}
}