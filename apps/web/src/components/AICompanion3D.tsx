import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';
import { Volume2, VolumeX, Sparkles, Smile, HelpCircle, Eye, Radio, Mic, MicOff, RefreshCw } from 'lucide-react';

export type CompanionEmotion = 'neutral' | 'happy' | 'thinking' | 'surprised' | 'listening' | 'speaking';

interface AICompanion3DProps {
  modelType?: 'stylized' | 'vrm';
  vrmUrl?: string;
  currentEmotion?: CompanionEmotion;
  onEmotionChange?: (emotion: CompanionEmotion) => void;
  speechText?: string;
  isSpeaking?: boolean;
  onVoiceSubmit?: (text: string) => void;
}

export const AICompanion3D: React.FC<AICompanion3DProps> = ({
  modelType = 'stylized',
  vrmUrl = '/models/sample.vrm',
  currentEmotion = 'neutral',
  onEmotionChange,
  speechText,
  isSpeaking: externalIsSpeaking,
  onVoiceSubmit,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeModel, setActiveModel] = useState<'stylized' | 'vrm'>(modelType);
  const [emotion, setEmotion] = useState<CompanionEmotion>(currentEmotion);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const stylizedRigRef = useRef<{
    head: THREE.Group;
    eyesLeft: THREE.Group;
    eyesRight: THREE.Group;
    eyelidTopLeft: THREE.Mesh;
    eyelidTopRight: THREE.Mesh;
    mouth: THREE.Mesh;
    mouthInner: THREE.Mesh;
    eyebrowLeft: THREE.Mesh;
    eyebrowRight: THREE.Mesh;
    hoodieDrawstrings: THREE.Group;
    hologramGroup: THREE.Group;
  } | null>(null);

  // Audio & Animation states
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouthOpenAmountRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (externalIsSpeaking) {
      mouthOpenAmountRef.current = 0.6;
    }
  }, [externalIsSpeaking]);

  // Keep emotion state synchronized
  useEffect(() => {
    setEmotion(currentEmotion);
  }, [currentEmotion]);

  const handleSelectEmotion = (newEmotion: CompanionEmotion) => {
    setEmotion(newEmotion);
    onEmotionChange?.(newEmotion);
  };

  // Text-To-Speech with Real-time Lip-sync & 100% Native Vietnamese Voice
  const speakVoice = useCallback((textToSpeak: string) => {
    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Filter text for natural speech reading - Reads ENTIRE message without truncation
    const cleanText = textToSpeak
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    setIsSpeakingLocal(true);
    handleSelectEmotion('speaking');

    // Interval to create rhythmic vowel mouth movements matching 1.15x speed
    const mouthInterval = setInterval(() => {
      mouthOpenAmountRef.current = 0.25 + Math.random() * 0.7;
    }, 95);

    const cleanup = () => {
      clearInterval(mouthInterval);
      mouthOpenAmountRef.current = 0;
      setIsSpeakingLocal(false);
      handleSelectEmotion('neutral');
      if (currentAudioRef.current) {
        currentAudioRef.current = null;
      }
    };

    // Fallback: Browser Web Speech API - ưu tiên giọng Nam tiếng Việt
    const fallbackBrowserSpeech = () => {
      if (!window.speechSynthesis) {
        cleanup();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.1;
      utterance.pitch = 0.85; // Giọng trầm hơn (giọng Nam)

      const voices = window.speechSynthesis.getVoices();

      // Ưu tiên 1: giọng Nam tiếng Việt (male Vietnamese)
      const maleViVoice = voices.find(
        (v) =>
          (v.lang.toLowerCase().replace('_', '-').startsWith('vi')) &&
          (v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('nam') ||
            v.name.toLowerCase().includes('minh') ||
            v.name.toLowerCase().includes('hung') ||
            v.name.toLowerCase().includes('an'))
      );

      // Ưu tiên 2: bất kỳ giọng tiếng Việt nào
      const anyViVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().replace('_', '-').startsWith('vi') ||
          v.name.toLowerCase().includes('vietnam') ||
          v.name.toLowerCase().includes('tiếng việt')
      );

      if (maleViVoice) {
        utterance.voice = maleViVoice;
      } else if (anyViVoice) {
        utterance.voice = anyViVoice;
        // Giả lập giọng Nam bằng pitch thấp hơn khi không có giọng Nam
        utterance.pitch = 0.75;
      }

      utterance.onend = cleanup;
      utterance.onerror = cleanup;
      window.speechSynthesis.speak(utterance);
    };

    // Primary: TechStore Cloudflare Edge Vietnamese TTS (100% Native Vietnamese female voice)
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = 1.15; // Tăng tốc độ đọc mượt mà 1.15x theo yêu cầu
      currentAudioRef.current = audio;

      audio.onended = cleanup;
      audio.onerror = () => {
        fallbackBrowserSpeech();
      };

      audio.play().catch(() => {
        fallbackBrowserSpeech();
      });
    } catch {
      fallbackBrowserSpeech();
    }
  }, []);

  // Listen to speechText prop triggers
  useEffect(() => {
    if (speechText && !audioMuted) {
      speakVoice(speechText);
    }
  }, [speechText, audioMuted, speakVoice]);

  // Voice Recognition (Speech to Text)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ Web Speech API nhận diện giọng nói.');
      return;
    }

    if (isListeningVoice) {
      recognitionRef.current?.stop();
      setIsListeningVoice(false);
      handleSelectEmotion('neutral');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        handleSelectEmotion('listening');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        const text = transcript.trim();
        setIsListeningVoice(false);
        handleSelectEmotion('thinking');

        if (onVoiceSubmit && text) {
          onVoiceSubmit(text);
        } else if (text) {
          speakVoice(`Tôi đã nghe thấy: "${text}". Đang chuyển đến trợ lý tư vấn.`);
        }
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
        handleSelectEmotion('neutral');
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Lỗi SpeechRecognition:', err);
      setIsListeningVoice(false);
    }
  };

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    setLoading(true);

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 20);
    camera.position.set(0, 1.4, 1.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting matching the Reference Photo
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.2);
    keyLight.position.set(1.5, 2.8, 2.2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cool fill light
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.0);
    fillLight.position.set(-1.5, 1.5, 1.8);
    scene.add(fillLight);

    // Dynamic reactive rim light (shifts color based on AI emotion)
    const dynamicRimLight = new THREE.DirectionalLight(0x00e5ff, 2.8);
    dynamicRimLight.position.set(-2.0, 1.8, -1.5);
    scene.add(dynamicRimLight);

    // Dynamic emotion aura point light
    const emotionPointLight = new THREE.PointLight(0x00e5ff, 2.0, 5);
    emotionPointLight.position.set(0, 1.0, -0.6);
    scene.add(emotionPointLight);

    // Purple soft back light
    const purpleRim = new THREE.DirectionalLight(0x7c3aed, 1.4);
    purpleRim.position.set(1.8, 1.2, -1.5);
    scene.add(purpleRim);

    // Cyber Hologram Podium Floor (Double Ring)
    const podiumGroup = new THREE.Group();
    podiumGroup.position.set(0, 0.05, 0);

    const outerRingGeo = new THREE.RingGeometry(0.42, 0.58, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
    outerRing.rotation.x = -Math.PI / 2;
    podiumGroup.add(outerRing);

    const innerRingGeo = new THREE.RingGeometry(0.25, 0.35, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    podiumGroup.add(innerRing);

    scene.add(podiumGroup);

    // 3. Model Building: Stylized Reference Character vs VRM Model
    if (activeModel === 'stylized') {
      buildStylizedCompanion(scene);
      setLoading(false);
    } else {
      loadVRMModel(scene, vrmUrl);
    }

    // Build the Stylized Procedural Character (100% true to reference image)
    function buildStylizedCompanion(targetScene: THREE.Scene) {
      const characterGroup = new THREE.Group();
      characterGroup.position.set(0, 0.65, 0);

      // --- MATERIALS ---
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffd8c7,
        roughness: 0.45,
        metalness: 0.05,
      });

      const hairMat = new THREE.MeshStandardMaterial({
        color: 0x6e472e, // Caramel brown
        roughness: 0.5,
        metalness: 0.1,
      });

      const hoodieNavyMat = new THREE.MeshStandardMaterial({
        color: 0x162035, // Deep Navy Blue
        roughness: 0.65,
        metalness: 0.1,
      });

      const tshirtGreyMat = new THREE.MeshStandardMaterial({
        color: 0x242a38,
        roughness: 0.8,
      });

      const cyanGlowMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 2.4,
        roughness: 0.2,
      });

      const glassesBlackMat = new THREE.MeshStandardMaterial({
        color: 0x111318,
        roughness: 0.2,
        metalness: 0.8,
      });

      const glassesLensMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.18,
        roughness: 0.05,
        transmission: 0.9,
      });

      // --- TORSO & NAVY HOODIE ---
      const torsoGroup = new THREE.Group();

      // Main hoodie body
      const hoodieBodyGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.65, 32);
      const hoodieBody = new THREE.Mesh(hoodieBodyGeo, hoodieNavyMat);
      hoodieBody.position.y = 0.32;
      torsoGroup.add(hoodieBody);

      // Inner T-shirt v-neck
      const teeGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.2, 16);
      const tee = new THREE.Mesh(teeGeo, tshirtGreyMat);
      tee.position.set(0, 0.55, 0.14);
      torsoGroup.add(tee);

      // Hoodie Zipper & Cyan accents
      const zipperGeo = new THREE.BoxGeometry(0.015, 0.5, 0.02);
      const zipper = new THREE.Mesh(zipperGeo, cyanGlowMat);
      zipper.position.set(0, 0.35, 0.31);
      torsoGroup.add(zipper);

      // Cyan circuit lines on chest/shoulders
      const circuitLine1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.012, 0.02), cyanGlowMat);
      circuitLine1.position.set(0.12, 0.48, 0.29);
      circuitLine1.rotation.z = -0.2;
      torsoGroup.add(circuitLine1);

      const circuitLine2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.012, 0.02), cyanGlowMat);
      circuitLine2.position.set(-0.12, 0.48, 0.29);
      circuitLine2.rotation.z = 0.2;
      torsoGroup.add(circuitLine2);

      // Tech Pendant Necklace
      const necklaceCord = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.005, 8, 32), glassesBlackMat);
      necklaceCord.rotation.x = Math.PI / 2.3;
      necklaceCord.position.set(0, 0.58, 0.1);
      torsoGroup.add(necklaceCord);

      const pendant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 16), cyanGlowMat);
      pendant.position.set(0, 0.45, 0.28);
      torsoGroup.add(pendant);

      // Hoodie Collar / Hood bunching around neck
      const hoodBunch = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 16, 32), hoodieNavyMat);
      hoodBunch.rotation.x = Math.PI / 2.1;
      hoodBunch.position.set(0, 0.62, 0.02);
      torsoGroup.add(hoodBunch);

      // Drawstrings
      const drawstringsGroup = new THREE.Group();
      const stringGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.18, 8);
      const tipGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.04, 8);

      const stringL = new THREE.Mesh(stringGeo, hoodieNavyMat);
      stringL.position.set(-0.07, 0.48, 0.32);
      const tipL = new THREE.Mesh(tipGeo, cyanGlowMat);
      tipL.position.set(-0.07, 0.38, 0.32);
      drawstringsGroup.add(stringL, tipL);

      const stringR = new THREE.Mesh(stringGeo, hoodieNavyMat);
      stringR.position.set(0.07, 0.48, 0.32);
      const tipR = new THREE.Mesh(tipGeo, cyanGlowMat);
      tipR.position.set(0.07, 0.38, 0.32);
      drawstringsGroup.add(stringR, tipR);
      torsoGroup.add(drawstringsGroup);

      // Arms & Smartwatch
      const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.45, 16), hoodieNavyMat);
      armL.position.set(-0.35, 0.32, 0.08);
      armL.rotation.z = 0.35;
      armL.rotation.x = -0.3;
      torsoGroup.add(armL);

      const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.45, 16), hoodieNavyMat);
      armR.position.set(0.35, 0.32, 0.08);
      armR.rotation.z = -0.35;
      armR.rotation.x = -0.3;
      torsoGroup.add(armR);

      // Glowing Cyan Smartwatch on left wrist
      const watchBand = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.04, 16), glassesBlackMat);
      watchBand.position.set(-0.39, 0.16, 0.22);
      const watchScreen = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.01), cyanGlowMat);
      watchScreen.position.set(-0.39, 0.16, 0.29);
      torsoGroup.add(watchBand, watchScreen);

      characterGroup.add(torsoGroup);

      // --- HEAD RIG GROUP ---
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.72, 0.02);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.15, 16), skinMat);
      neck.position.set(0, 0.02, 0);
      headGroup.add(neck);

      // Stylized Head Shape (Cute rounded Pixar jaw)
      const headGeo = new THREE.SphereGeometry(0.22, 32, 32);
      headGeo.scale(1.0, 1.15, 1.05);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.position.set(0, 0.18, 0);
      headGroup.add(headMesh);

      // Ears
      const earGeo = new THREE.SphereGeometry(0.05, 16, 16);
      earGeo.scale(0.5, 1.1, 0.9);
      const earL = new THREE.Mesh(earGeo, skinMat);
      earL.position.set(-0.21, 0.18, -0.02);
      earL.rotation.y = -0.3;
      const earR = new THREE.Mesh(earGeo, skinMat);
      earR.position.set(0.21, 0.18, -0.02);
      earR.rotation.y = 0.3;
      headGroup.add(earL, earR);

      // --- EYES (Cyan / Blue Expressive) ---
      const eyeGeo = new THREE.SphereGeometry(0.042, 24, 24);
      const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
      const irisMat = new THREE.MeshStandardMaterial({
        color: 0x00c8e8, // Cyan Blue
        roughness: 0.2,
      });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x070b12 });
      const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      function createEyeBall() {
        const eye = new THREE.Group();
        const white = new THREE.Mesh(eyeGeo, scleraMat);
        const iris = new THREE.Mesh(new THREE.CircleGeometry(0.025, 24), irisMat);
        iris.position.set(0, 0, 0.039);
        const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.014, 24), pupilMat);
        pupil.position.set(0, 0, 0.040);
        const spec = new THREE.Mesh(new THREE.CircleGeometry(0.007, 16), highlightMat);
        spec.position.set(0.008, 0.008, 0.041);

        eye.add(white, iris, pupil, spec);
        return eye;
      }

      const eyesLeft = createEyeBall();
      eyesLeft.position.set(-0.075, 0.19, 0.18);
      const eyesRight = createEyeBall();
      eyesRight.position.set(0.075, 0.19, 0.18);
      headGroup.add(eyesLeft, eyesRight);

      // Eyelids (Blinking)
      const eyelidGeo = new THREE.SphereGeometry(0.045, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const eyelidTopLeft = new THREE.Mesh(eyelidGeo, skinMat);
      eyelidTopLeft.position.set(-0.075, 0.19, 0.18);
      eyelidTopLeft.rotation.x = -Math.PI / 2;
      eyelidTopLeft.scale.set(1.05, 1.05, 1.05);

      const eyelidTopRight = new THREE.Mesh(eyelidGeo, skinMat);
      eyelidTopRight.position.set(0.075, 0.19, 0.18);
      eyelidTopRight.rotation.x = -Math.PI / 2;
      eyelidTopRight.scale.set(1.05, 1.05, 1.05);
      headGroup.add(eyelidTopLeft, eyelidTopRight);

      // Eyebrows
      const browGeo = new THREE.BoxGeometry(0.07, 0.015, 0.02);
      const eyebrowLeft = new THREE.Mesh(browGeo, hairMat);
      eyebrowLeft.position.set(-0.078, 0.265, 0.19);
      eyebrowLeft.rotation.z = 0.08;

      const eyebrowRight = new THREE.Mesh(browGeo, hairMat);
      eyebrowRight.position.set(0.078, 0.265, 0.19);
      eyebrowRight.rotation.z = -0.08;
      headGroup.add(eyebrowLeft, eyebrowRight);

      // Nose
      const noseGeo = new THREE.ConeGeometry(0.025, 0.06, 16);
      const nose = new THREE.Mesh(noseGeo, skinMat);
      nose.position.set(0, 0.165, 0.225);
      nose.rotation.x = 0.2;
      headGroup.add(nose);

      // Mouth (Smile & Lip Sync)
      const mouthMat = new THREE.MeshStandardMaterial({ color: 0xb54646, roughness: 0.5 });
      const mouthGeo = new THREE.TorusGeometry(0.038, 0.009, 12, 24, Math.PI * 0.9);
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.set(0, 0.09, 0.21);
      mouth.rotation.z = Math.PI;

      const mouthInnerGeo = new THREE.SphereGeometry(0.028, 16, 16);
      mouthInnerGeo.scale(1.2, 0.4, 0.5);
      const mouthInner = new THREE.Mesh(mouthInnerGeo, new THREE.MeshBasicMaterial({ color: 0x4a1818 }));
      mouthInner.position.set(0, 0.085, 0.19);
      mouthInner.visible = false;
      headGroup.add(mouth, mouthInner);

      // --- SIGNATURE ROUND GLASSES ---
      const glassesGroup = new THREE.Group();
      const frameGeo = new THREE.TorusGeometry(0.055, 0.006, 16, 32);
      const lensGeo = new THREE.CircleGeometry(0.053, 32);

      const frameL = new THREE.Mesh(frameGeo, glassesBlackMat);
      frameL.position.set(-0.075, 0.19, 0.22);
      const lensL = new THREE.Mesh(lensGeo, glassesLensMat);
      lensL.position.set(-0.075, 0.19, 0.22);

      const frameR = new THREE.Mesh(frameGeo, glassesBlackMat);
      frameR.position.set(0.075, 0.19, 0.22);
      const lensR = new THREE.Mesh(lensGeo, glassesLensMat);
      lensR.position.set(0.075, 0.19, 0.22);

      // Bridge and Temples
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.005, 0.005), glassesBlackMat);
      bridge.position.set(0, 0.195, 0.222);

      const templeL = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.22), glassesBlackMat);
      templeL.position.set(-0.13, 0.19, 0.11);
      templeL.rotation.y = 0.08;

      const templeR = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.22), glassesBlackMat);
      templeR.position.set(0.13, 0.19, 0.11);
      templeR.rotation.y = -0.08;

      glassesGroup.add(frameL, lensL, frameR, lensR, bridge, templeL, templeR);
      headGroup.add(glassesGroup);

      // --- WAVEY CARAMEL QUIFF HAIR ---
      const hairGroup = new THREE.Group();

      // Hair Base Cap
      const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.7), hairMat);
      hairBase.position.set(0, 0.19, -0.01);
      hairGroup.add(hairBase);

      // Textured wavy locks on top and front
      const lockPositions = [
        { pos: [-0.04, 0.36, 0.12], rot: [0.4, 0.2, -0.1], scale: [0.09, 0.16, 0.09] },
        { pos: [0.03, 0.38, 0.10], rot: [0.35, -0.15, 0.15], scale: [0.10, 0.18, 0.09] },
        { pos: [0.09, 0.35, 0.08], rot: [0.3, -0.3, 0.25], scale: [0.08, 0.15, 0.08] },
        { pos: [-0.10, 0.33, 0.09], rot: [0.3, 0.3, -0.2], scale: [0.08, 0.14, 0.08] },
        { pos: [0.01, 0.40, 0.02], rot: [0.1, 0.1, 0.05], scale: [0.12, 0.19, 0.12] },
        { pos: [-0.06, 0.38, -0.04], rot: [-0.2, 0.1, -0.1], scale: [0.10, 0.16, 0.10] },
      ];

      lockPositions.forEach((l) => {
        const lockGeo = new THREE.ConeGeometry(1, 1.8, 12);
        const lock = new THREE.Mesh(lockGeo, hairMat);
        lock.position.set(l.pos[0], l.pos[1], l.pos[2]);
        lock.rotation.set(l.rot[0], l.rot[1], l.rot[2]);
        lock.scale.set(l.scale[0], l.scale[1], l.scale[2]);
        hairGroup.add(lock);
      });
      headGroup.add(hairGroup);

      characterGroup.add(headGroup);

      // --- FLOATING HOLOGRAPHIC UI CARDS (Matching Reference Background) ---
      const hologramGroup = new THREE.Group();

      const holoCardGeo = new THREE.PlaneGeometry(0.35, 0.22);
      const holoMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
        side: THREE.DoubleSide,
      });

      const card1 = new THREE.Mesh(holoCardGeo, holoMat);
      card1.position.set(0.55, 1.0, -0.2);
      card1.rotation.y = -0.35;

      const card2 = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), holoMat);
      card2.position.set(-0.55, 0.85, -0.15);
      card2.rotation.y = 0.4;

      hologramGroup.add(card1, card2);
      characterGroup.add(hologramGroup);

      targetScene.add(characterGroup);

      // Save references for live rigging
      stylizedRigRef.current = {
        head: headGroup,
        eyesLeft,
        eyesRight,
        eyelidTopLeft,
        eyelidTopRight,
        mouth,
        mouthInner,
        eyebrowLeft,
        eyebrowRight,
        hoodieDrawstrings: drawstringsGroup,
        hologramGroup,
      };
    }

    // VRM Loader
    function loadVRMModel(targetScene: THREE.Scene, url: string) {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      loader.load(
        url,
        (gltf) => {
          const vrm = gltf.userData.vrm as VRM;
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.combineSkeletons(gltf.scene);

          vrm.scene.rotation.y = Math.PI;
          vrm.scene.position.set(0, 0.05, 0);
          targetScene.add(vrm.scene);
          vrmRef.current = vrm;
          setLoading(false);
        },
        undefined,
        (err) => {
          console.warn('Không thể tải VRM từ URL, chuyển sang mô hình Stylized Procedural:', err);
          setActiveModel('stylized');
          buildStylizedCompanion(targetScene);
          setLoading(false);
        }
      );
    }

    // Mouse Move Gaze Listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 4. ANIMATION LOOP (Real-Time Physics, Blinking, Lip-Sync, LookAt)
    const clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlink = 3.2;

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Stylized Procedural Rig Animation
      if (stylizedRigRef.current) {
        const rig = stylizedRigRef.current;

        // A. Breathing & Gaze (Head rotation)
        const targetRotY = mousePos.current.x * 0.45;
        const targetRotX = -mousePos.current.y * 0.28 + Math.sin(elapsed * 1.5) * 0.02;
        const targetRotZ = (emotion === 'thinking' ? 0.12 : 0) + Math.cos(elapsed * 0.9) * 0.015;

        rig.head.rotation.y = THREE.MathUtils.lerp(rig.head.rotation.y, targetRotY, 0.08);
        rig.head.rotation.x = THREE.MathUtils.lerp(rig.head.rotation.x, targetRotX, 0.08);
        rig.head.rotation.z = THREE.MathUtils.lerp(rig.head.rotation.z, targetRotZ, 0.08);

        // B. Eye Saccades & Cursor Tracking
        const eyeTargetX = mousePos.current.x * 0.15;
        const eyeTargetY = mousePos.current.y * 0.12;
        rig.eyesLeft.rotation.y = THREE.MathUtils.lerp(rig.eyesLeft.rotation.y, eyeTargetX, 0.15);
        rig.eyesLeft.rotation.x = THREE.MathUtils.lerp(rig.eyesLeft.rotation.x, -eyeTargetY, 0.15);
        rig.eyesRight.rotation.y = THREE.MathUtils.lerp(rig.eyesRight.rotation.y, eyeTargetX, 0.15);
        rig.eyesRight.rotation.x = THREE.MathUtils.lerp(rig.eyesRight.rotation.x, -eyeTargetY, 0.15);

        // C. Blinking Engine
        blinkTimer += delta;
        if (blinkTimer > nextBlink) {
          const blinkT = (blinkTimer - nextBlink) / 0.14;
          if (blinkT <= 1.0) {
            const rotClose = -Math.PI / 2 + Math.sin(blinkT * Math.PI) * (Math.PI / 2);
            rig.eyelidTopLeft.rotation.x = rotClose;
            rig.eyelidTopRight.rotation.x = rotClose;
          } else {
            rig.eyelidTopLeft.rotation.x = -Math.PI / 2;
            rig.eyelidTopRight.rotation.x = -Math.PI / 2;
            blinkTimer = 0;
            nextBlink = 2.5 + Math.random() * 3.5;
          }
        }

        // D. Emotion Morph Weights
        let targetEyebrowLY = 0.265;
        let targetEyebrowRY = 0.265;
        let targetEyebrowRotL = 0.08;
        let targetEyebrowRotR = -0.08;
        let mouthScaleY = 1.0;
        let mouthScaleX = 1.0;

        if (emotion === 'happy') {
          targetEyebrowRotL = 0.15;
          targetEyebrowRotR = -0.15;
          mouthScaleX = 1.25;
          mouthScaleY = 1.3;
        } else if (emotion === 'thinking') {
          targetEyebrowLY = 0.285;
          targetEyebrowRY = 0.245;
          targetEyebrowRotL = 0.22;
          targetEyebrowRotR = -0.02;
          mouthScaleX = 0.75;
        } else if (emotion === 'surprised') {
          targetEyebrowLY = 0.30;
          targetEyebrowRY = 0.30;
          mouthScaleY = 2.0;
          mouthScaleX = 0.85;
        } else if (emotion === 'listening') {
          targetEyebrowLY = 0.275;
          targetEyebrowRY = 0.275;
          mouthScaleX = 1.1;
        }

        // Real-time lip-sync mouth opening
        if (mouthOpenAmountRef.current > 0.05) {
          mouthScaleY = 1.0 + mouthOpenAmountRef.current * 2.2;
          rig.mouthInner.visible = true;
          rig.mouthInner.scale.y = mouthOpenAmountRef.current * 1.5;
        } else {
          rig.mouthInner.visible = false;
        }

        rig.eyebrowLeft.position.y = THREE.MathUtils.lerp(rig.eyebrowLeft.position.y, targetEyebrowLY, 0.1);
        rig.eyebrowRight.position.y = THREE.MathUtils.lerp(rig.eyebrowRight.position.y, targetEyebrowRY, 0.1);
        rig.eyebrowLeft.rotation.z = THREE.MathUtils.lerp(rig.eyebrowLeft.rotation.z, targetEyebrowRotL, 0.1);
        rig.eyebrowRight.rotation.z = THREE.MathUtils.lerp(rig.eyebrowRight.rotation.z, targetEyebrowRotR, 0.1);
        rig.mouth.scale.x = THREE.MathUtils.lerp(rig.mouth.scale.x, mouthScaleX, 0.15);
        rig.mouth.scale.y = THREE.MathUtils.lerp(rig.mouth.scale.y, mouthScaleY, 0.15);

        // Secondary Physics for Hoodie Strings & Hologram Float
        rig.hoodieDrawstrings.rotation.z = Math.sin(elapsed * 2.0) * 0.05;
        rig.hologramGroup.position.y = Math.sin(elapsed * 1.2) * 0.02;
      }

      // VRM Model Animation Loop
      if (vrmRef.current) {
        const vrm = vrmRef.current;
        if (vrm.lookAt) {
          const target = new THREE.Vector3(
            mousePos.current.x * 0.8,
            1.4 + mousePos.current.y * 0.4,
            camera.position.z - 0.4
          );
          vrm.lookAt.lookAt(target);
        }

        if (vrm.expressionManager) {
          // Lip sync for VRM
          const currentA = vrm.expressionManager.getValue('aa') || 0;
          vrm.expressionManager.setValue('aa', THREE.MathUtils.lerp(currentA, mouthOpenAmountRef.current, 0.3));

          // Emotion for VRM
          vrm.expressionManager.setValue('happy', emotion === 'happy' ? 0.9 : 0.05);
          vrm.expressionManager.setValue('surprised', emotion === 'surprised' ? 0.9 : 0);
        }

        vrm.update(delta);
      }

      // Dynamic Reactive Emotion Lighting & Hologram Podium Rotation (Awwwards 60FPS)
      const emotionHex =
        emotion === 'happy'
          ? 0x10b981
          : emotion === 'thinking'
          ? 0xf59e0b
          : emotion === 'surprised'
          ? 0xa855f7
          : emotion === 'listening'
          ? 0x3b82f6
          : emotion === 'speaking'
          ? 0x00f0ff
          : 0x00e5ff;

      const targetColor = new THREE.Color(emotionHex);
      dynamicRimLight.color.lerp(targetColor, 0.08);
      emotionPointLight.color.lerp(targetColor, 0.08);
      ringMat.color.lerp(targetColor, 0.08);

      podiumGroup.rotation.y += delta * 0.35;
      ringMat.opacity = 0.28 + Math.sin(elapsed * 2.2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const currentMount = container;
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (currentMount) currentMount.innerHTML = '';
    };
  }, [activeModel, vrmUrl, emotion]);

  const emotionTheme = {
    neutral: {
      border: 'border-cyan-500/30',
      glow: 'shadow-[0_0_60px_rgba(0,229,255,0.14)]',
      pulse: 'bg-cyan-400',
      title: 'text-cyan-300',
    },
    happy: {
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_60px_rgba(16,185,129,0.20)]',
      pulse: 'bg-emerald-400',
      title: 'text-emerald-300',
    },
    thinking: {
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_60px_rgba(245,158,11,0.20)]',
      pulse: 'bg-amber-400',
      title: 'text-amber-300',
    },
    surprised: {
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_60px_rgba(168,85,247,0.20)]',
      pulse: 'bg-purple-400',
      title: 'text-purple-300',
    },
    listening: {
      border: 'border-blue-500/40',
      glow: 'shadow-[0_0_60px_rgba(59,130,246,0.20)]',
      pulse: 'bg-blue-400',
      title: 'text-blue-300',
    },
    speaking: {
      border: 'border-cyan-400/50',
      glow: 'shadow-[0_0_60px_rgba(0,240,255,0.25)]',
      pulse: 'bg-cyan-300',
      title: 'text-cyan-200',
    },
  }[emotion] || {
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_60px_rgba(0,229,255,0.14)]',
    pulse: 'bg-cyan-400',
    title: 'text-cyan-300',
  };

  return (
    <div className={`relative w-full h-[540px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#10141E] via-[#0D1017] to-[#07090D] border ${emotionTheme.border} ${emotionTheme.glow} transition-all duration-700 ease-out flex flex-col justify-between`}>
      {/* Top Status Bar */}
      <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-[#0B0D11]/90 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${emotionTheme.pulse} animate-ping absolute`} />
            <span className={`w-2 h-2 rounded-full ${emotionTheme.pulse} transition-colors duration-500`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold ${emotionTheme.title} tracking-wider transition-colors duration-500`}>TRỢ LÝ ẢO TECHSTORE</span>
              {isSpeakingLocal && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-pulse">
                  ĐANG NÓI...
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#8E95A5]">Trợ lý 3D Tương tác thời gian thực</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#161B26]/80 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setActiveModel('stylized')}
            className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all ${
              activeModel === 'stylized'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/30'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            Robot 3D (Ảnh gốc)
          </button>
          <button
            onClick={() => setActiveModel('vrm')}
            className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all ${
              activeModel === 'vrm'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/30'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            Mô hình Anime 3D
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B0D11]/95 z-20 text-cyan-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs uppercase tracking-widest font-mono text-cyan-300">Khởi tạo nhân vật 3D...</p>
        </div>
      )}

      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Controls & Expression Bar */}
      <div className="p-3.5 z-10 bg-gradient-to-t from-[#0B0D11]/95 via-[#0B0D11]/80 to-transparent flex flex-col gap-2.5 border-t border-white/5">
        {/* Emotion Switcher Buttons */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] text-[#8E95A5] font-mono uppercase pl-1">Biểu cảm:</span>
          
          <button
            onClick={() => handleSelectEmotion('neutral')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${
              emotion === 'neutral'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-transparent text-[#8E95A5] hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            onClick={() => handleSelectEmotion('happy')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${
              emotion === 'happy'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-white/5 border-transparent text-[#8E95A5] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vui vẻ</span>
          </button>

          <button
            onClick={() => handleSelectEmotion('thinking')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${
              emotion === 'thinking'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-white/5 border-transparent text-[#8E95A5] hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suy nghĩ</span>
          </button>

          <button
            onClick={() => handleSelectEmotion('surprised')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${
              emotion === 'surprised'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-white/5 border-transparent text-[#8E95A5] hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ngạc nhiên</span>
          </button>

          <button
            onClick={() => handleSelectEmotion('listening')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${
              emotion === 'listening'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                : 'bg-white/5 border-transparent text-[#8E95A5] hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Lắng nghe</span>
          </button>
        </div>

        {/* Audio Speech & Voice Action Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => speakVoice('Xin chào bạn! Tôi là trợ lý ảo kỹ thuật của TechStore. Rất vui được đồng hành và tư vấn cấu hình tối ưu nhất cho bạn!')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Nghe lời chào (Tiếng Việt)</span>
            </button>

            <button
              onClick={toggleVoiceInput}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isListeningVoice
                  ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                  : 'bg-white/5 border-white/10 text-[#8E95A5] hover:text-white'
              }`}
            >
              {isListeningVoice ? <Mic className="w-3.5 h-3.5 text-red-400" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isListeningVoice ? 'Đang lắng nghe bạn...' : 'Nói tiếng Việt'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              setAudioMuted(!audioMuted);
              window.speechSynthesis?.cancel();
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8E95A5] hover:text-white transition-colors"
            title={audioMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
