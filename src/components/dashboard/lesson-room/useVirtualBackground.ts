import { useCallback, useEffect, useRef, useState } from 'react';
import type { ICameraVideoTrack } from 'agora-rtc-react';
import AgoraRTC from 'agora-rtc-react';
import VirtualBackgroundExtension from 'agora-extension-virtual-background';

export type VBMode = 'none' | 'blur' | 'image';

/**
 * Applies a virtual background (blur or custom image) to a local camera track.
 *
 * IMPORTANT setup requirements:
 * 1. The extension loads .wasm files at runtime. Copy
 *    `node_modules/agora-extension-virtual-background/wasms/*` into
 *    `public/agora-vb-wasm/` (the path used in `processor.init()` below).
 * 2. This only runs client-side (browser), so keep this hook's usage inside
 *    'use client' components.
 */
export function useVirtualBackground(cameraTrack: ICameraVideoTrack | null) {
  const [mode, setMode] = useState<VBMode>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processorRef = useRef<any>(null);
  const extensionRef = useRef<VirtualBackgroundExtension | null>(null);

  const getProcessor = useCallback(async () => {
    if (processorRef.current) return processorRef.current;

    if (!extensionRef.current) {
      extensionRef.current = new VirtualBackgroundExtension();
      AgoraRTC.registerExtensions([extensionRef.current]);
    }

    const processor = extensionRef.current.createProcessor();
    // Pass wasm directory path to init(), not to the constructor
    await processor.init('/agora-vb-wasm');
    processorRef.current = processor;
    return processor;
  }, []);

  const applyBlur = useCallback(
    async (blurDegree: 1 | 2 | 3 = 2) => {
      if (!cameraTrack) return;
      setIsLoading(true);
      setError(null);
      try {
        const processor = await getProcessor();
        cameraTrack.pipe(processor).pipe(cameraTrack.processorDestination);
        processor.setOptions({ type: 'blur', blurDegree });
        await processor.enable();
        setMode('blur');
      } catch (err: any) {
        console.error('[VirtualBackground] Blur error:', err);
        setError('Не вдалося застосувати розмиття фону');
      } finally {
        setIsLoading(false);
      }
    },
    [cameraTrack, getProcessor]
  );

  const applyImage = useCallback(
    async (imageUrl: string) => {
      if (!cameraTrack) return;
      setIsLoading(true);
      setError(null);
      try {
        const processor = await getProcessor();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
        });
        cameraTrack.pipe(processor).pipe(cameraTrack.processorDestination);
        processor.setOptions({ type: 'img', source: img });
        await processor.enable();
        setMode('image');
      } catch (err: any) {
        console.error('[VirtualBackground] Image background error:', err);
        setError('Не вдалося завантажити фонове зображення');
      } finally {
        setIsLoading(false);
      }
    },
    [cameraTrack, getProcessor]
  );

  const disableVB = useCallback(async () => {
    try {
      if (processorRef.current) {
        await processorRef.current.disable();
        cameraTrack?.pipe(null as any); // unpipe, restore direct camera->destination
      }
      setMode('none');
    } catch (err) {
      console.error('[VirtualBackground] Disable error:', err);
    }
  }, [cameraTrack]);

  // Clean up processor when camera track changes/unmounts
  useEffect(() => {
    return () => {
      const p = processorRef.current;
      if (p) {
        p.disable().catch(() => {});
      }
    };
  }, [cameraTrack]);

  return { mode, isLoading, error, applyBlur, applyImage, disableVB };
}
