import React, {Component} from 'react';
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as pageActions from '../actions/pageActions'
import Cookies from 'js-cookie'
import InputFields from '../components/InputFields'
import regLastMatched from '../gist/regLastMatched'
import StaticController from '../components/StaticController'

class Controller extends Component {
    constructor(props) {
        super(props);

        this.state = {value: '', isAreaActive:true};
        this.handleInputChange = this.handleInputChange.bind(this);
        this.checkEnter = this.checkEnter.bind(this);
        this.checkVal = this.checkVal.bind(this);
        this.toggleArea = this.toggleArea.bind(this);
    }

    componentWillMount() {
        this.oldinpStrChuncks = [];
    }
    componentDidMount() {
        this.lastActiveId = -1;
        this.lastCursorPos = 0;
        this.lastValue = '';
        this.lastById = '';
        if (Cookies.get('ctrVal')) {
            this.input.value = Cookies.get('ctrVal');
            this.handleInputChange({target: this.input});
            this.lastValue = Cookies.get('ctrVal');
        }
        
        this.reg = {
            chunck :/.+\ +\d{1,2}(\.\d{1,2})?($|\ ?\/{1,2})/gm,
            name : /.+?(?=(\ +\d))/g,
            duration : /\ (\d{1,2}(\.\d{1,2})?)/g,
            fullDur : /\ \d{1,2}\.\d{1,2}/g,
            inpSplit : /\n/
        }

        this.input.spellcheck = false;
        window.addEventListener('beforeunload', function() {this.handleUnload(this.oldinpStrChuncks ? this.oldinpStrChuncks.join("\n") : '')}.bind(this) )
        this.input.addEventListener("blur",() => this.checkVal());
        this.input.addEventListener("keyup", (e) => this.checkEnter(e));

        this.handleUnload = this.handleUnload.bind(this);
    }

    handleUnload(vl) {
        if (vl > 0 && this.props.ids.length > 0) {
            Cookies.set('ctrVal', vl, {expires: 1});
        }
    }

    handleInputChange(e) {
        this.lastCursorPos = e.target.selectionEnd;
        this.setState({value: e.target.value},function() {this.checkVal()}.bind(this));
    }

    checkVal() {
        let inpStrChuncks = this.state.value.match(this.reg.chunck);
        Cookies.set('ctrVal',inpStrChuncks ? inpStrChuncks.join("\n") : '', {expires: 1});
        
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
        if (!this.props.isAreaActive && this.lastById && this.lastById != JSON.stringify(nextProps.byId)) {
            this.syncInput(nextProps);
        }

        let target;
        if (nextProps.activeId == undefined) { // && this.lastActiveId != -1
            this.lastActiveStaticChunck.classList.remove("active");
        } else if ( nextProps.activeId != this.lastActiveId) {
            if (!this.props.byId[nextProps.activeId]) return;
            target = document.querySelector(`.staticChunck[data-order="${this.props.byId[nextProps.activeId].order}"]`);
            if (!target) return;

            if(this.lastActiveStaticChunck ) this.lastActiveStaticChunck.classList.remove('active');

            target.classList.add('active');
            this.lastActiveStaticChunck = target;
            
        }

        this.lastById = JSON.stringify(nextProps.byId);
    }

    componentDidUpdate() {
        if (this.props.isAreaActive) this.input.focus();
    }

    toggleArea() {
        this.props.pageActions.toggleAreaType();
    }
    

    render() {
        return(
            <div className="controller">
                <InputFields />
                <textarea style={{display:this.props.isAreaActive ? "block" : "none"}} onBlur={this.toggleArea} onChange={this.handleInputChange} value={this.state.value} ref={(el) => this.input = el} className="ctrInput" />
                <StaticController isActive={!this.props.isAreaActive} handleClick={this.toggleArea} chuncks={this.state.value.split('\n')}/>
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
      activeId: state.activeChunckId,
      isAreaActive: state.isAreaActive
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(pageActions, dispatch) 
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Controller)