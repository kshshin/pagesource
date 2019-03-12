import { Component } from 'react';

///////////////// NON-TIMER
class NonTimer extends Component {
	constructor( props ) {
		super( props );

		const { msecBase, callback } = props;

		this.state = {
			msecBase: msecBase ? msecBase : 0,
			callback: callback || ( ()=>{} ),
		}; // state

		this.callbackNextNode = this.callbackNextNode.bind( this );
	}//constructor

	callbackNextNode( e, end=false ) {
		const { callback, msecBase } = this.state;
		setTimeout( callback, msecBase, e.target, end );
	}// reset clock
}// non-timer

///////////////// TIMER
// INTERVAL is set with function 'tick'; child should have tick function for interval
// callbackNextNode(=restartTime) -> interval( this.tick )
class Timer extends Component
{
	constructor( props ) {
		super( props );
		this.timerState = { START:Symbol.for('START'), PAUSE:Symbol.for('PAUSE'), STOP:Symbol.for('STOP') };

		const { msecBase, time } = props;

		this.state = {
			msecBase: msecBase ? msecBase : 1000,
			maxTime : Math.max( time || 0, 0 ),
			currTime: Math.max( time || 0, 0 ),

			timeUpdateFunction: ( x => x-1 ),

			isCountup : false,

			dom : null,
			timerState: this.timerState.STOP,
		}; // state

		this.tick = this.tick.bind( this );
		this.restartTime = this.restartTime.bind( this );
		this.pauseResume = this.pauseResume.bind( this );
		this.callbackNextNode = this.restartTime.bind( this );
	}//constructor

	format( seconds ) {
		const padZero = ( num, pad=2 ) => Math.floor(num).toString().padStart(pad,'0');

		const hh = padZero( seconds/3600    );
		const mm = padZero( seconds%3600/60 );
		const ss = padZero( seconds%60      );

		return `${hh}:${mm}:${ss}`;
	}// format

	restartTime( e ) {
		this.setState( { dom: e.target } );

		// remove old and create new INTERVAL
		this.stopTime();
		this.resetCurrTime();
		this.startTime();
	}// restart clock

	resetCurrTime() {
		const { maxTime } = this.state;
		this.setState( { currTime: maxTime } );
		this.forceUpdate();
	}// reset curr tick

	startTime() {
		this.setState( { timerState: this.timerState.START } );

		const { msecBase } = this.state;

		// INTERVAL + this.tick
		this.intervalID = setInterval( this.tick, msecBase );
	}// startTime

	pauseTime() {
		this.setState( { timerState: this.timerState.PAUSE } );

		if( this.intervalID === void 0 ) { return; }

		// INTERVAL + this.tick
		this.intervalID = clearInterval( this.intervalID );
	}// pause Time

	stopTime() {
		this.pauseTime();
		this.setState( { timerState: this.timerState.STOP } );
	}// pause Time

	pauseResume() {
		const { timerState:state } = this.state;
		const { START, PAUSE }     = this.timerState;

		// if timer is on STOP, nothing happens
		switch( state ) {
			case START:
				return this.pauseTime();
			case PAUSE:
				return this.startTime();
			default:
		}// switch
	}// pause resume

	componentWillUnmount() {
		this.pauseTime();
	}// component did mount
}// timer

export { NonTimer, Timer };
