/* eslint-disable */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as npActions from '../actions/npActions'

import Chunck from '../components/Chunck'
import Controller from './Controller'
import Sortable from 'sortablejs'

import Cookies from 'js-cookie'

class App extends Component {
  constructor(props) {
    super(props);
    this.sortableContainer = this.sortableContainer.bind(this);
  }

  componentWillReceiveProps() {
    if (!this._container) return;

    this._container.options.store;
    
  } 

  sortableContainer(cont) {
    if (!cont) return;
    var dragGhost = {};
    this._container = Sortable.create(cont, 
     {group: "chuncks",
      ghostClass:"ghostChunck",
      chosenClass: "chosenChunck",
      animation: 100,
      setData: function (dataTransfer, dragEl) {
        dragGhost = dragEl.cloneNode(true);
        dragGhost.removeAttribute('data-id');
        dragGhost.removeAttribute('data-order');
        dragGhost.removeAttribute('data-id');
        
        dragGhost.classList.add('ghostChunck');
        document.body.appendChild(dragGhost);
        dataTransfer.setDragImage(dragGhost, 0, 0);
      },
    	onEnd: function (e) {
        dragGhost.parentNode.removeChild(dragGhost);
        if (e.newIndex == e.oldIndex) return;
        let itemEl = document.querySelector(`[data-order="${e.oldIndex}"]`);
        let replacedInd = e.newIndex;
        let replacedElemId = document.querySelector(`[data-order="${replacedInd}"]`).dataset.id;
        this.props.actions.setOrder(itemEl.dataset.id, replacedElemId, e.oldIndex, e.newIndex);
      }.bind(this)
      })
  }

  clearCookies() {
    Cookies.remove('ctrVal');
    Cookies.remove('dt');
  }

  render() {
    const {actions} = this.props;
    const { byID, ids } = this.props;

    let chuncks = ids.map((id, ind) => {
      let curr = byID[id];
      return (
        <Chunck 
          key={`_chunck${id}${curr.order}${Math.random()}`}  //${Math.random()}
          name={curr.name}
          from={curr.from}
          to={curr.to}
          order={curr.order}
          id={id}
          />
      )
    })

    return (
      <div >
        <button className="cookieBtn" onClick={this.clearCookies}></button>
        <Controller />
      <div ref={this.sortableContainer} id="sortable" className="chunckContainer">
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

