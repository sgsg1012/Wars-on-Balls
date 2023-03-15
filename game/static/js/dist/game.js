class AcGameMenu{
    constructor(root){
        this.root=root;
        this.$menu=$(`
            <div class="ac-game-menu">
                <div class="ac-game-menu-field">
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-single_mode">单人模式</div>
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-multi_mode">多人模式</div>
                    <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">设置</div>
                </div>
            </div>
        `);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single_mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi_mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        
        
        this.start();
    }
    start(){
        this.add_listening_events();
    }
    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide(); // 隐藏menu div
            outer.root.playground.show(); // 显示playground div
        });
        this.$multi_mode.click(function(){
            console.log("click multi_mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }
    show(){ // 显示menu界面
        this.$menu.show();
    }
    hide(){ // 隐藏menu界面
        this.$menu.hide();
    }
}let AC_GAME_OBJECTS = [];
class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);

        this.has_called_start=false; // 是否执行过start函数
        this.timedelta=0; // 帧与帧的时间差
    }
    start(){ // 只会在第一帧执行一次

    }
    update(){ // 每一帧都会被执行

    }
    on_destroy(){ // 被销毁前执行

    }
    destroy(){ // 销毁 js中，一个对象没有被任何变量保存会自动销毁
        this.on_destroy();
        for(let i=0;i<AC_GAME_OBJECTS.length;i++)
        {
            if(AC_GAME_OBJECTS[i]===this)
            {
                AC_GAME_OBJECTS.splice(i,1);
                break;
            }
        }
    }
}

// 实现每一帧执行update函数
let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp){
    for(let i=0;i<AC_GAME_OBJECTS.length;i++){
        let obj=AC_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start=true;
        }else{
            obj.update();
            obj.timedelta=timestamp-last_timestamp;
        }
    }
    last_timestamp=timestamp;
    // 这一帧执行完之后，递归调用执行下一帧
    requestAnimationFrame(AC_GAME_ANIMATION);
}

// 该函数会在每一帧执行传入的参数函数
requestAnimationFrame(AC_GAME_ANIMATION);class GameMap extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }
    start(){
        this.$canvas.on("contextmenu", function() {
            return false;
        });
        this.render();
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.fillStyle="rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height); 
    }
}class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,is_me){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.direction_x=0;
        this.direction_y=0;
        this.move_length=0;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.is_me=is_me;
        this.eps=0.1;
    }
    start(){
        if (this.is_me) {
            this.add_listening_events();
        }
    }
    update(){
        if(this.move_length<this.eps){
            this.move_length=0;
            this.direction_x=this.direction_y=0;
        }else{
            let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
            this.x += moved * this.direction_x;
            this.y += moved * this.direction_y;
            this.move_length -= moved;
        }
        this.render();
    }
    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (e.which === 1) {
                outer.move_to(e.clientX, e.clientY);
            }
        });
        $(window).keydown(function(e){
            if(e.which === 81) { // q
                let fireball = new FireBall(outer.playground,outer,outer.x,outer.y,outer.direction_x,outer.direction_y,outer.playground.height * 0.02, "red", outer.playground.height * 0.5, outer.playground.height * 1);
            }
        });
    }
    get_distance(x1,y1,x2,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(x,y){
        this.move_length=this.get_distance(this.x,this.y,x,y);
        let angle = Math.atan2(y-this.y,x-this.x);
        this.direction_x = Math.cos(angle);
        this.direction_y = Math.sin(angle);
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class FireBall extends AcGameObject{
    constructor(playground,player,x,y,dx,dy,radius,color,speed,move_length){
        super();
        this.playground=playground;
        this.player=player;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.direction_x=dx;
        this.direction_y=dy;
        this.move_length=move_length;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.eps=0.1;
    }
    start(){
    }
    update(){
        if(this.move_length<this.eps){
            this.destroy();
        }else{
            let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
            this.x += moved * this.direction_x;
            this.y += moved * this.direction_y;
            this.move_length -= moved;
        }
        this.render();
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class AcGamePlayground{
    constructor(root){
        this.root=root;
        this.$playground=$(`
            <div class="ac-game-playground">
            </div>
        `);
        this.root.$ac_game.append(this.$playground);
        this.width=this.$playground.width();
        this.height=this.$playground.height();
        this.game_map=new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.5, true));
        this.start();
    }
    start(){
        // this.hide();
    }
    show(){
        this.$playground.show();
    }
    hide(){
        this.$playground.hide();
    }
}export class AcGame {
    constructor(id){
        // console.log('create ac game')
        this.id=id;
        this.$ac_game=$('#'+this.id);
        // this.menu=new AcGameMenu(this);
        this.playground=new AcGamePlayground(this);
    }
}