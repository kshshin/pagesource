import React, { Component } from 'react';
import './App.css';
import Canvas from './lib/canvas.js';

class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<Canvas/>
				</header>
			</div>
		);
	}//render
}//app


export default App;

/*
	  npm start
	  Starts the development server.

	  npm run build
	  Bundles the app into static files for production.

	  npm test
	  Starts the test runner.

	  npm run eject
	  Removes this tool and copies build dependencies, configuration files
	  and scripts into the app directory. If you do this, you can’t go back!
*/
