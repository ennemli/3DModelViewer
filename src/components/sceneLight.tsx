import * as three from 'three';
import { useScene } from '../context/canvas';
import { useEffect, useMemo } from 'react';
import { folder, useControls } from 'leva';
const SceneLight = function () {
    const ambientLight = useMemo(() => new three.AmbientLight("#ffffff", 1.5), []);
    const directionalLight = useMemo(() => new three.DirectionalLight("#ffffff", 1.5), [])
    const { scene } = useScene();
    const { ambientColor, ambientIntensity, dirColor, dirIntensity, position } = useControls({
        ambientLightSettings: folder({
            ambientColor: ambientLight.color.getHex(),
            ambientIntensity: {
                min: 0,
                max: 2,
                value: ambientLight.intensity,
            }
        }),
        directionalLightSettings: folder({
            dirColor: directionalLight.color.getHex(),
            dirIntensity: {
                min: 0,
                max: 2,
                value: directionalLight.intensity,
            },
            position: {
                value: { x: 1, y: 10, z: 10 },
            }
        }),

    });
    useEffect(() => {
        scene.add(ambientLight);
        scene.add(directionalLight);
    }, [scene, ambientLight, directionalLight]);

    useEffect(() => {

        directionalLight.position.set(position.x, position.y, position.z);
        directionalLight.color = new three.Color(dirColor);
        directionalLight.intensity = dirIntensity;
        ambientLight.color = new three.Color(ambientColor);
        ambientLight.intensity = ambientIntensity;
    }, [ambientColor, ambientIntensity, dirColor, dirIntensity, position, directionalLight, ambientLight]);
    return null;
}

export default SceneLight;