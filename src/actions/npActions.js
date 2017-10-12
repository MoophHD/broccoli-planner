import {ADD_CHUNCK} from '../constants/core'

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