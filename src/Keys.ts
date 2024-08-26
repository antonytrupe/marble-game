import { Input } from "phaser"

export interface Keys {
    FORWARD: Input.Keyboard.Key
    BACKWARD: Input.Keyboard.Key
    LEFT: Input.Keyboard.Key
    RIGHT: Input.Keyboard.Key
    ENTER: Input.Keyboard.Key
    SLASH:Input.Keyboard.Key
    SHIFT:Input.Keyboard.Key
}

export enum KEY_ACTION {
    JUSTUP_FORWARD = "JUSTUP_FORWARD",
    JUSTUP_BACKWARD = "JUSTUP_BACKWARD",
    JUSTUP_RIGHT = "JUSTUP_RIGHT",
    JUSTUP_LEFT = "JUSTUP_LEFT",
    JUSTDOWN_FORWARD = "JUSTDOWN_FORWARD",
    JUSTDOWN_BACKWARD = "JUSTDOWN_BACKWARD",
    JUSTDOWN_RIGHT = "JUSTDOWN_RIGHT",
    JUSTDOWN_LEFT = "JUSTDOWN_LEFT",
    JUSTDOWN_SHIFT = "JUSTDOWN_SHIFT",
    JUSTUP_SHIFT = "JUSTUP_SHIFT"
}