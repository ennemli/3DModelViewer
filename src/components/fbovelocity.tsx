import { useEffect, useMemo, useRef, useState } from "react";
import * as three from 'three';
import { useFrame, useScene } from "../context/canvas";
import { useScenePlayer } from "../context/scenePlayer";
function FBOVelocity({ velocityTexture, width, height, fireSmokeMaterial }: {
    fireSmokeMaterial: three.ShaderLibShader,
    velocityTexture: three.DataTexture, width: number, height: number
}) {
    const { renderer } = useScene();
    const fboCamera = useMemo(() => new three.OrthographicCamera(- width / 2, width / 2, height / 2, -height / 2, 0.1, 1000), [width, height]);
    fboCamera.position.z = 1;
    const [FBOScene, setFBOScene] = useState<three.Mesh<three.PlaneGeometry, three.ShaderMaterial>>();
    const clock = new three.Clock();
    const scenePlayer = useScenePlayer();
    let fbo = useMemo(() => {
        const fboWriter = new three.WebGLRenderTarget(width, height, {
            magFilter: three.NearestFilter,
            minFilter: three.NearestFilter,
            format: three.RGBAFormat,
            type: three.FloatType,
            generateMipmaps: false,
        });
        return { fboWriter, fboReader: fboWriter.clone() };
    }, [width, height]);
    useEffect(() => {

        const fbogem = new three.PlaneGeometry(width, height);
        const fboMaterial = new three.ShaderMaterial({

            vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv=uv;
                gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
            }
            `,
            fragmentShader: `
            #define dt 0.01
            varying vec2 vUv;
            uniform sampler2D velocityTexture;
            uniform sampler2D velocityTextureOrigin;
            uniform float uTime;
            uniform float stop;
            
            void main(){
                vec4 originV=texture2D(velocityTextureOrigin,vUv);
                vec4 old = texture2D(velocityTexture, vUv);
                vec4 vl=texture2D(velocityTexture,vUv+vec2(-1.0,0.0));
                vec4 vr=texture2D(velocityTexture,vUv+vec2(1.0,0.0));
                vec4 vt=texture2D(velocityTexture,vUv+vec2(0.0,1.0));
                vec4 vb=texture2D(velocityTexture,vUv+vec2(0.0,-1.0));
                vec4 new=4.0*old+0.01*(vl+vr+vt+vb);
                new/=4.0*(1.0+0.01);
                new.y+=dt;
                float threshold=step(1.5,new.y);
                new=threshold*originV*0.25+new*(1.0-threshold);
                new=(1.0-stop)*new+old*stop;
                gl_FragColor=new;
            }
            `,
            uniforms: {
                uTime: {
                    value: 0
                },
                velocityTexture: {
                    value: velocityTexture
                },
                velocityTextureOrigin: {
                    value: velocityTexture.clone()
                },
                stop: {
                    value: false
                }
            }
        });
        const fboScene = new three.Mesh(fbogem, fboMaterial);
        setFBOScene(fboScene)

        return () => {
            fboMaterial.dispose();
            fbogem.dispose();
            velocityTexture.dispose();
            fbo.fboReader.dispose();
            fbo.fboWriter.dispose();
        }

    }, [width, height, velocityTexture, fbo.fboWriter, fbo.fboReader]);

    useFrame(() => {

        const elapsedTime = clock.getElapsedTime();
        if (FBOScene) {
            FBOScene.material.uniforms['uTime'].value = elapsedTime;
            FBOScene.material.uniforms['stop'].value = scenePlayer.isSceneStopped();

            renderer.setRenderTarget(fbo.fboWriter);
            renderer.render(FBOScene, fboCamera);
            renderer.setRenderTarget(null);
            const tmp = fbo.fboWriter;
            fbo.fboWriter = fbo.fboReader;
            fbo.fboReader = tmp;
            FBOScene.material.uniforms['velocityTexture'].value = fbo.fboReader.texture;
            fireSmokeMaterial.uniforms['velocityTexture'].value = fbo.fboReader.texture;
        }
    });
    return null;
}

export default FBOVelocity;