/* eslint-disable */
import 
    {ADD_CHUNCK, 
    CLEAR_CHUNCKS,
    SET_ORDER,
    SET_DT,
    CHANGE_NAME,
    REBUILD_CHUNCKS,
    CHANGE_DUR} from '../constants/core'
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

let id, order, ids, byId
export default function index(state=initialState, action) {
    switch (action.type) {
        case REBUILD_CHUNCKS:
            ({byId, ids} = rebuildChuncks(action.byId, action.ids, state.from));
            return {...state, chuncksByID:byId, chuncksIDs:ids}
        case CHANGE_NAME:
            id = action.id;
            byId = {...state.chuncksByID};
            byId[id].name = action.name;   
            return {...state, chuncksByID:byId}
        case ADD_CHUNCK:
            id = action.id;
            order = action.order ? action.order : state.chuncksIDs.length;
            ({byId, ids} = rebuildChuncks({...state.chuncksByID, [id]: {
                order: order,
                duration: action.dur,
                name: action.name}
            },[...state.chuncksIDs, id], state.from));
            return {...state,
                 chuncksIDs: ids,
                 chuncksByID: byId } 
        case CLEAR_CHUNCKS:
            return {...state, chuncksByID:{}, chuncksIDs:[]}
        case SET_ORDER:
            let _byId = {...state.chuncksByID};
            _byId[action.from].order  = action.toInd;
            _byId[action.to].order =action.fromInd;
           ({byId, ids} = rebuildChuncks(_byId, [...state.chuncksIDs], state.from));
            return {...state, chuncksByID:byId, chuncksIDs:ids}
        // return {...state};
        case SET_DT :
            if (action.dtType == "from") {
                ({byId, ids} = rebuildChuncks({...state.chuncksByID}, [...state.chuncksIDs], action.payload));
                return {...state, [action.dtType]: action.payload,
                    chuncksByID: byId,
                    chuncksIDs: ids}
            } else {
                return {...state, [action.dtType]: action.payload}
            }
        case CHANGE_DUR:
            id = action.id;
            byId = moveChunckDt(state.chuncksIDs.indexOf(id), {...state.chuncksByID}, [...state.chuncksIDs], action.dur - state.chuncksByID[id].duration)
            return {...state, chuncksByID:byId}
        default:
            return state
    }
}

function reorderIds(ids, byId) {
    ids.sort((a,b) => {
        return byId[a].order > byId[b].order ? 1 : -1;
    })
    return ids;
}

function rebuildChuncks(byId={}, ids=[], from) {
    ids = reorderIds(ids, byId);
    let anchorFrom = from;
    let predictedChTo;
    ids.forEach(function(id, ind) {
        let ch = byId[id];
        let dur;

        if (/\.\d{2}/.test(ch.duration)) {
            dur = 60*~~(ch.duration)+ch.duration%1*100;
        } else {
            dur = 60*ch.duration;
        }
        console.log(dur);
        dur = Math.round(dur);

        let anchorTo = anchorFrom.clone().add(dur, 'minutes');
        if (!ch.from || !ch.to) {
            byId[id].from = anchorFrom;
            byId[id].to = anchorTo;
        } else if(!ch.from.isSame(anchorFrom) && !ch.to.isSame(anchorTo))  {
            byId[id].from = anchorFrom;
            byId[id].to = anchorTo;
        } else if (!ch.from.isSame(anchorFrom)) {
            byId[id].from = anchorFrom;
        } else if (!ch.to.isSame(anchorTo)) {
            byId[id].to = anchorTo;
        }
        anchorFrom = anchorTo;
    });

    return {byId:byId, ids:ids};
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