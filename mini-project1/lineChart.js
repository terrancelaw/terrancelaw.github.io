var LineChart = {
  margin: {top: 20, right: 20, bottom: 30, left: 50},
  width: null,
  height: null,

  svg: null, // for zoom behavior
  group: null, // for rendering line chart

  xScale: null,
  yScale: null,
  circleScale: null,

  sizeData: null,

  currentGraph: 0,

  setSVG: function() {
    var self = this;

    self.width = 650 - self.margin.left - self.margin.right;
    self.height = 350 - self.margin.top - self.margin.bottom;

    self.svg = d3.select(".chart")
                  .attr("height", self.height + self.margin.top + self.margin.bottom)
                  .attr("width", self.width + self.margin.left + self.margin.right + 100)

    self.group = self.svg.append("g")
                          .attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

    var zoom = d3.behavior.zoom()
                          .scaleExtent([1, 50])
                          .on("zoom", function() {
                            var e = d3.event;
                            var tx = Math.min(0, Math.max(e.translate[0], self.width - self.width * e.scale));
                            var ty = Math.min(0, Math.max(e.translate[1], self.height - self.height * e.scale));
                            zoom.translate([tx, ty]);
                            self.group.attr("transform", ["translate(" + self.margin.left + ", " + self.margin.top + ")", "translate(" + [tx, ty] + ")", "scale(" + e.scale + ")"].join(" "));
                          });

    self.svg.call(zoom);

    self.svg.on("mousedown", function() {
      var mouse = d3.mouse(this);

      self.svg.append("rect")
          .attr({
            rx: 6,
            ry: 6,
            class: "selection",
            x: mouse[0],
            y: mouse[1],
            width: 0,
            height: 0
          });
    })
    .on("mousemove", function() {
      var box = self.svg.select("rect.selection");

      if(!box.empty()) {
        var mouse = d3.mouse(this);
        var boxPos = {
          x: parseInt(box.attr("x"), 10),
          y: parseInt(box.attr("y"), 10),
          width: parseInt(box.attr("width"), 10),
          height: parseInt(box.attr("height"), 10)
        };
        var move = {
          x: mouse[0] - boxPos.x,
          y: mouse[1] - boxPos.y
        };

        if (move.x < 1 || (move.x * 2 < boxPos.width)) {
            boxPos.x = mouse[0];
            boxPos.width -= move.x;
        } 
        else {
            boxPos.width = move.x;       
        }

        if(move.y < 1 || (move.y * 2 < boxPos.height)) {
            boxPos.y = mouse[1];
            boxPos.height -= move.y;
        } 
        else {
            boxPos.height = move.y;       
        }

        box.attr(boxPos);
      }
    })
    .on("mouseup", function() {
      self.svg.selectAll("rect.selection").remove();
    })
    .on("mouseout", function() {
      if(d3.event.relatedTarget.tagName == 'HTML') {
        self.svg.selectAll("rect.selection").remove();
      }
    });
  },
  init: function() {
    var self = this;

    self.setSVG();

    d3.csv("size.csv", type, function(error, data) {
      self.sizeData = d3.nest()
                        .key(function(d) {
                          return d.ego;
                        })
                        .entries(data);

      self.xScale = d3.time.scale()
                            .domain(d3.extent(data, function(d) { return d.startDate; }))
                            .range([0, self.width]);
      self.yScale = d3.scale.linear()
                            .domain(d3.extent(data, function(d) { return d.size; }))
                            .range([self.height, 0]);
      self.circleScale = d3.scale.linear()
                            .domain(d3.extent(data, function(d) { return d.size; }))
                            .range([10, 40]);

      var xAxis = d3.svg.axis()
                        .scale(self.xScale)
                        .orient("bottom");

      var yAxis = d3.svg.axis()
                        .scale(self.yScale)
                        .orient("left");

      var line = d3.svg.line()
                        .x(function(d) { return self.xScale(d.startDate); })
                        .y(function(d) { return self.yScale(d.size); })

      self.group.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + self.height + ")")
                .call(xAxis);

      self.group.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .attr("dx", "2em")
                .style("text-anchor", "end")
                .text("Network Size");

      var lineGroup = self.group.selectAll(".lineGroup")
                                .data(self.sizeData)
                                .enter()
                                .append("g")
                                .attr("class", "lineGroup")
                                .on("mouseover", function() {
                                  d3.select(this)
                                    .select("path")
                                      .style("stroke-width", "3px")
                                      .style("stroke", "red")
                                      .style("opacity", 1);

                                  d3.select(this)
                                    .select(".line-name")
                                    .attr("opacity", "1")
                                    .style("font-size", "15px")
                                    .attr("dx", "0.8em")
                                    .style("fill", "red");
                                })
                                .on("mouseout", function() {
                                  self.group.selectAll(".line")
                                            .style("stroke", function(d, i) {
                                              if (i == self.currentGraph)
                                                return "steelblue";

                                              return "#DDDDDD";
                                            })
                                            .style("opacity", function(d, i) {
                                              if (i == self.currentGraph)
                                                return 1;

                                              return 0.5;
                                            })
                                            .style("stroke-width", function(d, i) {
                                              if (i == self.currentGraph)
                                                return "3px";

                                              return "1px"
                                            });

                                  self.group.selectAll(".line-name")
                                            .attr("opacity", function(d, i) {
                                              if (i == self.currentGraph)
                                                return 1;

                                              return 0.1
                                            })
                                            .style("font-size", function(d, i) {
                                              if (i == self.currentGraph)
                                                return "15px";

                                              return "11px";
                                            })
                                            .attr("dx", function(d, i) {
                                              if (i == self.currentGraph)
                                                return "0.8em";

                                              return "0em";
                                            })
                                            .style("fill", "black");
                                })
                                .on("click", function(d, i) {
                                  self.currentGraph = i;

                                  self.group.selectAll(".line")
                                            .style("stroke", function(d, i) {
                                              if (i == self.currentGraph)
                                                return "steelblue";

                                              return "#DDDDDD";
                                            })
                                            .style("opacity", function(d, i) {
                                              if (i == self.currentGraph)
                                                return 1;

                                              return 0.5;
                                            })
                                            .style("stroke-width", function(d, i) {
                                              if (i == self.currentGraph)
                                                return "3px";

                                              return "1px"
                                            });

                                  self.group.selectAll(".line-name")
                                            .attr("opacity", function(d, i) {
                                              if (i == self.currentGraph)
                                                return 1;

                                              return 0.1
                                            })
                                            .style("font-size", function(d, i) {
                                              if (i == self.currentGraph)
                                                return "15px";

                                              return "11px";
                                            })
                                            .attr("dx", function(d, i) {
                                              if (i == self.currentGraph)
                                                return "0.8em";

                                              return "0em";
                                            })
                                            .style("fill", "black");

                                    d3.select(".select-rect")
                                        .attr("width", 0)
                                        .attr("x", 0);

                                    // redraw slider
                                    d3.select('#slider')
                                      .selectAll("*")
                                      .remove();
                                    d3.select('#slider')
                                      .call(d3.slider().axis(true).min(2000).max(2012).step(1)
                                        .on("slide", function(evt, value) {
                                          Network.update(value);
                                          LineChart.update(value);
                                      }));

                                    Network.restart();
                                    Network.update(2000);
                                    self.update(2000);
                                    RankChart.clear();
                                    RankChart.update(d.values[0].id, false);
                                });

      lineGroup.append("path")
                .attr("class", "line")
                .attr("d", function(d) {
                  return line(d.values);
                })
                .style("stroke", function(d, i) {
                  if (i == self.currentGraph)
                    return "steelblue";

                  return "#DDDDDD";
                })
                .style("opacity", function(d, i) {
                  if (i == self.currentGraph)
                    return 1;

                  return 0.5;
                })
                .style("stroke-width", function(d, i) {
                  if (i == self.currentGraph)
                    return "3px";

                  return "1px"
                });

      lineGroup.append("text")
                .attr("class", "line-name")
                .attr("transform", function(d, i) {
                  return "translate(" + (self.width + 3) + "," + self.yScale(self.sizeData[i].values[self.sizeData[i].values.length - 1].size) + ")";
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .text(function(d) {
                  return d.key;
                })
                .attr("opacity", function(d, i) {
                  if (i == self.currentGraph)
                    return 1;

                  return 0.1
                })
                .style("font-size", function(d, i) {
                  if (i == self.currentGraph)
                    return "15px";

                  return "11px";
                })
                .attr("dx", function(d, i) {
                  if (i == self.currentGraph)
                    return "0.8em";

                  return "0em";
                });

      self.group.append("circle");

      self.update(2000);
    });

    function type(d) {
      var formatDate = d3.time.format("%m/%d/%y");

      d.startDate = formatDate.parse(d.startDate);
      d.size = +d.size;

      return d;
    }
  },
  update: function(year) {
    var self = this;

    var format = d3.time.format("%m/%d/%y");
    var sliderDate = format.parse("01/01/" + year.toString().substring(2, 5));
    var cx, cy;

    var i;
    for (i = 0; i < self.sizeData[self.currentGraph].values.length; i++) {
      if (self.sizeData[self.currentGraph].values[i].startDate > sliderDate)
        break;
    }

    cx = self.xScale(self.sizeData[self.currentGraph].values[i].startDate);
    cy = self.yScale(self.sizeData[self.currentGraph].values[i].size);

    self.group.select("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", self.circleScale(self.sizeData[self.currentGraph].values[i].size))
          .style("fill", "red")
          .style("stroke-width", 5)
          .style("opacity", 0.5);
  }
};