import * as three from 'three';

interface TextSpriteParameters {
    fontFace?: string;
    fontSize?: number;
    borderThickness?: number;
    borderColor?: { r: number; g: number; b: number; a: number };
    backgroundColor?: { r: number; g: number; b: number; a: number };
    textColor?: { r: number; g: number; b: number; a: number };
}

function makeTextSprite(
    message: string,
    size: { width: number, height: number },
    parameters: TextSpriteParameters = {}
): three.Sprite {
    const {
        fontFace = "Courier New",
        fontSize = 18,
        borderColor = { r: 0, g: 0, b: 0, a: 1.0 },
        backgroundColor = { r: 0, g: 0, b: 255, a: 1.0 },
        textColor = { r: 0, g: 0, b: 0, a: 1.0 }
    } = parameters;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = `Bold ${fontSize}px ${fontFace}`;
    canvas.width = size.width;
    canvas.height = size.height;
    const measureText = context.measureText(message);
    const textWidth = measureText.width;

    context.font = `Bold ${fontSize}px ${fontFace}`;

    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`
    context.fillStyle = `rgb(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;
    context.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},1.0)`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(message, canvas.width / 2, canvas.height / 2);


    const texture = new three.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new three.SpriteMaterial({ map: texture });
    const sprite = new three.Sprite(spriteMaterial);
    sprite.scale.set(0.5 * fontSize, 0.25 * fontSize, 0.75 * fontSize);
    sprite.userData = { textWidth, fontSize }
    return sprite;
}

export { makeTextSprite }