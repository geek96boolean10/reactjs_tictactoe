import React, {Component} from 'react';
import './LastUpdated.css'

class LastUpdated extends Component
{
	componentDidMount()
	{
		fetch(
			"https://api.github.com/repos/geek96boolean10/reactjs_tictactoe/branches/master"
		).then(response => {
			response.json().then(json => {
				console.log("Got commit data.");
				this.setState({
				author: json.commit.author.login,
				branch: json.name,
				date: json.commit.commit.author.date,
				sha: json.commit.sha,
				link: json._links.html
				});
			});
			})
			.catch(error => {
			console.log(error);
			});
	}

	render()
	{
		let date = this.state?.date.slice(0,10);
		let time = this.state?.date.slice(11,19)
		return <span className="Text">
			<div>
				<code>The latest commit for this page occurred at <br/>
				{date} {time} UTC.</code>
			</div>
		</span>
	}
}

export default LastUpdated
