d3.sankey = function() {
	
var nodetypearray2=[];	
				
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };
    

      		
  sankey.layout = function(iterations) {	   
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };


  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    
    links.forEach(function(link) {

      var source = link.source,
          target = link.target;
      if (typeof source === "number") {
		  var targetLink=clone(source);
		  source = link.source = nodes[link.source];
		}      
	  if (typeof target === "number") {
		  nodes[link.target].targetLink=targetLink;
		  target = link.target = nodes[link.target];
	  }
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
      
    });
  }


  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

	//~ console.log('graph',graph);

  function computeNodeBreadths() {

	  
    var remainingNodes = nodes,
        nextNodes,
        x = .6;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          nextNodes.push(link.target);
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

//     moveSinksRight(x); --disabling this call is all that's required to give the chart
//	the "each step right is a visit" look of a visits chart
 
    scaleNodeBreadths((width - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

    var highestnode=0;
    var lowestnode=0;
    var highestrank=0;
    var lowestrank=0;

  function computeNodeDepths(iterations) {
	
		  
    var nodesByBreadth = d3.nest()
        .key(function(d) {return d.x; }).sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) {return d.values; }); 
	
    initializeNodeDepth();   
   
    
	var bottommost=nodes[lowestnode].y+nodes[lowestnode].dy;

	for (i2=0; i2=100; i2++)  {
    	    
    	positionnodes(nodePadding,nodePadding);    
    	    
	    bottommost=nodes[lowestnode].y+nodes[lowestnode].dy;	    
	    if (bottommost<size[1]) { 
			var highnodepos=(nodes[highestnode].y+(size[1]-bottommost))/2;
			positionnodes(nodePadding,highnodepos); 
			break;
		}
	    
		nodePadding*=.99
    
	}	
	
	function positionnodes(nodePadding,highnodepos) {
		relaxRightToLeft2(nodePadding);
	    relaxRightToLeft3(nodePadding,highnodepos);
	}

    function initializeNodeDepth() {
		var ky = d3.min(nodesByBreadth, function(nodes) {  
		return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
		});

		var rankcount=0;
		var prevnodecount=0;
								
		nodesByBreadth.forEach(function(nodes)	{		
	
			nodes.forEach(function(node, i) { 		
				node.dy = node.value * ky;
			});		

			nodes.forEach(function(node, i) { 
				if (node.targetLinks.length) {
					node.targetLinks.forEach(function (obj) {
						node.targeti=obj.source.i;
					});					
				} else {
					node.targeti=i;					
				};
				node.i=i;
			});	
			
			nodes.sort(
				firstBy(function (a, b) { return a.targeti-b.targeti; })
				.thenBy(function (a, b) { return b.value-a.value; })
			);				

			var templinkrank = 0;
			var temptarget = 0;
			var j=0;
			var rankSum=0;		
			var nodecount=-1;
			
			nodes.forEach(function (node) {++nodecount;});
				
			nodes.forEach(function(node, i) { 
				if (j==0) {
					templinkrank = j;
					temptarget = node.targeti;
					if (node.targeti==0) {
						highestnode=node.node;
						highestrank=rankcount;
						}
				} else {
					if (temptarget == node.targeti) {
						templinkrank += 1;
					} else {
						temptarget = node.targeti;
						templinkrank=0;
					}
				}
								
				if (i==nodecount) {
					if (node.targeti==prevnodecount) {
						lowestnode=node.node;
						lowestrank=rankcount;
					} 
					prevnodecount=nodecount;
				}
				
				node.i=i;
				node.y=i;
				node.templinkrank=templinkrank;
				j+=1;			
			});		
			
			rankcount+=1;

		});
					
		links.forEach(function(link) {
			link.dy = link.value * ky;
		});
					
    }



	var firstY, temprankSum;


	function relaxRightToLeft2(nodePadding) {
			
			nodesByBreadth.slice().reverse().forEach(function(subnodes) {

			subnodes.sort(
				firstBy(function (a, b) { return a.targeti-b.targeti; })
				.thenBy(function (a, b) { return b.value-a.value; })
			);

			subnodes.forEach(function(node) {
				var ranksum=0;	
				node.hassourcelinks=0;
				if (node.sourceLinks.length>0) {				
					node.sourceLinks.forEach(function(obj) {
						ranksum +=obj.target.ranksum;				
					});
					ranksum += ((node.sourceLinks.length-1) * nodePadding)
					node.ranksum=ranksum;
					node.hassourcelinks=1;
				} else {
					node.ranksum=node.dy;
				}

			});
			
		});
	}

 	function relaxRightToLeft3(nodePadding,highnodepos) {
		nodesByBreadth.slice().reverse().forEach(function(subnodes) {

				var j=0;
				if (j<=highestrank) {
					
					subnodes.sort(
						firstBy(function (a, b) { return a.targeti-b.targeti; })
						.thenBy(function (a, b) { return b.value-a.value; })
					);
		
					var tempy=0;
					
					subnodes.forEach(function(node) {

						if (node.node==highestnode) {
							node.y=highnodepos;
							tempy=node.y+node.ranksum+nodePadding;							
						} else {
							
							if (node.sourceLinks.length>0) {
								var firstY=0;
								var endY=0;
								node.sourceLinks.forEach(function(obj) {
									if (obj.target.templinkrank==0) {
										firstY=obj.target.y;										
									} 		
									endY=Math.max(obj.target.y+obj.target.dy,endY);
								});
								node.y=firstY+((endY-firstY)/2)-(node.dy/2)
								tempy=node.y+node.ranksum+nodePadding;	
							} else {
								node.y=tempy;
								tempy=node.y+node.ranksum+nodePadding;							
							}

						}														
					});
					
					j+=1;
				}
		});
	}
      

  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    	var ycenter=node.y + node.dy / 2
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  firstBy=(function(){function e(f){f.thenBy=t;return f}function t(y,x){x=this;return e(function(a,b){return x(a,b)||y(a,b)})}return e})();

  return sankey;
};

