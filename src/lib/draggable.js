import React, { Component } from 'react';

class Draggable extends Component
{
	constructor( props ) {
		super( props );

		this.upZIndex  = this.upZIndex.bind( this );
		this.startMove = this.startMove.bind( this );
		this.endMove   = this.endMove.bind( this );
	}// constructor

	upZIndex( e ) {
		var { target:element } = e;
		// find draggable element
		for( let i = 0; i < 100; i++ ) {
			if( element.className === 'draggable' ) { break; }
			element = element.parentElement;
		}// for

		element.style.zIndex = 10;
	}// up z index

	startMove( e ) {
		// mouse coord
		var { pageX:x, pageY:y, target:element } = e;
		const { left, top } = element.getBoundingClientRect();

		// find draggable element
		for( let i = 0; i < 100; i++ ) {
			if( element.className === 'draggable' ) { break; }
			element = element.parentElement;
		}// for

		this.element = element;
		this.left = left;
		this.top  = top;
		this.x = x;
		this.y = y;

		element.style.left = left + "px";
		element.style.top  = top  + "px";

		this.prevChildBorder = element.children[0].style.border || '2px solid black'; 
		element.children[0].style.border = '7px solid blue';
	}// start move

	endMove( e ) {
		const { pageX:currX, pageY:currY } = e;
		const { element, left, top, x:prevX, y:prevY } = this;
		
		// on mouse up, curr x,y becomes zero
		if( currX === 0 && currY === 0 ) return;

		const newLeft = left + (currX-prevX);
		const newTop  = top  + (currY-prevY);

		element.style.left = newLeft + "px";
		element.style.top  = newTop  + "px";

		this.left = newLeft;
		this.top  = newTop;
		this.x = currX;
		this.y = currY;

		element.children[0].style.border = this.prevChildBorder;
		element.style.zIndex = 2;
	}// move
	

	render() {
		return (
			<div
				className="draggable"
				draggable='true'
				id={this.props.id}
				style={{ ...this.props.style, position:'absolute' }}
				onMouseDown = {this.upZIndex}
				onDragStart = {this.startMove}
				onDragEnd   = {this.endMove}
			>
				{this.props.children}
			</div>
		); // return
	}// render
}// test

/////////////////////////////////////

export default Draggable;
