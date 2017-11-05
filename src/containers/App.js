/* eslint-disable */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as pageActions from '../actions/pageActions'
import * as dtActions from '../actions/dtActions'

import Chunck from '../components/Chunck'
import Controller from './Controller'
import Sortable from 'sortablejs'
import ActivityPanel from '../components/ActivityPanel'

import Cookies from 'js-cookie'
import moment from 'moment'
import addPulse from '../gist/addPulse'

class App extends Component {
  constructor(props) {
    super(props);
    this.sortableContainer = this.sortableContainer.bind(this);
    this.clear = this.clear.bind(this);
    this.lastActive = props.activeId;
    this.state = {
      ids: props.ids,
      byid: props.byid
    }
  }

  updateContainerScroll(id) {
    let order = this.props.byid[id].order;
    let cont = this.cont;
    
    let actH = cont.clientHeight;

    let scrH = cont.scrollHeight;
    let scrT = cont.scrollTop;
    let scrB = scrH - cont.clientHeight - scrT;
    
    let chPerc = (1/this.props.ids.length)*order;
    let actAreaPrc = actH/scrH;

    if (chPerc >= scrT/scrH && chPerc <= (actAreaPrc+scrB/scrH)) return; //already in active area;
    
    this.cont.scrollTop = Math.max(0, chPerc*scrH - actH/2);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => {return {ids:nextProps.ids, byid:nextProps.byid}});
    if (nextProps.activeId != this.lastActive) {
      this.updateContainerScroll(nextProps.activeId);
    }
    this.lastActive = nextProps.activeId;
  } 

  sortableContainer(cont) {
    if (!cont) return;
    this.cont = cont;

    var dragGhost = {};
    this._container = Sortable.create(cont, 
     {group: "chuncks",
      ghostClass:"ghostChunck",
      chosenClass: "chosenChunck",
      animation: 100,
      onSort: function (evt) {
      setTimeout(()=> {
        var oldId = evt.oldIndex,
        newId = evt.newIndex,
        reArrange = this._container.toArray(),
        oldSort = this._container.toArray();

        if (oldId < newId) {
            for (var i = oldId; i < newId; i++)
                reArrange[i+1] = oldSort[i];
        } else {
            for (var i = newId + 1; i <= oldId; i++)
                reArrange[i-1] = oldSort[i];
        }
    
        reArrange[oldId] = oldSort[newId];
        this._container.sort(reArrange);

      }, 0)
        }.bind(this),
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
    addPulse(target);
    
    // document.querySelector('div.ctrInput').innerHTML = "";
    document.querySelector('textarea.ctrInput').value = "";
    Cookies.remove('ctrVal');
    Cookies.remove('dt', {path: '/'});
    Cookies.remove('dt');


    this.props.actions.clearChuncks();
    this.props.dtActions.clearDt();
  }

  render() {
    const {actions} = this.props;
    const { byid, ids } = this.state;

    let chuncks = ids.map((id, ind) => {
      return (
        <Chunck 
          key={`_chunck${ind}`}
          id={id}
          />
      )
    });

    return (
      <div >
        <ActivityPanel />
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
    byid: state.chuncksByID,
    ids: state.chuncksIDs,
    activeId: state.activeChunckId
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(pageActions, dispatch), // eslint-disable-line
    dtActions : bindActionCreators(dtActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

