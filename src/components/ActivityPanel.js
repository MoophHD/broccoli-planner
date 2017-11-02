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
            drag: false,
            listenersAttached: false,
            activities:{},
            activityNames: []
        }

        this.togglePin = this.togglePin.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.endDrag = this.endDrag.bind(this);
        this.drag = this.drag.bind(this);
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

    togglePin() {
        addPulse(this.pinDiv);

        !this.state.pinned ? this.pinDiv.classList.add('active') : this.pinDiv.classList.remove('active')
        this.setState(() => {return{pinned: !this.state.pinned}});
    }

    startDrag(e) {
        if (!this.state.pinned) this.togglePin();

        this.setState(() => {return{drag:true}})
        this.container.style.left = e.pageX + 'px';
        this.container.style.top = e.pageY + this.container.offsetHeight/2 - 8 + 'px';
        window.addEventListener("mousemove", (e) => this.drag(e));
        window.addEventListener("mouseup", () => this.endDrag());

        document.body.classList.add("unselectable");

    }

    endDrag() {

        this.setState(() => {return{drag:false}})
        window.removeEventListener("mousemove", (e) => this.drag(e));
        window.removeEventListener("mouseup", () => this.endDrag());

        document.body.classList.remove("unselectable");
    }

    drag(e) {
        if (!this.state.drag) return; // safe

        this.container.style.left = e.pageX + 'px';
        this.container.style.top = e.pageY + this.container.offsetHeight/2 - 8 + 'px';
    }

    render() {
        return (
            <div ref={(el) => this.container = el} style={{display:(this.state.active || this.state.pinned) ? "block" : "none"}} className="activityContainer"> 
                <div onMouseUp={this.endDrag} onMouseDown={this.startDrag} onMouseMove={this.drag} className="actDragPanel"></div>
                <div ref={(el) => this.pinDiv = el} onClick={this.togglePin} className="activityPinBtn btn btn-default">
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