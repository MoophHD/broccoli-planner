/* eslint-disable */
import 
    {ADD_CHUNCK, 
    CLEAR_CHUNCKS,
    SET_ORDER,
    SET_DT,
    CHANGE_NAME,
    CHANGE_DT} from '../constants/core'
import moment from 'moment';
    

let initialState = {
    chuncksByID: {},
    chuncksIDs: [],
    from: {},
    to: {}
}
Array.prototype.swap = function (x,y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
  }

let id, byId, chIds;
export default function index(state=initialState, action) {
    switch (action.type) {
        case CHANGE_NAME:
            id = action.id;
            byId = {...state.chuncksByID};
            byId[id].name = action.name;            
            return {...state, chuncksByID:byId}
        case ADD_CHUNCK:
            id = action.id;
            return {...state,
                 chuncksIDs: [...state.chuncksIDs, id],
                 chuncksByID: {...state.chuncksByID, [id]: {
                     order: state.chuncksIDs.length,
                     duration: action.dur,
                     name: action.name,
                     from: action.from,
                     to: action.to}} } 
        case CLEAR_CHUNCKS:
            return {...state, chuncksByID:{}, chuncksIDs:[]}
        case SET_ORDER:
            byId = {...state.chuncksByID};
            byId[action.from].order = action.toInd;
            byId[action.to].order = action.fromInd;
            chIds = [...state.chuncksIDs];
                chIds.swap(action.fromInd, action.toInd);
            return {...state, chuncksByID:byId, chuncksIDs: chIds}
        case SET_DT :
            return {...state, [action.dtType]: action.payload}
        case CHANGE_DT:
            id = action.id;
            byId = moveChunckDt(state.chuncksIDs.indexOf(id), {...state.chuncksByID}, [...state.chuncksIDs], action.diff);
            return {...state, chuncksByID:byId}
        default:
            return state
    }
}

function moveChunckDt(start, byid, ids, diff) {
    // let momFunc = diff > 0 ? 'add' : 'subtract'
    let momFunc = 'add';
    console.log(momFunc);
    byid[ids[start]].to[momFunc](diff, 'hours');
    for (let i = start+1; i < ids.length; i++) {
        byid[ids[i]].from[momFunc](diff, 'hours');
        byid[ids[i]].to[momFunc](diff, 'hours');
    }

    return byid;
}