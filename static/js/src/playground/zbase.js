class AcGamePlayground{
    constructor(root){
        this.root=root;
        this.$playground=$(`
            <div class="ac-game-playground">
            </div>
        `);
        this.mouse_x=0; //存储鼠标位置
        this.mouse_y=0;
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.start();
    }
    get_random_color(){
        let colors=["white","green","red","pink","cyan"];
        return colors[Math.floor(Math.random()*colors.length)];
    }
    start(){
        this.hide();
        this.add_listening_events();
    }
    add_listening_events(){
        let outer=this;
        $(window).resize(function() {
            outer.resize();
        });
        $(window).mousemove(function(e){
            outer.mouse_x=e.clientX;
            outer.mouse_y=e.clientY;
        });
    }
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
    }
    show(mode){
        this.$playground.show();
        this.game_map=new GameMap(this);
        this.mode = mode;
        this.resize();
        this.players = [];
        if(mode === "single mode"){
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.5, "me",this.root.settings.username,this.root.settings.photo));
            for(let i=0;i<10;i++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.3, "robot"));
            }
        }else if(mode === "multi mode"){
            // 多人模式
            let outer = this;
            let username = this.root.settings.username;
            let photo = this.root.settings.photo;
            this.multi_player_socket = new MultiPlayerSocket(this);
            let uuid = this.multi_player_socket.uuid;
            this.multi_player_socket.ws.onopen = function(){
                outer.multi_player_socket.send_create_player(uuid, username, photo);
            };
        }
    }
    hide(){
        this.$playground.hide();
    }
}