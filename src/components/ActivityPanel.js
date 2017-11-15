import React, {Component} from 'react';
import {connect} from 'react-redux'

import moment from 'moment'; //eslint-disable-line
import addPulse from '../gist/addPulse'

import Cookies from 'js-cookie'

class ActivityPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            pinned: false,
            drag: false,
            listenersAttached: false,
            value: ''
        }

        this.switchPin = this.switchPin.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.endDrag = this.endDrag.bind(this);
        this.drag = this.drag.bind(this);
        this.syncCookieValue = this.syncCookieValue.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        this.switchListeners(true);
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

    switchPin(bool) {
        if (bool != undefined && bool == this.state.pinned) return;
        if (bool == undefined) bool = !this.state.pinned;
        if (this.pinDiv) {
            addPulse(this.pinDiv);
            !this.state.pinned ? this.pinDiv.classList.add('active') : this.pinDiv.classList.remove('active')
        }
        this.setState(() => {return{pinned:bool}});
    }

    startDrag(e) {
        if (!this.state.pinned) this.switchPin(true);

        this.setState(() => {return{drag:true}})
        console.log(e.pageX);
        this.container.style.left = e.pageX + 'px';
        this.container.style.top = e.pageY + this.container.offsetHeight/2 - 8 + 'px';
        window.addEventListener("mousemove", (e) => this.drag(e));
        window.addEventListener("mouseup", () => this.endDrag());

        document.body.classList.add("unselectable");

    }

    drag(e) {
        if (!this.state.drag) return; // safe

        this.container.style.left = e.pageX + 'px';
        this.container.style.top = e.pageY + this.container.offsetHeight/2 - 8 + 'px';
    }

    endDrag() {

        this.setState(() => {return{drag:false}})
        window.removeEventListener("mousemove", (e) => this.drag(e));
        window.removeEventListener("mouseup", () => this.endDrag());

        document.body.classList.remove("unselectable");
    }

    handleInputChange(e) {
        let val = e.target.value;
        this.setState(() => {return{value:val}})
        Cookies.set('PanelInputValue', val, {expires: 10});
    }

    syncCookieValue(target) {
        if (target != null) this.setState(() => {return{value:Cookies.get('PanelInputValue')}})
    }

    render() {
        return (
            <div ref={(el) => this.container = el} style={{display:(this.state.active || this.state.pinned) ? "block" : "none"}} className="activityContainer"> 
                <div className="control">
                    <div onMouseUp={this.endDrag} onMouseDown={this.startDrag} onMouseMove={this.drag} className="actDragPanel"></div>
                    <div ref={(el) => this.pinDiv = el} onClick={() => this.switchPin()} className="activityPinBtn btn btn-default">
                        <i className="fa fa-thumb-tack" aria-hidden="true"></i>
                    </div>
                </div>
                <textarea onFocus={() => this.switchPin(true)} value={this.state.value} ref={this.syncCookieValue} onChange={this.handleInputChange} className="panelTextarea inputCore" />
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