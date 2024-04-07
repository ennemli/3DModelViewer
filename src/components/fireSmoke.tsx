import * as three from 'three';
import { useFrame, useScene } from '../context/canvas';
import { useEffect, useState } from 'react';
import { noise } from '../shader/nose';
import FBOVelocity from './fbovelocity';
import { useScenePlayer } from '../context/scenePlayer';
const FireSmoke = function () {
    const { scene } = useScene();
    const [velocityTexture, setVelocityTexture] = useState<three.DataTexture>();
    const width = 12;
    const height = 12;
    const count = width * height;
    const [fireSmokeMaterial, setFireSmokeMaterial] = useState<three.ShaderMaterial>();
    const clock = new three.Clock();
    useEffect(() => {
        const geometry = new three.BufferGeometry();
        const positionBuffer = new Float32Array(count * 3);
        const velocityBuffer = new Float32Array(count * 4);
        const sizeBuffer = new Float32Array(count);
        const fboUV = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            const stride3 = i * 3;
            positionBuffer[stride3] = Math.random() - 0.5;
            positionBuffer[stride3 + 1] = (Math.random() + 2.5);
            positionBuffer[stride3 + 2] = Math.random();
            const stride2 = i * 2;
            fboUV[stride2] = (i % width) / width;
            fboUV[stride2 + 1] = ~~(i / height) / height;
            const stride4 = i * 4;
            velocityBuffer[stride4] = Math.random();
            velocityBuffer[stride4 + 1] = Math.random();
            velocityBuffer[stride4 + 2] = Math.random();


            sizeBuffer[i] = Math.random() * (200 - 140) + 200;

        }
        const vData = new three.DataTexture(velocityBuffer, width, height, three.RGBAFormat, three.FloatType);
        vData.magFilter = three.NearestFilter;
        vData.minFilter = three.NearestFilter;
        vData.needsUpdate = true;
        setVelocityTexture(vData);
        geometry.setAttribute('position', new three.BufferAttribute(positionBuffer, 3));
        geometry.setAttribute('size', new three.BufferAttribute(sizeBuffer, 1));
        geometry.setAttribute('fboUV', new three.BufferAttribute(fboUV, 2));
        const pointMaterial = new three.ShaderMaterial({
            depthWrite: false,
            transparent: true,
            depthTest: false,
            vertexShader: `
            ${noise}
            varying vec3 pos;
            attribute float size;
            attribute vec2 fboUV;
            uniform float uTime;
            uniform sampler2D velocityTexture;
            uniform float stop;
            void main(){
                vec4 velocity=texture2D(velocityTexture,fboUV);
                vec4 modelPosition=modelMatrix*vec4(position,1.0);
                modelPosition.xyz+=velocity.xyz*20.0;
                pos=modelPosition.xyz;
                vec4 viewPosition=viewMatrix*modelPosition;

                gl_Position=projectionMatrix*viewPosition;
                gl_PointSize=size*25.0;
                gl_PointSize*= ( 1.0 / - viewPosition.z );
                pos=modelPosition.xyz;
            }
            `,
            fragmentShader: `
            ${noise}
            uniform float uTime; 
            varying vec3 pos;
            void main(){
                float ythreshold=1.0-step(8.0,pos.y);
                float l=length(gl_PointCoord-0.5);
                float smoke=1.0-smoothstep(0.0,0.7,l);
                vec4 fire=vec4(1.0, 0.35, 0.0,0.5);
                vec4 col=mix(vec4(smoke),fire*smoke,ythreshold);
                gl_FragColor=col*noise(gl_PointCoord);
            }
            `,
            uniforms: {
                uTime: {
                    value: 0
                },
                velocityTexture: {
                    value: vData
                }
            }
        });
        const particles = new three.Points(geometry, pointMaterial);
        setFireSmokeMaterial(pointMaterial)
        scene.add(particles);

        return () => {
            particles.geometry.dispose();
            particles.material.dispose();
            scene.remove(particles);
            vData.dispose();
        }
    }, [scene, width, height, count]);

    useFrame(() => {
        const elapsedTime = clock.getElapsedTime();
        if (fireSmokeMaterial !== undefined) {
            fireSmokeMaterial.uniforms['uTime'].value = elapsedTime;
        }

    })
    return <>

        {fireSmokeMaterial && velocityTexture &&
            < FBOVelocity
                fireSmokeMaterial={fireSmokeMaterial}
                velocityTexture={velocityTexture} width={width}
                height={height}
            />
        }
    </>;
    // return null;
}

export default FireSmoke;