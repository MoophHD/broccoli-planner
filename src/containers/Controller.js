import React, {Component} from 'react';
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as npActions from '../actions/npActions'
import moment from 'moment';



class Controller extends Component {
    constructor(props) {
        super(props);

        this.handleInputSubmit = this.handleInputSubmit.bind(this);
    }

    componentDidMount() {
        this.id = 0;
        this.lastValue = '';
        this.queueIds = [];
        this.queueById = {};

        this.nameReg = /.+?(?=(\d{1,2}\.\d{1,2}|\d))/;
        this.tmReg = /\d{1,2}(\.\d{1,2})?/g;
        

        this.input.spellcheck = false;
        this.input.addEventListener("keypress",(e) => this.handleEnter(e))
        this.input.addEventListener("blur",() => this.grabChuncks())
    }

    handleEnter(e) {
        if (e.keyCode == 13) {
            this.grabChuncks();
        }
    }

    grabChuncks() {
        let val = this.input.value;
        if (val == this.lastValue) return;

        this.clearQueue();
        let tm,
            name;

        let inp = val.split('\n'),
            id = this.id,
            queueIds = this.queueIds,
            queueById = this.queueById;
            
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

        this.rebuild().then(() => {this.lastValue = val});
        

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
        
        let queueIds = this.queueIds,
            queueById = this.queueById,
            addChunck = this.props.actions.addChunck;

        let chCount = queueIds.length - 1;
        let chMins = 0;

        queueIds.forEach((id) => {
            let current = queueById[id];
            chMins += parseFloat(current.tm);
        });
        chMins = Math.round(chMins*1000)/1000;
        let breakMins =( diff - chMins ) / chCount;
        console.log(breakMins);

        queueIds.forEach((id) => {
            let current = queueById[id];
            // if (queueIds.indexOf(id) != 0) {
            //     lastDt.add(breakMins, 'minutes');
            // }

            addChunck(current.name, lastDt.format('h:mm A'), lastDt.add(current.tm, 'minutes').format('h:mm A'));
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
        this.queueById = {};
        this.queueIds = [];
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

    }

    checkInputKeyDown(e) {
        if (e.key != "Enter") return;
    
        this.handleInputSubmit(e);
    }

    formatInputDt(val) {
        let splRg= /((\ \:\ )|\:|\-|\ )/g;
        let now = moment();
        let dt,
            formDt;

        if (splRg.test(val)) {
            dt = val.split(val.match(splRg)[0]);
            if (dt[1].length < 2) {
                dt[1] = 60 * dt[1];
            }

            now.hour(dt[0]);
            now.minute(dt[1]);
            now.second(0);

            dt[0] = this.checkAndFixZeros(dt[0]);
            dt[1] = this.checkAndFixZeros(dt[1]);
            

            formDt = dt.join(' : ');
        } else {
            now.hour(val);
            now.minute(0);
            now.second(0);

            val = this.checkAndFixZeros(val);
            
            formDt = `${val} : 00`;
        }

        return {vl: now, formDt: formDt}
    }

    checkAndFixZeros(slice) {
        if (slice.length > 1) return slice;

        return slice < 10 ? '0' + slice : slice.toString();
    }

    render() {
        return(
            <div className="controller">
                <div className="dtInput">
                    from:<input onBlur={this.handleInputSubmit} onKeyPress={(e) => this.checkInputKeyDown(e)} data-type="from"></input>
                </div>
                <div className="dtInput">
                    to:<input onBlur={this.handleInputSubmit} onKeyPress={(e) => this.checkInputKeyDown(e)} data-type="to"></input>
                </div>
                <div className="dtInput total">
                    total:<input readOnly></input>
                </div>
                <textarea ref={(el) => this.input = el} className="ctrInput"/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
      byID: state.chuncksByID,
      ids: state.chuncksIDs
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(npActions, dispatch) // eslint-disable-line
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Controller)