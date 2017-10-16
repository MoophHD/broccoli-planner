import 
    {ADD_CHUNCK,
    CLEAR_CHUNCKS,
    SET_ORDER} from '../constants/core'

let nextChunckId = 0;

export function addChunck(name,from,to) {
    return {
        type: ADD_CHUNCK,
        name: name,
        id: nextChunckId++,
        from: from,
        to: to
    }
}

export function clearChuncks() {
    return {
        type: CLEAR_CHUNCKS
    }
}

export function setOrder(order) {
    return {
        type: SET_ORDER,
        order: order
    }
}