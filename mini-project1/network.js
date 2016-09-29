var Network = {
  width: 350, 
  height: 350,

  svg: null,

  allNodes: null,
  allLinks: null,
  nodes: null,
  links: null,

  force: null,

  // current state of graph
  currentYear: 0,
  linksShown: [],
  nodesShown: [{id: "38259P", name: "Google Inc", step: "0"}],
  nodesAdded: [0],
  newNodesStartIndex: [],

  radius: 4,
  rootRadius: 8,
  color: ["#FF0000", "#555", "#DCDCDC"],

  init: function() {
    var self = this;

    self.svg = d3.select(".network")
                  .attr("width", self.width)
                  .attr("height", self.height);

    self.force = d3.layout.force()
                  .charge(-70)
                  .linkDistance(25)
                  .gravity(0.3)
                  .size([self.width, self.height]);

    d3.csv("edges.csv", type, function(error, links) {
      d3.csv("nodes.csv", function(error, nodes) {
        self.allNodes = d3.nest()
                          .key(function(d) { return d.ego; })
                          .entries(nodes);
        self.allLinks = d3.nest()
                          .key(function(d) { return d.ego; })
                          .entries(links);
        self.restart();
        self.update(2000);
      });
    });

    function type(d) {
      d.target = +d.target;
      d.source = +d.source;
      return d;
    }
  },
  update: function(year) { // function for updating the node and edge data
    var self = this;

    if (year > self.currentYear)
      self.addNodesnLinks(year);
    else
      self.removeNodesnLinks(year);

    self.startUpdate();
    self.currentYear = year;
  },
  restart: function() {
    var self = this;

    self.nodes = self.allNodes[LineChart.currentGraph].values;
    self.links = self.allLinks[LineChart.currentGraph].values;

    self.svg.selectAll("*").remove();

    self.currentYear = 0;
    self.linksShown = [];
    self.nodesShown = [{id: self.nodes[0].id, name: self.nodes[0].name, step: self.nodes[0].step}];
    self.nodesAdded = [0];
    self.newNodesStartIndex = [];
  },
  addNodesnLinks: function(year) {
    var self = this;

    var format = d3.time.format("%m/%d/%y");
    var sliderDate = format.parse("01/01/" + (year + 1).toString().substring(2, 5));
    var currentDate = format.parse("01/01/" + (self.currentYear + 1).toString().substring(2, 5));

    self.newNodesStartIndex.push(self.nodesAdded.length); // store the starting index before any changes

    // loop until find last position
    var i;
    for (i = 0; i < self.links.length; i++) {
      var linkStartDate = format.parse(self.links[i].startDate);

      if (linkStartDate >= currentDate)
        break;
    }

    // from the last position push new nodes and links to the graph
    for (; i < self.links.length; i++) {
      var linkStartDate = format.parse(self.links[i].startDate);

      if (linkStartDate < sliderDate) {
          // push the links
          self.linksShown.push($.extend(true, {}, self.links[i]));

          // push the source nodes
          if ($.inArray(self.links[i].source, self.nodesAdded) == -1) {
            var source = $.extend(true, {}, self.nodes[self.links[i].source]);
            self.nodesAdded.push(self.links[i].source);
            self.nodesShown.push($.extend(true, {}, source));
          }

          // push the target nodes
          if ($.inArray(self.links[i].target, self.nodesAdded) == -1) {
            var target = $.extend(true, {}, self.nodes[self.links[i].target]);
            self.nodesAdded.push(self.links[i].target);
            self.nodesShown.push($.extend(true, {}, target));
          }
      }
      else
          break;
    }
  },
  removeNodesnLinks: function(year) {
    var self = this;

    var format = d3.time.format("%m/%d/%y");
    var sliderDate = format.parse("01/01/" + (year + 1).toString().substring(2, 5));
    var currentDate = format.parse("01/01/" + (self.currentYear + 1).toString().substring(2, 5));

    // loop until find last position
    var i;
    for (i = 0; i < self.links.length; i++) {
      var linkStartDate = format.parse(self.links[i].startDate);

      if (linkStartDate >= sliderDate)
        break;
    }

    // remove links
    for (; i < self.links.length; i++) {
      var linkStartDate = format.parse(self.links[i].startDate);

      if (linkStartDate < currentDate) {
        self.linksShown.pop();
      }
    }

    // remove newly added nodes in the last period
    var start = self.newNodesStartIndex.pop()
    var end = self.nodesAdded.length;
    for (var i = start; i < end; i++) {
      self.nodesAdded.pop();
      self.nodesShown.pop();
    }
  },
  startUpdate: function() { // really update nodes and links
    var self = this;

    var node = self.svg.selectAll(".node");
    var link = self.svg.selectAll(".link");
    var text = self.svg.selectAll(".name");

    // render links
    link = link.data(self.linksShown);
    link.enter()
        .insert("line", ".link")
        .attr("class", "link");
    link.exit().remove();

    // render nodes
    node = node.data(self.nodesShown)
                .attr("r", function(d, i) {
                  if (i == 0)
                    return self.rootRadius;

                  return self.radius;
                })
                .style("fill", function(d, i) {
                  return self.color[d.step]
                });
    node.enter()
        .insert("circle", ".node")
        .attr("class", "node")
        .attr("r", function(d, i) {
          if (i == 0)
            return self.rootRadius;

          return self.radius;
        })
        .style("fill", function(d, i) {
          return self.color[d.step]
        })
        .on("mouseover", function(d, i) {
          self.svg.select("#node" + i)
            .classed("selected", true);
        })
        .on("mouseout", function(d, i) {
          self.svg.select("#node" + i)
                  .classed("selected", false);
        })
        .call(self.force.drag);
    node.exit().remove();

    // render text
    text = text.data(self.nodesShown)
                .text(function(d) { 
                  return d.name;
                });
    text.enter()
        .insert("text", ".name")
        .attr("class", "name")
        .attr("id", function(d, i) {
          return "node" + i;
        })
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { 
          return d.name;
        });
    text.exit().remove();

    // process nodes and links variables
    self.force.nodes(self.nodesShown)
              .links(self.linksShown)
              .start();

    // can start moving now
    self.force.on("tick", function() {
      node
      .attr("cx", function(d) {
        return Math.max(self.radius, Math.min(self.width - self.radius, d.x));
      })
      .attr("cy", function(d) {
        return Math.max(self.radius, Math.min(self.height - self.radius, d.y));
      })

      text
      .attr("x", function(d) {
        return Math.max(self.radius, Math.min(self.width - self.radius, d.x));
      })
      .attr("y", function(d) {
        return Math.max(self.radius, Math.min(self.height - self.radius, d.y));
      })

      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    });
  }
};