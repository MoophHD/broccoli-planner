/* eslint-disable */
import 
    {ADD_CHUNCK, 
    CLEAR_CHUNCKS,
    SET_ORDER,
    SET_DT,
    CHANGE_NAME,
    CHANGE_DUR} from '../constants/core'
import moment from 'moment';
    

let initialState = {
    chuncksByID: {},
    chuncksIDs: [],
    from: {},
    to: {},
    txtChuncks: {}
}

Array.prototype.swap = function (x,y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
  }

let id, byId, chIds, txt, order;
export default function index(state=initialState, action) {
    switch (action.type) {
        case CHANGE_NAME:
            id = action.id;
            byId = {...state.chuncksByID};
            txt = {...state.txtChuncks};
            byId[id].name = txt[id].name = action.name;   
            return {...state, chuncksByID:byId}
        case ADD_CHUNCK:
            id = action.id;
            order = action.order ? action.order : state.chuncksIDs.length
            return {...state,
                 txtChuncks: {...state.txtChuncks, [id]:{name: action.name, duration:action.dur, order: order}},
                 chuncksIDs: [...state.chuncksIDs, id],
                 chuncksByID: {...state.chuncksByID, [id]: {
                     order: order,
                     duration: action.dur,
                     name: action.name,
                     from: action.from,
                     to: action.to}} } 
        case CLEAR_CHUNCKS:
            return {...state, chuncksByID:{}, chuncksIDs:[], txtChuncks: {}}
        case SET_ORDER:
            byId = {...state.chuncksByID};
            txt = {...state.txtChuncks};
            byId[action.from].order = txt[action.from].order = action.toInd;
            byId[action.to].order =  txt[action.to].order =action.fromInd;
            return {...state, chuncksByID:byId}
        case SET_DT :
            return {...state, [action.dtType]: action.payload}
        case CHANGE_DUR:
            id = action.id;
            txt[id].duration + action.dur;
            byId = moveChunckDt(state.chuncksIDs.indexOf(id), {...state.chuncksByID}, [...state.chuncksIDs], action.dur - state.chuncksByID[id].duration)
            return {...state, chuncksByID:byId}
        default:
            return state
    }
}

function moveChunckDt(start, byid, ids, diff) {
    byid[ids[start]].duration += diff;
    diff = diff * 60; // to mins
    byid[ids[start]].to.add(diff, 'minutes');
    for (let i = start+1; i < ids.length; i++) {
        byid[ids[i]].to.add(diff, 'minutes');
    }
    return byid;
}