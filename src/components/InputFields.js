import React, { Component } from 'react';
import * as actions from '../actions/pageActions';
import { bindActionCreators } from 'redux' 
import { connect } from 'react-redux'
import moment from 'moment'

class InputFields extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spare: ''
        }
        this.handleInputSubmit = this.handleInputSubmit.bind(this);
    }

    checkInputKeyDown(e) {
        if (e.key != "Enter") return;
        
        this.handleInputSubmit(e);

        if (e.target.dataset.type == "from") {
            document.querySelector('[data-type=to]').focus();
        } else if (e.target.dataset.type == "to") {
            document.querySelector('.ctrInput').focus();
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

        this.props.actions.setDt(vl, type);

        if (this.dtFrom && this.dtTo) {
            let totalInp = document.querySelector('.total input');
            totalInp.value=this.dtTo.diff(this.dtFrom, "hours") + 'h'+ this.dtTo.diff(this.dtFrom, "minutes")%60+ "m";
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
                val = val.split(/\ ?AM|\ ?PM/i).join("");
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

    componentWillReceiveProps(nextProps) {
        let {ids, byId, from, to} = nextProps;
        if (!from || !to) return;

        let result;
        let overAll = to.diff(from, 'minutes');
        let fullfilled = 0; // in minutes

        ids.forEach(function(id) {
            fullfilled += byId[id].to.diff(byId[id].from, 'minutes');
        });

        result = Math.round(overAll - fullfilled);

        this.setState(() => {return {spare:`${~~(result/60)}h${result%60}m`}})
    }

    render() {
        return(
            <div>
                <div className="dtInput">
                    from:<input autoFocus={true} onFocus={(e) => e.target.select()} onBlur={this.handleInputSubmit} onKeyPress={(e) => this.checkInputKeyDown(e)} data-type="from"></input>
                </div>
                <div className="dtInput">
                    to:<input onFocus={(e) => e.target.select()} onBlur={this.handleInputSubmit} onKeyPress={(e) => this.checkInputKeyDown(e)} data-type="to"></input>
                </div>
                <div className="dtInput total">
                    spare:<input value={this.state.spare} tabIndex="-1" readOnly></input>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        from: state.from,
        to: state.to,
        byId: state.chuncksByID,
        ids: state.chuncksIDs
    }
}
  
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch) // eslint-disable-line
    }
}
  

export default connect(mapStateToProps, mapDispatchToProps)(InputFields)
