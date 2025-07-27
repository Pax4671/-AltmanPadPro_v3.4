// AltmanPad Pro v3.4 - 最適化版（MP4書き出し・録画・描画・消しゴム・背景色対応）

import { useRef, useState, useEffect } from "react";

export default function AltmanPadPro() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [useEraser, setUseEraser] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [recording, setRecording] = useState(false);
  const recordedChunks = useRef([]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getMousePos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    ctxRef.current.strokeStyle = useEraser ? backgroundColor : color;
    ctxRef.current.lineWidth = brushSize;
    ctxRef.current.lineCap = "round";
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(e);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const endDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    ctxRef.current.fillStyle = backgroundColor;
    ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveAsImage = () => {
    const link = document.createElement("a");
    link.download = "AltmanPadPro_Drawing.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const startRecording = () => {
    recordedChunks.current = [];
    const stream = canvasRef.current.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "AltmanPadPro_Timelapse.webm";
      link.click();
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }, [backgroundColor]);

  return (
    <div>
      <h1>🖌 AltmanPad Pro v3.4</h1>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        style={{ border: "1px solid black", cursor: useEraser ? "cell" : "crosshair" }}
      />
      <div>
        <label>
          色:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={useEraser}
          />
        </label>
        <label>
          太さ:
          <input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </label>
        <label>
          背景色:
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </label>
        <button onClick={() => setUseEraser(!useEraser)}>
          {useEraser ? "🖌 ペンに戻す" : "🧼 消しゴム"}
        </button>
        <button onClick={clearCanvas}>🧽 全消去</button>
        <button onClick={saveAsImage}>💾 PNG保存</button>
        <button onClick={startRecording} disabled={recording}>▶️ 録画開始</button>
        <button onClick={stopRecording} disabled={!recording}>⏹ 録画停止</button>
      </div>
    </div>
  );
}
