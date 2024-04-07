import * as three from 'three'
import { defaultSceneProps } from './constants';
import { Scene, SceneProps } from './types';



function setupScene(sceneProps: SceneProps | undefined): Scene {
    let camera;
    const {
        antialias = defaultSceneProps.antialias,
        cameraType = defaultSceneProps.cameraType,
        cameraProps = defaultSceneProps.cameraProps
    } = sceneProps || defaultSceneProps;
    const {
        aspect = defaultSceneProps.cameraProps.aspect,
        fov = defaultSceneProps.cameraProps.fov,
        near = defaultSceneProps.cameraProps.near,
        far = defaultSceneProps.cameraProps.far,
        position = defaultSceneProps.cameraProps.position
    } = cameraProps;
    if (cameraType === "perspective") {
        camera = new three.PerspectiveCamera(fov, aspect, near, far);
    } else {
        camera = new three.OrthographicCamera(-aspect, aspect, aspect, -aspect, near, far)
    }
    camera.position.set(...position as [x: number, y: number, z: number]);
    const scene = new three.Scene();
    const renderer = new three.WebGLRenderer({ antialias });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("#000000");
    scene.add(camera);
    return { scene, renderer, camera };
}
export { setupScene }