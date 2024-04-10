import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { useFrame, useScene } from '../context/canvas';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as three from 'three';
import { makeTextSprite } from '../lib/uiText';
import { suspend } from 'suspend-react';
import { useScenePlayer } from '../context/scenePlayer';

const modelsUrl = "https://abxr-backend.s3.amazonaws.com/media/threejs_tests/threejs-scene.json";


type Vector3 = {
    x: number;
    y: number;
    z: number;
};

type Model = {
    name: string;
    url: string;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
};


const getTextUI = (text: string) => {
    const textSprite = makeTextSprite(text, { width: 550, height: 225 }, {
        fontSize: 55,
        backgroundColor: {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        },
        textColor: {
            r: 255,
            g: 255,
            b: 255,
            a: 1
        }
    });
    return textSprite;
}

const getModels = async function (modelsUrl: string) {
    const loader = new GLTFLoader();
    const gltfModels: {
        modelInfo: Model,
        gltf: GLTF
    }[] = [];
    const modelsResp = await fetch(modelsUrl, {
        mode: "cors",
    });
    const models: { models: Model[] } = await modelsResp.json();
    for (const model of models['models']) {

        const gltf = await loader.loadAsync(model.url);
        gltfModels.push({ modelInfo: model, gltf });


    }
    return gltfModels;

}

function ModelViewer() {
    const { scene, camera } = useScene();
    const scenePlayer = useScenePlayer()
    const PI = Math.PI;
    const toRad = (d: number) => (d / 180) * PI;
    const [mixers, setAnimationMixers] = useState<three.AnimationMixer[]>([]);
    const pointer = useMemo(() => new three.Vector2(), []);
    const modelsGLtf = suspend(() => getModels(modelsUrl), []);
    const rayCaster = useMemo(() => new three.Raycaster(), []);
    const [clipActions, setClipActions] = useState<three.AnimationAction[]>([]);
    const hasClicked = useRef(false);
    const [models, setModels] = useState<three.Object3D[]>([]);
    const onPointerMove = function (event: MouseEvent) {

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    };
    useEffect(() => {
        window.addEventListener('pointerdown', (event) => {
            onPointerMove(event);
            hasClicked.current = true;

        });
        const textSprites: three.Sprite[] = [];
        modelsGLtf.forEach(({ gltf, modelInfo }) => {
            const { position, scale, rotation, name } = modelInfo;
            const mixer = new three.AnimationMixer(gltf.scene);
            const clips = gltf.animations;
            const object = new three.Object3D();
            object.add(gltf.scene);
            object.position.set(position.x, position.y, position.z);
            object.scale.set(scale.x, scale.y, scale.z);
            object.rotation.set(toRad(rotation.x), toRad(rotation.y), toRad(rotation.z));
            object.updateMatrixWorld();
            clips.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.play();
                setClipActions((prevAction) => [...prevAction, action]);


            });

            const textSprite = getTextUI(name);
            textSprite.visible = false;

            const boundingBox = new three.Box3().setFromObject(object);
            textSprite.position.set(boundingBox.max.x + 2, 10 + boundingBox.max.y, 0);

            object.userData = {
                toggleUIText: () => {
                    textSprite.visible = !textSprite.visible;
                }
            }
            textSprites.push(textSprite)
            object.add(textSprite);
            scene.add(object);
            setAnimationMixers((prevMixers) => [...prevMixers, mixer]);
            setModels((prevObjects) => [...prevObjects, object])

        });

        return () => {
            window.removeEventListener('pointerdown', onPointerMove);
            textSprites.forEach((s) => {
                s.geometry.dispose();
                s.material.dispose();
                s.material.map?.dispose();
                s.parent?.remove();
            });
            models.forEach((m) => {
                m.traverse((obj) => {
                    if (obj instanceof three.Mesh) {
                        obj.geometry.dispose();
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach((m) => {
                                m.dispose();
                                m.map.dispose();
                            });
                        } else {
                            obj.material.dispose();
                            obj.material.map.dispose();
                        }
                    }
                    m.remove(obj);

                });
                scene.remove(m);
            });
            setAnimationMixers([]);
            setClipActions([]);
            setModels([]);
        }
    }, [scene]);
    useFrame(() => {


        if (scenePlayer.isSceneStopped()) {
            clipActions.forEach((clipAction) => {
                clipAction.stop();
            });
        } else {
            clipActions.forEach((clipAction) => {
                clipAction.play();
            });
        }
        mixers.forEach((mixer) => {
            mixer.update(0.015);
        });
        if (hasClicked.current) {

            rayCaster.setFromCamera(pointer, camera);
            const intersects = rayCaster.intersectObjects(models);
            if (intersects.length > 0) {
                intersects[0].object.traverseAncestors((o) => {
                    if ('toggleUIText' in o.userData) {

                        o.userData.toggleUIText.call(undefined);
                    }
                });
            }
            hasClicked.current = false;
        }

    });
    return null;
}

export default ModelViewer;