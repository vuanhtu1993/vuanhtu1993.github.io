import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useHistory } from '@docusaurus/router';
import { useOntologyData } from './useOntologyData';
import './OntologyGraph.css';

export default function OntologyGraph({ domain, searchTerm }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const oldPositions = useRef(new Map());
  const { data, loading, error } = useOntologyData(domain);
  const history = useHistory();
  const [hoveredNode, setHoveredNode] = useState(null);

  // Track expanded/collapsed state dynamically, separate from original data fetching
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Initialize expanded nodes and reset old positions on data load
  useEffect(() => {
    if (data && data.allNodes) {
      oldPositions.current.clear(); // Reset positions for new domain
      const initial = new Set();
      // Expand only level 0 by default (root node)
      data.allNodes.forEach(n => {
        if (n.level === 0) {
          initial.add(n.id);
        }
      });
      setExpandedNodes(initial);
    }
  }, [data]);

  // Compute active nodes and links based on expanded state
  const { activeNodes, activeLinks } = useMemo(() => {
    if (!data || !data.originalRoot) return { activeNodes: [], activeLinks: [] };

    const nodes = [];
    const links = [];
    const addedNodeIds = new Set();

    function addVisibleNodes(node, isVisible) {
      if (!isVisible) return;

      const clone = { ...node }; // Clone to avoid d3 mutating our data
      const old = oldPositions.current.get(node.id);
      if (old) {
        clone.x = old.x;
        clone.y = old.y;
        clone.vx = old.vx;
        clone.vy = old.vy;
      } else if (addedNodeIds.size > 0 && oldPositions.current.size > 0) {
        // If it's a new node (just expanded), try to start it near its parent
        // (Assuming parent is already in the map)
        const parentPos = Array.from(oldPositions.current.values())[0]; // rough fallback
        clone.x = parentPos.x + (Math.random() - 0.5) * 50;
        clone.y = parentPos.y + (Math.random() - 0.5) * 50;
      }

      nodes.push(clone);
      addedNodeIds.add(node.id);

      const isExpanded = expandedNodes.has(node.id);

      if (node.children) {
        node.children.forEach(child => {
          if (isExpanded) {
            links.push({
              source: node.id,
              target: child.id,
              type: 'parent-child'
            });
          }
          addVisibleNodes(child, isExpanded);
        });
      }
    }

    addVisibleNodes(data.originalRoot, true);

    // Add cross-references if both source and target are visible
    if (data.allNodes) {
      data.allNodes.forEach(node => {
        if (addedNodeIds.has(node.id) && node.relations) {
          node.relations.forEach(rel => {
            if (addedNodeIds.has(rel.targetId)) {
              links.push({
                source: node.id,
                target: rel.targetId,
                type: rel.type
              });
            }
          });
        }
      });
    }

    return { activeNodes: nodes, activeLinks: links };
  }, [data, expandedNodes]);


  useEffect(() => {
    if (!activeNodes.length || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Initial transform to center
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    // Force simulation
    const simulation = d3.forceSimulation(activeNodes)
      .alpha(0.1) // Lower initial alpha to prevent explosion on re-render
      .force("link", d3.forceLink(activeLinks).id(d => d.id).distance(d => d.type === 'parent-child' ? 180 : 250))
      .force("charge", d3.forceManyBody().strength(-1200)) // Increase repulsion strongly
      .force("center", d3.forceCenter(0, 0))
      // Đặt bán kính va chạm = bán kính node + (độ dài chữ x 4px) + margin
      .force("collide", d3.forceCollide().radius(d => getRadius(d.level) + (d.label ? d.label.length * 4 : 0) + 20).iterations(3));

    // Draw links
    const link = g.append("g")
      .selectAll("line")
      .data(activeLinks)
      .join("line")
      .attr("class", d => `link-line ${d.type !== 'parent-child' ? 'cross-ref' : ''}`)
      .attr("stroke-width", d => d.type === 'parent-child' ? 2 : 1);

    // Draw nodes
    const node = g.append("g")
      .selectAll("g")
      .data(activeNodes)
      .join("g")
      .attr("class", "node-group")
      .on("click", handleNodeClick)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .call(drag(simulation));

    node.append("circle")
      .attr("class", d => `node-circle level-${d.level}`)
      .attr("r", d => getRadius(d.level));

    node.append("text")
      .attr("class", "node-label")
      .attr("dy", d => getRadius(d.level) + 15)
      .text(d => d.label);

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);

      // Save positions for next render
      activeNodes.forEach(d => {
        oldPositions.current.set(d.id, { x: d.x, y: d.y, vx: d.vx, vy: d.vy });
      });
    });

    // Search highlight logic
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      node.classed("search-match", d => d.label.toLowerCase().includes(term) || (d.description && d.description.toLowerCase().includes(term)));
      node.classed("search-nomatch", d => !(d.label.toLowerCase().includes(term) || (d.description && d.description.toLowerCase().includes(term))));
      link.classed("search-nomatch", true); // Dim links during search
    } else {
      node.classed("search-match", false).classed("search-nomatch", false);
      link.classed("search-nomatch", false);
    }

    // --- Interaction Handlers ---

    function getRadius(level) {
      const sizes = { 0: 30, 1: 22, 2: 16, 3: 12, 4: 8 };
      return sizes[level] || 8;
    }

    function handleNodeClick(event, d) {
      // If has docLink and holding Shift/Cmd, navigate
      if (d.docLink && (event.shiftKey || event.metaKey || event.ctrlKey)) {
        history.push(d.docLink);
        return;
      }

      // Toggle expansion
      if (d.children && d.children.length > 0) {
        setExpandedNodes(prev => {
          const next = new Set(prev);
          if (next.has(d.id)) {
            next.delete(d.id);
            // Optionally: recursively collapse children? Keeping simple for now.
          } else {
            next.add(d.id);
          }
          return next;
        });
      }
    }

    function handleMouseOver(event, d) {
      setHoveredNode(d);
    }

    function handleMouseOut() {
      setHoveredNode(null);
    }

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [activeNodes, activeLinks, searchTerm, history]);

  return (
    <div className="ontology-container" ref={containerRef}>
      <div className="ontology-stats" style={{ position: 'absolute', right: 16, top: 16, zIndex: 10 }}>
        {loading ? 'Loading...' : error ? 'Error loading data' :
          `${activeNodes.length} nodes currently visible`
        }
      </div>

      {error && <div style={{ padding: '60px 20px', color: 'red' }}>Failed to load ontology data: {error.message}</div>}

      <svg ref={svgRef} className="ontology-svg"></svg>
      
      {/* Left-side Popup Panel */}
      <div className={`ontology-side-panel ${hoveredNode ? 'visible' : ''}`}>
        {hoveredNode && (
          <div className="ontology-side-panel-content">
            <div className="panel-header">
              <span className="level-badge">Level {hoveredNode.level}</span>
            </div>
            <h2>{hoveredNode.label}</h2>
            
            {hoveredNode.description && (
              <div className="panel-section">
                <h3>Description</h3>
                <p>{hoveredNode.description}</p>
              </div>
            )}
            
            {hoveredNode.tags && hoveredNode.tags.length > 0 && (
              <div className="panel-section">
                <h3>Tags</h3>
                <div className="tags">
                  {hoveredNode.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            )}

            <div className="panel-footer">
              {hoveredNode.docLink && (
                <span className="doc-link-hint">⇧ Click (Shift+Click) to view docs</span>
              )}
              {(!hoveredNode.docLink && hoveredNode.children && hoveredNode.children.length > 0) && (
                <span className="doc-link-hint" style={{ color: 'var(--ifm-color-emphasis-500)' }}>Click to expand/collapse node</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
