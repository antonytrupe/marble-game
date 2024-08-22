"use client"
import { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
 import { Scene } from 'phaser';

export default () => {

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

     

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Scene) => {
    }

    return (         
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />       
    )
}