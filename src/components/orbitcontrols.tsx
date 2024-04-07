import { useEffect } from 'react';
import { OrbitControls as Orbit } from 'three/examples/jsm/controls/OrbitControls';
import { useScene } from '../context/canvas';

const OrbitControls = function () {
    const { renderer, camera } = useScene();
    useEffect(() => {
        const controls = new Orbit(camera, renderer.domElement);
        controls.update();
    }, [camera, renderer]);

    return null;
}
export default OrbitControls;