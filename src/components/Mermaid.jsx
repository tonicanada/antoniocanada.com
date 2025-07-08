import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function Mermaid({ code }) {
  const ref = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      themeVariables: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        primaryColor: '#f9f9f9',
        primaryTextColor: '#222',
        primaryBorderColor: '#ccc',
        lineColor: '#888',
        edgeLabelBackground: '#fff',
        clusterBkg: '#f0f0f0',
        clusterBorder: '#bbb',
        nodeBorder: '#aaa',
        nodeTextColor: '#111',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'linear'
      }
    });

    if (ref.current) {
      try {
        mermaid.run({ nodes: [ref.current] });
      } catch (err) {
        console.error("Mermaid render error:", err);
      }
    }
  }, [code]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div ref={ref} className="mermaid">
        {code}
      </div>
    </div>
  );
}
