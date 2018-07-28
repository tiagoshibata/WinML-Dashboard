import { IAction, SET_METADATA_PROPS } from '../actions';
import { ModelProtoSingleton } from './modelProto';

export const protoMiddleware = (store: any) => (next: (action: IAction) => any) => (action: IAction) => {
    if (action.type === SET_METADATA_PROPS) {
        ModelProtoSingleton.setMetadata(action.metadataProps);
    }
    return next(action);
}
