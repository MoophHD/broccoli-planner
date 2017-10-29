import React, {Component} from 'react';
import moment from 'moment'; //eslint-disable-line
import {connect} from 'react-redux'

class ActivityPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            listenersAttached: false,
            activities:{},
            activityNames: []
        }
    }

    switchActive(e, bool) {
        if (this.props.isAreaActive || e.keyCode != 32) return;
        if (this.state.active == bool) return;

        this.setState(() => {return{active:bool}});
    }

    switchListeners(on) {
        if (on && !this.state.listenersAttached) {
            console.log("on");
            this.setState(() => {return{listenersAttached:true}}, () =>{
                window.addEventListener("keydown", (e) => this.switchActive(e, true));
                window.addEventListener("keyup", (e) => this.switchActive(e, false));
            })

        } else if (!on && this.state.listenersAttached){
            console.log("off");
            this.setState(() => {return{listenersAttached:false}}, () =>{
                window.removeEventListener("keydown", (e) => this.switchActive(e, true));
                window.removeEventListener("keyup", (e) => this.switchActive(e, false));
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        const {byid, ids, isAreaActive} = nextProps;
        isAreaActive ? this.switchListeners(false) :this.switchListeners(true)
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
    render() {
        return (
            <div style={{display:this.state.active ? "block" : "none"}} className="activityContainer"> 
                {this.state.activityNames.map((nm) => {
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