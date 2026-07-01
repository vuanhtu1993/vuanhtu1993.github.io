import { useState, useEffect } from 'react';

export function useOntologyData(domain) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/ontology/${domain}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        
        // Transform tree structure to nodes and links for D3 force-directed graph
        const nodes = [];
        const links = [];
        
        function traverse(node, parentId = null) {
          nodes.push({
            id: node.id,
            label: node.label,
            level: node.level,
            description: node.description,
            docLink: node.docLink,
            tags: node.tags || [],
            collapsed: node.level > 1, // Collapse nodes below level 1 by default
            _children: node.children || [] // Keep original children for toggle
          });
          
          if (parentId) {
            links.push({
              source: parentId,
              target: node.id,
              type: 'parent-child'
            });
          }
          
          if (node.children) {
            node.children.forEach(child => traverse(child, node.id));
          }
          
          if (node.relations) {
            node.relations.forEach(rel => {
               links.push({
                 source: node.id,
                 target: rel.targetId,
                 type: rel.type
               });
            });
          }
        }
        
        traverse(json);
        
        setData({ originalRoot: json, allNodes: nodes, allLinks: links });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch ontology data:", err);
        setError(err);
        setLoading(false);
      }
    }
    
    if (domain) {
      fetchData();
    }
  }, [domain]);

  return { data, loading, error };
}
