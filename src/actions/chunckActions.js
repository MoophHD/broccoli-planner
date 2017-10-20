import {CHANGE_NAME,
        CHANGE_DUR} from '../constants/core'

export function changeName(id, name) {
    return {
        type: CHANGE_NAME,
        name: name,
        id: id
    }
}

export function changeDur(id, dur) {
    return {
        type: CHANGE_DUR,
        dur: dur,
        id: id
    }
}

