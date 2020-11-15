import React, {Component} from 'react';
import './chess.css';


class Piece extends Component
{
	constructor(props)
	{
		super(props)
		this.state = {
			name: props.name, 
			side: props.side,
			meta: props.meta
		}
	}
	render()
	{
		return <div className={"piece  " + this.state.side}>{`${this.state.side} ${this.state.name}`}</div>
	}
}

function Cell(props)
{
	//console.log("cell render hilite " + props.hilite)
	let el = props.element
	return <td className={"cell " + props.shade}>
		<button className={props.hilite===true?"hilite":null} onClick={props.onClick}>
		{
			props.element !== null ? <Piece name={el.state.name} 
				side={el.state.side} 
				meta={el.state.meta}/> : null
		}
	</button></td>
}

/* 
Chessboard holds pieces, with lite at the top and dark at the bottom,
and therefore A1 at the top left. The board may be rendered opposite;
the data will remain locked as such. 
*/
class Grid extends Component
{
	// hold all game pieces as kv
	constructor(props)
	{
		super(props);
		// generate and fill board; grid is row-first, column-second
		let grid = [];
		for (let row = 0; row < 8; row++)
			grid.push(new Array(8).fill(null))
		// generate dark and lite pawns
		for (let row = 1; row < 8; row += 5)
			for (let col = 0; col < 8; col++)
				grid[row][col] = new Piece({name:"pawn", side: row === 1 ? "lite" : "dark"})
		// generate baselines
		for (let row = 0; row < 8; row += 7)
		{
			// castles
			grid[row][0] = new Piece({name:"castle", side: row === 0 ? "lite" : "dark"})
			grid[row][7] = new Piece({name:"castle", side: row === 0 ? "lite" : "dark"})
			// knights
			grid[row][1] = new Piece({name:"knight", side: row === 0 ? "lite" : "dark"})
			grid[row][6] = new Piece({name:"knight", side: row === 0 ? "lite" : "dark"})
			// bishops
			grid[row][2] = new Piece({name:"bishop", side: row === 0 ? "lite" : "dark"})
			grid[row][5] = new Piece({name:"bishop", side: row === 0 ? "lite" : "dark"})
			// queen
			grid[row][3] = new Piece({name:"queen", side: row === 0 ? "lite" : "dark"})
			// king
			grid[row][4] = new Piece({name:"king", side: row === 0 ? "lite" : "dark"})
		}
		// generate test pawn
		grid[5][4] = new Piece({name:"pawn", side: "lite"})
		// generate hilite overlay grid
		let hilite = this.resetHilite();
		// attach
		this.state = {
			grid: grid,
			hilite: hilite,
			turn: 0,
			selected: null,
		}
		console.log(grid)
	}

	resetHilite() // creates a full hilite grid populated with false
	{
		let grid = []
		for (let row = 0; row < 8; row++)
			grid.push(new Array(8).fill(false))
		return grid
	}

	/* 
	When a piece is selected, show the valid spots for the piece to move to.
	*/
	selectPiece(row, column)
	{
		let piece = this.state.grid[row][column]
		if (piece === null) // reset hilite and deselect
		{
			this.state.hilite = this.resetHilite();
			this.setState({selected: null})
			return; 
		}
		console.log("piece clicked at " + row + ", " + column)
		// reset hilite
		this.state.hilite = this.resetHilite() // mutate; 'state.selected' will be used to trigger render
		switch (piece.state.name)
		{
			case "pawn":
				// if at home pos, move up to two. test each fwd mov for blocking.
				let homeRow = piece.state.side === "lite" ? 1 : 6
				let limit = row === homeRow ? 2 : 1
				let increment = piece.state.side === "lite" ? 1 : -1
				let pawnMutater = (row, column)=>{return {row: row + increment, column: column}}
				this.hilitePosition(row, column, pawnMutater, limit, false)
				// test diag capture too (both directions)
				let rowIncrement = piece.state.side === "lite" ? 1 : -1
				let pawnCaptureMutater = (row, column)=>{return {row: row + rowIncrement, column: column + 1}}
				this.hilitePosition(row, column, pawnCaptureMutater, 1, true, true)
				pawnCaptureMutater = (row, column)=>{return {row: row + rowIncrement, column: column - 1}}
				this.hilitePosition(row, column, pawnCaptureMutater, 1, true, true)
				break;
			case "castle":
				let eastMutator = (row, column)=>{return {row: row, column: column + 1}}
				let westMutator = (row, column)=>{return {row: row, column: column - 1}}
				let northMutator = (row, column)=>{return {row: row - 1, column: column}}
				let southMutator = (row, column)=>{return {row: row + 1, column: column}}
				break;
			default:
				console.log("unknown piece " + piece.state.name)

		}
		// trigger render
		console.log("trying to force render...")
		this.setState({selected: {row:row, column:column}})
	}

	/** 
	@description Sets a series of positions in the hilite grid to be highlighted.
	@param mutater A function that accepts two numbers as coordinates and returns a new property pair as the
	next coordinates to apply; returns null to terminate.
	@param limit The number of cells that may be hilited in one sweep.
	@param allowCapture Determines if the piece, using this mutater, may capture a piece.
	@param mustCapture Only hilites a cell if a capturable piece is in it.
	*/
	hilitePosition(row, column, mutater, limit, allowCapture=true, mustCapture=false)
	{
		//console.log("hling source at " + row + ", " + column)
		// assume initial row and column are the origin; don't hilite it.
		let next = mutater(row, column)
		while (next !== null && limit > 0)
		{

			let occupied = this.testPosition(next.row, next.column)
			//console.log("occupancy:")
			//console.log(occupied)
			if (occupied === null)
			{
				// space is invalid, stop looking
				next = null;
			}
			else if (occupied !== false) // the position is occupied, capture but go no further
			{
				if (allowCapture === true)
				{
					//console.log("setting true")
					this.state.hilite[next.row][next.column] = true;
				}
				next = null; // disable next evaluation
			}
			else // no occupancy, hilite and mutate if not mustCapture
			{
				if (mustCapture !== true)
				{
					this.state.hilite[next.row][next.column] = true;
					next = mutater(next.row, next.column);
					//console.log("next mutater result")
					//console.log(next)
				}
				else
				{
					// can't capture, so halt
					next = null;
				}
			}
			limit -= 1
		}
	}

	/* 
	Tests if a position is occupied. Returns the object if one exists, otherwise returns false.
	Returns null if the position is invalid.
	*/
	testPosition(row, column)
	{
		let obj = this.state.grid[row][column];
		if (obj === undefined)
			return null;
		//console.log("testing position")
		//console.log(obj)
		if (obj === null)
		{
			return false;
		} else {
			return obj
		}
	}

	/*
	If a valid movement is selected, move the selected piece to that location.
	*/
	selectMotion(row, column, targetrow, targetcolumn)
	{
		console.log("select motion")
	}

	getOnClickFunc(row, column)
	{
		// if the space contains a piece only, select piece.
		if (this.state.grid[row][column] !== null && 
			this.state.grid[row][column].name !== null && 
			this.state.hilite[row][column] === false)
		{
			return ()=>{
				console.log("selecting piece")
				this.selectPiece(row, column)
			}
		}
		// if the space is hilited only, select motion.
		else if (this.state.grid[row][column] === null && 
			this.state.hilite[row][column] === true)
		{
			return ()=>{
				console.log("selecting motion")
				this.selectMotion(this.state.selected.row, this.state.selected.column, row, column)
			}
		}
		// if the space has both, capture piece and select motion.
		else if (this.state.grid[row][column] !== null && 
			this.state.grid[row][column].name !== null &&
			this.state.hilite[row][column] === true)
		{
			
		}
		// if neither, no action occurs
	}

	render()
	{
		console.log("rendering")
		return (
			<div>
				<div className="App Short" style={{borderCollapse:"collapse", paddingBottom:"0px"}}>
					<div className="TextBox" style={{fontSize: "16px", verticalAlign: "bottom"}}>
						A chessboard, work in progress. Try <a href="/ttt" style={{color:"white"}}>tic tac toe</a>!
					</div>
				</div>
				<table className="App">
				<tbody>
					{
						this.state.grid.map((row, rowIndex)=>{
							return <tr key={rowIndex}>
								{
									row.map((element, columnIndex)=>
									{
										let shade = (rowIndex + columnIndex) % 2 === 0 ? "dark" : "lite"
										let oCF = this.getOnClickFunc(rowIndex, columnIndex)
										let hl = this.state.hilite[rowIndex][columnIndex]
										//if (hl === true){console.log("hiliting " + rowIndex + ", " + columnIndex + ": " + hl)}
										// Cell onClick should be decided by content of cell or hilite.
										return <Cell 
										key={columnIndex} 
										element={element}
										shade={shade}
										hilite={hl} // true or false
										onClick={oCF}/>
									})
								}
							</tr>
							})
						}
				</tbody>
				</table>
			</div>)
	}
}

export default Grid