import React, {PureComponent} from 'react'
import moment from 'moment'
import * as actions from '../actions/chunckActions'
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'

class Chunck extends PureComponent {
    constructor(props) {
        super(props);
        let id = props.id;
        let thisCh = props.byid[id];
        this.intervalId = null;

        this.info = {
            id: id,
            from: thisCh.from,
            to: thisCh.to,
            order: thisCh.order,
            name: thisCh.name
        }

        this.state = {
            active: false
        }

        this.setContRef = this.setContRef.bind(this);
    }

    componentDidMount() {
        this.checkActive();
    }

    componentWillReceiveProps(nextProps) {
        let id = nextProps.id;
        let thisCh = nextProps.byid[id];
        let dur = moment.duration(thisCh.to.diff(thisCh.from)).asHours();

        let info = {
            id: id,
            from: thisCh.from,
            to: thisCh.to,
            order: thisCh.order,
            name: thisCh.name,
            dur: dur
        }

        if (JSON.stringify(info) != JSON.stringify(this.props.info)) this.updateInfo(info);
        
        let ids = nextProps.ids;
        if (this.intervalId != null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (id == nextProps.activeId || (nextProps.activeId == -1 && id == ids[0])) { //if 1st or active
            this.intervalId = setInterval(() => { this.checkActive() }, 1000)
        }

        this.checkActive();
        
    }

    updateInfo(obj) {
        this.info = obj;
        this.forceUpdate();
    }

    checkActive() {
        let now = moment();
        let from = moment(this.info.from, "h:mm A");
        let to = moment(this.info.to, "h:mm A");

        let nowDur = moment.duration({h:now.get("hours"), m:now.get("minutes"), s:now.get("seconds")}).asSeconds();
        let fromDur = moment.duration({h:from.get("hours"), m:from.get("minutes")}).asSeconds();
        let toDur = moment.duration({h:to.get("hours"), m:to.get("minutes")}).asSeconds();

        if (this.state.active) {
            let ids = this.props.ids;
            let chunckId = this.props.id;
            if (nowDur < fromDur) {
                if (ids.indexOf(chunckId) > 0) { // not first
                    clearInterval(this.intervalId);
                    this.resetStyles();
                    this.props.actions.setActiveChunck(ids[ids.indexOf(chunckId)-1]);
                }
                return;
            } else if ( nowDur > toDur) {
                if (ids.indexOf(chunckId) != ids.length-1) { //not last 
                    clearInterval(this.intervalId); 
                    this.resetStyles();
                    this.props.actions.setActiveChunck(ids[ids.indexOf(chunckId)+1]);
                } 
                return;
            }
        }

        if ( nowDur > fromDur && nowDur < toDur) { // is active
            if (!this.state.active) this.setActive();
            if (this.info.id != this.props.activeId) this.props.actions.setActiveChunck(this.props.id);
        }
    }


    setActive() {
        this.setState(() => {return{active:true}}, this.cont.classList.add("active"));
    }

    resetStyles() {
        this.setState(() => {return{active:false}}, this.cont.classList.remove("active"));
    }

    setContRef(el) {
        if (el == null) return;
        this.cont = el;
    }

    render() {
        let {from, to, name, order, id} = this.info;
        from = from.format('h:mm A');
        to = to.format('h:mm A');

        return (
            <div ref={this.setContRef} data-id={id} data-order={order} className="chunck">
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
