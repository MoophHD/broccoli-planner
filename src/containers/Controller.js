/* eslint-disable */

import React, {Component} from 'react';
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import moment from 'moment';
import * as npActions from '../actions/npActions'

class Controller extends Component {
    constructor(props) {
        super(props);

        this.handleInputSubmit = this.handleInputSubmit.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }

    componentDidMount() {
        let {byId, ids} = this.props;
        this.id = 0;
        this.lastValue = '';

        
        this.byId = byId ? byId : {};
        this.ids = ids ? ids : [];

        this.nameReg = /.+?(?=(\d{1,2}\.\d{1,2}|\d))/;
        this.tmReg = /\d{1,2}(\.\d{1,2})?/g;
        
        this.txtState = this.ids.length > 0 ? this.stateToTxt(ids, byId) : '';

        this.input.spellcheck = false;
        this.input.addEventListener("keyup",this.handleEnter);
        this.input.addEventListener("blur",() => this.grabChuncks());
    }

    handleEnter(e) { //eslint-disable-line
        if (e.key == "Enter" && (!this.dtFrom || !this.dtTo)) {
            e.preventDefault();
            this.focusInput();
            return false;
        }

        this.grabChuncks();
    }

    stateToTxt(ids, byid) {
        let resString = '',
            chunck;
        
        ids.sort((id1, id2) => {
            return byID[id1].order > byID[id2].order ? 1 : -1;
        })

        ids.forEach((id) => {
            chunck = byid[id];
            resString += chunck.name + chunck.duration + '\n';
        })

        return resString;
    }

    grabChuncks(pressure=false) { //eslint-disable-line
        let val = this.input.value;

        if (val == this.lastValue && !pressure) return;
        if (!val.match(/\d$/gm)) return;
        if (val.match(/\d$/gm).length == this.ids.length) {
            console.log('1 passed');
        }   
        
        this.clearQueue();
        let tm,
            name;

        let inp = val.split('\n'),
            id = this.id,
            queueIds = this.ids,
            queueById = this.byId;

        inp.forEach(function(ln) {
            if (this.tmReg.test(ln)) {
                name = ln.match(this.nameReg) ? ln.match(this.nameReg)[0] : 'None';
                tm = ln.match(this.tmReg) ? ln.match(this.tmReg)[0] : '0.5';
                tm = this.hrToMin(tm);

                let currId = id++;
                queueIds.push(currId);
                queueById[currId] = {name:name, tm: tm};
            }
        }, this);

        this.rebuild().then(() => {this.lastValue = val}, null);
        

    }

    rebuild() {
        if (!this.dtFrom || !this.dtTo) {
            this.focusInput();
            return new Promise((res, rej) => rej())
        }

        let from = this.dtFrom;
        let to = this.dtTo;
        let diff = to.diff(from, 'minutes');
        let lastDt = from.clone();
        
        let queueIds = this.ids,
            queueById = this.byId,
            addChunck = this.props.actions.addChunck;

        let chCount = queueIds.length - 1;
        let chMins = 0;

        queueIds.forEach((id) => {
            let current = queueById[id];
            chMins += parseFloat(current.tm);
        });
        chMins = Math.round(chMins*1000)/1000;
        let freeTm = diff - chMins;
        let breakMins = freeTm/ chCount; // eslint-disable-line
        document.querySelector('.dtInput.total input').value = `${~~(freeTm/60)}h${~~(freeTm%60)}m`;
        

        queueIds.forEach((id) => {
            let current = queueById[id];
            addChunck(current.name, lastDt.clone(), lastDt.clone().add(current.tm, 'minutes'), current.tm);
            lastDt.add(current.tm, 'minutes');
        })

        return new Promise((res) => res())
    }

    hrToMin(tm) {
        if (tm.indexOf('.') == -1 || tm.split('.')[1].length < 2) {
            return tm*60;
        } else {
            let tmArr = tm.split('.');
            return tmArr[0]*60 + parseFloat(tmArr[1]);
        }
    }

    clearQueue() {
        this.props.actions.clearChuncks();
        this.ids = [];
        this.byId = {};
    }

    focusInput() {
        if (!this.dtFrom) {
            document.querySelector('[data-type=from]').focus()
        } else {
            document.querySelector('[data-type=to]').focus()
        }
    }

    handleInputSubmit(e) {
        if (!/\d/.test(e.target.value)) return;
        
        let target = e.target,
            vl,
            formInputObj;
        let type = target.dataset.type;

        if (type == "from" && this.dtFrom && target.value == this.lastUnfFrom ||
            type == "to" && this.dtTo && target.value == this.lastUnfTo) return;


        formInputObj = this.formatInputDt(target.value);
        vl = formInputObj.vl;
        target.value = formInputObj.formDt;

        if (type == "from") {
            this.dtFrom = vl;
            this.lastUnfFrom = formInputObj.formDt;
        } else if (type == "to") {
            this.dtTo = vl;
            this.lastUnfTo = formInputObj.formDt;
        }

        if (this.dtFrom && this.dtTo) {
            let totalInp = document.querySelector('.total input');
            totalInp.value=this.dtTo.diff(this.dtFrom, "hours") + 'h'+ this.dtTo.diff(this.dtFrom, "minutes")%60+ "m";
        }

        this.grabChuncks(true);

    }

    checkInputKeyDown(e) {
        if (e.key != "Enter") return;
        
        this.handleInputSubmit(e);

        if (e.target.dataset.type == "from") {
            document.querySelector('[data-type=to]').focus();
        } else if (e.target.dataset.type == "to") {
            this.input.focus();
        }
    }

    formatInputDt(val) {
        let splRg= /((\ \:\ )|\:|\-|\ )/g;
        let now = moment();
        let dt = [],
            formDt,
            result;

        let tmPeriod = (now.get("hours") < 12) ? "AM" : "PM";

        if (/AM/i.test(val)) {
            tmPeriod = "AM";
        } else if (/PM/i.test(val)) {
            tmPeriod = "PM";
        }

        let tmPeriodMatch = val.match(/AM|PM/i) ? val.match(/AM|PM/i)[0] : null;

        if (splRg.test(val)) {
            dt = val.split(val.match(splRg)[0]);

            if (tmPeriod) dt[1] = dt[1].split(/\ ?AM|\ ?PM/i).join("");

            if (/\./.test(dt[0])) {
                dt = this.normilizeDotDate(dt[0]);
            }

            dt[1] = this.checkAndFixZeros(dt[1]);

        } else {
            if (tmPeriodMatch) {
                val = val.split(val).join("");
            }

            if (/\./.test(val)) {
                dt = this.normilizeDotDate(val);
                } else {
                    dt[0] = val;
                    dt[1] = 0;
                }
        }
            result = moment(`${dt[0]}:${dt[1]} ${tmPeriod}`, "h:mm A").format('HH:mm').split(':');
            now.hour(result[0]);
            now.minute(result[1]);
            now.second(0);

            dt[0] = this.checkAndFixZeros(dt[0]);
            dt[1] = this.checkAndFixZeros(dt[1]);
            formDt = `${dt.join(' : ')}${" " + tmPeriod}`;
            
        return {vl: now, formDt: formDt}
    }

    normilizeDotDate(dt) {
        dt = dt.split('.');
        
        if (dt[1].length < 2) {
            dt[1] = (60 * (dt[1]/10)).toString();
        }

        return dt;
    }

    checkAndFixZeros(slice) {
        if (slice.length > 1) return slice;

        return slice < 10 ? '0' + slice : slice.toString();
    }
    render() {
        return(
            <div className="controller">
                <div className="dtInput">
                    from:<input autoFocus={true} onFocus={(e) => e.target.select()} onBlur={this.handleInputSubmit} onKeyPress={(e) => this.checkInputKeyDown(e)} data-type="from"></input>
                </div>
                <div className="dtInput">
                    to:<input onFocus={(e) => e.target.select()} onBlur={this.handleInputSubmit} onKeyPress={(e) => this.checkInputKeyDown(e)} data-type="to"></input>
                </div>
                <div className="dtInput total">
                    free:<input  tabIndex="-1" readOnly></input>
                </div>
                <textarea ref={(el) => this.input = el} className="ctrInput"/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
      byId: state.chuncksByID,
      ids: state.chuncksIDs
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(npActions, dispatch) // eslint-disable-line
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Controller)