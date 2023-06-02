let GameState = {
    ChooseLevel: "ChooseLevel",
    Playing: "Playing",
    GameWon: "GameWon",
    GameOver: "GameOver",
};

let app = new Vue({
    el: "#app",
    data: {
        GameState,
        gameState: GameState.ChooseLevel,
        game: null,
        currentLevel: null,
        currentLevelIndex: null,
        levels: puzzle_data,
    },
    methods: {
        start_level: function (level_idx) {
            this.currentLevelIndex = level_idx;
            this.currentLevel = this.levels[this.currentLevelIndex];
            this.game = Game.from_json(this.currentLevel["puzzle"], this);
            this.gameState = GameState.Playing;
        },
        keypress: function (evt) {
            if (this.gameState == GameState.Playing) {
                this.game.move(evt.key);
            }
        },
        onInvalidMove: function (game) {
            this.gameState = GameState.GameOver;
        },
        onWin: function (game) {
            this.gameState = GameState.GameWon;
        },
        draw_game: function () {
            if (this.game != null) {
                this.game.draw(this.$refs.gameCanvas);
            }
        },
    },
    mounted: function () {
        document.addEventListener("keydown", this.keypress);
        setInterval(this.draw_game, 10);
    },

    updated: function () {
        let gameCanvas = document.getElementById("gameCanvas");
        if (gameCanvas !== null) {
            gameCanvas.width = Math.min(window.innerWidth * 0.9, 1200);
            gameCanvas.height = gameCanvas.width * 0.66;
        }
    },
});
