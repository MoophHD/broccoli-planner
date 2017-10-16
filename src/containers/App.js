/* eslint-disable */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as npActions from '../actions/npActions'

import Chunck from '../components/Chunck'
import Controller from './Controller'
import Sortable from 'sortablejs'

class App extends Component {
  constructor(props) {
    super(props);
    this.sortableContainer = this.sortableContainer.bind(this);
  }

  componentWillReceiveProps() {
    if (!this._container) return;

    this._container.options.store;
    console.log()
  } 

  sortableContainer(cont) {
    if (!cont) return;

    this._container = Sortable.create(cont, 
     {group: "chuncks",
      ghostClass:"ghostChunck",
      chosenClass: "chosenChunck",
    	onEnd: function (/**Event*/evt) {
        let itemEl = evt.item;  // dragged HTMLElement
      },
      store: {
        /**
         * Get the order of elements. Called once during initialization.
         * @param   {Sortable}  sortable
         * @returns {Array}
         */
        get: function (sortable) {
          console.log('reorder');
          let order;
          if (this.props.order.length !== 0) {
            order = this.props.order;
          } else if (localStorage.getItem(sortable.options.group.name)) {
            order = localStorage.getItem(sortable.options.group.name);
          }

          console.log(order);
          return order ? order.split('|') : [];
        }.bind(this),
    
        /**
         * Save the order of elements. Called onEnd (when the item is dropped).
         * @param {Sortable}  sortable
         */
        set: function (sortable) {
          var order = sortable.toArray();
          this.props.actions.setOrder(order)
          
          localStorage.setItem(sortable.options.group.name, order.join('|'));
        }.bind(this)
      }
      })
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
    
    // chuncks.sort((ch1, ch2) => {
    //   return ch1.props.order > ch2.props.order ? 1 : -1;
    // })

    return (
      <div >
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

