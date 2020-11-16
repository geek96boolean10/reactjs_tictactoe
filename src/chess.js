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
		// manage game connection
		let chessFunc = process.env.chessFunctionConnectionString
		console.log("chessFunc url: " + chessFunc)
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
		// grid[5][4] = new Piece({name:"pawn", side: "lite"})
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
	// Some general mutators that can be used by multiple pieces
	eastMutator = (prev)=>{return {row: prev.row, column: prev.column + 1}}
	westMutator = (prev)=>{return {row: prev.row, column: prev.column - 1}}
	northMutator = (prev)=>{return {row: prev.row - 1, column: prev.column}}
	southMutator = (prev)=>{return {row: prev.row + 1, column: prev.column}}
	seMutator = (prev)=>{return {row: prev.row + 1, column: prev.column + 1}}
	swMutator = (prev)=>{return {row: prev.row + 1, column: prev.column - 1}}
	neMutator = (prev)=>{return {row: prev.row - 1, column: prev.column + 1}}
	nwMutator = (prev)=>{return {row: prev.row - 1, column: prev.column - 1}}
	knightMutator = (prev)=>{
		let next = {
			row: 0, 
			column: 0, 
			index: prev.index===undefined ? 1 : prev.index + 1,
			origin: prev.origin===undefined ? {row:prev.row, column:prev.column} : prev.origin,
		}
		// use index to determine which of the 8 positions to go to;
		// 1 5 7 3
		// 2 6 8 4
		let nRow = 0, nCol = 0;
		switch (next.index)
		{
			case 1:
				nRow = -1; nCol = -2;
				break;
			case 2:
				nRow = 1; nCol = -2;
				break;
			case 3:
				nRow = -1; nCol = 2;
				break;
			case 4:
				nRow = 1; nCol = 2
				break;
			case 5:
				nRow = -2; nCol = -1;
				break;
			case 6:
				nRow = 2; nCol = -1;
				break;
			case 7:
				nRow = -2; nCol = 1;
				break;
			case 8:
				nRow = 2; nCol = 1;
				break;
			default:
				return null
		}
		next.row = next.origin.row + nRow
		next.column = next.origin.column + nCol
		//console.log(next)
		return next
	}
	selectPiece(row, column)
	{
		let piece = this.state.grid[row][column]
		if (piece === null) // reset hilite and deselect
		{
			//console.log("nulled")
			this.state.hilite = this.resetHilite();
			this.setState({selected: null})
			return; 
		}
		// only allow pieces of currently playing side to be clicked
		let side = this.state.turn % 2 === 0 ? "lite" : "dark"
		if (piece.state.side !== side)
		{
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
				let pawnMutater = (prev)=>{return {row: prev.row + increment, column: prev.column}}
				this.hilitePosition(row, column, pawnMutater, limit, piece.state.side, false)
				// test diag capture too (both directions)
				let rowIncrement = piece.state.side === "lite" ? 1 : -1
				let pawnCaptureMutater = (prev)=>{return {row: prev.row + rowIncrement, column: prev.column + 1}}
				this.hilitePosition(row, column, pawnCaptureMutater, 1, piece.state.side, true, true)
				pawnCaptureMutater = (prev)=>{return {row: prev.row + rowIncrement, column: prev.column - 1}}
				this.hilitePosition(row, column, pawnCaptureMutater, 1, piece.state.side, true, true)
				break;
			case "castle":
				// general cases first
				this.hilitePosition(row, column, this.northMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.southMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.eastMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.westMutator, 8, piece.state.side, true, false)
				// check if castling is allowed
				break;
			case "queen":
				this.hilitePosition(row, column, this.northMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.southMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.eastMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.westMutator, 8, piece.state.side, true, false)
				// allow multiple-case into bishop's diagonal
			case "bishop":
				this.hilitePosition(row, column, this.neMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.nwMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.seMutator, 8, piece.state.side, true, false)
				this.hilitePosition(row, column, this.swMutator, 8, piece.state.side, true, false)
				break;
			case "king":
				// ugh, but it works
				this.hilitePosition(row, column, this.northMutator, 1, piece.state.side, true, false)
				this.hilitePosition(row, column, this.southMutator, 1, piece.state.side, true, false)
				this.hilitePosition(row, column, this.eastMutator, 1, piece.state.side, true, false)
				this.hilitePosition(row, column, this.westMutator, 1, piece.state.side, true, false)
				this.hilitePosition(row, column, this.neMutator, 1, piece.state.side, true, false)
				this.hilitePosition(row, column, this.nwMutator, 1, piece.state.side, true, false)
				this.hilitePosition(row, column, this.seMutator, 1, piece.state.side, true, false)
				this.hilitePosition(row, column, this.swMutator, 1, piece.state.side, true, false)
				break;
			case "knight":
				// gonna cheat and use a more complex mutator
				this.hilitePosition(row, column, this.knightMutator, 8, piece.state.side, true, false, true)
				break;
			default:
				console.log("unknown piece " + piece.state.name)
		}
		// trigger render
		//console.log("trying to force render...")
		this.setState({selected: {row:row, column:column}})
	}

	/** 
	@description Sets a series of positions in the hilite grid to be highlighted.
	@param mutater A function that accepts one property pair as coordinates and returns a new property pair as the
	next coordinates to apply; returns null to terminate.
	@param limit The number of cells that may be hilited in one sweep.
	@param allowCapture Determines if the piece, using this mutater, may capture a piece.
	@param mustCapture Only hilites a cell if a capturable piece is in it.
	@param fulfillLimit Forces the
	*/
	hilitePosition(row, column, mutater, limit, side, allowCapture=true, mustCapture=false, fulfillLimit=false)
	{
		//console.log("hling source at " + row + ", " + column)
		// assume initial row and column are the origin; don't hilite it.
		let next = mutater({row: row, column: column})
		//console.log("initial next")
		//console.log(next)
		while (next !== null && limit > 0)
		{
			let occupied = this.testPosition(next.row, next.column)
			//console.log("occupancy:")
			//console.log(occupied)
			if (occupied === null && fulfillLimit !== true)
			{
				// space is invalid, stop looking
				next = null;
				//console.log("aborting")
			}
			else if (occupied === null && fulfillLimit === true) // invalid space but must get next
			{
				next = mutater(next);
			}
			else if (occupied !== false) // the position is occupied, capture but go no further
			{
				if (allowCapture === true && side !== occupied.state.side) // hilite if opposite team
				{
					//console.log("setting true")
					this.state.hilite[next.row][next.column] = true;
				}
				if (fulfillLimit) // even being blocked, continue
				{
					next = mutater(next)
				}
				else // blocked, don't continue
				{
					next = null; // disable next evaluation
					//console.log("aborting")
				}
			}
			else // no occupancy, hilite and mutate if not mustCapture
			{
				if (mustCapture !== true) // don't have to capture, so mark empty cell as ok
				{
					this.state.hilite[next.row][next.column] = true;
					next = mutater(next);
					//console.log("next mutater result")
					//console.log(next)
				}
				else // must capture, but cell is empty
				{
					// can't capture, so halt
					next = null;
					//console.log("aborting")
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
		//console.log("testing position " + row + ", " + column)
		let obj = this.state.grid[row]?.[column];
		//console.log(obj)
		if (obj === undefined)
			return null;
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
		//console.log("select motion")
		let piece = this.state.grid[row][column]
		//console.log("moving piece " + piece.state.name) // if this throws error, it has failed
		this.state.grid[row][column] = null;
		this.state.grid[targetrow][targetcolumn] = piece
		// force redraw
		this.state.hilite = this.resetHilite()
		this.setState({selected: null})
	}
	
	/*
	If a valid movement is selected, move the selected piece to that location and capture the piece on it.
	*/
	selectCapture(row, column, targetrow, targetcolumn)
	{
		//console.log("select capture")
		let piece = this.state.grid[row][column]
		this.state.grid[row][column] = null;
		this.state.grid[targetrow][targetcolumn] = null;
		// force redraw twice to guarantee the capturing piece is shown
		this.state.hilite = this.resetHilite()
		this.setState({selected: null}, ()=>{
			this.state.grid[targetrow][targetcolumn] = piece
			this.setState({selected: null})
		})
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
				this.setState({turn: this.state.turn + 1})
			}
		}
		// if the space has both, capture piece and select motion.
		else if (this.state.grid[row][column] !== null && 
			this.state.grid[row][column].name !== null &&
			this.state.hilite[row][column] === true)
		{
			return ()=>{
				console.log("selecting capture")
				this.selectCapture(this.state.selected.row, this.state.selected.column, row, column)
				this.setState({turn: this.state.turn + 1})
			}
		}
		// if neither, no action occurs
		return ()=>{this.selectPiece(row, column)} // select piece has handler for nulls
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
			<div className="App Short" style={{borderCollapse:"collapse", paddingBottom:"0px"}}>
				<div className="TextBox" style={{fontSize: "16px", verticalAlign: "bottom"}}>
					It's {this.state.turn % 2 === 0 ? "lite" : "dark"}'s turn.
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
			<div className="App Short" style={{borderCollapse:"collapse"}}>
				<div className="TextBox" style={{fontSize: "16px", verticalAlign: "bottom"}}>
					Turn {this.state.turn}
				</div>
			</div>
			</div>)
	}
}

export default Grid