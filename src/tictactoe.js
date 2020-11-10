import React, {Component} from 'react';
import './tictactoe.css';

function TTTButton(props)
{ 
	if (props.gameover === true)
	{
		if (props.owner === 0)
		{ return (
			<button className="GameDisabled">
				<span className="TextBox"></span>
			</button>
		)}
		else if (props.owner !== props.gamewinner)
		{ return (
			<button className="GameLost">
				<span className="TextBox Gray">{props.owner===1 ? "P1" : "P2"}</span>
			</button>
		)}
		else if (props.hilite === true)
		{ return (
			<button className={"Winner" + (props.owner===1 ? "PosOne" : "NegOne")} color="#555522">
				<span className="TextBox">{props.owner===1 ? "P1" : "P2"}</span>
			</button>
		)}
	}
	//console.log(props.id + " owned by " + props.owner)
	if (props.owner !== 0)
	{
		return (
			<button className={"Locked" + (props.owner===1 ? "PosOne" : "NegOne")} color="#555522">
				<span className="TextBox">{props.owner===1 ? "P1" : "P2"}</span>
			</button>
		)
	}
	else // no owner, free to play
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
	Hilite = [] // used to select which positions won the game
	constructor(props) // props may have size?
	{
		super(props)
		this.reset = this.reset.bind(this);
		this.state = {
			current_player: 1,
			game_over: false,
			game_winner: 0,
			width: 3,
		}
		this.reset(false)
	}

	reset(resetState = true)
	{	
		if (resetState)
		{
			this.setState({
			current_player: 1,
			game_over: false,
			game_winner: 0,
			})
		}
		// initialize grid with raw data
		this.Grid = [];
		this.Hilite = [];
		console.log("initing new grid of width " + this.state.width);
		for (let row = 0; row < this.state.width; row++)
		{
			var comp = [] // List of data, accessed via column
			for (var column = 0; column < this.state.width; column++)
			{
				var id = row * this.state.width + column
				comp.push(
					{
						id : id,
						owner : 0,
					}
				)
			}
			//console.log("comp" + row)
			//console.log(comp)
			this.Grid.push(comp);
			let width = this.state.width;
			this.Hilite.push(new Array(width).fill(false));
		}
		//console.log("this grid")
		//console.log(this.Grid)
		//console.log(this.Hilite)
	}

	handleClick(id)
	{
		// check for game condition
		if (this.state.game_over === true){ return; }
		//console.log("CLICKED " + id);
		let column = id % this.state.width;
		let row = Math.floor(id / this.state.width);
		//console.log(`COORD R${row} C${column}`)
		this.Grid[row][column].owner = this.state.current_player
		//console.log("Set " + this.Grid[row][column].id + 
		//	" to owned by " + this.state.current_player + " : " +
		//	this.Grid[row][column].owner)
		this.setState({current_player: this.state.current_player * -1})

		// after a cell is selected, check for win conditions
		// check all possibilities, since each move can only result in
		// a single winner and never a tie, but a player may win in more than one way
		// horizontals, i.e. rows, i.e. first axis
		let winner = 0; // if zero, no winner.
		for (let i = 0; i < this.Grid.length; i++)
		{
			let row = this.Grid[i];
			if (this.isAllSame(row))
			{
				winner = row[0].owner;
				this.Hilite[i].fill(true);
				console.log("ROW WINNER is " + winner + " at row " + i)
			}
		}
		// verticals, i.e. columns, i.e. second axis
		for (let i = 0; i < this.Grid[0].length; i++)
		{
			let column = this.Grid.map((row)=>{return row[i]})
			if (this.isAllSame(column))
			{
				winner = column[0].owner;
				this.Hilite = this.Hilite.map((row)=>{let r = row; r[i] = true; return r;})
				console.log("COL WINNER is " + winner + " at col " + i)
			}
		}
		// diagonals
		let upperLeft = this.Grid.map((elem, index)=>{return elem[index]})
		if (this.isAllSame(upperLeft))
		{
			winner = upperLeft[0].owner;
			this.Hilite = this.Hilite.map((row, index)=>{let r = row; r[index] = true; return r;})
			console.log("DIA WINNER is " + winner + " at upperLeft")
		}
		let kiara = this.Grid.map((elem, index)=>{return elem[this.Grid.length - 1 - index]})
		if (this.isAllSame(kiara))
		{
			winner = kiara[0].owner;
			this.Hilite = this.Hilite.map((row, index)=>{let r = row; r[this.Grid.length - 1 -index] = true; return r;})
			console.log("DIA WINNER is " + winner + " at kiara")
		}
		// set game state if we have a winner
		if (winner !== 0) 
		{ 
			this.setState(
				{
					game_over: true,
					game_winner: winner
				}
			); 
			//console.log(this.Grid);
			//console.log(this.Hilite);
		}
	}

/** @param {Array} array 
 * @description Returns true if all element.owner values are the same in an
 * array, and also non-zero.
*/
	isAllSame(array)
	{
		let first = array[0].owner;
		if (first === 0) { return false; }
		for (let i = 1; i < array.length; i++)
		{
			if (array[i].owner !== first) { return false; }
		}
		return true;
	}

	render() {
		//console.log("rendering...")
		return (
		<div>
			<div className="App Short" style={{borderCollapse:"collapse", paddingBottom:"0px"}}>
				<div className="TextBox" style={{fontSize: "16px", verticalAlign: "bottom"}}>
					A simple tic-tac-toe game.
					<br/>Connect <b>all</b> cells in a row, column, or diagonal.
				</div>
			</div>
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
										gameover = {this.state.game_over}
										gamewinner = {this.state.game_winner}
										hilite = {this.Hilite[indr][indc]}
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
			<table className="App Short" style={{borderCollapse:"collapse"}}>
				<tbody>
					<tr key="0">
						<td className="TextBox" style={{fontSize: "16px", verticalAlign: "bottom"}}>
						Grid width: <span>
							<input id="gridWidthInput" type="number" size={3} maxLength={2} min={0} max={20} defaultValue={this.state.width}/>
							</span>
						</td>
						<td>
							
						</td>
					</tr>
					<tr key="1"><td>
						<div style={{textAlign:"center"}}><button className="Reset" 
							onClick={()=>
								{
									let v = document.getElementById("gridWidthInput");
									console.log(v.value);
									// setstate is async, reset is callback
									this.setState({width: Number(v.value)}, ()=>{this.reset()});
								}
							} style={{textAlign:"center"}}>
								Reset
							</button></div>
					</td></tr>
				</tbody>
			</table>
		</div>
		)
	}
}

export default Form;
