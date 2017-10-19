import {CHANGE_NAME,
        CHANGE_DT} from '../constants/core'

export function changeName(id, name) {
    return {
        type: CHANGE_NAME,
        name: name,
        id: id
    }
}

export function changeDt(id, diff) {
    return {
        type: CHANGE_DT,
        diff: diff,
        id: id
    }
}

