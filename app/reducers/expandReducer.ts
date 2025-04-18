export type ExpandAction =
| { type: 'TOGGLE'; id: string }
| { type: 'SET_ALL'; map: Record<string, boolean> }

export default function expandReducer(
  state: Record<string, boolean>,
  action: ExpandAction
): Record<string, boolean> {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, [action.id]: !state[action.id] }
    case 'SET_ALL':
      return action.map
    default:
      return state
  }
}
