import React, {Component} from 'react'
import moment from 'moment'
import * as actions from '../actions/chunckActions'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'


class Chunck extends Component {
    constructor(props) {
        super(props);
        this.setStuff = this.setStuff.bind(this);

        let id = props.id;
        let thisCh = props.byid[id];

        this.state = {
            id: id,
            from: thisCh.from,
            to: thisCh.to,
            order: thisCh.order,
            name: thisCh.name
        }
    }

    componentWillReceiveProps(nextProps) {

        let id = nextProps.id;
        let thisCh = nextProps.byid[id];

        this.setState(() => { 
        return {
            id: id,
            from: thisCh.from,
            to: thisCh.to,
            order: thisCh.order,
            name: thisCh.name
        }})


        let ids = nextProps.ids;
        if (nextProps.id == ids[0] || ids[ids.indexOf(nextProps.activeId)+1] == nextProps.id) { //if 1st or after active
            this.intervalId = setInterval(() => this.checkActive(), 1000)
        } else if (this.intervalId) {
            clearInterval(this.intervalId);
            this.resetStyles();
        }
    }

    setStuff(container) {
        if (container == null) return;

        this.cont = container;
        this.activeStyles = {color: "white", bgColor: "Crimson"};
        this.inActiveStyles = {color: this.cont.style.color, bgColor: this.cont.style.backgroundColor}
        this.active = false;
        this.checkActive();
    }

    checkActive() {

        let now = moment();
        let nowDur = moment.duration({h:now.get("hours"), m:now.get("minutes"), s:now.get("seconds")}).asSeconds();
        let from = moment(this.props.from, "h:mm A");
        let to = moment(this.props.to, "h:mm A");
        
        let fromDur = moment.duration({h:from.get("hours"), m:from.get("minutes")}).asSeconds();
        let toDur = moment.duration({h:to.get("hours"), m:to.get("minutes")}).asSeconds();

        if (this.active) {
            if (nowDur >= toDur) {
                clearInterval(this.intervalId);
                this.resetStyles();
                return;
            }
        }
        if ( nowDur > fromDur && nowDur < toDur) { // is active
            this.setActiveStyles();
            if (this.props.id != this.props.activeId) this.props.actions.setActiveChunck(this.props.id);
        }
    }


    
    setActiveStyles() {
        this.active = true;
        this.cont.style.backgroundColor = this.activeStyles.bgColor;
        this.cont.style.color = this.activeStyles.color;
    }

    resetStyles() {
        this.cont.style.backgroundColor = this.inActiveStyles.bgColor;
        this.cont.style.color = this.inActiveStyles.color;
    }

    render() {
        let {from, to, name, order, id} = this.state;
        from = from.format('h:mm A');
        to = to.format('h:mm A');

        return (
            <div ref={this.setStuff} data-id={id} data-order={order} className="chunck">
                <div className="chunckFrom">{from}</div>
                <div className="chunckTo">{to}</div>
                <div className="chunckName">{name}</div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
      activeId: state.activeChunckId,
      ids: state.chuncksIDs,
      byid: state.chuncksByID
    }
  }
  

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch) // eslint-disable-line
    }
}
  

export default connect(mapStateToProps, mapDispatchToProps)(Chunck)
