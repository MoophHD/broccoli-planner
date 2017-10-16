/* eslint-disable */
import 
    {ADD_CHUNCK, 
    CLEAR_CHUNCKS,
    SET_ORDER} from '../constants/core'
let initialState = {
    chuncksByID: {},
    chuncksIDs: [],
    chunckOrder: []
}
export default function index(state=initialState, action) {
    switch (action.type) {
        case ADD_CHUNCK:
            let id = action.id;
            return {...state,
                 chunckOrder: [...state.chunckOrder, state.chunckOrder.length],
                 chuncksIDs: [...state.chuncksIDs, id],
                 chuncksByID: {...state.chuncksByID, [id]: {
                     name: action.name,
                     from: action.from,
                     to: action.to}} } 
        case CLEAR_CHUNCKS:
            return {...state, chuncksByID:{}, chuncksIDs:[], chunckOrder:[]}
        case SET_ORDER:
            return {...state, order: action.order}
        default:
            return state
    }

}