/* eslint-disable */
import React, {Component} from 'react'
import moment from 'moment' // eslint-disable-line 


class Chunck extends Component {
    constructor(props) {
        super(props);
        this.setStuff = this.setStuff.bind(this);
    }

    setStuff(container) {
        if (container == null) return;

        this.cont = container;
        this.activeStyles = {color: "white", bgColor: "Crimson"};
        this.inActiveStyles = {color: this.cont.style.color, bgColor: this.cont.style.backgroundColor}
        this.active = false;
        this.checkActive();
        this.intervalId = setInterval(() => this.checkActive(), 10000)
    }

    checkActive() {

        let now = moment();
        let nowDur = moment.duration({h:now.get("hours"), m:now.get("minutes"), s:now.get("seconds")}).asSeconds();
        let from = moment(this.props.from, "h:mm A");
        let to = moment(this.props.to, "h:mm A");
        
        let fromDur = moment.duration({h:from.get("hours"), m:from.get("minutes")}).asSeconds();
        let toDur = moment.duration({h:to.get("hours"), m:to.get("minutes")}).asSeconds();

        if (this.active) {
            if (nowDur >= toDur) {
                clearInterval(this.intervalId);
                this.resetStyles();
                return;
            }
        }
        
        if ( nowDur > fromDur && nowDur < toDur) {
            this.setActiveStyles();
        } else if (nowDur > toDur) {
            clearInterval(this.intervalId);
        }
    }

    setActiveStyles() {
        this.active = true;
        this.cont.style.backgroundColor = this.activeStyles.bgColor;
        this.cont.style.color = this.activeStyles.color;
    }

    resetStyles() {
        this.cont.style.backgroundColor = this.inActiveStyles.bgColor;
        this.cont.style.color = this.inActiveStyles.color;
    }


    render() {
        let {from, to, name, order} = this.props;
        from = from.format('h:mm A');
        to = to.format('h:mm A');
        return (
            <div ref={this.setStuff} className="chunck">
                <div>{from}</div>
                <div>{to}</div>
                <div>{name}</div>
                <div>{order}</div>
            </div>
        )
    }
}

export default Chunck;