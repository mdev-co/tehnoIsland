import { useState, Suspense, useRef, useEffect, memo } from 'react';
import { Color, CylinderGeometry, Mesh, MeshBasicMaterial } from 'three';
import { BrightnessContrast, ChromaticAberration, DepthOfField, EffectComposer, GodRays, HueSaturation } from "@react-three/postprocessing";
import { BlendFunction, Resizer, KernelSize } from 'postprocessing';
import { OrbitControls, PerspectiveCamera, Environment, Float, Lightformer } from "@react-three/drei";
import { FloatingIsland } from "./FloatingIsland";
import { Portal } from './Portal';
import { Rocks } from './Rocks';
import { FloatingRocks } from './FloatingRocks';
import { Trees } from "./Trees";
import { Grass } from "./Grass";
import { useFrame } from '@react-three/fiber';
import { SceneParticles } from './SceneParticles';

let lightColor = new Color(0.2, 1, 0.1)
// let meshInside = new Mesh(
//     new CylinderGeometry(0.3, 0.3, 0.2),
//     new MeshBasicMaterial({
//         color: lightColor,
//         transparent: true,
//         opacity: 1
//     })
// )
let meshInside = new Mesh(
    new CylinderGeometry(0.15, 0.15, 0.65),
    new MeshBasicMaterial({
        color: '#00b0cf',
        transparent: true,
        opacity: 1
    })
)
let mesh = new Mesh(
    new CylinderGeometry(0.09, 0.1, 0.6),
    new MeshBasicMaterial({
        color: 'rgb(152, 26, 9)',
        transparent: false,
        opacity: 1
    })
)

mesh.rotation.x = Math.PI * 0.5
mesh.position.set(1.17, 10.9, -4)
mesh.scale.set(1.5, 1, 1)


let xOffset = 0;
export const SceneContainer = ({ darkMode = false, isMenuOpen }) => {
    const targetHue = darkMode ? 5 : 0;
    const hueRef = useRef(targetHue);
    const hueEffectRef = useRef();
    const godRaysRef = useRef();
    const [userControlCamera, setUserControlCamera] = useState(false);

    useEffect(() => {
        setUserControlCamera(isMenuOpen)
    }, [isMenuOpen])


    const cameraRef = useRef();

    // Funkcja do delikatnego obracania kamery
    const rotateCamera = (camera, xOffset) => {
        const time = performance.now() * 0.0001; // Zmienne tempo obrotu kamery
        let radius = 3; // Promień obrotu
        // setTimeout(() => {
        //     if (radius < 10) radius += 1; else return

        // }, 100)
        // const cameraX = -1.75; // Oblicz nową pozycję kamery na osi X
        const cameraX = -1.75 + Math.sin(time) * xOffset / 2; // Oblicz nową pozycję kamery na osi X
        const cameraY = 11.85; // Zachowaj pozycję kamery na osi Y
        const cameraZ = 23.35 + Math.cos(time) * xOffset * 2
        // const cameraZ = Math.cos(time) * radius + 10; // Oblicz nową pozycję kamery na osi Z

        camera.position.set(cameraX, cameraY, cameraZ); // Ustaw nową pozycję kamery
        // camera.lookAt(0, 0, 0); // Skieruj kamerę na punkt (0, 0, 0)
    };


    meshInside.rotation.x = Math.PI * 0.5
    meshInside.position.set(1.17, 11.9, -4)
    meshInside.scale.set(1.5, 1, 1)

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (xOffset <= 10) {
                xOffset += 0.1;
            } else {
                clearInterval(intervalId);
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (hueEffectRef.current) hueEffectRef.current.saturation = darkMode ? -0.35 : -0.15;
        if (godRaysRef.current) godRaysRef.current.lightSource = darkMode ? meshInside : mesh;
    }, [darkMode]);

    useFrame(() => {
        const hueEffect = hueEffectRef.current;
        if (hueEffect && hueRef.current !== targetHue) {
            const diff = targetHue - hueRef.current;
            const speed = 0.1;
            const newHue = hueRef.current + diff * speed

            hueRef.current = Number(newHue.toFixed(0)) !== targetHue ? newHue : targetHue;
            hueEffect.hue = hueRef.current;
        }
        const camera = cameraRef.current;

        if (camera) {
            rotateCamera(camera, xOffset);
        }
    }, 0);



    return (
        <Suspense fallback={null}>
            <Environment background={"only"} files={"./textures/bg.hdr"} />
            <Environment background={false} files={"./textures/envmap.hdr"} />

            {!darkMode ?
                <PerspectiveCamera makeDefault fov={60} position={[-1.75, 7.85, 23.35]} /> :
                <PerspectiveCamera ref={userControlCamera ? null : cameraRef} makeDefault fov={60} position={[-1.75, 7.85, 23.35]} />
            }

            <OrbitControls target={[2, 5, 3]} maxPolarAngle={Math.PI * 0.5} />
            {darkMode &&
                <Float
                    speed={2.5}
                    rotationIntensity={5.6}
                    floatIntensity={5.6}
                >
                    <primitive object={meshInside} />
                </Float>
            }
            <Float
                speed={0.5}
                rotationIntensity={0.6}
                floatIntensity={0.6}
            >
                <primitive object={mesh} />
                <spotLight
                    penumbra={1}
                    distance={500}
                    angle={60.65}
                    anglePower={3}
                    attenuation={1}
                    color={lightColor}
                    intensity={0.3}
                    position={[1.19, 10.85, -4.45]}
                    target-position={[0, 0, -1]}
                />
                <FloatingIsland />
                <Portal />
                <Rocks />
                <Trees />
                <Grass />
                <SceneParticles />
            </Float>
            <FloatingRocks darkMode={darkMode} />
            <SceneEffects hueEffectRef={hueEffectRef} godRaysRef={godRaysRef} />
        </Suspense>
    )
}

// Efekty tworzone raz. Tryb ciemny zmieniamy przez refy, bo @react-three/postprocessing
// tworzy efekt od nowa przy kazdym renderze i nie zwalnia starego.
const SceneEffects = memo(({ hueEffectRef, godRaysRef }) => (
    <EffectComposer stencilBuffer={true}>
        <DepthOfField
            focusDistance={0.012}
            focalLength={0.015}
            bokehScale={3}
        />
        <HueSaturation ref={hueEffectRef} hue={0} saturation={-0.15} />
        <BrightnessContrast brightness={0.0} contrast={0.035} />
        <ChromaticAberration radialModulation={true} offset={[0.00175, 0.00175]} />
        <GodRays
            ref={godRaysRef}
            sun={mesh}
            blendFunction={BlendFunction.Screen}
            samples={20}
            density={0.97}
            decay={0.97}
            weight={0.6}
            exposure={0.3}
            clampMax={1}
            width={Resizer.AUTO_SIZE}
            height={Resizer.AUTO_SIZE}
            kernelSize={KernelSize.SMALL}
            blur={true}
        />
    </EffectComposer>
));
