import 
    {ADD_CHUNCK,
    CLEAR_CHUNCKS,
    SET_ORDER} from '../constants/core'

let nextChunckId = 0;

export function addChunck(name,from,to,dur, order) {
    return {
        type: ADD_CHUNCK,
        name: name,
        id: nextChunckId++,
        from: from,
        to: to,
        dur: dur,
        order: order
    }
}

export function clearChuncks() {
    return {
        type: CLEAR_CHUNCKS
    }
}

export function setOrder(from, to, fromInd,  toInd) {
    return {
        type: SET_ORDER,
        from: from,
        to: to,
        fromInd: fromInd,
        toInd: toInd
    }
}