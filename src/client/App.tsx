"use client"
import { useRef } from 'react';
import { Scene } from 'phaser';
import { IRefPhaserGame, PhaserGame } from '@/client/PhaserGame';

export default () => {

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Scene) => {
    }

    return (         
            <PhaserGame ref={phaserRef}   />       
    )
}