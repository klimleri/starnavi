import React from 'react';
import './style.css';

function Leader(props) {
    return (
        <div className="winners">
            <div className="winners__title">Leader Board</div>
            <div className="winners__block">
                {
                    props.winners.map(winner => (
                        <div className="winners__item winner" key={winner.id}>
                            <div className="winner__name">{winner.winner}</div>
                            <div className="winner__time">{winner.date}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Leader;
