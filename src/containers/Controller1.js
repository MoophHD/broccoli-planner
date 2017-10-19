import React, {Component} from 'react';
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
// import moment from 'moment';
import * as npActions from '../actions/npActions'
import Cookies from 'js-cookie'

class Controller extends Component {
    constructor(props) {
        super(props);

        this.handleInputSubmit = this.handleInputSubmit.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.input) this.input = document.body.querySelector(".ctrInput");
        this.input.value = this.stateToTxt(nextProps.ids, nextProps.byId);
        // this.build();
    }

    
    componentDidMount() {
        if (Cookies.get('ctrVal')) this.input.value = Cookies.get('ctrVal');
        
        let {byId, ids} = this.props;
        this.id = 0;
        this.lastValue = '';

        
        this.byId = byId ? byId : {};
        this.ids = ids ? ids : [];

        this.nameReg = /.+?(?=(\d{1,2}\.\d{1,2}|\d))/;
        this.tmReg = /\d{1,2}(\.\d{1,2})?/g;
        
        this.input.spellcheck = false;
        this.input.addEventListener("keyup",this.handleEnter);
        this.input.addEventListener("blur",() => this.grabChuncks());

        this.grabChuncks(true);
    }

    handleEnter(e) { //eslint-disable-line
        if (e.key == "Enter") {
            if (!this.dtFrom || !this.dtTo) {
                e.preventDefault();
                this.focusInput();
            } else {
                this.grabChuncks();
            }
        }
        // if (e.key == "Enter" &&  (!this.dtFrom || !this.dtTo)) {
        //     e.preventDefault();
        //     this.focusInput();
        //     return false;
        // } else if (e.key == "Enter" || this.isCharacterKeyPress(e)) {
        //     this.grabChuncks();
        // }
    }

    isCharacterKeyPress(evt) {
        if (typeof evt.which == "undefined") {
            return true;
        } else if (typeof evt.which == "number" && evt.which > 0) {
            return  !evt.metaKey && !evt.altKey && evt.which != 8;
        }
        return false;
    }

    stateToTxt(ids, byid) { 
        if (ids.length < 1) return '';

        let resString = '',
            chunck;
        console.log(ids);
        ids.sort((id1, id2) => {
            return byid[id1].order > byid[id2].order ? 1 : -1;
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

        let splittedInp = val.split('\n');
        
        this.clearQueue();
        let tM,
            tH,
            name;

        let inp = [...splittedInp],
            id = this.id,
            queueIds = this.ids,
            queueById = this.byId;

        inp.forEach(function(ln) {
            if (this.tmReg.test(ln)) {
                name = ln.match(this.nameReg) ? ln.match(this.nameReg)[0] : 'None';
                tH = ln.match(this.tmReg) ? ln.match(this.tmReg)[0] : '0.5';
                tM = this.hrToMin(tH);

                let currId = id++;
                queueIds.push(currId);
                queueById[currId] = {name:name, tM: tM, tH:tH};
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
            chMins += parseFloat(current.tM);
        });
        chMins = Math.round(chMins*1000)/1000;
        let freeTm = diff - chMins;
        let breakMins = freeTm/ chCount; // eslint-disable-line
        document.querySelector('.dtInput.total input').value = `${~~(freeTm/60)}h${~~(freeTm%60)}m`;
        

        queueIds.forEach((id) => {
            let current = queueById[id];
            addChunck(current.name, lastDt.clone(), lastDt.clone().add(current.tM, 'minutes'), current.tH);
            lastDt.add(current.tM, 'minutes');
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
    render() {
        console.log('1');
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
  