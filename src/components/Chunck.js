
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
        if (this.active) {
            if (nowDur > toDur) {
                clearInterval(this.intervalId);
                this.resetStyles();
                return;
            }
        }

        let now = moment();
        let nowDur = moment.duration({h:now.get("hours"), m:now.get("minutes")}).asSeconds();
        let from = moment(this.props.from, "h:mm A");
        let to = moment(this.props.to, "h:mm A");
        
        let fromDur = moment.duration({h:from.get("hours"), m:from.get("minutes")}).asSeconds();
        let toDur = moment.duration({h:to.get("hours"), m:to.get("minutes")}).asSeconds();
        
        console.log(fromDur);
        console.log(nowDur);
        console.log(toDur);
        console.log(nowDur < toDur)
        if ( nowDur > fromDur && nowDur < toDur) {
            console.log('tada');
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
        let {from, to, name} = this.props;

        return (
            <div ref={this.setStuff} className="chunck">
                <div>{from}</div>
                <div>{to}</div>
                <div>{name}</div>
            </div>
        )
    }
}

export default Chunck;