import { CompositionAction } from "../actions/composition";

import {
    ADD_LAYER,
    MOVE_LAYER,
    REMOVE_LAYER_AT,
    SET_DURATION,
    SET_FPS,
    SET_HEIGHT,
    SET_WIDTH,
    UPDATE_LAYER,
} from "../constants/";

import { CompositionState } from "../types/index";

import { layerReducer } from "./layer";

export const CompositionInitialState: CompositionState = {
    height: 500,
    width: 500,

    duration: 2,
    fps: 12,
    layers: [],
};

export function compositionReducer(
    state: CompositionState = CompositionInitialState,
    action: CompositionAction): CompositionState {

        switch (action.type) {
            case UPDATE_LAYER:
                return {
                  ...state,
                    layers: [
                        ...state.layers.slice(0, action.index),
                        layerReducer(state[action.index], action.layerAction),
                        ...state.layers.slice(action.index + 1),
                    ],
                };
            case ADD_LAYER:
                return {
                    ...state,
                    layers: [
                        ...state.layers,
                        action.layer,
                    ],
                };
            case REMOVE_LAYER_AT:
                return {
                    ...state,
                    layers: state.layers.splice(action.at, 1),
                };
            case MOVE_LAYER:
                const results = state.layers.slice();
                results[action.from] = state.layers[action.to];
                results[action.to] = state.layers[action.from];
                return {
                    ...state,
                    layers: results,
                };
            case SET_HEIGHT:
                return { ...state, height: action.height };
            case SET_WIDTH:
                return { ...state, width: action.width };
            case SET_DURATION:
                return { ...state, duration: action.duration };
            case SET_FPS:
                return { ...state, fps: action.fps };
        }
        return state;
    }