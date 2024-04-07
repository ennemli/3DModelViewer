import * as three from 'three'

export type SceneProps = {
    cameraType?: string;
    antialias?: boolean;
    cameraProps?: {
        fov?: number;
        aspect?: number;
        near?: number;
        far?: number;
        position?: [x: number, y: number, z: number];
    },
}
export type Scene = {
    camera: three.PerspectiveCamera | three.OrthographicCamera;
    scene: three.Scene;
    renderer: three.WebGLRenderer;
}