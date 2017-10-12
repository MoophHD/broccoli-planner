import React, {Component} from 'react'

class Chunck extends Component {
    render() {
        const {from, to, name} = this.props;
        return (
            <div className="chunck">
                <div>{from}</div>
                <div>{to}</div>
                <div>{name}</div>
            </div>
        )
    }
}

export default Chunck;