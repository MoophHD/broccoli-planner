/* eslint-disable */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as npActions from '../actions/npActions'

import Chunck from '../components/Chunck'
import Controller from './Controller'


class App extends Component {
  componentWillReceiveProps(nextProps) {
  }

  render() {
    const {actions} = this.props;
    const { byID, ids} = this.props;

    let chuncks = ids.map((id, ind) => {
      let curr = byID[id];
      return (<Chunck 
                key={'_chunck'+id} 
                name={curr.name}
                from={curr.from}
                to={curr.to}
                />)
    })


    return (<div>
      <Controller />
      <div className="chunckContainer">
        {chuncks}
      </div>
    </div>)
  }
}
function mapStateToProps(state) {
  return {
    byID: state.chuncksByID,
    ids: state.chuncksIDs
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(npActions, dispatch) // eslint-disable-line
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

