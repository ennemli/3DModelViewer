import React from "react"
const defaultScenePlayerContext = {
    isScenePaused: false,
    setPause: function (pause: boolean) {
        this.isScenePaused = pause;
    }
}
const ScenePlayerContext = React.createContext(defaultScenePlayerContext);
function useScenePlayer() {
    return { isSceneStopped: () => defaultScenePlayerContext.isScenePaused };
}

export { defaultScenePlayerContext, ScenePlayerContext, useScenePlayer };