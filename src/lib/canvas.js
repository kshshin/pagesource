import React, { Component } from 'react';
import Graph from './graph.js';
import './canvas.css';

class Canvas extends Component
{
	constructor( props ) {
		super( props );

		this.state = {
			requestType:'move', // newNode, straightEdge1, angledEdge, delete, move, zoomIn, zoomOut, moveAround
			clear: 'clear',
		};// state

		this.updateRequest = this.updateRequest.bind( this );
	}// constructor

	updateRequest( e ) {
		const request = e.target.getAttribute('v');

		// clear all
		if( request === 'clear' &&
			window.confirm('Are you sure you want to clear all?') )
		{
			this.setState( { clear:'clearAll' } );
		} else { 
			this.setState( { clear:'clear' } );
		}// if/else

		this.setState( { requestType: request } );
	}// update request type

	render() {
		const { requestType, clear } = this.state;
		const { updateRequest } = this;
		return (
			<div>
				{ Buttons( updateRequest ) }
				<Graph key={clear} type={requestType} />
			</div>
		);// return
	}// render
}// canvas

		
function Buttons( callback )
{
	return (
		<div className='controls' >
			<input type='button' value='move'      v='move'         onClick={callback} />
			<input type='button' value='start'     v='startNode'    onClick={callback} />
			<input type='button' value='notify'    v='notify'       onClick={callback} />
			<input type='button' value='countdown' v='countdown'    onClick={callback} />
			<input type='button' value='countup'   v='countup'      onClick={callback} />
			<input type='button' value='counter+'  v='counter+'     onClick={callback} />
			<input type='button' value='counter-'  v='counter-'     onClick={callback} />
			<input type='button' value='todo'      v='todoList'     onClick={callback} />

			<input type='button' value='edge'      v='straightEdge' onClick={callback} />

			<input type='button' value='delete'    v='delete'       onClick={callback} />
			<input type='button' value='clear'     v='clear'        onClick={callback} />

		</div>
	);// return
}// buttons


export default Canvas;
