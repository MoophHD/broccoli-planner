import {SET_DT, ClEAR_DT} from '../constants/dt';

export function setDt(pl, type) {
    return {
        type: SET_DT,
        payload: pl,
        dtType: type
    }
}

export function clearDt() {
    return {
        type: ClEAR_DT
    }
}
