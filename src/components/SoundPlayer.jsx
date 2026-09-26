import { useState, useEffect } from 'react';
import { Howl } from 'howler';

export const SoundPlayer = ({ playSoundSignal }) => {
    const [sound] = useState(() =>
        new Howl({
            src: ['./sounds/nani.mp3'],
            volume: 1.0,
            loop: true,
        })
    );

    useEffect(() => {
        return () => sound.unload();
    }, [sound]);

    const soundFunctions = {
        play: () => sound.play(),
        pause: () => sound.pause(),
        stop: () => sound.stop()
    };

    useEffect(() => {
        playSoundSignal ? soundFunctions.play() : soundFunctions.stop()
    }, [playSoundSignal]);

    return (
        <div>
            {/* Buttons if menu needed  */}
            {/* {Object.keys(soundFunctions).map((methodName) => (
                <button key={methodName} onClick={soundFunctions[methodName]}>
                    {methodName}
                </button>
            ))} */}
        </div>
    );
};
