
export interface Keys {
    FORWARD: Phaser.Input.Keyboard.Key;
    BACKWARD: Phaser.Input.Keyboard.Key;
    LEFT: Phaser.Input.Keyboard.Key;
    RIGHT: Phaser.Input.Keyboard.Key;
    ENTER: Phaser.Input.Keyboard.Key;
}

export enum KEY_ACTION {
    JUSTUP_FORWARD = "JUSTUP_FORWARD",
    JUSTUP_BACKWARD = "JUSTUP_BACKWARD",
    JUSTUP_RIGHT = "JUSTUP_RIGHT",
    JUSTUP_LEFT = "JUSTUP_LEFT",
    JUSTDOWN_FORWARD = "JUSTDOWN_FORWARD",
    JUSTDOWN_BACKWARD = "JUSTDOWN_BACKWARD",
    JUSTDOWN_RIGHT = "JUSTDOWN_RIGHT",
    JUSTDOWN_LEFT = "JUSTDOWN_LEFT"
}