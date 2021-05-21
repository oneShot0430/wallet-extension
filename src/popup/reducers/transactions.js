import { SET_TRANSACTIONS } from '../actions/types'

const initialState = []

export default (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case SET_TRANSACTIONS:
      return [...state, ...payload]
    default:
      return state
  }
}