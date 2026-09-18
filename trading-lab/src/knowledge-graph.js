import graph from '../knowledge/graph/financial-knowledge-graph.v1.json' with { type: 'json' };

const nodes=new Map(graph.nodes.map(n=>[n.id,n]));
export function knowledgeNode(id){return nodes.get(id)||null}
export function incoming(id,type=null){return graph.edges.filter(e=>e.to===id&&(!type||e.type===type)).map(e=>({...e,node:nodes.get(e.from)}))}
export function outgoing(id,type=null){return graph.edges.filter(e=>e.from===id&&(!type||e.type===type)).map(e=>({...e,node:nodes.get(e.to)}))}
export function prerequisites(id){return incoming(id,'prerequisite_of').map(x=>x.node).filter(Boolean)}
export function related(id){return [...incoming(id,'related_to'),...outgoing(id,'related_to')].map(x=>x.node).filter(Boolean)}
export function learningPath(id){return graph.learningPaths.find(p=>p.target===id)||null}
export function graphContext(id){
 const node=knowledgeNode(id), path=learningPath(id);
 return {node,prerequisites:prerequisites(id),related:related(id),path:path?{...path,nodes:path.sequence.map(knowledgeNode).filter(Boolean)}:null};
}
export function graphStats(){return{nodes:graph.nodes.length,edges:graph.edges.length,paths:graph.learningPaths.length,authored:graph.nodes.filter(n=>n.status==='authored').length,stubs:graph.nodes.filter(n=>n.status==='stub').length}}
