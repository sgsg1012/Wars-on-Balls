class AcGamePlayground{
    constructor(root){
        this.root=root;
        this.$playground=$(`
            <div class="ac-game-playground">
            </div>
        `);
        this.mouse_x=0; //存储鼠标位置
        this.mouse_y=0;
        this.start();
    }
    get_random_color(){
        let colors=["white","green","red","pink","puple","cyan"];
        return colors[Math.floor(Math.random()*colors.length)];
    }
    start(){
        this.hide();
    }
    add_listening_events(){
        let outer=this;
        this.game_map.$canvas.mousemove(function(e) {
            outer.mouse_x=e.clientX;
            outer.mouse_y=e.clientY;
        });
    }
    show(){
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.game_map=new GameMap(this);
        this.add_listening_events();
        this.players = [];
        this.players.push(new Player(this, this.$playground.width() / 2, this.$playground.height() / 2, this.$playground.height() * 0.05, "white", this.$playground.height() * 0.5, true));
        for(let i=0;i<20;i++){
            this.players.push(new Player(this, this.$playground.width() / 2, this.$playground.height() / 2, this.$playground.height() * 0.05, this.get_random_color(), this.$playground.height() * 0.3, false));
        }
    }
    hide(){
        this.$playground.hide();
    }
}