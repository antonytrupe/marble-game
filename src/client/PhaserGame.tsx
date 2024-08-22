import { forwardRef, useLayoutEffect, useRef } from 'react';
import { Game, Scene } from 'phaser';
import StartGame from '@/client/main';
import styles from '@/client/styles.module.css'

export interface IRefPhaserGame {
    game: Game | null;
    scene: Scene | null;
}

export const PhaserGame = forwardRef<IRefPhaserGame>(function PhaserGame({ }, ref) {
    const game = useRef<Game | null>(null!);

    // console.log(ref)

    useLayoutEffect(() => {
        if (game.current === null) {

            game.current = StartGame("phaser-container");

            if (typeof ref === 'function') {
                ref({ game: game.current, scene: null });
            } else if (ref) {
                ref.current = { game: game.current, scene: null };
            }

        }
        game.current.canvas.width = 1000

        return () => {
            if (game.current) {
                game.current.destroy(true);
                if (game.current !== null) {
                    game.current = null;
                }
            }
        }
    }, [ref]);

    // useEffect(() =>
    // {
    //     EventBus.on('current-scene-ready', (scene_instance: Scene) =>
    //     {
    //         if (currentActiveScene && typeof currentActiveScene === 'function')
    //         {
    //             currentActiveScene(scene_instance);
    //         }
    //         if (typeof ref === 'function')
    //         {
    //             ref({ game: game.current, scene: scene_instance });
    //         } else if (ref)
    //         {
    //             ref.current = { game: game.current, scene: scene_instance };
    //         }
    //     });
    //     return () =>
    //     {
    //         EventBus.removeListener('current-scene-ready');
    //     }
    // }, [currentActiveScene, ref]);

    return (
        <div id="phaser-container" className={styles.phaserContainer}></div>
    );

});
