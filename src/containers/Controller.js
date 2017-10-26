/* eslint-disable */ 
import React, {Component} from 'react';
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import moment from 'moment';
import * as pageActions from '../actions/pageActions'
import Cookies from 'js-cookie'
import InputFields from '../components/InputFields'
import regLastMatched from '../gist/regLastMatched'

class Controller extends Component {
    constructor(props) {
        super(props);

        this.state = {value: ''};
        this.handleInputChange = this.handleInputChange.bind(this);
        this.checkEnter = this.checkEnter.bind(this);
        this.checkVal = this.checkVal.bind(this);
    }

    componentWillMount() {
        this.oldinpStrChuncks = [];
    }
        
    componentDidMount() {
        this.lastCursorPos = 0;
        this.lastValue = '';
        this.lastById = '';
        if (Cookies.get('ctrVal')) {
            this.input.value = Cookies.get('ctrVal');
            this.handleInputChange({target: this.input});
            this.lastValue = Cookies.get('ctrVal');
        }
        
        this.reg = {
            chunck :/.+\ +\d{1,2}(\.\d{1,2})?$/gm,
            name : /.+?(?=(\ +\d))/g,
            duration : /\ (\d{1,2}(\.\d{1,2})?)/g,
            fullDur : /\ \d{1,2}\.\d{1,2}/g,
            inpSplit : /\n/
        }
        
        this.input.spellcheck = false;
        window.addEventListener('beforeunload', () => this.handleUnload(this.input.value))
        this.input.addEventListener("blur",() => this.checkVal());
        this.input.addEventListener("keyup", (e) => this.checkEnter(e));

        this.handleUnload = this.handleUnload.bind(this);
    }

    handleUnload(vl) {
        if (this.state.value.length > 0) {
            Cookies.set('ctrVal', this.state.value, {expires: 1});
        }
    }

    handleInputChange(e) {
        this.lastCursorPos = e.target.selectionEnd;
        this.setState({value: e.target.value},function() {this.checkVal()}.bind(this));
    }

    checkVal() {
        Cookies.set('ctrVal', this.state.value, {expires: 1});
        let inpStrChuncks = this.state.value.match(this.reg.chunck);

        if (!inpStrChuncks) inpStrChuncks = [];
        if (!this.oldinpStrChuncks ) this.oldinpStrChuncks = [];

        if (inpStrChuncks.length == this.oldinpStrChuncks.length && 
            JSON.stringify(inpStrChuncks) == JSON.stringify(this.oldinpStrChuncks)) {
            return;
        }

        this.oldinpStrChuncks = inpStrChuncks;
        let chuncks = {};
        let ids = this.props.ids.slice();
        let lastId = ids.length > 0 ? ids.length : 0;
        let dur;

        while (ids.length < inpStrChuncks.length) {
            ids.push(lastId++);
        }

        inpStrChuncks.forEach((ch, ind) => {
            dur = ch.match(this.reg.duration)[0]
            chuncks[ids[ind]] = {};
            chuncks[ids[ind]].name = ch.match(this.reg.name)[0];
            chuncks[ids[ind]].duration = dur.slice(1, dur.length);
            chuncks[ids[ind]].order = ind;
        })
        ids = ids.slice(0, inpStrChuncks.length);
        this.props.pageActions.rebuildChuncks(chuncks, ids);
    }


    checkEnter(e) {
        if (e.key == "Enter") {
            if (Object.keys(this.props.to).length ===  0|| Object.keys(this.props.from).length === 0) {
                e.preventDefault()
                this.focusInput();
                return;
            }
        }

    }

    addMoment(dur) {
        let {byId, ids} = this.props;
        let lastCh = byId[ids[ids.length-1]] ? byId[ids[ids.length-1]].to : this.props.from;
        let newCh = lastCh.clone().add(dur, 'hours');
        return {from: lastCh, to: newCh};
    }
    
    focusInput() {
        if (Object.keys(this.props.from).length === 0) {
            document.querySelector('[data-type=from]').focus()
        } else {
            document.querySelector('[data-type=to]').focus()
        }
    }

    syncInput({ids, byId}) {
        let chuncks = byId;
        let resString = '';

        ids.forEach((id) => {
            let chunck = chuncks[id];
            resString += chunck.name + ' ' + chunck.duration + '\n';
        })

        resString = resString.slice(0, -1);
        
        let lastVal = this.state.value;
        let lastCh = regLastMatched(lastVal, this.reg.chunck);
        resString = resString + lastVal.slice(lastCh.index+lastCh.value.length, lastVal.length);
        
        this.setState({value: resString}, () => this.input.setSelectionRange(this.lastCursorPos, this.lastCursorPos));
    }

    componentWillReceiveProps(nextProps) {
        // if (Object.keys(this.props.byId).length == Object.keys(nextProps.byId).length && // resorted
        //     this.lastById && this.lastById != JSON.stringify(nextProps.byId)) {
        //     this.syncInput(nextProps);
        // }

        if (this.lastById && this.lastById != JSON.stringify(nextProps.byId)) {
            this.syncInput(nextProps);
        }
        
        this.lastById = JSON.stringify(nextProps.byId);
    }

    componentDidUpdate(prevProps) {
        let el = this.input;
        let top = el.offsetTop;
        let scrollT = el.scrollTop;
        let unit = top;

        var span = document.createElement("span");
        document.body.appendChild(span);
        span.classList.add('ctrInput');
        span.innerHTML="Hello World"; 
        let lnHeight = span.offsetHeight;
        document.body.removeChild(span);
        
        // console.log(lnHeight);
        // if (prevProps.activeId != this.props.activeId) {

        // }
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
      activeId: state.activeChunckId
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(pageActions, dispatch) 
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Controller)