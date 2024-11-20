import React, { useMemo, useState } from 'react';
import { Camera, useCameraDevices, useFrameProcessor, Frame } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { Alert } from 'react-native';

const App = () => {
  const devices = useCameraDevices();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedColor, setDetectedColor] = useState(null);
  const device = devices[3]; // Use the back camera; use 'devices.front' for the front camera

  const rgbToHsv = (r:any, g:any, b:any) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s, v];
  };

  const isBloodLikeColor = (r:any, g:any, b:any) => {
    const [hue, saturation, value] = rgbToHsv(r, g, b);
    return hue >= 0 && hue <= 20 && saturation >= 0.7 && value >= 0.5;
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const isColorNearBloodColor = (r:any, g:any, b:any) => {
      'worklet';
      // Define blood-like RGB range
      const bloodColorRange = {
        rMin: 120, rMax: 200, // Red range
        gMin: 0, gMax: 50,    // Green range
        bMin: 0, bMax: 50     // Blue range
      };

      return (
        r >= bloodColorRange.rMin &&
        r <= bloodColorRange.rMax &&
        g >= bloodColorRange.gMin &&
        g <= bloodColorRange.gMax &&
        b >= bloodColorRange.bMin &&
        b <= bloodColorRange.bMax
      );
    };

    // Extract frame data
    const { width, height, bytesPerRow } = frame;

    console.log(bytesPerRow)
    
    // if (planes.length > 0) {
    //   const data = planes[0].data; // Access pixel data
    //   for (let i = 0; i < data.length; i += 4) { // RGBA format
    //     const r = data[i];     // Red channel
    //     const g = data[i + 1]; // Green channel
    //     const b = data[i + 2]; // Blue channel

    //     if (isColorNearBloodColor(r, g, b)) {
    //       runOnJS(Alert.alert)('Blood color detected!');
    //       break;
    //     }
    //   }
    // }
  }, []);
  

  if (device == null) return null;

  return (
    <Camera
      style={{ flex: 1 }}
      device={device}
      isActive={true}
      pixelFormat="rgb"
      frameProcessor={frameProcessor}
      fps={30}
    />
  );
};

export default App;
