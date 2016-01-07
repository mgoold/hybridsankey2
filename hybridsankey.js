d3.sankey = function() {
  
var nodetypearray2=[];  
        
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 10,
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
//  the "each step right is a visit" look of a visits chart
 
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
   
  console.log('highestnode',highestnode,'lowestnode',lowestnode,'highestrank',highestrank);   
    console.log('nodesbybreadth', nodesByBreadth);
    console.log('size',size);
    
  var nodefloor=0;

  for (i2=0; i2<50; i2+=1)  {
    
    nodefloor=nodes[lowestnode].y+nodes[lowestnode].dy;  //the bottom of the lowest node.
    positionnodes(nodePadding); 
    nodePadding*=.99
    
    } 
            
  function positionnodes(nodePadding) {
    relaxRightToLeft2(nodePadding);
      relaxLefttoRight(nodePadding);
  }

    function initializeNodeDepth() {
    
    var ky = d3.min(nodesByBreadth, function(nodes) {  
      return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
    });

    var rankcount=0;
    var prevnodecount=0;
    var rankSum=0;  
                  
    nodesByBreadth.forEach(function(nodes)  {   
  
      nodes.forEach(function(node, i) {     
        node.dy = node.value * ky;
      });   

      nodes.forEach(function(node, i) { 
        if (node.targetLinks.length) {
          var targetsum=0;
          node.targetLinks.forEach(function (obj) { //for each node, sum the value of its lefthand links
            targetsum+=obj.source.dy;
            node.targeti=obj.source.i; //this is the 
          });   
          node.targetsum=targetsum;             
        } else {
          node.targetsum=node.dy;
          node.targeti=i;         
        };
        node.sourcelinkcount=node.sourceLinks.length-1; 
      }); 
      
      
      if (rankcount<1) {              
        nodes.sort(
          firstBy(function (a, b) { return b.targetsum-a.targetsum; })
        );        
        
  
      } else {  
        nodes.sort(
          firstBy(function (a, b) { return a.targeti-b.targeti; })
          .thenBy(function (a, b) { return b.dy-a.dy; })
        );  
                                        
      }

      var templinkrank = 0;
      var temptarget = 0; 
      var nodecount=-1;
      
      nodes.forEach(function (node) {++nodecount;});
        
      nodes.forEach(function(node, i) { 
        var j=0;  
//        console.log('node',node);
        node.i=i;
                          
        if (node.targeti==0 && node.i==0) { //if the left hand node you link to is 0, that means you're the highest in your stack
          templinkrank = j;
          temptarget = node.sourcei;
          highestnode=node.node;

        } else {
          if (temptarget == node.targeti) { //if next node shares same link, then increment templinkrank (link rank w/in same node)
            templinkrank += 1;
          } else {
            temptarget = node.targeti; //else the new temp target is whatever left hand node goes with this node
            templinkrank=0;
          }
        }
                
        if (i==nodecount && node.targeti>=prevnodecount) { //conversely, if you're the last node and you link to the lowest node to your left, you're the new lowest
            lowestnode=node.node;
            prevnodecount=nodecount;
        }
        
        j+=1;                 

        node.templinkrank=templinkrank;   
      });   

      
      
      rankcount+=1;

    });
          
    links.forEach(function(link) {
      link.dy = link.value * ky;
    });
      
//    console.log('highestnode',highestnode,'lowestnode',lowestnode,'highestrank',highestrank);   
    }



  var firstY, temprankSum;


  function relaxRightToLeft2(nodePadding) { //whole point of this function is assigning a summed spatial requirement to each node.  this sum is sum of reqs to its right
      
//      console.log('nodePadding',nodePadding);
      
      nodesByBreadth.slice().reverse().forEach(function(subnodes) { 
        
        var thisranksum=0;
        
        subnodes.forEach(function(node) {
          var ranksum=0;  
          node.hassourcelinks=0;
          if (node.sourceLinks.length>0) {  
            var nodectr=[];     
            node.sourceLinks.forEach(function(obj) {
//              console.log('nodectr.indexOf(obj.node)',obj,obj.target.node,nodectr.indexOf(obj.target.node));
              if (nodectr.indexOf(obj.target.node)==-1) {
//                console.log('adding target ranksum',obj.target.node,obj.target.ranksum);
                ranksum +=obj.target.ranksum;
                nodectr.push(obj.target.node);
              }
               //bc we are summing the sizes of the links, should 
              //~ ranksum +=obj.target.ranksum;       
            });
//            console.log('nodectr',node.node,nodectr.length-1);
//            console.log('node ranksum',node.node,ranksum);
            ranksum += (nodectr.length-1) * nodePadding;            
            node.ranksum=ranksum;
            node.hassourcelinks=1;
            
            node.sourceLinks.forEach(function(obj) {
              nodes[obj.target.node].prevranksum=ranksum;     
            });           
            
            
          } else {
            node.ranksum=node.dy;
          }
          
          thisranksum+=ranksum;                   

        });
        
        subnodes.forEach(function(node) {
          node.thisranksum=thisranksum;
        });
        
        
      
    });
  }

      
  function relaxLefttoRight(nodePadding) {
    var j=0;
        
    nodesByBreadth.slice().forEach(function(subnodes) {
      var tempY=0;
      subnodes.forEach(function(node) {   
//        console.log('node',node);             
        if (j==0) {           
          node.y=size[1]/2-node.dy/2;                   
        } else {
            
          if (node.i==0) {
            node.y=node.sourcey+node.sourcedy/2-node.prevranksum/2+node.ranksum/2-node.dy/2;
          } else {
            node.y=tempY+node.ranksum/2-node.dy/2;
          }
          
          tempY=node.y+node.dy/2+node.ranksum/2+nodePadding;  
                                                                        
        }
        
        node.sourceLinks.forEach(function(obj) {
          nodes[obj.target.node].sourcedy=node.dy;
          nodes[obj.target.node].sourcey=node.y;
        }); 
        
      })
      j+=1;
        
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

