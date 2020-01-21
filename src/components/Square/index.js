import React from 'react';
import './style.css';

const Square = (props) => {
    const { isBlue, isGreen, isRed, clickable, started } = props;
    const styles = {
        backgroundColor: isBlue ? '#42d8e8' : (isGreen ? '#00e871' : (isRed ? '#e85a5f' : 'white') ),
        cursor: started && clickable ? 'pointer' : 'default'
    }

    return (
        <div className="square" style={styles} onClick={props.handleClick} data-id={props.id}/>
    );
}

export default Square;
