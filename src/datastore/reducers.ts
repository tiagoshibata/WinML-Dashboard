import * as actions from './actions';
import IState from './state';

export function rootReducer(state: IState, action: actions.IAction) {
    state = state || {};
    switch (action.type) {
        case actions.UPDATE_INPUTS:
            return { ...state, inputs: action.inputs };
        case actions.UPDATE_METADATA_PROPS:
            return { ...state, metadataProps: action.metadataProps };
        case actions.UPDATE_NODES:
            return { ...state, nodes: action.nodes };
        case actions.UPDATE_OUTPUTS:
            return { ...state, outputs: action.outputs };
        case actions.UPDATE_PROPERTIES:
            return { ...state, properties: action.properties };
        case actions.UPDATE_SELECTED_NODE:
            return { ...state, selectedNode: action.selectedNode };
        default:
            return state;
    }
}
