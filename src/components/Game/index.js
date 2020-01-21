import React, { Component } from 'react';
import { TextField, MenuItem, Button } from '@material-ui/core';
import './style.css';
import Leader from "../Leader";
import Loader from "../Loader";
import Square from "../Square";

class Game extends Component {
    constructor(props){
        super(props);

        this.state = {
            gameSettings: null,
            mode: '',
            field: null,
            delay: null,
            winners: null,
            winnerName: null,
            userName: '',
            isLoad: false,
            started: false,
            ended: false
        }
    }

    componentDidMount() {
        fetch("https://starnavi-frontend-test-task.herokuapp.com/game-settings")
            .then((resp) => {
                return resp.json();
            })
            .then((data) => {
                this.setState({
                    gameSettings: data,
                    field: data[Object.keys(data)[0]].field
                });

                fetch("https://starnavi-frontend-test-task.herokuapp.com/winners")
                    .then((resp) => {
                        return resp.json();
                    })
                    .then((data) => {
                        this.setState({
                            isLoad: true,
                            winners: data
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    }

    handleChangeMode = (e) => {
        const mode = e.target.value;

        this.setState((prevState) => ({
            mode: mode,
            field: prevState.gameSettings[mode].field,
            delay: prevState.gameSettings[mode].delay
        }));

        this.createField(this.state.gameSettings[mode].field);
    }

    handleChangeName = (e) => {
        this.setState({
            userName: e.target.value
        });
    }

    handleStart = () => {
        const { field, ended } = this.state;

        if (ended) {
            const resetArray = this.createField(field);

            this.setState({
                arrayOfSquares: resetArray,
                ended: false
            });
        }

        this.setState({
            started: true
        });

        this.interval();
    }

    interval = () => {
        const interval = setInterval(() => {
            const { arrayOfSquares, field, userName } = this.state;

            const blueSquare = arrayOfSquares.filter(square => square.isBlue);
            if (blueSquare.length) {
                arrayOfSquares[blueSquare[0].id].isBlue = false;
                arrayOfSquares[blueSquare[0].id].isRed = true;
                arrayOfSquares[blueSquare[0].id].clickable = false;
            }

            if (arrayOfSquares.filter(square => square.isGreen).length === Math.round((field**2) / 2)) {
                this.endGame(userName);
                clearInterval(interval);
            } else if (arrayOfSquares.filter(square => square.isRed).length === Math.round((field**2) / 2)) {
                this.endGame('Computer AI');
                clearInterval(interval);
            } else {
                const availableSquares = arrayOfSquares.filter(square => square.available);
                if (availableSquares.length) {
                    const randomIndex = Math.floor((Math.random()*availableSquares.length));
                    const activeSquare = availableSquares[randomIndex];
                    arrayOfSquares[activeSquare.id].isBlue = true;
                    arrayOfSquares[activeSquare.id].available = false;

                    this.setState({
                        availableSquares: availableSquares
                    });
                }
            }
        }, this.state.delay);
    }

    endGame = (name) => {
        this.setState({
            started: false,
            ended: true,
            winnerName: name
        });
        this.postData();
    }

    handleClick = (e) => {
        const { arrayOfSquares } = this.state;
        const square = arrayOfSquares[e.target.dataset.id];
        if(square.isBlue) {
            arrayOfSquares[square.id].isBlue = false;
            arrayOfSquares[square.id].isGreen = true;
            arrayOfSquares[square.id].clickable = false;

            this.setState({
                arrayOfSquares: arrayOfSquares
            });
        }
    }

    createField = (size) => {
        let arrayOfSquares = [];
        for (let i = 0; i < size ** 2; i++) {
            arrayOfSquares[i] = {
                id: i,
                isBlue: null,
                isGreen: null,
                isRed: null,
                clickable: true,
                available: true
            };
        }

        this.setState({
            arrayOfSquares: arrayOfSquares
        });

        return arrayOfSquares;
    }

    postData = () => {
        const url = "https://starnavi-frontend-test-task.herokuapp.com/winners";
        const date = new Date();
        const dateToSend = `${date.toTimeString().slice(0, 5)}; ${date.getDate()} ${date.toLocaleDateString("en-US", {month: 'long'})} ${date.getFullYear()}`;

        const dataToSend = {
            winner: this.state.winnerName,
            date: dateToSend
        }

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
            .then(response => response.json())
            .then((data) => {
                this.setState({
                    winners: data
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    render() {
        const { isLoad, gameSettings, mode, field, arrayOfSquares, winners, winnerName, userName, started, ended } = this.state;

        return (
            isLoad ?
                <>
                    <div className="game">
                        <div className="game__settings">
                            <div className="game__mode">
                                <TextField
                                    select
                                    label="Pick game mode"
                                    className="select"
                                    value={mode}
                                    onChange={this.handleChangeMode}
                                >
                                    {Object.keys(gameSettings).map((setting, i) => (
                                        <MenuItem key={i} value={setting}>
                                            {setting}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                            <div className="game__user">
                                <TextField
                                    label={"Enter your name"}
                                    className="input"
                                    value={userName}
                                    onChange={this.handleChangeName}
                                />
                            </div>
                            <div className="game__play">
                                <Button
                                    variant='contained'
                                    className={'play-button'}
                                    disabled={(!mode || !userName || started)}
                                    onClick={this.handleStart}
                                >
                                    {ended ? 'Play Again' : 'Play'}
                                </Button>
                            </div>
                        </div>
                        <div className="game__message">
                            {ended && `${winnerName} won`}
                        </div>
                        {
                            arrayOfSquares &&
                            <div className="game__field" style={{ maxWidth: `${50 * field}px` }}>
                                {
                                    arrayOfSquares.map(item => {
                                        return <Square key={item.id} {...item} started={started} handleClick={this.handleClick} />
                                    })
                                }
                            </div>
                        }
                    </div>
                    <Leader winners={winners} />
                </>
                :
                <Loader/>
        )
    }
}

export default Game;
