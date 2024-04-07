import * as three from 'three';

interface TextSpriteParameters {
    fontface?: string;
    fontsize?: number;
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
        fontface = "Courier New",
        fontsize = 18,
        borderColor = { r: 0, g: 0, b: 0, a: 1.0 },
        backgroundColor = { r: 0, g: 0, b: 255, a: 1.0 },
        textColor = { r: 0, g: 0, b: 0, a: 1.0 }
    } = parameters;

    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d')!;
    context.font = `Bold ${fontsize}px ${fontface}`;
    const metrics = context.measureText(message);
    const textWidth = metrics.width;
    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`
    context.fillStyle = `rgb(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const x = (canvas.width - textWidth) / 2;
    const y = (canvas.height - fontsize) / 2;
    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;
    context.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},1.0)`;
    context.fillText(message, x, y);


    const texture = new three.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new three.SpriteMaterial({ map: texture });
    const sprite = new three.Sprite(spriteMaterial);
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    return sprite;
}

export { makeTextSprite }