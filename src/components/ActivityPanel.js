import React, {Component} from 'react';
import {connect} from 'react-redux'
import moment from 'moment'; //eslint-disable-line
import Cookies from 'js-cookie'

import addPulse from '../gist/addPulse'
import getCoords from '../gist/getCoords'

class ActivityPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            pinned: false,
            drag: false,
            value: '',
            focused: false
        }

        this.switchPin = this.switchPin.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.endDrag = this.endDrag.bind(this);
        this.drag = this.drag.bind(this);
        this.syncCookieValue = this.syncCookieValue.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keydown", (e) => this.switchActive(e, true));
        window.addEventListener("keyup", (e) => this.switchActive(e, false));
    }

    switchActive(e, bool) {
        if (this.props.isAreaActive) return;
        if (e.keyCode != 32) return;
        if (this.state.active == bool) return;
        
        this.setState(() => {return{active:bool}});
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
        if (this.state.focused) return;
        if (!this.state.pinned) this.switchPin(true);

        this.setState(() => {return{drag:true}})
        let shiftX = e.pageX - getCoords(this.container).left;
        let shiftY = e.pageY - getCoords(this.container).top;

        this.container.style.left = e.pageX - shiftX + 'px';
        this.container.style.top = e.pageY - shiftY + 'px';

        window.addEventListener("mousemove", (e) => this.drag(e,shiftX,shiftY));
        window.addEventListener("mouseup", () => this.endDrag());

        document.body.classList.add("unselectable");
        this.container.classList.add("dragging");

        if (this.container.classList.contains("centeredByTransform")) this.container.classList.remove("centeredByTransform");
    }

    drag(e, shiftX, shiftY) {
        if (!this.state.drag) return; // safe

        this.container.style.left = e.pageX - shiftX + 'px';
        this.container.style.top = e.pageY - shiftY + 'px';
    }

    endDrag() {
        this.setState(() => {return{drag:false}})
        window.removeEventListener("mousemove", (e) => this.drag(e));
        window.removeEventListener("mouseup", () => this.endDrag());

        document.body.classList.remove("unselectable");
        this.container.classList.remove("dragging");
    }

    handleInputChange(e) {
        let val = e.target.value;
        this.setState(() => {return{value:val}})
        Cookies.set('PanelInputValue', val, {expires: 10});
    }

    syncCookieValue(target) {
        if (target != null) this.setState(() => {return{value:Cookies.get('PanelInputValue')}})
        this.input = target;
    }

    togleFocus(bool) {
        this.setState(() => {return{focused: bool}})
    }

    render() {
        return (
            <div ref={(el) => this.container = el} 
                style={{display:(this.state.active || this.state.pinned) ? "block" : "none"}} 
                className="activityContainer centeredByTransform"
                onMouseUp={this.endDrag} onMouseDown={this.startDrag} onMouseMove={this.drag} 
                > 
                <div className="control">
                    {/* <div className="actDragPanel"></div> */}
                    <div ref={(el) => this.pinDiv = el} onClick={() => this.switchPin()} className="activityPinBtn btn btn-default">
                        <i className="fa fa-thumb-tack" aria-hidden="true"></i>
                    </div>
                </div>
                <textarea onBlur={()=>this.togleFocus(false)} onFocus={() => {this.switchPin(true); this.togleFocus(true)}} value={this.state.value} ref={this.syncCookieValue} onChange={this.handleInputChange} className="panelTextarea inputCore" />
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