
export type Vec2 = [number, number];

// Game
export type Game = {
    levels: Level[];
}

export type GameState = {
    current_level: number;
    completed: boolean;
    current_level_state: LevelState
}

// Level
export type Level = {
    user: User;
    camera: Camera;
    colliders: Collider[];
};

export type LevelState = {
    user_state: UserState;
    camera_state: CameraState;
    colliders_state: ColliderState[];
    completed: boolean,
}

// User
export type User = {
    start_pos: Vec2;
    size: Vec2;
};

export type UserState = {
    pos: Vec2;
    movement: Vec2,
    velocity: Vec2,
    keyJump: boolean,
    keyMove: string | undefined,
    rest: boolean,
    parent: null | number,
};

// Camera
export type Camera = {
    start_pos: Vec2;
    padding: Vec2,
    inertia: Vec2,
}

export type CameraState = {
    pos: Vec2
}

// Collider
export type Collider = {
    type: 'platform' | 'coin' | 'goal' | 'lava'
    size: Vec2;
    start_pos: Vec2;
    path?: PathInterpolation;
};

export type ColliderState = {
    pos: Vec2;
    path?: PathInterpolationState;
};

// Path
export type PathInterpolation = {
    duration: number; //seconds
    ease: boolean;
    on_complete: 'loop' | 'bounce'
} & (LinearPath | FunctionalPath);

export type LinearPath = {
    type: "linear";
    from: Vec2;
    to: Vec2;
};

export type FunctionalPath = {
    type: "functional";
    func: (percent: number) => Vec2;
};


export type PathInterpolationState = {
    percent: number;
    direction: 'forward' | 'backward';
};