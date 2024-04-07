import React, { useEffect, useMemo } from "react"
import { AnimateContext, defaultAnimateContextValue, SceneContext, useScene } from "../context/canvas";
import { setupScene } from "../lib/scene";
import { SceneProps } from "../lib/types";
import { PerspectiveCamera } from "three";
interface CanvasProps {
    fallBack?: React.ReactNode;
    children?: React.ReactNode;
    canvasProps?: JSX.IntrinsicElements['canvas'];
    sceneProps?: SceneProps
}


const Resize = function () {
    const { camera, renderer } = useScene();

    useEffect(() => {

        const onResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            if (camera instanceof PerspectiveCamera) {
                camera.aspect = aspect
            } else {
                camera.left = -aspect;
                camera.right = aspect;
                camera.top = aspect;
                camera.bottom = -aspect;
            }
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        }
    }, [camera, renderer]);
    return null;
}

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas(props, ref) {
    const newScene = useMemo(() => setupScene(props.sceneProps), [props.sceneProps]);
    const canvasContainer = React.useRef<HTMLDivElement>(null!);
    useEffect(() => {
        const current = canvasContainer.current;
        current.appendChild(newScene.renderer.domElement);
        return () => {
            newScene.renderer.domElement.remove();
        };
    });

    useEffect(() => {
        if (ref !== null) {
            if ('current' in ref) {
                ref.current = newScene.renderer.domElement;
            }
        }

    }, [ref, newScene.renderer]);


    useEffect(() => {

        function animate(delta: number) {
            defaultAnimateContextValue.callBacks.forEach((callBack) => {
                callBack.call(undefined, delta)
            });
            window.requestAnimationFrame(animate);
            newScene.renderer.render(newScene.scene, newScene.camera);

        }

        const animateId = window.requestAnimationFrame(animate)

        return () => {
            defaultAnimateContextValue.callBacks = [];
            window.cancelAnimationFrame(animateId);
        }
    }, [newScene.scene, newScene.camera, newScene.renderer]);

    return <>
        <SceneContext.Provider value={newScene}>
            <AnimateContext.Provider value={defaultAnimateContextValue}>

                <div ref={canvasContainer}></div>
                {props.children}
                <Resize />
            </AnimateContext.Provider>
        </SceneContext.Provider>
    </>

})

export default Canvas;