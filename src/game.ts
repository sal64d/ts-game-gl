import type { Camera, Game, User } from "./game.model";

function defaultUser(): User {
    return {
        size: [10, 10],
        start_pos: [0, 20],
    }
}

function defaultCamera(): Camera {
    return {
        start_pos: [0, 0],
        padding: [30, 30],
        inertia: [0.01, 0.01]
    }
}

export const game: Game = {
    levels: [
        // Base level
        {
            user: defaultUser(),
            camera: defaultCamera(),
            colliders: [
                {
                    type: 'platform',
                    size: [1000, 1000],
                    start_pos: [-500, 10.0]
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: [30, 20]
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: [70, 30]
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: [120, 50]
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: [60, 80]
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: [20, 60]
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: [110, 100],
                    path: {
                        type: 'linear',
                        from: [110, 100],
                        to: [110, 140],
                        duration: 1.5,
                        ease: true,
                        on_complete: 'bounce',
                    },
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: [160, 140],
                    path: {
                        type: 'linear',
                        from: [160, 140],
                        to: [210, 140],
                        duration: 1.5,
                        ease: true,
                        on_complete: 'bounce',
                    },
                },
                {
                    type: "platform",
                    size: [60, 10],
                    start_pos: [240, 160],
                },
                {
                    type: "goal",
                    size: [5, 5],
                    start_pos: [270, 170],
                },
            ]
        }
    ]
}