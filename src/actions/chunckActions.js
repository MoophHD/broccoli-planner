import { 
    CHANGE_NAME,
    CHANGE_DUR,
    REVISE_ACTIVE_CHUNCK 
} from '../constants/chunck'

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

export function reviseActiveChunck() {
    return {
        type: REVISE_ACTIVE_CHUNCK
    }
}