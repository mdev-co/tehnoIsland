import { Canvas } from "@react-three/fiber";
import { SceneContainer } from "./components/SceneContainer";
import { useEffect, useMemo, useState } from "react";
import { SoundPlayer } from "./components/SoundPlayer";
import { ReactComponent as ArrowsIcon } from "./icons/rotationArrows.svg";
import _ from "lodash";

const CanvasSizeStyles = {
	width: "min(1200px, calc(100vw - 32px))",
	height: "auto",
	aspectRatio: "3 / 2",
	borderRadius: "10px",
	border: "2px solid black",
};

const darkButtonStyle = {
	border: "none",
	padding: "10px",
	width: "80px",
	height: "80px",
	margin: "10px",
	transition: "0.9s",
};

const backgroundStyled = {
	width: "100%",
	height: "100%",
	display: "flex",
	alignContent: "flex-start",
	justifyContent: "center",
	flexWrap: "wrap",
};

const rotationArrowsStyles = {
	cursor: "pointer",
	width: "70px",
	height: "70px",
	marginLeft: "70px",
};

const menuBarStyles = {
	background: "#000",
	width: "100%",
	height: "100px",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
};

const spotLights = [
	{
		color: "#442277",
		intensity: 4,
		angle: 0.6,
		penumbra: 0.5,
		position: [35, 5, 5],
		castShadow: true,
		"shadow-bias": -0.0001,
	},
	{
		color: "#bb8888",
		intensity: 5,
		angle: 0.6,
		penumbra: 0.5,
		position: [-35, 15, 15],
		castShadow: true,
		"shadow-bias": -0.0001,
	},
];

function App() {
	const [darkMode, setDarkMode] = useState(false);
	const [playSoundSignal, setPlaySoundSignal] = useState(false);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleDarkModeToggle = useMemo(
		() =>
			_.debounce(() => {
				setIsButtonDisabled(true);
				setDarkMode((prevDarkMode) => !prevDarkMode);
				setPlaySoundSignal((prevSignal) => !prevSignal);
				setTimeout(() => {
					setIsButtonDisabled(false);
				}, 500);
			}, 500),
		[]
	);

	useEffect(() => {
		return () => handleDarkModeToggle.cancel();
	}, [handleDarkModeToggle]);

	return (
		<>
			<div
				style={{
					...backgroundStyled,
					backgroundColor: darkMode ? "#222" : "#fff",
				}}
			>
				<div style={menuBarStyles}>
					<button
						style={{
							background: `url(${process.env.PUBLIC_URL}/icons/${
								darkMode ? "uncheck.png" : "check.png"
							}) center/cover no-repeat`,
							...darkButtonStyle,
						}}
						onClick={() => !isButtonDisabled && handleDarkModeToggle()}
					>
						<br />
					</button>
					<div
						style={rotationArrowsStyles}
						onClick={() => alert("Rotate by holding mouse and move")}
						disabled={isButtonDisabled}
					>
						<ArrowsIcon
							width="70"
							height="70"
							fill="none"
							stroke="#0044ff"
							strokeWidth="3"
						/>
					</div>
				</div>

				<div onClick={() => setIsMenuOpen(!isMenuOpen)}>
					<Canvas style={CanvasSizeStyles} dpr={[1, 1.5]}>
						{spotLights.map((spotLight, index) => (
							<spotLight
								key={index}
								color={spotLight.color}
								intensity={spotLight.intensity}
								angle={spotLight.angle}
								penumbra={spotLight.penumbra}
								position={spotLight.position}
								castShadow
								shadow-bias={-0.0001}
								target-position={[0, 0, -1]}
							/>
						))}
						<SceneContainer darkMode={darkMode} isMenuOpen={isMenuOpen} />
					</Canvas>
				</div>
			</div>
			<SoundPlayer playSoundSignal={playSoundSignal} />
		</>
	);
}

export default App;
