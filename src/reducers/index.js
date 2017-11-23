import{
  ADD_CHUNCK, 
  CLEAR_CHUNCKS,
  SET_ORDER,
  REBUILD_CHUNCKS,
  TOGGLE_AREA_TYPE
  } from '../constants/core'

import {
  CHANGE_NAME,
  REVISE_ACTIVE_CHUNCK
} from '../constants/chunck'

import {
  SET_DT,
  ClEAR_DT
} from '../constants/dt'
import moment from 'moment'; // eslint-disable-line


let initialState = {
  chuncksByID: {},
  chuncksIDs: [],
  from: {},
  to: {},
  activeChunckId: -1,
  isAreaActive: false
}

let id, order, ids, byId;

export default function index(state=initialState, action) {
switch (action.type) {
    case REVISE_ACTIVE_CHUNCK:
        id = getActiveChunck(state);
        return {...state, activeChunckId: id}
    case TOGGLE_AREA_TYPE:
        return {...state, isAreaActive:!state.isAreaActive}
    case REBUILD_CHUNCKS:
        ({byId, ids} = rebuildChuncks(action.byId, action.ids, state.from));
        id = getActiveChunck({chuncksByID: byId, chuncksIDs: ids});
        return {...state, chuncksByID:byId, chuncksIDs:ids, activeChunckId: id}
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
    case ClEAR_DT:
          return {...state, from: {}, to:{}}
    case SET_DT :
        if (action.dtType == "from") {
            ({byId, ids} = rebuildChuncks({...state.chuncksByID}, [...state.chuncksIDs], action.payload));
            return {...state, [action.dtType]: action.payload,
                chuncksByID: byId,
                chuncksIDs: ids}
        } else {
            return {...state, [action.dtType]: action.payload}
        }
        break;
    default:
        return state
}
}

function getActiveChunck({chuncksByID, chuncksIDs}) {
    let nowDt = moment();
    let nowSecs = moment.duration({h:nowDt.get("hours"), m:nowDt.get("minutes"), s:nowDt.get("seconds")}).asSeconds();

    let chunck, id;

    for (let i = 0; i < chuncksIDs.length; i++) {
        id = chuncksIDs[i];
        chunck = chuncksByID[id];
        
        if (nowSecs >= chunck._fromSecs && nowSecs <= chunck._toSecs) {
            return id;
        }
    }

    return -1;
}

function reorderIds(ids, byId) {
    ids.sort((a,b) => {
        return byId[a].order > byId[b].order ? 1 : -1;
    })
    return ids;
}

function rebuildChuncks(byId={}, ids=[], from) {
    ids = reorderIds(ids, byId);
    if (Object.keys(from).length === 0) return {byId:{}, ids:[]};

    let anchorFrom = from;

    ids.forEach((id) => {
        let ch = byId[id];
        let dur;


        if (/\.\d{2}/.test(ch.duration)) {
            dur = 60*~~(ch.duration)+ch.duration%1*100;
        } else {
            dur = 60*ch.duration;
        }
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

        let _from = byId[id].from;
        let _to = byId[id].to;

        //secs from start of a day
        byId[id]._fromSecs =  moment.duration({h:_from.get("hours"), m:_from.get("minutes"), s:_from.get("seconds")}).asSeconds();
        byId[id]._toSecs   =  moment.duration({h:_to.get("hours"), m:_to.get("minutes"), s:_to.get("seconds")}).asSeconds();
        
        anchorFrom = anchorTo;
    }); 

    return {byId:byId, ids:ids};
}