/* eslint-disable */ 
import React, {Component} from 'react';
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import moment from 'moment';
import * as npActions from '../actions/npActions'
import * as chActions from '../actions/chunckActions'
import Cookies from 'js-cookie'
import InputFields from '../components/InputFields'
import regexLastIndexOf from '../gist/regexLastIndexOf'

class Controller extends Component {
    constructor(props) {
        super(props);

        this.state = {value: ''};
        this.handleInputChange = this.handleInputChange.bind(this);
        this.checkEnter = this.checkEnter.bind(this);
    }
    
    componentDidMount() {
        this.lastValue = '';
        this.oldChuncks = [];
        if (Cookies.get('ctrVal')) {
            this.setInputVal(Cookies.get('ctrVal'));
            this.lastValue = Cookies.get('ctrVal');
            this.oldChuncks = this.lastValue.split('\n');
        }
        
        this.reg = {
            chunck :/.+\ +\d{1,2}(\.\d{1,2})?$/gm,
            name : /.+?(?=(\ +\d))/g,
            tm : /\ (\d{1,2}(\.\d{1,2})?)/g,
            inpSplit : /\n/
        }
        
        this.input.spellcheck = false;
        this.input.addEventListener("blur",() => this.grabChuncks());
        this.input.addEventListener("keyup", (e) => this.checkEnter(e));
    }

    handleInputChange(e) {
        let actionLine = this.getLineNumber(e.target) - 1;
        let valSplitted = e.target.value.split('\n');

        if (valSplitted[actionLine].match(this.reg.chunck)) { // this.reg.chunck.test(valSplitted[actionLine]
            this.checkLine(actionLine, valSplitted[actionLine], () => this.oldChuncks = valSplitted)
        }

        let val = e.target.value;
        this.setInputVal(val);
    }

    checkEnter(e) {
        if (e.key == "Enter") {
            if (Object.keys(this.props.to).length ===  0|| Object.keys(this.props.from).length === 0) {
                e.preventDefault()
                this.focusInput();
                return;
            }// } else {
            //     this.grabChuncks();
            // }
        }

    }

    checkLine(lineNum, lineToCompare, cb) {
        let oldLine = this.oldChuncks[lineNum];
        if (lineToCompare == oldLine) return;

        let {addChunck} = this.props.npActions;
        let {changeName, changeDur} = this.props.chActions;

        let id = this.props.ids[lineNum];
        let newTm = lineToCompare.match(this.reg.tm)[0];
        let newNm = lineToCompare.match(this.reg.name)[0];
        
        if (id == undefined) { // new Line
            let momObj = this.addMoment(newTm);
            addChunck(newNm, momObj.from, momObj.to, parseInt(newTm.split(' ').join("")));
            cb();
            return;
        }

        let oldTm = this.reg.tm.test(oldLine) ? oldLine.match(this.reg.tm)[0] : null; 
        let oldNm = this.reg.name.test(oldLine) ? oldLine.match(this.reg.name)[0] : null;

        if (!oldNm || oldNm != newNm) {
            changeName(id, newNm);
        }

        if (!oldTm || oldTm != newTm) {
            changeDur(id, parseFloat(newTm));
        }

        cb();
    }

    addMoment(dur) {
        let {byId, ids} = this.props;
        let lastCh = byId[ids[ids.length-1]] ? byId[ids[ids.length-1]].to : this.props.from;
        let newCh = lastCh.clone().add(dur, 'hours');
        return {from: lastCh, to: newCh};
    }

    getLineNumber(textarea) {
        return textarea.value.substr(0, textarea.selectionStart).split("\n").length;
    }



    setInputVal(newVal) {
        this.setState({value: newVal});
    }
    
    grabChuncks() {
        let val = this.input.value;
        let splittedInp = val.split(this.reg.inpSplit);
    }

    focusInput() {
        if (Object.keys(this.props.from).length === 0) {
            document.querySelector('[data-type=from]').focus()
        } else {
            document.querySelector('[data-type=to]').focus()
        }
    }
    syncInput() {
        let ids = this.props.ids;
        let chuncks = this.props.txtCh;
        let resString = '';

        ids.forEach((id) => {
            let chunck = chuncks[id];
            resString += chunck.name + ' ' + chunck.duration + '\n';
        })

        
        let lastVal = this.state.value;
        resString = resString + lastVal.slice(lastVal.regexLastIndexOf(this.reg.chunck));
        this.setState(() => {return {value: resString}});
    }

    componentDidUpdate(prevProps) {
        this.props.ids.sort((id1, id2) => {
            return this.props.byId[id1].order > this.props.byId[id2].order ? 1 : -1;
        })
        console.log(this.props.txtCh);
        if (JSON.stringify(this.props.txtCh) != JSON.stringify(prevProps.txtCh)) {
            console.log('fresh');
            this.syncInput();
        }
    }
    
    render() {
        return(
            <div className="controller">
                <InputFields />
                <textarea onChange={this.handleInputChange} value={this.state.value} ref={(el) => this.input = el} className="ctrInput" />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
      byId: state.chuncksByID,
      ids: state.chuncksIDs,
      from: state.from,
      to: state.to,
      txtCh: state.txtChuncks
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
        npActions: bindActionCreators(npActions, dispatch), // eslint-disable-line
        chActions: bindActionCreators(chActions, dispatch)
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Controller)