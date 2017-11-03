import React from 'react';

export default function StaticController(props) {
    return (
    <div style={{display:props.isActive ? "block" : "none"}} onClick={props.handleClick} className="ctrInput">
        {props.chuncks.map((chunck, ind) => {
            return(<div key={ind} className="staticChunck" data-order={ind}>{chunck}</div>)
        })}
    </div>)
}