import {SET_DT} from '../constants/core';

export function setDt(pl, type) {
    return {
        type: SET_DT,
        payload: pl,
        dtType: type
    }
}