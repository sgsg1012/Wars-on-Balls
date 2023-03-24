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
        this.hide();
    }
    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide(); // 隐藏menu div
            outer.root.playground.show("single mode"); // 显示playground div
        });
        this.$multi_mode.click(function(){
            outer.hide(); // 隐藏menu div
            outer.root.playground.show("multi mode"); // 显示playground div
        });
        this.$settings.click(function(){
            console.log("click settings");
            outer.root.settings.logout_on_remote();
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
        this.uuid = this.create_uuid(); // 8位数的uuid
    }
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 10)之间的数
            res += x;
        }
        return res;
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
requestAnimationFrame(AC_GAME_ANIMATION);class ChatField {
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="ac-game-chat-field-history">历史记录</div>`);
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();

        this.func_id = null;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$input.keydown(function(e) {
            if (e.which === 27) {  // ESC
                outer.hide_input();
                return false;
            } else if (e.which === 13) {  // ENTER
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text) {
                    outer.$input.val("");
                    // outer.add_message(username, text);
                    outer.playground.multi_player_socket.send_message(username, text);
                }
                return false;
            }
        });
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();

        if (this.func_id) clearTimeout(this.func_id);

        this.func_id = setTimeout(function() {
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }

    show_input() {
        this.show_history();

        this.$input.show();
        this.$input.focus();
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}

class GameMap extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.$playground.width();
        this.ctx.canvas.height = this.playground.$playground.height();
        this.playground.$playground.append(this.$canvas);
    }
    start(){
        this.add_listening_events();
        this.render();
        this.$canvas.focus();
    }
    add_listening_events(){
        this.$canvas.on("contextmenu", function() {
            return false;
        });
    }
    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
        this.eps=0.01; // 误差
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,character,username,photo){
        // console.log(username);
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
        this.character=character; // 小球角色 三种 自己 敌人 机器人
        this.username=username; // 角色信息 机器人不填
        this.photo=photo; 
        this.eps=0.01; //误差 
        // 被攻击的强制移动
        this.damage_x=0;
        this.damage_y=0;
        this.damage_speed=0;
        this.friction=0.9; // 摩擦力
        this.spendtime=0;
        this.alive=true;
        this.skill="";

        // 加载用户头像
        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3;  // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://app907.acapp.acwing.com.cn/static/image/playground/fireball.png";

            this.blink_coldtime = 5;  // 单位：秒
            this.blink_img = new Image();
            this.blink_img.src = "https://app907.acapp.acwing.com.cn/static/image/playground/blink.png";
        }
    }
    start(){
        if (this.character === "me") { // 给自己的小球绑定一些监听事件
            this.add_listening_events();
        }else if(this.character === "robot") { // 人机自动移动
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }
    update(){
        this.spendtime += this.timedelta / 1000;
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(0, this.fireball_coldtime);
        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(0,this.blink_coldtime);
        // 人机自动攻击
        this.update_attack();
        // 更新位置
        this.update_position();
        // 渲染
        this.render();
    }
    update_attack(){
        // 人机自动攻击
        if(this.alive && this.character === "robot" && this.spendtime > 3 &&  Math.random() < 1.0/300){
            let tag = false;
            for(let i=0;i<this.playground.players.length;i++)
            {
                if(this.playground.players[i].character !== "robot"){ // 有用户时机器人不会自相残杀
                    this.shoot_fireball(this.playground.players[i].x,this.playground.players[i].y);
                    tag = true;
                    break;
                }
            }
            if(!tag){
                let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
                this.shoot_fireball(player.x, player.y);
            }
        }
    }
    update_position(){
        if(this.damage_speed > this.eps){
            this.direction_x = this.direction_y = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else{
            if(this.move_length < this.eps){ // 移动距离为0 停止移动
                this.move_length=0;
                this.direction_x=this.direction_y=0;
                if(this.character === "robot") // 人机自动移动
                {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }else{ // 移动
                // 两帧之间小球的移动距离
                let moved = Math.min(this.move_length ,this.speed * this.timedelta / 1000);
                this.x += moved * this.direction_x;
                this.y += moved * this.direction_y;
                // 别忘了减去已经移动的距离
                this.move_length -= moved;
            }
        } 
    }
    add_listening_events(){
        let outer = this;
        
        this.playground.game_map.$canvas.mousedown(function(e) {
            outer.playground.chat_field.hide_input();
            if(outer.alive){
                if (e.which === 1) { // 鼠标左键 控制移动
                    const rect = outer.ctx.canvas.getBoundingClientRect();
                    let tx = (e.clientX-rect.left) / outer.playground.scale;
                    let ty = (e.clientY-rect.top) / outer.playground.scale;
                    if(outer.playground.mode === "multi mode"){ // 多人模式
                        outer.playground.multi_player_socket.send_move_to(outer.uuid,tx,ty);
                    }else{
                        outer.move_to(tx,ty);
                    }
                }else if(e.which === 3){ // 鼠标右键 控制闪现
                    if(outer.skill === "blink"){
                        const rect = outer.ctx.canvas.getBoundingClientRect();
                        let tx = (e.clientX-rect.left) / outer.playground.scale;
                        let ty = (e.clientY-rect.top) / outer.playground.scale;
                        if(outer.playground.mode === "multi mode"){ // 多人模式
                            outer.playground.multi_player_socket.send_blink(outer.uuid,tx,ty);
                        }else{ // 单人模式
                            outer.blink(tx,ty);
                        }
                        outer.skill = "";
                        outer.blink_coldtime = 5.0;
                    }
                }
            }
        });
        // 监听键盘事件 发技能 技能的方向为当前鼠标的位置与自己位置的夹角
        this.playground.game_map.$canvas.keydown(function(e){
            // 打开聊天输入框
            if (e.which === 13) {  // enter
                if (outer.playground.mode === "multi mode") {  // 打开聊天框
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }


            if(outer.alive){ // 活着才能发技能
                if(e.which === 81) { // 监听q键 发火球
                    if(outer.fireball_coldtime < outer.eps){ // 技能cd
                        const rect = outer.ctx.canvas.getBoundingClientRect();
                        let tx=outer.playground.mouse_x;
                        let ty=outer.playground.mouse_y;
                        tx = (tx-rect.left)/outer.playground.scale;
                        ty = (ty-rect.top)/outer.playground.scale;
                        if(outer.playground.mode === "multi mode"){ // 多人模式
                            outer.playground.multi_player_socket.send_shoot_fireball(outer.uuid,tx,ty);
                        }else{
                            outer.shoot_fireball(tx,ty);
                        }
                        outer.fireball_coldtime = 3.0; // 重置冷却时间
                    }
                }else if(e.which === 70){ // f键 闪现
                    if(outer.blink_coldtime < outer.eps){ // 技能cd
                        outer.skill = "blink";
                    }
                }
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
        if (this.radius < this.eps) { 
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
    shoot_fireball(tx, ty) { // 火球
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let damage = 0.01;
        new FireBall(this.playground, this, x, y, vx, vy, radius, color, speed, move_length, damage);
        // 发射技能时停止移动
        this.move_length=0;
        this.direction_x=0;
        this.direction_y=0;
    }
    blink(x, y){ // 闪现
        let length=Math.min(0.8,this.get_distance(this.x,this.y,x,y));
        let angle = Math.atan2(y-this.y,x-this.x);
        let nx = this.x + length * Math.cos(angle);
        let ny = this.y + length * Math.sin(angle);
        this.x=nx,this.y=ny;
        this.move_length=0; // 闪现后停止移动
    }
    // 渲染 技能图标
    render_skill_coldtime() {
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > this.eps) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }
    // 渲染
    render(){
        let scale = this.playground.scale;

        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if(this.character === "me"){
            this.render_skill_coldtime();
        }
    }
    on_destroy(){
        if(this.character === "me" && this.playground.mode === "multi mode"){
            this.playground.multi_player_socket.send_dead(this.uuid);
        }
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
        this.eps=0.01; // 误差
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
                if(this.playground.mode === "multi mode"){ // 多人模式
                    if(this.player.character === "me"){
                        this.attack(players[i]);
                    }
                }else{ // 单人模式
                    this.attack(players[i]);
                }                
                this.destroy();
                return false;
            }
        }
        // 处理火球移动
        if(this.move_length < this.eps){
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
        if(this.playground.mode === "multi mode"){
            this.playground.multi_player_socket.send_is_attacked(player.uuid, angle, this.damage);
        }else{
            player.is_attacked(angle, this.damage);
        }
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class MultiPlayerSocket{
    constructor(playground){
        this.playground=playground;
        this.ws = new WebSocket("wss://app907.acapp.acwing.com.cn/wss/multiplayer/");
        this.uuid = this.create_uuid();
        this.start();
    }
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 10)之间的数
            res += x;
        }
        return res;
    }
    start(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);
            let event = data.event;
            if(event === "create_player"){
                outer.receive_create_player(data.uuid,data.username,data.photo);
            }else if(event === "move_to"){
                outer.receive_move_to(data.uuid,data.tx,data.ty);
            }else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(data.uuid,data.tx,data.ty);
            }else if(event === "is_attacked"){
                outer.receive_is_attacked(data.uuid, data.angle, data.damage);
            }else if(event === "blink"){
                outer.receive_blink(data.uuid, data.tx, data.ty);
            }else if(event === "message"){
                outer.receive_message(data.username,data.text);
            }
        }
    }
    // create player
    send_create_player(uuid, username, photo){
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': uuid,
            'username': username,
            'photo': photo,
        }));
    }
    receive_create_player(uuid, username, photo){
        let player;
        if(uuid === this.uuid) { // 自己
            player = new Player(this.playground,this.playground.width / 2 / this.playground.scale,0.5,0.05,"white",0.5,"me",username,photo);
        }
        else{ // 敌人
            player = new Player(this.playground,this.playground.width / 2 / this.playground.scale, 0.5,0.05,"white",0.5,"enemy",username,photo);
        }
        player.uuid = uuid; // 以服务器端的uuid为准
        this.playground.players.push(player);
    }

    // move to
    send_move_to(uuid,tx,ty){
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    get_player(uuid){
        for(let i = 0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player.uuid === uuid) return player;
        }
    }
    receive_move_to(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player) player.move_to(tx,ty);
    }

    // shoot fireball
    send_shoot_fireball(uuid,tx,ty){
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    receive_shoot_fireball(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player) player.shoot_fireball(tx,ty);
    }

    // is attacked
    send_is_attacked(uuid, angle, damage){
        this.ws.send(JSON.stringify({
            'event': "is_attacked",
            'uuid': uuid,
            'angle': angle,
            'damage': damage,
        }));
    }
    receive_is_attacked(uuid, angle, damage){
        let player = this.get_player(uuid);
        if(player) player.is_attacked(angle,damage);
    }
    // blink
    send_blink(uuid, tx, ty){
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    receive_blink(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player) player.blink(tx,ty);
    }
    send_dead(uuid){
        this.ws.send(JSON.stringify({
            'event': "dead",
            'uuid': uuid,
        }));
    }
    send_message(username, text){
        this.ws.send(JSON.stringify({
            'event': "message",
            'username': username,
            'text': text,
        }));
    }
    receive_message(username, text){
        this.playground.chat_field.add_message(username,text);
    }
}
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
            this.chat_field = new ChatField(this);
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
}class Settings {
    constructor(root) {
        this.root = root;
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app907.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app907.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
`);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");
        
        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img');

        this.$register.hide();

        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    start() {
        let outer = this;
        this.getinfo();
        this.add_listening_events();
        // acwing第三方登录
        this.$acwing_login.click(function() {
            outer.acwing_login();
        });
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
        
    }

    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    acwing_login(){ // acwing第三方授权登录
        $.ajax({
            url: "https://app907.acapp.acwing.com.cn/settings/acwing_authorize_login/obtain_authorization",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    login_on_remote() {  // 在远程服务器上登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app907.acapp.acwing.com.cn/settings/login_system/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    register_on_remote() {  // 在远程服务器上注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app907.acapp.acwing.com.cn/settings/login_system/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();  // 刷新页面
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() {  // 在远程服务器上登出
        if (this.platform === "ACAPP") return false;

        $.ajax({
            url: "https://app907.acapp.acwing.com.cn/settings/login_system/logout/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                }
            }
        });
    }

    register() {  // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {  // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo() {
        let outer = this;

        $.ajax({
            url: "https://app907.acapp.acwing.com.cn/settings/login_system/getinfo/",
            type: "GET",
            data: {
            },
            success: function(resp) {
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}
export class AcGame {
    constructor(id){
        this.id=id;
        this.$ac_game=$('#'+this.id);
        this.settings=new Settings(this);
        this.menu=new AcGameMenu(this);
        this.playground=new AcGamePlayground(this);
    }
}