/* eslint-disable */
import 
    {ADD_CHUNCK, 
    CLEAR_CHUNCKS,
    SET_ORDER} from '../constants/core'
let initialState = {
    chuncksByID: {},
    chuncksIDs: []
}
Array.prototype.swap = function (x,y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
  }


export default function index(state=initialState, action) {
    switch (action.type) {
        case ADD_CHUNCK:
            let id = action.id;
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
            let byId = state.chuncksByID;
                byId[action.from].order = action.toInd;
                byId[action.to].order = action.fromInd;
            return {...state,chuncksByID:byId, chuncksIDs: state.chuncksIDs.swap(action.fromInd, action.toInd)}
        default:
            return state
    }

}