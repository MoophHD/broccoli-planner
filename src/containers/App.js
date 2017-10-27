/* eslint-disable */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as pageActions from '../actions/pageActions'
import * as dtActions from '../actions/dtActions'

import Chunck from '../components/Chunck'
import Controller from './Controller'
import Sortable from 'sortablejs'

import Cookies from 'js-cookie'

class App extends Component {
  constructor(props) {
    super(props);
    this.sortableContainer = this.sortableContainer.bind(this);
    this.clear = this.clear.bind(this);
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
    	onEnd: function (e) {
        if (e.newIndex == e.oldIndex) return;
        let itemEl = document.querySelector(`.chunck[data-order="${e.oldIndex}"]`);
        let replacedInd = e.newIndex;
        let replacedElemId = document.querySelector(`.chunck[data-order="${replacedInd}"]`).dataset.id;
        this.props.actions.setOrder(itemEl.dataset.id, replacedElemId, e.oldIndex, e.newIndex);
      }.bind(this)
      })
  }

  clear(e) {
    let target = e.target;
    if (target) {
      if (target.tagName == "I") target=target.parentNode;
      target.classList.add('pulse');
      setTimeout(()=>target.classList.remove('pulse'), 500);
    }

    document.querySelector('textarea.ctrInput').value = "";
    Cookies.remove('ctrVal');
    Cookies.remove('dt', {path: '/'});
    Cookies.remove('dt');


    this.props.actions.clearChuncks();
    this.props.dtActions.clearDt();
  }

  render() {
    const {actions} = this.props;
    const { byID, ids, activeId } = this.props;

    let chuncks = ids.map((id, ind) => {
      let curr = byID[id];
      return (
        <Chunck 
          key={`_chunck${id}${curr.order}}`}  //${Math.random()}
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
        <a onClick={this.clear} className="btn btn-default reloadBtn"  >
          <i className="fa fa-refresh" aria-hidden="true"></i>
        </a>
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
    actions: bindActionCreators(pageActions, dispatch), // eslint-disable-line
    dtActions : bindActionCreators(dtActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

