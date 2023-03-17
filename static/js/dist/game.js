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
        this.ctx.canvas.width = this.playground.$playground.width();
        this.ctx.canvas.height = this.playground.$playground.height();
        this.playground.$playground.append(this.$canvas);
    }
    start(){
        this.add_listening_events();
        this.render();
    }
    add_listening_events(){
        window.addEventListener("resize", () => {
            this.ctx.canvas.width = this.playground.$playground.width();
            this.ctx.canvas.height = this.playground.$playground.height();
        });
        this.$canvas.on("contextmenu", function() {
            return false;
        });
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.fillStyle="rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height); 
    }
}// 粒子类，玩家被攻击时会掉落粒子动画
class Particle extends AcGameObject{
    constructor(playground,x,y,radius,dx,dy,color,speed,move_length){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        // 粒子信息
        this.x=x;
        this.y=y;
        this.dx=dx;
        this.dy=dy;
        this.move_length=move_length;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.friction=0.9;
        this.eps=0.1; // 误差
    }
    start(){
    }
    update(){
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.dx * moved;
        this.y += this.dy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,is_me){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;

        // 移动位置 和 移动距离
        this.direction_x=0;
        this.direction_y=0;
        this.move_length=0;
        // 小球信息
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.is_me=is_me; // 小球是否是自己
        this.eps=0.1; //误差 
        // 被攻击的强制移动
        this.damage_x=0;
        this.damage_y=0;
        this.damage_speed=0;
        this.friction=0.9; // 摩擦力
        this.spendtime=0;
        this.alive=true;
    }
    start(){
        if (this.is_me) { // 给自己的小球绑定一些监听事件
            this.add_listening_events();
        }else{
            let tx = Math.random() * this.playground.$playground.width();
            let ty = Math.random() * this.playground.$playground.height();
            this.move_to(tx, ty);
        }
    }
    update(){
        this.spendtime += this.timedelta / 1000;
        // 自动攻击
        if(this.alive && !this.is_me && this.spendtime > 3 &&  Math.random() < 1.0/300){
            let tag = false;
            for(let i=0;i<this.playground.players.length;i++)
            {
                if(this.playground.players[i].is_me){
                    this.shoot_fireball(this.playground.players[i].x,this.playground.players[i].y);
                    tag = true;
                    break;
                }
            }
            if(!tag){
                let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
                this.shoot_fireball(player.x,player.y);
            }
        }

        if(this.damage_speed > 10){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;

        }else{
            if(this.move_length<this.eps){ // 移动距离为0 停止移动
                this.move_length=0;
                this.direction_x=this.direction_y=0;
                if(!this.is_me)
                {
                    let tx = Math.random() * this.playground.$playground.width();
                    let ty = Math.random() * this.playground.$playground.height();
                    this.move_to(tx, ty);
                }
            }else{ // 移动
                // 两帧之间小球的移动距离
                let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
                this.x += moved * this.direction_x;
                this.y += moved * this.direction_y;
                // 别忘了减去已经移动的距离
                this.move_length -= moved;
            }
        } 
        // 渲染
        this.render();
    }
    add_listening_events(){
        let outer = this;
        // 鼠标左键 控制移动
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (outer.alive && e.which === 1) {
                const rect = outer.ctx.canvas.getBoundingClientRect();
                outer.move_to(e.clientX-rect.left, e.clientY-rect.top);
            }
        });
        // 监听键盘事件 发技能 技能的方向为当前鼠标的位置与自己位置的夹角
        $(window).keydown(function(e){
            if(outer.alive && e.which === 81) { // 监听q键 发火球
                const rect = outer.ctx.canvas.getBoundingClientRect();
                let tx=outer.playground.mouse_x;
                let ty=outer.playground.mouse_y;
                outer.shoot_fireball(tx-rect.left,ty-rect.top);
                outer.move_length=0;
                outer.direction_x=0;
                outer.direction_y=0;
            }
        });
    }
    is_attacked(angle, damage){
        // 被打动画 释放粒子
        for (let i = 0; i < 20 + Math.random() * 10; i ++ ) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 3;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        // 半径变小 速度变慢
        this.radius -= damage;
        this.speed *= 0.8;
        // 死亡
        if (this.radius < 10) {
            this.alive=false;
            this.destroy();
            return false;
        }
        // 强制移动
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
    }
    get_distance(x1,y1,x2,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    // 小球移动
    move_to(x,y){
        this.move_length=this.get_distance(this.x,this.y,x,y);
        let angle = Math.atan2(y-this.y,x-this.x);
        this.direction_x = Math.cos(angle);
        this.direction_y = Math.sin(angle);
    }
    shoot_fireball(tx, ty) {
        console.log(this.playground.players.length);
        let x = this.x, y = this.y;
        let radius = this.playground.$playground.height() * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.$playground.height() * 0.5;
        let move_length = this.playground.$playground.height() * 1;
        let damage = this.playground.$playground.height() * 0.01;
        new FireBall(this.playground, this, x, y, vx, vy, radius, color, speed, move_length, damage);
    }
    // 渲染
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    on_destroy(){
        for(let i=0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this) {
                this.playground.players.splice(i,1);
                break;
            }
        }
    }
}class FireBall extends AcGameObject{
    constructor(playground,player,x,y,dx,dy,radius,color,speed,move_length,damage){
        super();
        this.playground=playground;
        this.player=player;
        this.ctx=this.playground.game_map.ctx;
        // 火球信息
        this.x=x;
        this.y=y;
        this.direction_x=dx;
        this.direction_y=dy;
        this.move_length=move_length;
        this.radius=radius;
        this.speed=speed;
        this.color=color;
        this.damage=damage;
        this.eps=0.1; // 误差
    }
    start(){
    }
    update(){
        // 处理碰撞
        let players = this.playground.players;
        for(let i=0;i<players.length;i++){
            if(players[i] === this.player) continue;
            if(this.is_collision(players[i]))
            {
                this.attack(players[i]);
                this.destroy();
                return false;
            }
        }
        // 处理火球移动
        if(this.move_length<this.eps){
            this.destroy();
            return false;
        }else{
            let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
            this.x += moved * this.direction_x;
            this.y += moved * this.direction_y;
            this.move_length -= moved;
        }
        this.render();
    }
    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
        return false;
    }
    get_distance(x1,y1,x2,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    is_collision(obj)
    {
        let distance = this.get_distance(this.x,this.y,obj.x,obj.y);
        return distance < this.radius + obj.radius;
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
}export class AcGame {
    constructor(id){
        // console.log('create ac game')
        this.id=id;
        this.$ac_game=$('#'+this.id);
        this.menu=new AcGameMenu(this);
        this.playground=new AcGamePlayground(this);
    }
}