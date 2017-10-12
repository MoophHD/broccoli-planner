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
        // this.unformDtReg = /(\d{1,2}|\d{1,2}\.\d{1,2})(\ |\:|\-)(\d{1,2}\.\d{1,2}|\d{1,2})/g;
        // this.nameReg = /.*\ \d/gm;
        this.nameReg = /.+?(?=(\d{1,2}\.\d{1,2}|\d))/;
        this.tmReg = /\d{1,2}(\.\d{1,2})?/g;


        this.input.addEventListener("keypress",(e) => this.handleEnter(e))
        this.input.addEventListener("blur",() => this.build())
    }

    handleEnter(e) {
        if (e.keyCode == 13) {
            this.build();
        }
    }

    build() {
        let inp = this.input.value.split('\n'),
            tm,
            name;
        console.log(inp);

        inp.forEach(function(ln) {
            if (this.tmReg.test(ln)) {
                // let dt = ln.match(this.unformDtReg);
                name = ln.match(this.nameReg) ? ln.match(this.nameReg)[0] : 'None';
                tm = ln.match(this.tmReg)[0];
                console.log(name);
                console.log(tm);
            }
        }, this);

    }

    render() {
        return(
            <div className="controller">
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