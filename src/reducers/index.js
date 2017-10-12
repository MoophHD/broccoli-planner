/* eslint-disable */
import {ADD_CHUNCK} from '../constants/core'
let initialState = {
    chuncksByID: {},
    chuncksIDs: []
}
let id;
export default function index(state=initialState, action) {
    switch (action.type) {
        case ADD_CHUNCK:
            id = action.id;
            return {...state,
                 chuncksIDs: [...state.chuncksIDs, id],
                 chuncksByID: {...state.chuncksByID, [id]: {
                     name: action.name,
                     from: action.from,
                     to: action.to}} } 
        default:
            return state
    }

}