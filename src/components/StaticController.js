import React from 'react';
// import {connect} from 'react-redux'

export default function StaticController(props) {
    return (
    <div style={{display:props.isActive ? "block" : "none"}} onClick={props.handleClick} className="ctrInput">
        {props.chuncks.map((chunck, ind) => {
            return(<div key={ind} className="staticChunck" data-order={ind}>{chunck}</div>)
        })}
    </div>)
}

// function mapStateToProps(state) {
//     return {
//       byId: state.chuncksByID,
//       ids: state.chuncksIDs,
//       from: state.from,
//       to: state.to,
//       activeId: state.activeChunckId
//     }
//   }
  
//   function mapDispatchToProps(dispatch) {
//     return {
//         pageActions: bindActionCreators(pageActions, dispatch) 
//     }
//   }
  
//   export default connect(mapStateToProps, mapDispatchToProps)(Controller)