/* eslint-disable */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as npActions from '../actions/npActions'

import Chunck from '../components/Chunck'
import Controller from './Controller'

import $ from 'jquery'
import 'jquery-ui/ui/widgets/sortable'

class App extends Component {
  componentDidMount() {
    $( "#sortable" ).sortable({
      revert: true,
      axis: "y"
		});
  }

  render() {
    const {actions} = this.props;
    const { byID, ids, order} = this.props;

    let chuncks = ids.map((id, ind) => {
      let curr = byID[id];
      return (<Chunck 
                key={'_chunck'+id} 
                name={curr.name}
                from={curr.from}
                to={curr.to}
                order={order[ind]}
                />)
    })
    
    chuncks.sort((ch1, ch2) => {
      return ch1.props.order > ch2.props.order ? 1 : -1;
    })

    return (
      <div >
        <Controller />
      <div id="sortable" className="chunckContainer">
        {chuncks}
      </div>
    </div>)
  }
}
function mapStateToProps(state) {
  return {
    byID: state.chuncksByID,
    ids: state.chuncksIDs,
    order: state.chunckOrder
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(npActions, dispatch) // eslint-disable-line
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

