import React, { Component } from 'react';

class TextInputBoxCollector 
{
	constructor() {
		// collection of generated textinput boxes
		this.state = {};// state
	}// constructor


	addToCollection = ( newBox ) => {
		const id = newBox.state.milSec;

		this.state = { ...this.state, [id]:newBox };
	}// update collection


	removeFromCollection = ( newBox ) => {
		const id = newBox.state.milSec;

		delete this.state[id];
	}// update collection

	closeRest = ( id ) => {
		const textList = Object.keys( this.state );

		textList.forEach( key => {
			if( +key !== +id ) {
				this.state[key].undoAndClose();
			}// if
		});// foreach
	}// close rest

	// clicking something else will close all the textinput boxes
	appClassOnClickCloseRest = ( e ) => {
		// this.closeRest( e.target.id );
	}// only in App class
}// text input main

const textboxCollection = new TextInputBoxCollector();
/////////////////////////////////////

class TextInputBox extends Component
{
	constructor( props ) {
		super( props );

		this.state = {
			text       : this.props.text || 'Clock',
			tempText   : this.props.text || 'Clock',
			modifyText : false,
			milSec     : (new Date()).getTime()
		};// state

		this.toggleToModify = this.toggleToModify.bind( this );
		this.onReturnKey    = this.onReturnKey.bind( this );
		this.textOnChange   = this.textOnChange.bind( this );
		this.undoAndClose   = this.undoAndClose.bind( this );
	}//constructor

	componentDidMount() {
		textboxCollection.addToCollection( this );
	} //

	componentWillUnmount() {
		textboxCollection.removeFromCollection( this );
	} //

	// update on 'return key'
	onReturnKey( e ) {
		if( e.which !== 13 ) {
			return;
		}// if

		this.toggleToModify();
	}// on return


	toggleToModify( e ) {
		textboxCollection.closeRest( this.state.milSec );

		this.setState( { text: this.state.tempText } );

		// set text to {blank} when nothing is inputed
		if( this.state.tempText.length === 0 ||
			/^\s+$/.test( this.state.tempText ) )
		{
			this.setState( () => ({ text:'{blank}', tempText:'{blank}' }) );
		}// if

		this.setState( { modifyText:!this.state.modifyText } );
	}// toggle to modify


	undoAndClose() {
		this.setState( { modifyText:false } );
	}// toggle to modify


	textOnChange( e ) {
		this.setState( { tempText: e.target.value } );
	}// text on change

	render() {
		const { text, tempText, modifyText, milSec:id } = this.state;
		return (
			<div>
				{
					(!modifyText)
						?  <div id={id} onClick={ this.toggleToModify }> { text } </div>
						: ( <div id={id} className='editbox'>
							<input
								className='editbox'
								type='text'
								value={ tempText }
								onChange={ this.textOnChange }
								onKeyPress={ this.onReturnKey } />
							<input type='button' value='apply' onClick={ this.toggleToModify } />
						</div> )
				}
			</div>
		);// return
	}// render
}// text input

export default TextInputBox;
