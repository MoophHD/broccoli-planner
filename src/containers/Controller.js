import React, {Component} from 'react';
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import * as npActions from '../actions/npActions'
// import moment from 'moment';



class Controller extends Component {
    constructor(props) {
        super(props);
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
                tm = ln.match(this.tmReg) ? ln.match(this.tmReg) : '0.5';

                let currId = id++;
                queueIds.push(currId);
                queueById[currId] = {name:name, tm: tm};
            }
        }, this);

        this.rebuild().then(() => {this.lastValue = val});
        

    }

    rebuild() {
        // if (!this.dtFrom || !this.dtTo) {
        //     this.focusInput();
        //     return;
        // }

        // let from = this.dtFrom;
        // let to = this.dtTo;

        let queueIds = this.queueIds,
            queueById = this.queueById,
            addChunck = this.props.actions.addChunck;

        queueIds.forEach((id) => {
            let current = queueById[id];
            addChunck(current.name, current.tm, current.tm+'1');
        })

        return new Promise((res) => res())
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
        if (e.keyCode != 13) return;

        let target = e.target;
        if (target.dataset.type == "from") {
            this.dtFrom = target.value;
        } else if (target.dataset.type == "to") {
            this.dtTo = target.value;
        }

    }



    render() {
        return(
            <div className="controller">
                <div className="dtInput">
                    from:<input onKeyPress={(e) => this.handleInputSubmit(e)} data-type="from"></input>
                </div>
                <div className="dtInput">
                    to:<input data-type="to"></input>
                </div>
                <div className="dtInput total">
                    total:<input></input>
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