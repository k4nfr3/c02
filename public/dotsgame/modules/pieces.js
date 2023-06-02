class Piece {
    constructor(x, y, triggers) {
        this.x = x
        this.y = y
        this.final_x = x
        this.final_y = y
        this.triggers = triggers
    }

    commit_move(key, grid_width, grid_height) {
        const duration = 500
        let x_keyframes = this.final_x
        let y_keyframes = this.final_y

        if (this.final_x >= grid_width) {
            x_keyframes = [
                { value: grid_width + 0.5, duration: duration / 2 },
                { value: -1.5, duration: 0 },
                { value: 0, duration: duration / 2 },
            ]
        } else if (this.final_x < 0) {
            x_keyframes = [
                { value: -1.5, duration: duration / 2 },
                { value: grid_width + 0.5, duration: 0 },
                { value: grid_width - 1, duration: duration / 2 },
            ]
        }

        if (this.final_y >= grid_height) {
            y_keyframes = [
                { value: grid_height + 0.5, duration: duration / 2 },
                { value: -1.5, duration: 0 },
                { value: 0, duration: duration / 2 },
            ]
        } else if (this.final_y < 0) {
            y_keyframes = [
                { value: -1.5, duration: duration / 2 },
                { value: grid_height + 0.5, duration: 0 },
                { value: grid_height - 1, duration: duration / 2 },
            ]
        }

        anime({
            targets: this,
            x: x_keyframes,
            y: y_keyframes,
            duration: duration,
            easing: 'easeOutQuad',
        })

        this.final_x = (this.final_x + grid_width) % grid_width
        this.final_y = (this.final_y + grid_height) % grid_height
    }
}

class PlayerPiece extends Piece {
    constructor(x, y) {
        super(x, y, ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'])
        this.color = 'hsl(130, 75%, 50%)'
    }
    move(key, grid_width, grid_height) {
        switch (key) {
            case 'ArrowRight':
                this.final_x += 1
                break
            case 'ArrowLeft':
                this.final_x -= 1
                break
            case 'ArrowUp':
                this.final_y -= 1
                break
            case 'ArrowDown':
                this.final_y += 1
                break
        }
        this.commit_move(key, grid_width, grid_height)
    }
}

class GoalPiece extends Piece {
    constructor(x, y) {
        super(x, y, [])
        this.color = 'hsl(0, 0%, 85%)'
    }
}

class RightPiece extends Piece {
    constructor(x, y) {
        super(x, y, ['ArrowRight', 'ArrowLeft'])
        this.color = 'hsl(0, 75%, 50%)'
    }
    move(key, grid_width, grid_height) {
        this.final_x += 1
        this.commit_move(key, grid_width, grid_height)
    }
}

class LeftPiece extends Piece {
    constructor(x, y) {
        super(x, y, ['ArrowRight', 'ArrowLeft'])
        this.color = 'hsl(220, 75%, 50%)'
    }
    move(key, grid_width, grid_height) {
        this.final_x -= 1
        this.commit_move(key, grid_width, grid_height)
    }
}

class UpPiece extends Piece {
    constructor(x, y) {
        super(x, y, ['ArrowUp', 'ArrowDown'])
        this.color = 'hsl(30, 75%, 50%)'
    }
    move(key, grid_width, grid_height) {
        this.final_y -= 1
        this.commit_move(key, grid_width, grid_height)
    }
}

class DownPiece extends Piece {
    constructor(x, y) {
        super(x, y, ['ArrowUp', 'ArrowDown'])
        this.color = 'hsl(275, 75%, 50%)'
    }
    move(key, grid_width, grid_height) {
        this.final_y += 1
        this.commit_move(key, grid_width, grid_height)
    }
}

class GreyPiece extends Piece {
    constructor(x, y) {
        super(x, y, [])
        this.color = 'hsl(0, 0%, 50%)'
    }
}
