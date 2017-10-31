import React, {Component} from 'react';
import {connect} from 'react-redux'

import moment from 'moment'; //eslint-disable-line
import addPulse from '../gist/addPulse'

class ActivityPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            pinned: false,
            listenersAttached: false,
            activities:{},
            activityNames: []
        }

        this.togglePin = this.togglePin.bind(this);
    }

    switchActive(e, bool) {
        if (this.props.isAreaActive || e.keyCode != 32) return;
        if (this.state.active == bool) return;

        this.setState(() => {return{active:bool}});
    }

    switchListeners(on) {
        if (on && !this.state.listenersAttached) {
            this.setState(() => {return{listenersAttached:true}}, () =>{
                window.addEventListener("keydown", (e) => this.switchActive(e, true));
                window.addEventListener("keyup", (e) => this.switchActive(e, false));
            })

        } else if (!on && this.state.listenersAttached){
            this.setState(() => {return{listenersAttached:false}}, () =>{
                window.removeEventListener("keydown", (e) => this.switchActive(e, true));
                window.removeEventListener("keyup", (e) => this.switchActive(e, false));
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        const {byid, ids, isAreaActive} = nextProps;
        isAreaActive && !this.state.pinned ? this.switchListeners(false) :this.switchListeners(true)
        let acts = {}, actNames=[], curr;

        let nm, dur;
        ids.forEach(function(id) {
            curr = byid[id];
            nm = curr.name.toString();

            dur = byid[id].to.diff(byid[id].from, 'seconds');
            if (actNames.indexOf(nm) == -1) actNames.push(nm);
            acts[nm] = acts[nm] ? acts[nm] + dur : dur;
        }); 

        this.setState(() => {return {activities:acts, activityNames:actNames}});
    }

    togglePin(e) {
        let target = e.target;
        if (target.tagName == "I") target=target.parentNode;
        addPulse(target);
        !this.state.pinned ? target.classList.add('active') : target.classList.remove('active')
        this.setState(() => {return{pinned: !this.state.pinned}});
    }

    render() {
        return (
            <div style={{display:(this.state.active || this.state.pinned) ? "block" : "none"}} className="activityContainer"> 
                <div onClick={this.togglePin} className="activityPinBtn btn btn-default">
                    <i className="fa fa-thumb-tack" aria-hidden="true"></i>
                </div>
                {this.state.activityNames
                .slice()
                .sort((a,b) => {return this.state.activities[a] > this.state.activities[b] ? -1 : 1})
                .map((nm) => {
                    let durS = this.state.activities[nm];
                    return (
                    <li key={`_act_${nm}`}>
                        {nm} --- {`${~~(durS/3600)}h${~~((durS%3600)/60)}m`}
                    </li>)
                })}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
      byid: state.chuncksByID,
      ids: state.chuncksIDs,
      isAreaActive: state.isAreaActive
    }
  }
  
export default connect(mapStateToProps)(ActivityPanel)