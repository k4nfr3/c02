class Game {
    grid_width = 0;
    grid_height = 0;
    moves_made = [];
    pieces = [];
    listener = null;
    constructor(listener, grid_width, grid_height) {
        this.listener = listener;
        this.grid_width = grid_width;
        this.grid_height = grid_height;
    }

    draw(canvas) {
        const canvas_ctx = canvas.getContext("2d");
        var space_width = canvas.width / (this.grid_width + 1);
        var space_height = canvas.height / (this.grid_height + 1);

        canvas_ctx.fillStyle = "#333";
        canvas_ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const piece of this.pieces) {
            canvas_ctx.fillStyle = piece.color;
            canvas_ctx.beginPath();
            var canvas_x = (1 + piece.x) * space_width;
            var canvas_y = (1 + piece.y) * space_height;
            canvas_ctx.arc(canvas_x, canvas_y, 25, 2 * Math.PI, false);
            canvas_ctx.fill();
        }
    }

    move(key) {
        for (const piece of this.pieces) {
            if (piece.triggers.includes(key)) {
                piece.move(key, this.grid_width, this.grid_height);
            }
        }
        this.moves_made.push(key);

        if (!this.is_valid()) {
            this.listener.onInvalidMove(this);
        } else if (this.is_winning()) {
            this.listener.onWin(this);
        }
    }

    is_valid() {
        let player_positions = new Set();
        let non_goal_positions = new Set();

        for (const piece of this.pieces) {
            let position = `${[piece.final_x]},${piece.final_y}`;
            if (piece instanceof PlayerPiece) {
                player_positions.add(position);
            } else if (!(piece instanceof GoalPiece)) {
                non_goal_positions.add(position);
            }
        }

        for (const position of player_positions) {
            if (non_goal_positions.has(position)) {
                return false;
            }
        }

        return true;
    }

    is_winning() {
        let player_positions = new Set();
        let goal_positions = new Set();

        for (const piece of this.pieces) {
            let position = `${[piece.final_x]},${piece.final_y}`;
            if (piece instanceof PlayerPiece) {
                player_positions.add(position);
            } else if (piece instanceof GoalPiece) {
                goal_positions.add(position);
            }
        }

        for (const position of player_positions) {
            if (!goal_positions.has(position)) {
                return false;
            }
        }

        return true;
    }

    static from_json(game_json, listener) {
        let game = new Game(listener, game_json["grid_width"], game_json["grid_height"]);
        game_json["pieces"].forEach((piece) => {
            var piece = eval(`new ${piece["type"]}(${piece["position"][0]}, ${piece["position"][1]})`);
            game.pieces.push(piece);
        });
        return game;
    }
}
