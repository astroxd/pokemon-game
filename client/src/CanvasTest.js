import { useEffect, useRef } from "react";
const CanvasTest = () => {
  const canvasRef = useRef(null);
  const invert = (context, canvas) => {
    console.log("invert");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const blackpixel = 31;
    for (let i = 0; i < data.length; i += 4) {
      if (i > 3) {
        if (
          Math.abs(data[i - 3] - data[i]) > 10 &&
          Math.abs(data[i - 2] - data[i + 1]) > 10 &&
          Math.abs(data[i - 1] - data[i + 2]) > 10
        ) {
          data[i] = blackpixel;
          data[i + 1] = blackpixel;
          data[i + 2] = blackpixel;
        }
      } else {
        if (data[i] < 250 && data[i + 1] < 250 && data[i + 2] < 250) {
          data[i] = blackpixel;
          data[i + 1] = blackpixel;
          data[i + 2] = blackpixel;
        }
      }
    }
    context.putImageData(imageData, 0, 0);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = "https://img.pokemondb.net/artwork/large/charizard.jpg";
    image.onload = () => {
      context.drawImage(image, 0, 0);
      invert(context, canvas);
    };
  };

  useEffect(() => {
    draw();
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} height={500} width={500}></canvas>
    </div>
  );
};

export default CanvasTest;
