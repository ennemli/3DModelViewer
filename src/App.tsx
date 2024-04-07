import './App.css';

import Canvas from './components/canvas';
import OrbitControls from './components/orbitcontrols';
import { Leva } from 'leva';
import SceneLight from './components/sceneLight';
import ModelViewer from './components/3DModelView';
import FireSmoke from './components/fireSmoke';
import { Suspense, useEffect, useState } from 'react';
import { defaultScenePlayerContext, ScenePlayerContext } from './context/scenePlayer';

function Loading() {
  return <div className="loading">
    <div>
      <h1>Loading...</h1>
    </div>
  </div>
}
function Player() {
  const [isPaused, setIsPaused] = useState(defaultScenePlayerContext.isScenePaused);
  const togglePlayer = () => {
    if (defaultScenePlayerContext.isScenePaused) {
      defaultScenePlayerContext.setPause(false);
    } else {
      defaultScenePlayerContext.setPause(true);
    }
    setIsPaused(defaultScenePlayerContext.isScenePaused)

  }
  return <div>
    <button onClick={togglePlayer} className='player'>
      {isPaused && <h4>Play</h4>}
      {!isPaused && <h4>Pause</h4>}
    </button>
  </div>
}
function App() {
  return (
    <div>
      <Suspense fallback={<Loading />
      }>

        <Canvas
          sceneProps={{
            cameraProps: {
              position: [0, 0, -50],
            }
          }}
          canvasProps={
            {
              style: {
                width: "100%",
                height: "100%",
                backgroundColor: "#000000",
                position: "absolute",

              }
            }
          }>
          <ScenePlayerContext.Provider value={defaultScenePlayerContext}>
            <ModelViewer />
            <FireSmoke />
            <OrbitControls />
            <SceneLight />
          </ScenePlayerContext.Provider>
        </Canvas>
        <Player />

      </Suspense>
      <Leva hidden={false} collapsed={false} />
    </div>
  );
}

export default App;
