export const defaultSceneProps = {
    antialias: true,
    cameraType: "perspective",
    cameraProps: {
        fov: 75,
        near: 0.1,
        far: 1000,
        aspect: window.innerWidth / window.innerHeight,
        position: [10, 5, 85]
    }
}
