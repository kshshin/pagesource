/* eslint-disable */

import React, { Component } from 'react';
import './graph.css';
import Draggable from './draggable.js';

import NewNode from './newnode.js';

const { log, trace, count, table, time:timeStart, timeLog, timeEnd, group:groupStart, groupEnd } = console;

const printTest  = ( ...str ) => log( '----->', ...str );

Array.prototype.splice2 = function( i ) {
	return [ ...this.slice(0, i), ...this.slice(i+1) ];
}// splice 2

Array.prototype.findValueIndex = function( val ) {
	const arrayIndex = x => ( x === val );
	return this.findIndex( arrayIndex );
}// find value index
// or its called indexOf

Array.prototype.removeFirstMatch = function( val ) {
	const i = this.findValueIndex( val );

	return ~i ? this : this.splice2( i ); // splice2 when i != -1
}// remove value from array

// used with eventListener
function followMouse( id, e, moveEnd=true )
{
	const edgeDOM = document.getElementById( id );
	const points  = edgeDOM.points;

	const start = 0;
	const end   = points.length-1;

	const startIndex = moveEnd ? start : end;
	const endIndex   = moveEnd ? end   : start;
	const midIndex   = Math.floor( points.length/2 );

	const startPointCoord = points[ startIndex ];
	const endPointCoord   = points[ endIndex ];
	const midPointCoord   = points[ midIndex ];

	// get start and end point values
	const { x:startX, y:startY } = startPointCoord;
	const { pageX:endX, pageY:endY } = e;

	// set end point
	endPointCoord.x = endX;
	endPointCoord.y = endY;

	// set mid point
	midPointCoord.x = (endX + startX) / 2
	midPointCoord.y = (endY + startY) / 2 
}// follow mouse

function followCoord( id, x, y , moveEnd=true )
{
	const cover = { pageX:x, pageY:y };
	followMouse( id, cover, moveEnd );
}// follow edge start

// get parent element with given class name; limit to 20 levels
function getParentElementWithClassName( element, className )
{
	for( let i = 0; i < 20; i++ ) {
		// regular .className wont work on svg elements due to their "intentional" reason
		let currClassName =
			!element
			? null
			: currClassName = element.getAttribute('class');

		switch( true ) {
			case (element === null):
				return null;
			case (currClassName === className):
				return element;
			default:
				element = element.parentElement;
		}// switch
	}//for
	return null;
}// get parent element with class name

// get parent element with given class name; limit to 20 levels
function getChildElementWithClassName( element, className, count=20 )
{
	// regular .className wont work on svg elements due to their "intentional" reason
	const currClassName = !element ? null : (element.getAttribute('class'));

	switch( true ) {
		case (element === null):
			return null;
		case (currClassName === className):
			return element;
		default:
			const children = [...element.children];
			const result = children.map( child => {
				return getChildElementWithClassName( child, className, count-1 );
			});// map
			return result.find( x => x );
	}// switch
}// get parent element with class name

class Graph extends Component
{
	constructor( props ) {
		super( props );
		/*
		const localNODES = localStorage.getItem('NODES');
		*/

		const localEDGES = localStorage.getItem('EDGES');

		this.state = {
			requestType : null,
			nodes : {}, //+ref
			edges : {}, 
			temp  : null,
		};// state

		this.processRequest = this.processRequest.bind( this );
		this.operateOnList = this.operateOnList.bind( this );

		this.callbackFromNode = this.callbackFromNode.bind( this );
		this.getNextNodeIDs = this.getNextNodeIDs.bind( this );

		this.followNodeStart = this.followNodeStart.bind( this );
		this.followNodeEnd   = this.followNodeEnd.bind( this );
	}// constructor

	static getDerivedStateFromProps( nextProps, prevState ) {
		const newType = nextProps.type;
		const oldType = prevState.requestType;

		switch( true ) {
			case ( /\d/.test(oldType)  ): // extended type
			case ( newType === oldType ): 
				return {};
			default:
				return { requestType:newType };
		}// switch
	}// component did update

	componentDidUpdate( nextProps, prevState ) {
		const newType = nextProps.type;
		const oldType = prevState.requestType;

		if( newType === oldType ) return;

		this.setState( { requestType:newType } );
		this.undoEdge();
	}// component did update


	// when different request is made while only start of edge is selected
	// undo this edge
	undoEdge() {
		const { temp } = this.state;

		if( temp != null ) {
			this.setState( { temp:null } );
			// remove edgeline with only start
			const edgeID = temp[1];
			document.removeEventListener( 'mousemove', this.followMouseFunction );
			this.setState( { requestType:this.props.type } );
			this.operateOnList( 'delete', 'edge', edgeID );
		}// if
	}// undo edge

	followNodeStart( e ) {
		const selectedNode = getParentElementWithClassName( e.target, 'node' );

		[ this.initialNodeX, this.initialNodeY ] = [ e.pageX, e.pageY ];
	}//

	followNodeEnd( e ) {
		const { requestType } = this.state;

		const selectedNode = getParentElementWithClassName( e.target, 'node' );

		const { pageX:finalNodeX, pageY:finalNodeY } = e;
		const { initialNodeX, initialNodeY } = this;

		const [ diffX, diffY ] = [ finalNodeX-initialNodeX, finalNodeY-initialNodeY ];

		// set edge to node's center
		const { left, right, top, bottom } = selectedNode.getBoundingClientRect();

		const [ centerX, centerY ] = [ (left+right)/2 + diffX, (top+bottom)/2 + diffY ];

		const { id } = selectedNode.parentElement;
		const nodeID = +id;

		const updateEdges = ( centerX, centerY, type, edgeIDs ) => {
			edgeIDs.forEach( edgeID => {
				followCoord( edgeID, centerX, centerY, type );
			});// foreach
		};// update edges

		const updateStartEdge = updateEdges.bind( null, centerX, centerY, false );
		const updateEndEdge   = updateEdges.bind( null, centerX, centerY, true  );

		this.setState( state => {
			const { nodes } = state;
			const { edgeStart, edgeEnd } = nodes[ nodeID ];

			updateStartEdge( edgeStart );
			updateEndEdge  ( edgeEnd );

			return { nodes };
		}); //set state 
	}//

	createNode( e, id, type ) {
		if( e.target.tagName != 'svg' ) return; // don't create element when clicked on a node

		const { clientX:x, clientY:y } = e;

		// error:object is not extensible
		//+hence, the following
		const newRef = ( id, ref ) => {
			this.setState( state => {
				const { nodes } = state;
				const currNode  = nodes[id];
				return {
					nodes:{
						...nodes,
						[id]:{ ...currNode, ref:ref }
					}
				};// return
			});// set state
		}// new ref

		const node = (
			<Draggable key={id} id={id} style={{left:x-100, top:y-60}}> 
				<div className='node' id={id} style={{width:200, height:120, "borderWidth":2}} draggable={"true"} onDragStart={this.followNodeStart} onDragEnd={this.followNodeEnd} onClick={this.processRequest} >
					<NewNode refToPass={newRef.bind(this, id)} key={id} type={type} callback={this.callbackFromNode} />
				</div>
			</Draggable> );

		this.operateOnList( 'add', 'node', id, node );
		return node;
	}// create node

	processRequest( e ) {
		const { requestType:request } = this.state;

		const id = (new Date()).getTime();

		const createNode = this.createNode.bind( this, e, id );

		switch( request ) {
			case 'startNode':
					createNode( 'start' );
					break;
			case 'notify':
					createNode( 'notify' );
					break;
			case 'countdown':
					createNode( 'countdown' );
					break;
			case 'countup':
					createNode( 'countup' );
					break;
			case 'counter+':
					createNode( 'counter+' );
					break;
			case 'counter-':
					createNode( 'counter-' );
					break;
			case 'todoList':
					createNode( 'todoList' );
					break;
			case 'straightEdge':
				{
					// if it is not a node, do not create edge
					let nodeCenter = getParentElementWithClassName( e.target, 'node' );

					if( nodeCenter === null ) { break; }

					// set edge to node's center
					const { left, right, top, bottom } = nodeCenter.getBoundingClientRect();

					const [ centerX, centerY ] = [ (left+right)/2, (top+bottom)/2 ];

					// make it three points so that we can add arrow
					const points = `${centerX},${centerY} `.repeat( 3 );

					const edge = <EdgeLine key={id} id={id} points={points} markerMid="url(#arrow)" onClick={this.processRequest}/>

					const nodeID = +nodeCenter.parentElement.id;
					const edgeID = id;

					// other end of edge follows mouse
					this.followMouseFunction = function( e ) { followMouse( id, e ) };
					document.addEventListener( 'mousemove', this.followMouseFunction );

					// update 
					this.operateOnList( 'add', 'edge', id, edge );

					this.setState( { requestType:'straightEdge1', temp:[ nodeID, edgeID ] } );
					break;
				}
			case 'straightEdge1':
				{
					// end of edge; stop follows mouse
					document.removeEventListener( 'mousemove', this.followMouseFunction );

					let nodeCenter = getParentElementWithClassName( e.target, 'node' );

					if( nodeCenter === null ) { 
						this.undoEdge();
						break;
					}// if

					const { nodes, edges, temp:[startNodeID, edgeID] } = this.state;

					// prevent duplicate edges
					const { nextNodeIDs, edgeStart:nodeEdgeStart } = nodes[ startNodeID ];

					const endNodeID = +nodeCenter.parentElement.id;

					const testDuplicateEdge = nextNodeIDs.find( node => node === endNodeID );

					if( testDuplicateEdge !== undefined || startNodeID === endNodeID ) {
						this.undoEdge();
						break;
					}// if 

					// set edge to node's center
					const { left, right, top, bottom } = nodeCenter.getBoundingClientRect();

					const [ centerX, centerY ] = [ (left+right)/2, (top+bottom)/2 ];

					followCoord( edgeID, centerX, centerY );

					// update
					this.operateOnList( 'update', 'edge', edgeID, [startNodeID, endNodeID] );

					this.setState( { requestType:this.props.type, temp:null } );
					break;
				}
			case 'delete':
				{
					const nodeToRemove = getParentElementWithClassName( e.target, 'draggable' );
					const edgeToRemove = getParentElementWithClassName( e.target, 'edge' );

					switch( true ) {
						case nodeToRemove !== null:
							this.operateOnList( 'delete', 'node', nodeToRemove.id );
							break;
						case edgeToRemove !== null:
							this.operateOnList( 'delete', 'edge', edgeToRemove.id );
							break;
						default:
					}//switch
					break;
				}
			default:
				return -1;
		}// switch
	}// process request

	operateOnList( operation, type, id, object ) {
		id = +id;

		switch( operation )
		{
			case 'add' :
				this.addToList( type, id, object );
				break;
			case 'update':
				this.updateList( type, id, object );
				break;
			case 'delete':
				this.deleteFromList( type, id );
				break;
			default:
				return -1;
		}// switch
	} // update list

	addToList( type, id, object ) {
		const updateMap = ( type ) => {
			this.setState( state => ({
				[type]:{
					...state[type],
					[id]:{ data:object, nextNodeIDs:[], edgeStart:[], edgeEnd:[] }
				}// nodes
			}) );// set state;
		};// update map

		switch( type ) {
			case 'node':
				updateMap( 'nodes' );
				break;
			case 'edge':
				updateMap( 'edges' );
				break;
		}// switch
	}// add to list

	updateList( type, id, object ) {
		switch( type ) {
			case 'node':
				break;
			case 'edge':
				{
					const [ startNodeID, endNodeID ] = object;
					const edgeID = id;

					const updateEdges = edges => {
						const currEdge = edges[ edgeID ];

						let { edgeStart, edgeEnd } = currEdge;

						edgeStart = [ ...edgeStart, startNodeID ];
						edgeEnd   = [ ...edgeEnd  , endNodeID ];

						const updatedCurrEdge = { ...currEdge, edgeStart, edgeEnd };

						return { ...edges, [edgeID]:updatedCurrEdge };
					}// update edges

					const updateNodes = nodes => {
						let [ startNode, endNode ] = [ nodes[startNodeID], nodes[endNodeID] ];

						{
							let { nextNodeIDs, edgeStart } = startNode;

							nextNodeIDs = [ ...nextNodeIDs, endNodeID ];
							edgeStart   = [ ...edgeStart, edgeID ];

							startNode = { ...startNode, nextNodeIDs, edgeStart };
						}// start node

						{
							let { edgeEnd } = endNode;

							edgeEnd = [ ...edgeEnd, edgeID ];

							endNode = { ...endNode, edgeEnd };
						}// end node

						return { ...nodes, [startNodeID]:startNode, [endNodeID]:endNode };
					}// update nodes

					this.setState( state => {
						let { edges, nodes } = state;

						const updatedEdges = updateEdges( edges );
						const updatedNodes = updateNodes( nodes );

						return {
							edges:updatedEdges,
							nodes:updatedNodes,
						};// return
					});// set state
				}
		}// switch
	}// update list

	deleteFromList( type, id ) {
		switch( type ) {
			case 'node':
				{
					const nodeID = id;

					// remove all the connected edges first
					const { edgeStart, edgeEnd } = this.state.nodes[ nodeID ];

					const edgesToDelete = [ ...edgeStart, ...edgeEnd ];

					edgesToDelete.forEach( edge => this.operateOnList( 'delete', 'edge', edge ) );
					this.forceUpdate();

					// remove node
					this.setState( state => {
						const { [nodeID+'']:_, ...updatedNodes } = state.nodes;

						return { nodes:updatedNodes };
					}); // set state
					break;
				}
			case 'edge':
				{
					const currEdgeID = id;

					// updates, node's edgeStart, endgeEnd, and nextNodeIDs
					const removeConnectionFromNode = ( nodes, nodeID, edgeID ) => {

						if( !nodeID ) { return {}; };

						let { edgeStart, edgeEnd, nextNodeIDs } = nodes[ nodeID ];

						// index of removed id
						const index = edgeStart.findValueIndex( edgeID );

						edgeStart = edgeStart.removeFirstMatch( edgeID );
						edgeEnd   = edgeEnd.removeFirstMatch( edgeID );

						nextNodeIDs = nextNodeIDs.splice2( index );

						return { edgeStart, edgeEnd, nextNodeIDs };
					}// remove edge from node

					this.setState( state => {
						const { nodes, edges } = state;

						const currEdge = edges[ currEdgeID ];

						const nodeStartID = currEdge.edgeStart[0];
						const nodeEndID   = currEdge.edgeEnd[0];

						if( currEdge === void 0 ) { return {}; }

						// update edge connections of nodes
						const nodeStart = nodes[ nodeStartID ];
						const nodeEnd   = nodes[ nodeEndID ];

						// can't think of good variable name
						const XnodeStart = removeConnectionFromNode( nodes, nodeStartID, currEdgeID );
						const XnodeEnd   = removeConnectionFromNode( nodes, nodeEndID, currEdgeID );

						// remove edge
						const { [currEdgeID+'']:_, ...updatedEdges }  = edges;

						return {
							nodes:{
								...nodes,
								[nodeStartID]:{...nodeStart, ...XnodeStart},
								[nodeEndID]:{...nodeEnd, ...XnodeEnd}
							},// nodes

							edges:updatedEdges,
						};// nodes object
					});// set state
					break;
				}
			default:
				return -1;
		}// switch
	}// delete from list

	// get next nodes and trigger them
	callbackFromNode( newNodeDOM, end=false ) {
		const currNodeDOM = getParentElementWithClassName( newNodeDOM, 'node' );

		currNodeDOM.style.border = '2px solid black';

		if( end ) return;

		const currID = +currNodeDOM.id;

		const nextNodeIDs = this.getNextNodeIDs( currID );

		nextNodeIDs.forEach( nodeID => {
			const draggableDOM = document.getElementById( nodeID );
			const nodeDOM = getChildElementWithClassName( draggableDOM, 'node' );

			nodeDOM.style.border = '7px solid purple';

			// ref
			const { nodes } = this.state;
			const nodeRef = nodes[nodeID].ref;

			nodeRef.callbackNextNode( { target:nodeDOM } );
		});// foreach
	}// callback from clock

	getNextNodeIDs( id ) {
		id = +id;

		const { nodes, edges } = this.state;
		const node = nodes[ id ];

		if( node === void 0 ) return [];

		const nextEdgeIDs = node.edgeStart;
		const nextNodeIDs = nextEdgeIDs.map( edgeID => edges[edgeID].edgeEnd );

		return nextNodeIDs.flat();
	}// next node ids

	render() {
		const { nodes, edges } = this.state;

		// map => values() => data:
		const mapToData = map => Array.from( Object.values(map), (x => x.data) );

		return ( 
			<div id='lists'>
				{
					mapToData( nodes )
				}

				<div id="canv">
					<svg height="100%" width="100%" onClick={this.processRequest}>
						<defs>
							<marker id="arrow" markerWidth="10" markerHeight="4" refX="3" refY="3" orient="auto" markerUnits="strokeWidth" viewBox="0 0 20 20">
								<path d="M0,0 L0,6 L9,3 z" fill="#f00" />
							</marker>
						</defs>
						{
							mapToData( edges )
						}
					</svg>
				</div>
			</div>
		);// return
	}// render
}// graph

/////////////////////////////////////////////////// VERTEXT COLLECTOR
class Graphx extends Component
{
	constructor( props ) {
		super( props );
		this.state = {
			//id:ref
		}// state
	}// constructor

	newID() {
		return (new Date()).getTime();
	}// new id

	addVertex() {
		const { newID, newRef } = this;
		const { type } = this.props;

		const id  = newID();
		const ref = React.CreatRef();

		const jsx = <Vertex type={type} key={id} id={id} width={200} height={150} bWidth={2} refToPass={ref} />;

		this.setState( { [id]:{jsx, ref} } );
	}// add vertex

	getDerivedStateFromProps( nextProps, prevState ) {
	}// get derived state from props

	render() {
	};
}// vertex collector

/////////////////////////////////////////////////// NODE
const NODE_WIDTH  = 200;
const NODE_HEIGHT = 120;
const NODE_BWIDTH = 2;

class Vertex extends Component
{
	constructor( props ) {
		super( props );
		const { width, height, bWidth, centerX, centerY, title, id, callback, type } = props;
		this.state = {
			width   : width   || NODE_WIDTH,
			height  : height  || NODE_HEIGHT,
			bWidth  : bWidth  || NODE_BWIDTH,
			centerX : centerX || 0,
			centerY : centerY || 0,
			id      : id      || 0,
			title   : title   || 'TITLE',
			type    : type    || 'START',

			callback : callback || ( ()=>{} ),

			node:null,

			// id are used
			edgeInID    : [],
			edgeOutID   : [],
			nextNodeIDs : [],
		};// state
	}// constructor


	nodeBorder( dom, width, color ) {
		const currNodeDOM = getParentElementWithClassName( dom, 'node' );
		currNodeDOM.style.border = `${width}px solid ${color}`;
	}// node border

	callback( clockDOM, end=false ) {
		const { nexNodeIDs } = this.state;

		nodeBorder( clockDOM, 2, 'black' );

		if( end ) return;

		nextNodeIDs.forEach( nodeID => {
			const draggableDOM = document.getElementById( nodeID );

			nodeBorder( 7, 'purple' );
			const nodeDOM = getChildElementWithClassName( dom, 'node' );
			nodeDOM.style.border = '7px solid purple';

			// ref
			const { nodes } = this.state;
			const nodeRef = nodes[nodeID].ref;

			nodeRef.callbackNextNode( { target:nodeDOM } );
		});// foreach
	}// callback from clock

	getNextNodeIDs( id ) {
		id = +id;

		const { nodes, edges } = this.state;
		const node = nodes[ id ];

		if( node === void 0 ) return [];

		const nextEdgeIDs = node.edgeStart;
		const nextNodeIDs = nextEdgeIDs.map( edgeID => edges[edgeID].edgeEnd );

		return nextNodeIDs.flat();
	}// next node ids

	render() {
		const { width, height, bWidth, centerX:x, centerY:y, title, id, callback, ref,type } = this.state;

		return (
			<Draggable id={id} style={{left:x-width/2, top:y-height/2}}>
				<div className='node' id={id} style={{width:width, height:height, "borderWidth":bWidth}} >
					<NewNode refToPass={ref} type={type} callback={callback} />
				</div>
			</Draggable>
		);// return
	}// render
}// vertex

/////////////////////////////////////////////////// EDGE
class EdgeLine extends Component
{
	constructor( props ) {
		super( props );
		this.state = {
			id: props.id || 0,
			points: props.points || '0,0 0,0',
			startNodeID: 0,
			endNodeID: 0,
		};// state

	}// constructor

	render() {
		const { id, points } = this.state;

		return (
			<polyline className='edge' id={id} points={points} markerMid={this.props.markerMid} style={{stroke:"rgb(255,255,0)", strokeWidth:10}} />
		);// return
	}// render
}// edge

export default Graph;
export { EdgeLine, Vertex }

/*
function range( start, end, step, includeStart=true, includeEnd=true )
{
	start += includeStart ? 0 : step;
	end   += (includeEnd || end%step !== 0) ? 0 : -step;

	const length = (end-start)/step + 1;
	const fn     = (_,i) => start + i*step;

	return Array.from( {length}, fn );
}// range

function trigLength( start, end )
{
	const { round, sqrt, pow } = Math;
	const [ startX, startY ] = start;
	const [ endX  , endY ]   = end;

	// sqrt( x^2 + y^2 )
	return round( sqrt(pow(endX-startX,2) + pow(endY-startY,2)) );
}// trigLength
*/

