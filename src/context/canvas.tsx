import React, { useContext } from "react"
import { Scene } from "../lib/types";
type AnimateCallBacks = (delta?: number) => void
type AnimateContextT = {
    callBacks: AnimateCallBacks[];
    setCallBacks: (callback: AnimateCallBacks) => void
}
const defaultAnimateContextValue: AnimateContextT = {
    callBacks: [],
    setCallBacks: function (callback) {
        this.callBacks.push(callback);
    }
}
const SceneContext = React.createContext<Scene>(null!);
const AnimateContext = React.createContext<AnimateContextT>(defaultAnimateContextValue)
function useScene() {
    const canvasElement = React.useContext(SceneContext);
    return canvasElement;
}

function useFrame(callBack: AnimateCallBacks) {
    const animateContext = useContext(AnimateContext);
    animateContext.setCallBacks(callBack);
}



export { useScene, useFrame, SceneContext, AnimateContext, defaultAnimateContextValue }