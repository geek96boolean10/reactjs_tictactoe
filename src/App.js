import React, {Component} from 'react';
import './App.css';

function TTTButton(props)
{ 
	console.log(props.id + " owned by " + props.owner)
	if (props.owner !== 0)
	{
		return (
			<button class={"Locked" + (props.owner===1 ? "PosOne" : "NegOne")} color="#555522">
				<span className="TextBox">{props.owner}</span>
			</button>
		)
	}
	else
	{
		return (
			<button onClick={()=>props.onClick(props.id)}>
				<span className="TextBox">{props.owner}</span>
			</button>
		);
	}
}

class Form extends Component
{
	Grid = []
	constructor()
	{
		super()
		this.state = {
			current_player: 1
		}
		// initialize grid with raw data
		console.log("initing")
		for (let row = 0; row < 3; row++)
		{
			var comp = [] // List of data, accessed via column
			for (var column = 0; column < 3; column++)
			{
				var id = row * 3 + column
				comp.push(
					{
						id : id,
						owner : 0,
					}
				)
			}
			console.log("comp" + row)
			console.log(comp)
			this.Grid.push(comp)
		}
		console.log("this grid")
		console.log(this.Grid)
	}

	handleClick(id)
	{
		console.log("CLICKED " + id);
		let column = id % 3;
		let row = Math.floor(id / 3);
		console.log(`COORD R${row} C${column}`)
		this.Grid[row][column].owner = this.state.current_player
		console.log("Set " + this.Grid[row][column].id + 
			" to owned by " + this.state.current_player + " : " +
			this.Grid[row][column].owner)
		this.setState({current_player: this.state.current_player * -1})
	}

	render() {
		console.log("rendering...")
		return (
		<div>
			<table className="App">
			<tbody>
				{
				this.Grid.map((row, indr)=>{
					return (
						<tr key={indr}>
						{row.map((column, indc)=>{
							// column is of type dict
							return (
								<td key={column.id}>
									<TTTButton
										owner = {column.owner}
										id = {column.id}
										onClick = {this.handleClick.bind(this)}
									>
									</TTTButton>
								</td>
							)
						})}
						</tr>
					)
				})
				}
			</tbody>
			</table>
		</div>
		)
	}
}

export default Form;
