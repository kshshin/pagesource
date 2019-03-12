/* eslint-disable */
import React, { Component } from 'react';
import './newnode.css'; // empty

import TextInputBox from './textinputbox.js';
import { NonTimer, Timer } from './timer.js';

const { log }  = console;
const testPrint = ( str='' ) => log( '----->', str );

///////////////// NEW NODE
function NewNode( props )
{
	const { type, callback, refToPass } = props;

	const child = {
		'start'    : { name : 'START'     , jsx : <StartNode ref={refToPass} callback={callback}/> },
		'counter+' : { name : 'COUNTER+'  , jsx : <CounterP  ref={refToPass} callback={callback}/> },
		'counter-' : { name : 'COUNTER-'  , jsx : <CounterN  ref={refToPass} callback={callback}/> },

		'notify'   : { name : 'NOTIFICATION', jsx : <NotificationNode  ref={refToPass} callback={callback}/> },

		'countdown': { name : 'COUNT DOWN', jsx : <CountdownTimer ref={refToPass} callback={callback}/> },
		'countup'  : { name : 'COUNT UP'  , jsx : <CountupTimer   ref={refToPass} callback={callback}/> },

		'todoList'  : { name : 'TODO'     , jsx : <TodoList ref={refToPass} callback={callback}/> },
	};// child

	return (
		<div>
			<div className='node-title'>
				<h3>
					<TextInputBox text={ child[type].name } />
				</h3>
			</div>
			<div className='node-body'>
				{ child[type].jsx }
			</div>
		</div>
	); //return
}// new node fractory function

///////////////// START NODE
class StartNode extends NonTimer
{
	render() {
		return (
			<input type='button' value='start' onClick={this.callbackNextNode} />
		);// return
	}// render
}// start

///////////////// COUNTER+ NODE
class CounterP extends NonTimer
{
	constructor( props ) {
		super( props );

		this.state = {
			...this.state,
			count: props.count || 0,
		};// state

		this.resetCount = this.resetCount.bind( this );
		this.callbackNextNode = this.updateCount.bind( this );
	}// constructor 

	// override
	updateCount( e ) {
		const { count } = this.state;
		this.setState( () => ({ count : count+1 }) );
		super.callbackNextNode( e );
	}// callback

	resetCount( e ) {
		this.setState( { count: 0 } );
	}// reset count

	render() {
		const { count } = this.state;

		return (
			<div>
				<p> {count} </p>
				<input type='button' value='reset' onClick={this.resetCount} />
				</div>
		);// return
	}// render
}// counter

///////////////// COUNTER- NODE
class CounterN extends NonTimer
{
	constructor( props ) {
		super( props );

		const { maxCount } = props; // for later use

		this.state = {
			...this.state,
			maxCount : maxCount || 0,
			currCount: maxCount || 0,
		};//state

		this.resetCount    = this.resetCount.bind( this );
		this.setCountValue = this.setCountValue.bind( this );

		this.callbackNextNode = this.updateCount.bind( this );
	}// constructor 

	// overrides callbackNextNode
	updateCount( e ) {
		const { currCount } = this.state;

		if( currCount > 0 ) { 
			this.setState( () => ({ currCount : currCount-1 }) );
			super.callbackNextNode( e );
		}// if
		else {
			super.callbackNextNode( e, true ); // end
		}
	}// callback

	resetCount( e ) {
		const { maxCount } = this.state;

		this.setState( { currCount: maxCount } );
	}// reset count

	setCountValue( e ) {
		const { target } = e;

		const input = parseInt( target.value );
		const newCount = Math.max( input, 0 );

		this.setState( { maxCount:newCount, currCount:newCount } );
	}// set count value


	render() {
		const { currCount, maxCount } = this.state;

		return (
			<div>
				<input type='text' onChange={this.setCountValue} />
				<p> {currCount} / {maxCount} </p>
				<input type='button' value='reset' onClick={this.resetCount} />
			</div>
		);// return
	}// render
}// counter

///////////////// NOTIFICATION NODE
import alarmFile from '../notification/digitalAlarm.wav';
import whistleFile from '../notification/whistle.wav';
class NotificationNode extends NonTimer
{
	constructor( props ) {
		super( props );

		const set = ( isOn, file ) => ({ isOn, file });

		// make sure to import sound files
		this.state = {
			...this.state,
			alarm   : set( true, alarmFile ),
			whistle : set( false, whistleFile ),
		};// state

		this.toggle = this.toggle.bind( this );
		this.callbackNextNode = this.notify.bind( this );
	}// constructor

	playSound( file ) {
		const audio = new Audio( file );
		audio.play();
	}// play sound

	// override
	notify( e ) {
		const state = this.state;

		const keys = Object.keys( state );

		for( let sound of keys ) {
			const { isOn, file } = state[sound];
			isOn ? this.playSound(file) : 0
		}// for

		super.callbackNextNode( e );
	}// callback

	toggle( e ) {
		const { name } = e.target;
		const {isOn, file} = this.state[name];
		this.setState( { [name]:{ isOn:!isOn, file } } );
	}// toggle

	render() {
		const checkbox = type => <input name={type} type='checkBox' checked={ this.state[type]['isOn'] } onChange={ this.toggle }/>

		return (
			<div>
				Alarm   { checkbox('alarm') }
				<br/>
				Whistle { checkbox('whistle') }
			</div>
		);// return
	}// render
}// start

///////////////// COUNTUP TIMER
class CountupTimer extends Timer
{
	tick() {
		const { currTime, callback, dom } = this.state;

		this.setState( { currTime: currTime+1 } );
	}// tick

	render() {
		const { currTime } = this.state;

		return (
			<div>
				<input type='button' value='pause/resume' onClick={this.pauseResume} />
				<p> { this.format(currTime) } </p>
			</div>
		); // return
	}// render
}// clock


///////////////// COUNTDOWN TIMER
class CountdownTimer extends Timer
{
	constructor( props ) {
		super( props );

		const { callback } = props;

		this.state = {
			...this.state,
			callback,
		};// state
		
		this.setInputTime = this.setInputTime.bind( this );
	}// constructor

	componentDidMount() {
	}// component did mount

	checkEOT( bool=true ) {
		const { callback, dom } = this.state;

		if( !bool ) { return; }

		callback( dom );
		this.stopTime();
		this.resetCurrTime();
	}// end of time

	tick() {
		const { currTime } = this.state;

		this.setState( () => ({ currTime: currTime-1 }) );

		this.checkEOT( currTime <= 1 );
	}// tick

	// override
	restartTime( e ) {
		const { currTime } = this.state;

		super.restartTime( e );

		this.checkEOT( currTime <= 0 );
	}// reset time

	setInputTime( e ) {
		const input = e.target.value;
		const time = input.split(':');

		if( time && time.length <= 0 ) return 0;

		const newTime = time.reduce( (acc, t) => {
			return acc*60 + (+t);
		}, 0 ); // reduce

		this.setState( { maxTime:newTime, currTime:newTime } );
	}// set input time

	render() {
		const { currTime } = this.state;

		return (
			<div>
				<input type='button' value='pause/resume' onClick={this.pauseResume} />
				<input type='text' onChange={this.setInputTime} />
				<p> { this.format(currTime) } </p>
			</div>
		); // return
	}// render
}// clock


///////////////// TO-DO LIST
class TodoList extends NonTimer
{
	constructor( props ) {
		super( props );

		this.state = {
			...this.state,
			items:[],
			total:0,
		};// state

		this.addItem    = this.addItem.bind( this );
		this.removeItem = this.removeItem.bind( this );
	}// constructor

	addItem( form ) {
		form.preventDefault();
		const { total, items } = this.state;
		const { target } = form;

		const inputDOM = [...target.childNodes].find( node => {
			return node.type === 'text';
		});// find

		const newItem = inputDOM.value;

		this.setState( {
			items: [ ...items, newItem ],
			total: total+1,
		} );// set state
	}// add item

	removeItem( e ) {
		const parentDOM = e.target.parentNode;
		const index = +parentDOM.id;

		this.setState( () => {
			const { items } = this.state;
			const start = items.slice( 0, index );
			const end   = items.slice( index+1 );
			return { items:[ ...start, ...end ] };
		});// set state
	}// remove item

	formatList() {
		const { items } = this.state;

		const itemListHTML = items.map( (item,i) => (
				<li key={'itemList'+i} id={i} style={{padding:'auto'}}>
					<div className='todoItem'> { item } </div>
					<input className='todoRemove' type='button' value='x' onClick={this.removeItem}/>
				</li>
		));// map

		return (
			<ul style={ {padding:0, margin:0} }>
				{ itemListHTML }
			</ul>
		);// return
	}// format list

	render() {
		return (
			<div>
				<form onSubmit={this.addItem}>
					<input type='text' placeholder='New Task'/>
					<input type='submit' value='+'/>
				</form>
				<ul>
					{ this.formatList() }
				</ul>
			</div>
		); // return
	}// render
}// clock

export default NewNode;
