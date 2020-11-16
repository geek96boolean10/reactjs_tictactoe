import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import tictactoe from './ttt/tictactoe';
import chess from './chess';
import LastUpdated from './LastUpdated';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';



fetch('https://www.cloudflare.com/cdn-cgi/trace').then(response => {
	return response.text()
}).then(text => {
	let split = text.split('\n')
	// find one with the 'ip' header
	for (let i = 0; i < split.length; i++)
	{
		if (split[i].substr(0, 3) === "ip=")
			return split[i].substr(3).trim()
	}
	return null
}).then(ip => {
	console.log("IP is: " + ip)
})

ReactDOM.render(
	<Router>
		<Switch>
			<Route
				exact path="/" component={chess}
			></Route>
			<Route
				path="/ttt" component={tictactoe}
			></Route>

			<Route render={
				(props)=>{
				//console.log(props)
				return <div>
					<p style={{textAlign:"center"}}>
						The page '{props.location.pathname.substring(1)}' does not exist yet.
					</p>
					<p style={{textAlign:"center"}}>
						<Link to="/">Return to Home</Link>
					</p>
				</div>
				}}>
			</Route>
		</Switch>
	</Router>,
  document.getElementById('root')
);

ReactDOM.render(
	<LastUpdated/>,
	document.getElementById('last-updated')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
