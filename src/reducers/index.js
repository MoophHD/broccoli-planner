/* eslint-disable */
import {ADD_CHUNCK, CLEAR_CHUNCKS} from '../constants/core'
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
                 chunckOrder: [...state.chunckOrder, state.chunckOrder.length+1],
                 chuncksIDs: [...state.chuncksIDs, id],
                 chuncksByID: {...state.chuncksByID, [id]: {
                     name: action.name,
                     from: action.from,
                     to: action.to}} } 
        case CLEAR_CHUNCKS:
            return {...state, chuncksByID:{}, chuncksIDs:[], chunckOrder:[]}
        default:
            return state
    }

}