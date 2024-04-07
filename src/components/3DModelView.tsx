import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { useFrame, useScene } from '../context/canvas';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as three from 'three';
import { makeTextSprite } from '../lib/uiText';
import { suspend } from 'suspend-react';
import { useScenePlayer } from '../context/scenePlayer';

/**
 * 
 * Because of the CORS, I can't access to data on the firebase server from local fetch, so I used local proxy.
 * 
 */
// const originalUrl = "https://firebasestorage.googleapis.com/v0/b/threejs-be120.appspot.com";
// const proxy = "http://localhost:8010/proxy";

const modelsUrl = "https://firebasestorage.googleapis.com/v0/b/threejs-be120.appspot.com/o/threejs-scene.json?alt=media&token=5681d972-4741-4a44-a069-4dcb74e41dd8";


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
// const getProxUrl = (o_url: string) => {
//     return o_url.replace(originalUrl, proxy);
// }
const addTextSpriteTOModel = (model: three.Object3D, text: string) => {
    const textSprite = makeTextSprite(text, { width: 400, height: 200 }, {
        fontsize: 55,
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
    textSprite.position.set(0, 25, 15);
    model.add(textSprite);

    textSprite.visible = true;
    return textSprite;
}

const toggleUIText = (textSprite: three.Sprite) => {
    if (textSprite.visible) {
        textSprite.visible = false;
    } else {
        textSprite.visible = true;
    }
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
    const raycaster = useMemo(() => new three.Raycaster(), []);
    const [clipActions, setClipActions] = useState<three.AnimationAction[]>([]);
    const hasClicked = useRef(false);
    const onPointerMove = function (event: MouseEvent) {

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    };
    useEffect(() => {
        window.addEventListener('click', (event) => {
            onPointerMove(event);
            hasClicked.current = true;

        });
        let models: { gltf: GLTF, modelInfo: Model }[] = [];
        const mixer_: three.AnimationMixer[] = [];
        const actions_: three.AnimationAction[] = []
        const textSprites: three.Sprite[] = [];
        modelsGLtf.forEach(({ gltf, modelInfo }) => {
            const { position, scale, rotation, name } = modelInfo;
            const mixer = new three.AnimationMixer(gltf.scene);
            const clips = gltf.animations;
            gltf.scene.position.set(position.x, position.y, position.z);
            gltf.scene.scale.set(scale.x, scale.y, scale.z);
            gltf.scene.rotation.set(toRad(rotation.x), toRad(rotation.y), toRad(rotation.z));

            clips.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.play();
                actions_.push(action);


            });
            const textSprite = addTextSpriteTOModel(gltf.scene, name);
            textSprites.push(textSprite);
            gltf.scene.traverse((obj) => {
                if (obj instanceof three.Mesh) {
                    obj.userData = {
                        ...gltf.scene.userData,
                        toggleUIText: () => {
                            toggleUIText(textSprite);
                        }
                    }
                }
            });
            scene.add(gltf.scene);
            mixer_.push(mixer);

        });

        setAnimationMixers(mixer_);
        setClipActions(actions_);

        return () => {
            window.removeEventListener('pointerdown', onPointerMove);
            textSprites.forEach((s) => {
                s.geometry.dispose();
                s.material.dispose();
                s.material.map?.dispose();
                s.parent?.remove(s);
            });
            models.forEach(({ gltf }) => {
                gltf.scene.traverse((obj) => {
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
                    gltf.scene.remove(obj);

                });
                scene.remove(gltf.scene);
            });
        }
    }, []);

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
            raycaster.setFromCamera(pointer, camera);

            const intersects = raycaster.intersectObjects(
                modelsGLtf.map(({ gltf }) => gltf.scene)
            )
            for (const i of intersects) {
                if ('toggleUIText' in i.object.userData) {
                    i.object.userData.toggleUIText();

                }
            }
            hasClicked.current = false;
        }
    });
    return null;
}

export default ModelViewer;