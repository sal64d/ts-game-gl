import type { Camera, Game, User, Vec2 } from "./game.model";

const spacingY = (i: number) => i * 10 + 20
const spacingX = (i: number) => i * 48
const spacing = (x: number, y: number) => [spacingX(x), spacingY(y)] as Vec2

function defaultUser(): User {
    return {
        size: [10, 10],
        start_pos: [0, 20],
        // start_pos: spacing(7,0)
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
        // Level 1
        {
            user: defaultUser(),
            camera: defaultCamera(),
            colliders: [
                // Ground
                {
                    type: 'platform',
                    size: [2000, 2000],
                    start_pos: [-500, 10.0]
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(1, 2),
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(2, 4),
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(3, 2),
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(4, 2),
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(5, 4),
                    path: {
                        type: 'linear',
                        from: spacing(5, 4),
                        to: spacing(6, 4),
                        duration: 1.5,
                        ease: true,
                        on_complete: 'bounce',
                    }
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(7, 4),
                    path: {
                        type: 'linear',
                        from: spacing(7, 4),
                        to: spacing(7, 8),
                        duration: 1.5,
                        ease: true,
                        on_complete: 'bounce',
                    }
                },
                {
                    type: 'platform',
                    size: [80, 100],
                    start_pos: spacing(8.5, 8),
                },
                {
                    type: 'goal',
                    size: [8, 15],
                    start_pos: spacing(9.3, 9.5),
                },
                {
                    type: 'coin',
                    size: [5, 5],
                    start_pos: spacing(2.25, 6),
                },
                {
                    type: 'coin',
                    size: [5, 5],
                    start_pos: spacing(5.8, 6),
                },
                {
                    type: 'coin',
                    size: [5, 5],
                    start_pos: spacing(7.25, 9),
                },
            ]
        },
        // Level 2
        {
            user: { ...defaultUser(), start_pos: spacing(0, 1) },
            camera: defaultCamera(),
            colliders: [
                {
                    type: 'lava',
                    size: [1000, 30],
                    start_pos: spacing(0, -1)
                },
                {
                    type: 'platform',
                    size: [150, 30],
                    start_pos: spacing(-2, 0)
                },
                {
                    type: 'platform',
                    size: [80, 30],
                    start_pos: spacing(2, 0)
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(4, 2),
                    path: {
                        type: 'linear',
                        from: spacing(4, 2),
                        to: spacing(4, 6),
                        duration: 1.5,
                        ease: true,
                        on_complete: 'bounce'
                    }
                },
                {
                    type: 'platform',
                    size: [80, 30],
                    start_pos: spacing(5.5, 0)
                },
                {
                    type: 'platform',
                    size: [100, 100],
                    start_pos: spacing(9, 8)
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(7.5, 2)
                },
                {
                    type: 'platform',
                    size: [30, 10],
                    start_pos: spacing(8.5, 5)
                },

                {
                    type: 'goal',
                    size: [30, 10],
                    start_pos: spacing(10, 9.5)
                },

                {
                    type: 'coin',
                    size: [5, 5],
                    start_pos: spacing(8, 9.5)
                },
                {
                    type: 'coin',
                    size: [5, 5],
                    start_pos: spacing(4.2, 8)
                },
                {
                    type: 'coin',
                    size: [5, 5],
                    start_pos: spacing(1.5, 4)
                },
            ]
        }
    ]


}