import React, {PureComponent} from 'react'
import moment from 'moment'
import * as actions from '../actions/chunckActions'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'

class Chunck extends PureComponent {
    constructor(props) {
        super(props);
        this.intervalId = null;

        this.state = {
            active: false
        }
    }

    checkStuff(props) {
        let id = props.id;
        let activeId = props.activeId;

        if (activeId == -1) {
            if (id === 0 && this.intervalId == null) { // no active chunck yet and this one is first
                this.intervalId = setInterval(() => this.checkActive(), 1000)
            }
        } else {
            if (this.intervalId != null && !this.state.active ) { //interval from check call
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }


        if (this.state.active) {
            if (id != activeId) { //no longer active
                this.setState(() => {return{active: false}});
                clearInterval(this.intervalId);
                this.intervalId = null;
            } 
        } else {
            if (id == activeId) {
                this.setState(() => {return{active: true}});
                this.intervalId = setInterval(() => this.checkActive(), 1000)
            }
        }
    }

    componentDidMount() {
        this.checkStuff(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.checkStuff(nextProps);
    }

    checkActive() {
        const { actions, fromSecs, toSecs } = this.props;
        let now = moment();
        let nowSecs = moment.duration({h:now.get("hours"), m:now.get("minutes"), s:now.get("seconds")}).asSeconds();

        if ( nowSecs >= fromSecs && nowSecs <= toSecs) { // is active
            if (!this.state.active) {
                this.setState(() => {return{active:true}})
                actions.reviseActiveChunck();
            }
        } else {
            if (this.state.active) {
                this.setState(() => {return{active:false}})
                actions.reviseActiveChunck();
            }
        }
    }


    render() {
        let {from, to, name, order, id} = this.props;
        from = from.format('h:mm A');
        to = to.format('h:mm A');

        return (
            <div className={`chunck ${this.state.active ? 'active' : ''}`} data-id={id} data-order={order}>
                <div className="chunckFrom">{from}</div>
                <div className="chunckTo">{to}</div>
                <div className="chunckName">{name}</div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    let self = state.chuncksByID[ownProps.id];
    return {
      activeId: state.activeChunckId,
      name: self.name,
      order: self.order,
      from: self.from,
      to: self.to,
      fromSecs: self._fromSecs,
      toSecs: self._toSecs
    }
  }
  

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch) // eslint-disable-line
    }
}
  

export default connect(mapStateToProps, mapDispatchToProps)(Chunck)
